import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useEffect } from 'react';
import clsx from 'clsx';

function EnergyBar({ energy, max }: { energy: number; max: number }) {
  const pct = Math.min(100, (energy / max) * 100);
  const color =
    pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-game-muted w-14">⚡ Enerji</span>
      <div className="flex-1 bg-game-bg rounded-full h-2 overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-game-muted w-12 text-right">
        {energy}/{max}
      </span>
    </div>
  );
}

function XpBar({ label, xp, level }: { label: string; xp: number; level: number }) {
  const xpForNext = level * 1000;
  const pct = Math.min(100, (xp / xpForNext) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-game-muted w-14">{label}</span>
      <div className="flex-1 bg-game-bg rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-gold-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-game-muted w-12 text-right">Sv. {level}</span>
    </div>
  );
}

export default function PlayerHUD() {
  const { player, updatePlayer } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['player', 'me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data),
    refetchInterval: 60_000,
    enabled: !!player,
  });

  useEffect(() => {
    if (data) updatePlayer(data);
  }, [data, updatePlayer]);

  // Listen for forced refetch events
  useEffect(() => {
    const handler = () => {
      api.get('/auth/me').then((r) => updatePlayer(r.data));
    };
    window.addEventListener('kv:refetch_player', handler);
    return () => window.removeEventListener('kv:refetch_player', handler);
  }, [updatePlayer]);

  if (!player) return null;

  const maxEnergy =
    player.vipPlan === 'SULTAN' ? 200
    : player.vipPlan === 'COMMANDER' ? 175
    : player.vipPlan === 'TRADER' ? 150
    : 100;

  const vipBadge =
    player.vipPlan === 'SULTAN' ? { label: '👑 Sultan', cls: 'badge-gold' }
    : player.vipPlan === 'COMMANDER' ? { label: '⚔️ Komutan', cls: 'bg-indigo-900 text-indigo-300' }
    : player.vipPlan === 'TRADER' ? { label: '📦 Tüccar', cls: 'badge-green' }
    : null;

  return (
    <div className="panel p-3 space-y-2">
      {/* Player name + VIP */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-game-text">{player.username}</span>
        {vipBadge && (
          <span className={clsx('badge text-[10px]', vipBadge.cls)}>
            {vipBadge.label}
          </span>
        )}
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-game-bg rounded-md px-3 py-2 text-center">
          <div className="text-xs text-game-muted">⚙️ Akçe</div>
          <div className="text-sm font-bold text-gold-400">
            {player.akceBalance.toLocaleString('tr-TR')}
          </div>
        </div>
        <div className="bg-game-bg rounded-md px-3 py-2 text-center">
          <div className="text-xs text-game-muted">🥇 Altın</div>
          <div className="text-sm font-bold text-yellow-300">
            {player.altinBalance.toLocaleString('tr-TR')}
          </div>
        </div>
      </div>

      {/* Energy */}
      <EnergyBar energy={player.energy} max={maxEnergy} />

      {/* XP bars */}
      <XpBar label="🗡️ Askeri" xp={player.militaryXp ?? 0} level={player.militaryLevel} />
      <XpBar label="📦 Ticaret" xp={player.tradeXp ?? 0} level={player.tradeLevel} />
    </div>
  );
}
