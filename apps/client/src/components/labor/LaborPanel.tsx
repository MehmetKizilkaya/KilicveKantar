import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import clsx from 'clsx';

const LABOR_TYPES = [
  { id: 'basic_worker', label: 'Temel İşçi', icon: '⛏️', reward: 200 },
  { id: 'craftsman',    label: 'Zanaatkar',   icon: '🔨', reward: 500 },
  { id: 'trader',       label: 'Tüccar',      icon: '📦', reward: 800 },
  { id: 'soldier',      label: 'Asker',       icon: '⚔️', reward: 300 },
] as const;

type LaborTypeId = typeof LABOR_TYPES[number]['id'];

export default function LaborPanel() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<LaborTypeId>('basic_worker');
  const [timeLeft, setTimeLeft] = useState('');

  const { data: cycle, isLoading } = useQuery({
    queryKey: ['labor', 'active'],
    queryFn: () => api.get('/labor/active').then((r) => r.data.cycle),
    refetchInterval: 30_000,
  });

  // Countdown timer
  useEffect(() => {
    if (!cycle) return;
    const update = () => {
      const end = new Date(cycle.endsAt);
      if (end <= new Date()) {
        setTimeLeft('Tamamlandı!');
      } else {
        setTimeLeft(formatDistanceToNow(end, { locale: tr, addSuffix: true }));
      }
    };
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, [cycle]);

  const start = useMutation({
    mutationFn: (type: LaborTypeId) => api.post('/labor/start', { type }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['labor'] }),
  });

  const collect = useMutation({
    mutationFn: (cycleId: string) => api.post(`/labor/${cycleId}/collect`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['labor'] });
      window.dispatchEvent(new CustomEvent('kv:refetch_player'));
    },
  });

  const extend = useMutation({
    mutationFn: (cycleId: string) => api.post(`/labor/${cycleId}/extend`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['labor'] }),
  });

  const instantRestart = useMutation({
    mutationFn: (type: LaborTypeId) => api.post('/labor/instant-restart', { type }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['labor'] });
      window.dispatchEvent(new CustomEvent('kv:refetch_player'));
    },
  });

  const isDone = cycle && new Date(cycle.endsAt) <= new Date();
  const isActive = cycle && !isDone;

  return (
    <div className="panel p-4 space-y-4">
      <h3 className="font-semibold text-game-text flex items-center gap-2">
        ⚙️ Çalışma Döngüsü
      </h3>

      {isLoading ? (
        <p className="text-xs text-game-muted">Yükleniyor...</p>
      ) : cycle ? (
        /* Active / completed cycle */
        <div className="space-y-3">
          <div className={clsx(
            'rounded-md p-3 border',
            isDone
              ? 'bg-green-900/20 border-green-800'
              : 'bg-game-bg border-game-border',
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-game-text">
                {LABOR_TYPES.find((t) => {
                  const map: Record<string, string> = {
                    BASIC_WORKER: 'basic_worker',
                    CRAFTSMAN: 'craftsman',
                    TRADER_LABOR: 'trader',
                    SOLDIER: 'soldier',
                  };
                  return map[cycle.type] === t.id;
                })?.icon ?? '⚙️'}{' '}
                {cycle.akceReward.toLocaleString('tr-TR')} Akçe
              </span>
              {isDone ? (
                <span className="badge badge-green">Hazır!</span>
              ) : (
                <span className="badge badge-blue">{timeLeft}</span>
              )}
            </div>

            {!isDone && (
              <div className="w-full bg-game-border rounded-full h-1.5">
                <div
                  className="bg-gold-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((Date.now() - new Date(cycle.startedAt).getTime()) /
                        (new Date(cycle.endsAt).getTime() - new Date(cycle.startedAt).getTime())) *
                        100,
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {isDone && (
              <button
                className="btn-gold flex-1"
                onClick={() => collect.mutate(cycle.id)}
                disabled={collect.isPending}
              >
                {collect.isPending ? 'Toplanıyor...' : '⚙️ Akçeyi Topla'}
              </button>
            )}
            {isActive && cycle.extendedCount < 2 && (
              <button
                className="btn-ghost flex-1 text-xs"
                onClick={() => extend.mutate(cycle.id)}
                disabled={extend.isPending}
              >
                🥇 Uzat (5 Altın)
              </button>
            )}
          </div>

          {isDone && (
            <button
              className="btn-ghost w-full text-xs"
              onClick={() => instantRestart.mutate(selected)}
              disabled={instantRestart.isPending}
            >
              🥇 Anında Yeni Döngü Başlat (8 Altın)
            </button>
          )}
        </div>
      ) : (
        /* No active cycle */
        <div className="space-y-3">
          <p className="text-xs text-game-muted">Çalışma türü seç:</p>
          <div className="grid grid-cols-2 gap-2">
            {LABOR_TYPES.map((t) => (
              <button
                key={t.id}
                className={clsx(
                  'rounded-md p-2.5 text-xs text-left border transition-colors',
                  selected === t.id
                    ? 'border-gold-600 bg-gold-900/20 text-gold-300'
                    : 'border-game-border hover:border-gold-700 text-game-muted hover:text-game-text',
                )}
                onClick={() => setSelected(t.id)}
              >
                <div className="text-base mb-0.5">{t.icon}</div>
                <div className="font-medium">{t.label}</div>
                <div className="text-game-muted text-[10px]">+{t.reward} Akçe</div>
              </button>
            ))}
          </div>

          <button
            className="btn-gold w-full"
            onClick={() => start.mutate(selected)}
            disabled={start.isPending}
          >
            {start.isPending ? 'Başlatılıyor...' : '▶ Çalışmayı Başlat'}
          </button>
        </div>
      )}
    </div>
  );
}
