import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';

const API = '/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type UnitKind = 'INFANTRY' | 'CAVALRY' | 'ARTILLERY';

interface ArmyUnit {
  id: string;
  unitType: UnitKind;
  count: number;
  isTraining: boolean;
  trainingEndsAt: string | null;
  isInTransit: boolean;
  travelEndsAt: string | null;
  garrisonRegion: { id: string; name: string } | null;
  destinationRegion: { id: string; name: string } | null;
}

interface Siege {
  id: string;
  attackerPower: number;
  defenderPower: number;
  endsAt: string;
  status: string;
  attacker: { username: string };
  targetRegion: { name: string; code: string };
}

interface Region {
  id: string;
  name: string;
  code: string;
  type: string;
  governorId?: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const UNIT_INFO: Record<UnitKind, { label: string; icon: string; costAkce: number; trainMinutes: number; power: number }> = {
  INFANTRY:  { label: 'Piyade',  icon: '🗡️',  costAkce: 300,  trainMinutes: 10, power: 8  },
  CAVALRY:   { label: 'Süvari',  icon: '🐴',  costAkce: 800,  trainMinutes: 15, power: 20 },
  ARTILLERY: { label: 'Topçu',   icon: '💣',  costAkce: 2000, trainMinutes: 25, power: 45 },
};

function formatTimeLeft(endsAt: string | null): string {
  if (!endsAt) return '';
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return 'Tamamlandı';
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ArmyPage() {
  const { accessToken: token, player } = useAuthStore();
  const qc = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };

  const [tab, setTab] = useState<'units' | 'recruit' | 'attack'>('units');
  const [recruitType, setRecruitType] = useState<UnitKind>('INFANTRY');
  const [recruitCount, setRecruitCount] = useState(1);
  const [moveUnitId, setMoveUnitId] = useState('');
  const [moveDestId, setMoveDestId] = useState('');
  const [attackTarget, setAttackTarget] = useState('');
  const [attackUnits, setAttackUnits] = useState<Partial<Record<UnitKind, number>>>({});
  const [errorMsg, setErrorMsg] = useState('');

  // ─── Queries ─────────────────────────────────────────────────────────────

  const { data: army = [], refetch: refetchArmy } = useQuery<ArmyUnit[]>({
    queryKey: ['army'],
    queryFn: () => fetch(`${API}/army`, { headers }).then((r) => r.json()),
    refetchInterval: 10000,
  });

  const { data: sieges = [] } = useQuery<Siege[]>({
    queryKey: ['army-sieges'],
    queryFn: () => fetch(`${API}/army/sieges`, { headers }).then((r) => r.json()),
    refetchInterval: 15000,
  });

  const { data: regions = [] } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: () => fetch(`${API}/regions`).then((r) => r.json()),
    staleTime: 30_000,
  });

  // ─── Mutations ────────────────────────────────────────────────────────────

  const recruitMutation = useMutation({
    mutationFn: () =>
      fetch(`${API}/army/recruit`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitType: recruitType, count: recruitCount }),
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      }),
    onSuccess: () => {
      setErrorMsg('');
      refetchArmy();
      qc.invalidateQueries({ queryKey: ['auth-me'] });
    },
    onError: (err) => setErrorMsg((err as Error).message),
  });

  const moveMutation = useMutation({
    mutationFn: () =>
      fetch(`${API}/army/move`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId: moveUnitId, destinationRegionId: moveDestId }),
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      }),
    onSuccess: () => {
      setErrorMsg('');
      setMoveUnitId('');
      setMoveDestId('');
      refetchArmy();
    },
    onError: (err) => setErrorMsg((err as Error).message),
  });

  const attackMutation = useMutation({
    mutationFn: () =>
      fetch(`${API}/army/attack`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRegionId: attackTarget, units: attackUnits }),
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      }),
    onSuccess: () => {
      setErrorMsg('');
      setAttackTarget('');
      setAttackUnits({});
      qc.invalidateQueries({ queryKey: ['army-sieges'] });
    },
    onError: (err) => setErrorMsg((err as Error).message),
  });

  // ─── Derived data ─────────────────────────────────────────────────────────

  const readyUnits = army.filter((u) => !u.isTraining && !u.isInTransit);
  const trainingUnits = army.filter((u) => u.isTraining);
  const movingUnits = army.filter((u) => u.isInTransit);

  const recruitCost = UNIT_INFO[recruitType].costAkce * recruitCount;
  const canAffordRecruit = (player?.akceBalance ?? 0) >= recruitCost;

  // Attack power preview
  const attackPowerPreview = (Object.entries(attackUnits) as [UnitKind, number][])
    .reduce((sum, [type, cnt]) => sum + (UNIT_INFO[type]?.power ?? 0) * cnt, 0);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚔️</span>
          <div>
            <h1 className="text-lg font-bold text-yellow-400">Ordu Yönetimi</h1>
            <p className="text-xs text-gray-400">
              {army.length} birlik grubu · {readyUnits.reduce((s, u) => s + u.count, 0)} hazır asker
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-300">
          <span className="text-yellow-400 font-bold">{player?.akceBalance?.toLocaleString('tr-TR')}</span>
          <span className="text-gray-500"> Akçe</span>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        {(['units', 'recruit', 'attack'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setErrorMsg(''); }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-gray-700 text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t === 'units' && '🪖 Birliklerim'}
            {t === 'recruit' && '➕ Asker Al'}
            {t === 'attack' && '⚔️ Saldır'}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Error message */}
        {errorMsg && (
          <div className="bg-red-900/50 border border-red-500 rounded-md px-3 py-2 text-xs text-red-300">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ── UNITS TAB ─────────────────────────────────────────────────── */}
        {tab === 'units' && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              {(['INFANTRY', 'CAVALRY', 'ARTILLERY'] as UnitKind[]).map((type) => {
                const total = army.filter((u) => u.unitType === type).reduce((s, u) => s + u.count, 0);
                const ready = readyUnits.filter((u) => u.unitType === type).reduce((s, u) => s + u.count, 0);
                return (
                  <div key={type} className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-2xl">{UNIT_INFO[type].icon}</div>
                    <div className="text-xs text-gray-400 mt-1">{UNIT_INFO[type].label}</div>
                    <div className="text-xl font-bold text-yellow-400">{total}</div>
                    <div className="text-xs text-green-400">{ready} hazır</div>
                  </div>
                );
              })}
            </div>

            {/* Training units */}
            {trainingUnits.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-blue-400 mb-2">🔧 Eğitimde</h3>
                <div className="space-y-2">
                  {trainingUnits.map((unit) => (
                    <div key={unit.id} className="bg-gray-800 rounded-md px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{UNIT_INFO[unit.unitType].icon}</span>
                        <span className="text-sm font-medium">
                          {unit.count}x {UNIT_INFO[unit.unitType].label}
                        </span>
                      </div>
                      <div className="text-xs text-blue-300 font-mono">
                        ⏱ {formatTimeLeft(unit.trainingEndsAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moving units */}
            {movingUnits.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-orange-400 mb-2">🚶 Hareket Halinde</h3>
                <div className="space-y-2">
                  {movingUnits.map((unit) => (
                    <div key={unit.id} className="bg-gray-800 rounded-md px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{UNIT_INFO[unit.unitType].icon}</span>
                        <div>
                          <p className="text-sm font-medium">
                            {unit.count}x {UNIT_INFO[unit.unitType].label}
                          </p>
                          <p className="text-xs text-gray-400">
                            → {unit.destinationRegion?.name ?? '?'}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-orange-300 font-mono">
                        ⏱ {formatTimeLeft(unit.travelEndsAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ready units with move option */}
            {readyUnits.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-green-400 mb-2">✅ Hazır</h3>
                <div className="space-y-2">
                  {readyUnits.map((unit) => (
                    <div key={unit.id} className="bg-gray-800 rounded-md px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{UNIT_INFO[unit.unitType].icon}</span>
                          <div>
                            <p className="text-sm font-medium">
                              {unit.count}x {UNIT_INFO[unit.unitType].label}
                            </p>
                            <p className="text-xs text-gray-400">
                              📍 {unit.garrisonRegion?.name ?? '?'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setMoveUnitId(unit.id);
                            setTab('units');
                          }}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            moveUnitId === unit.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          {moveUnitId === unit.id ? '✓ Seçildi' : 'Taşı'}
                        </button>
                      </div>

                      {/* Inline move form */}
                      {moveUnitId === unit.id && (
                        <div className="mt-3 flex gap-2">
                          <select
                            value={moveDestId}
                            onChange={(e) => setMoveDestId(e.target.value)}
                            className="flex-1 bg-gray-700 text-xs px-2 py-1 rounded"
                          >
                            <option value="">— Hedef seçin —</option>
                            {regions.filter((r) => r.id !== unit.garrisonRegion?.id).map((r) => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => moveMutation.mutate()}
                            disabled={!moveDestId || moveMutation.isPending}
                            className="px-3 py-1 text-xs bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 rounded font-bold"
                          >
                            Gönder
                          </button>
                          <button
                            onClick={() => { setMoveUnitId(''); setMoveDestId(''); }}
                            className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {army.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">🪖</div>
                <p className="text-sm">Henüz birliğiniz yok.</p>
                <button
                  onClick={() => setTab('recruit')}
                  className="mt-3 px-4 py-2 text-xs bg-yellow-700 hover:bg-yellow-600 rounded font-bold"
                >
                  Asker Al →
                </button>
              </div>
            )}

            {/* Active sieges */}
            {sieges.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-red-400 mb-2">🔥 Aktif Kuşatmalar</h3>
                <div className="space-y-2">
                  {sieges.map((siege) => (
                    <div key={siege.id} className="bg-red-900/30 border border-red-700 rounded-md px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-red-300">
                            {siege.targetRegion.name} ({siege.targetRegion.code})
                          </p>
                          <p className="text-xs text-gray-400">
                            Saldırgan: {siege.attacker.username}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-orange-400">⚔️ {siege.attackerPower} güç</p>
                          <p className="text-blue-400">🛡️ {siege.defenderPower} savunma</p>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Bitiş: {formatTimeLeft(siege.endsAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── RECRUIT TAB ───────────────────────────────────────────────── */}
        {tab === 'recruit' && (
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-xs text-gray-400">
              Asker almak için bulunduğunuz şehirde olmanız gerekir.
              Eğitim tamamlandığında birlikler hazır olur.
            </p>

            {/* Unit type selection */}
            <div className="space-y-2">
              {(['INFANTRY', 'CAVALRY', 'ARTILLERY'] as UnitKind[]).map((type) => {
                const info = UNIT_INFO[type];
                return (
                  <button
                    key={type}
                    onClick={() => setRecruitType(type)}
                    className={`w-full flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                      recruitType === type
                        ? 'border-yellow-500 bg-yellow-900/20 text-yellow-300'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bold">{info.label}</p>
                      <p className="text-xs text-gray-400">
                        {info.costAkce.toLocaleString('tr-TR')} Akçe/birlik · {info.trainMinutes} dk eğitim
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-orange-400 font-bold">💪 {info.power} güç</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Count */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Adet</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRecruitCount(Math.max(1, recruitCount - 1))}
                    className="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={recruitCount}
                    onChange={(e) => setRecruitCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center bg-gray-700 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => setRecruitCount(Math.min(100, recruitCount + 1))}
                    className="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Toplam güç:</span>
                  <span className="text-orange-400 font-bold">
                    {UNIT_INFO[recruitType].power * recruitCount} 💪
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Eğitim süresi:</span>
                  <span>{UNIT_INFO[recruitType].trainMinutes} dk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Toplam maliyet:</span>
                  <span className={`font-bold ${canAffordRecruit ? 'text-yellow-400' : 'text-red-400'}`}>
                    {recruitCost.toLocaleString('tr-TR')} Akçe
                  </span>
                </div>
              </div>

              <button
                onClick={() => recruitMutation.mutate()}
                disabled={!canAffordRecruit || recruitMutation.isPending}
                className="w-full py-2 font-bold rounded-md transition-colors bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {recruitMutation.isPending
                  ? '⏳ İşleniyor...'
                  : canAffordRecruit
                    ? `${UNIT_INFO[recruitType].icon} ${recruitCount}x ${UNIT_INFO[recruitType].label} Al`
                    : '❌ Yeterli Akçe Yok'}
              </button>

              {recruitMutation.isSuccess && (
                <p className="text-xs text-green-400 text-center">
                  ✅ Birlikler eğitime alındı!
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── ATTACK TAB ────────────────────────────────────────────────── */}
        {tab === 'attack' && (
          <div className="space-y-4 max-w-md mx-auto">
            <p className="text-xs text-gray-400">
              Bulunduğunuz şehirden hazır birliklerinizle bir şehre saldırın.
              Kuşatma 5 dakika içinde çözülür.
            </p>

            {readyUnits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">🛡️</div>
                <p className="text-sm">Saldırmak için hazır birliğiniz yok.</p>
                <button
                  onClick={() => setTab('recruit')}
                  className="mt-3 px-4 py-2 text-xs bg-yellow-700 hover:bg-yellow-600 rounded"
                >
                  Asker Al →
                </button>
              </div>
            ) : (
              <>
                {/* Target selection */}
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <label className="text-sm font-bold text-red-400">🎯 Hedef Şehir</label>
                  <select
                    value={attackTarget}
                    onChange={(e) => setAttackTarget(e.target.value)}
                    className="w-full bg-gray-700 px-3 py-2 rounded text-sm"
                  >
                    <option value="">— Şehir seçin —</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code})
                        {r.governorId ? ' 👑' : ' 🏴'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit selection */}
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-bold text-orange-400">⚔️ Gönderilecek Birlikler</p>
                  {(['INFANTRY', 'CAVALRY', 'ARTILLERY'] as UnitKind[]).map((type) => {
                    const unitGroup = readyUnits.filter((u) => u.unitType === type);
                    const maxCount = unitGroup.reduce((s, u) => s + u.count, 0);
                    if (maxCount === 0) return null;
                    const selected = attackUnits[type] ?? 0;
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <span className="text-lg w-6">{UNIT_INFO[type].icon}</span>
                        <div className="flex-1">
                          <p className="text-xs font-medium">{UNIT_INFO[type].label}</p>
                          <p className="text-xs text-gray-500">maks {maxCount}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setAttackUnits((prev) => ({
                              ...prev,
                              [type]: Math.max(0, (prev[type] ?? 0) - 1),
                            }))}
                            className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-xs font-bold"
                          >−</button>
                          <input
                            type="number"
                            min={0}
                            max={maxCount}
                            value={selected}
                            onChange={(e) => setAttackUnits((prev) => ({
                              ...prev,
                              [type]: Math.min(maxCount, Math.max(0, parseInt(e.target.value) || 0)),
                            }))}
                            className="w-14 text-center bg-gray-700 rounded px-1 py-0.5 text-xs"
                          />
                          <button
                            onClick={() => setAttackUnits((prev) => ({
                              ...prev,
                              [type]: Math.min(maxCount, (prev[type] ?? 0) + 1),
                            }))}
                            className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-xs font-bold"
                          >+</button>
                        </div>
                        <span className="text-xs text-orange-400 w-12 text-right">
                          💪 {selected * UNIT_INFO[type].power}
                        </span>
                      </div>
                    );
                  })}

                  {/* Power summary */}
                  <div className="border-t border-gray-700 pt-2 flex justify-between text-sm">
                    <span className="text-gray-400">Toplam saldırı gücü:</span>
                    <span className="text-orange-400 font-bold">💪 {attackPowerPreview}</span>
                  </div>
                </div>

                <button
                  onClick={() => attackMutation.mutate()}
                  disabled={!attackTarget || attackPowerPreview === 0 || attackMutation.isPending}
                  className="w-full py-3 font-bold rounded-md transition-colors bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {attackMutation.isPending
                    ? '⏳ Saldırı başlatılıyor...'
                    : '⚔️ Kuşatmayı Başlat'}
                </button>

                {attackMutation.isSuccess && (
                  <p className="text-xs text-green-400 text-center">
                    ✅ Kuşatma başladı! 5 dakika içinde sonuçlanacak.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
