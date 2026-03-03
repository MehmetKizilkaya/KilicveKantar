import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TurkeyMap from '../components/TurkeyMap';
import type { RegionInfo } from '../components/TurkeyMap';
import { useAuthStore } from '../store/auth.store';

const API = '/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Region {
  id: string;
  name: string;
  code: string;
  type: string;
  svgPathId: string;
  factionId?: string | null;
  governorId?: string | null;
  governor?: { username: string } | null;
  faction?: { name: string; tag: string } | null;
  isUnderSiege: boolean;
  economicValue: number;
  militaryValue: number;
  specialResource?: string | null;
  morale?: number;
  stats?: { defenseLevel: number; taxRate: number } | null;
}

interface NpcOrder {
  id: string;
  commodity: string;
  stock: number;
  maxStock: number;
  buyPrice: number;
  sellPrice: number;
}

interface TravelStatus {
  currentRegion: { id: string; name: string } | null;
  destination: { id: string; name: string } | null;
  travelEndsAt: string | null;
  isTraveling: boolean;
  remainingMs: number;
}

interface LaborCycle {
  id: string;
  type: string;
  endsAt: string;
  isActive: boolean;
  akceReward: number;
}

const REGION_TYPE_LABELS: Record<string, string> = {
  AGRICULTURE: '🌾 Tarım',
  INDUSTRIAL: '⚒️ Sanayi',
  TRADE: '💰 Ticaret',
  MILITARY: '⚔️ Askeri',
  COASTAL: '⚓ Kıyı',
};

const LABOR_TYPE_LABELS: Record<string, string> = {
  basic_worker: 'İşçi',
  craftsman: 'Usta',
  trader: 'Tüccar',
  soldier: 'Asker',
};
const LABOR_TYPE_REWARDS: Record<string, number> = {
  basic_worker: 150, craftsman: 350, trader: 600, soldier: 250,
};

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    if (targetMs <= 0) return;
    const iv = setInterval(() => {
      const r = Math.max(0, targetMs - Date.now());
      setRemaining(r);
      if (r === 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [targetMs]);
  return remaining;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapPage() {
  const { accessToken: token, player } = useAuthStore();
  const qc = useQueryClient();
  const headers = { Authorization: `Bearer ${token}` };

  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [npcTab, setNpcTab] = useState<'buy' | 'sell'>('buy');
  const [npcQty, setNpcQty] = useState(1);
  const [npcCommodity, setNpcCommodity] = useState('');
  const [laborType, setLaborType] = useState<string>('basic_worker');

  // ─── Queries ─────────────────────────────────────────────────────────────

  const { data: regions = [] } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: () => fetch(`${API}/regions`).then((r) => r.json()),
    staleTime: 30_000,
  });

  const { data: travelStatus, refetch: refetchTravel } = useQuery<TravelStatus>({
    queryKey: ['travel-status'],
    queryFn: () => fetch(`${API}/travel/status`, { headers }).then((r) => r.json()),
    refetchInterval: 5000,
  });

  const { data: laborCycle, refetch: refetchLabor } = useQuery<LaborCycle | null>({
    queryKey: ['labor-active'],
    queryFn: () => fetch(`${API}/labor/active`, { headers }).then((r) => r.json()),
    refetchInterval: 5000,
  });

  const { data: npcOrders = [] } = useQuery<NpcOrder[]>({
    queryKey: ['npc-orders', selectedRegion?.id],
    queryFn: () =>
      selectedRegion
        ? fetch(`${API}/npc/${selectedRegion.id}`).then((r) => r.json())
        : Promise.resolve([]),
    enabled: !!selectedRegion,
  });

  // ─── Travel countdown ─────────────────────────────────────────────────────
  const travelEndMs = travelStatus?.travelEndsAt ? new Date(travelStatus.travelEndsAt).getTime() : 0;
  const travelRemaining = useCountdown(travelEndMs);
  const laborEndMs = laborCycle?.endsAt ? new Date(laborCycle.endsAt).getTime() : 0;
  const laborRemaining = useCountdown(laborEndMs);

  useEffect(() => {
    if (travelEndMs > 0 && travelRemaining === 0) {
      refetchTravel();
      qc.invalidateQueries({ queryKey: ['regions'] });
    }
  }, [travelRemaining, travelEndMs, refetchTravel, qc]);

  useEffect(() => {
    if (laborEndMs > 0 && laborRemaining === 0) {
      refetchLabor();
    }
  }, [laborRemaining, laborEndMs, refetchLabor]);

  // ─── Mutations ────────────────────────────────────────────────────────────

  const travelMutation = useMutation({
    mutationFn: (destinationRegionId: string) =>
      fetch(`${API}/travel/start`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationRegionId }),
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travel-status'] });
      qc.invalidateQueries({ queryKey: ['regions'] });
    },
  });

  const npcBuyMutation = useMutation({
    mutationFn: ({ commodity, quantity }: { commodity: string; quantity: number }) =>
      fetch(`${API}/npc/${selectedRegion!.id}/buy`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ commodity, quantity }),
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['npc-orders', selectedRegion?.id] });
      qc.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });

  const npcSellMutation = useMutation({
    mutationFn: ({ commodity, quantity }: { commodity: string; quantity: number }) =>
      fetch(`${API}/npc/${selectedRegion!.id}/sell`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ commodity, quantity }),
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['npc-orders', selectedRegion?.id] });
      qc.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });

  const startLaborMutation = useMutation({
    mutationFn: (type: string) =>
      fetch(`${API}/labor/start`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      }),
    onSuccess: () => refetchLabor(),
  });

  const collectLaborMutation = useMutation({
    mutationFn: (cycleId: string) =>
      fetch(`${API}/labor/${cycleId}/collect`, {
        method: 'POST',
        headers,
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      }),
    onSuccess: () => {
      refetchLabor();
      qc.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });

  const handleRegionClick = useCallback((info: RegionInfo) => {
    const full = regions.find((r) => r.id === info.id) ?? null;
    setSelectedRegion(full);
    setNpcCommodity('');
    setNpcQty(1);
  }, [regions]);

  const currentRegionId = travelStatus?.currentRegion?.id ?? player?.homeRegionId;
  const destRegionId = travelStatus?.destination?.id;
  const isInSelectedRegion = selectedRegion?.id === currentRegionId;
  const laborDone = laborCycle && laborRemaining === 0 && laborCycle.isActive;

  return (
    <div className="flex h-full bg-gray-900 text-white overflow-hidden">

      {/* ── Left: Map ─────────────────────────────────────────────────────── */}
      <div className="flex-1 relative min-w-0">
        <TurkeyMap
          regions={regions}
          currentRegionId={currentRegionId}
          destinationRegionId={destRegionId}
          onRegionClick={handleRegionClick}
        />

        {/* Travel countdown banner */}
        {travelStatus?.isTraveling && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-blue-900/90 border border-blue-500 rounded-lg px-4 py-2 text-sm font-bold text-blue-200 shadow-lg">
            🚶 {travelStatus.destination?.name} — varış: {formatTime(travelRemaining)}
          </div>
        )}

        {/* Bottom bar — Labor & location */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/95 border-t border-gray-700 px-4 py-2 flex items-center gap-4">
          {/* Location */}
          <div className="text-sm">
            <span className="text-gray-400">Konum:</span>{' '}
            <span className="font-bold text-yellow-400">
              {travelStatus?.currentRegion?.name ?? '—'}
            </span>
          </div>

          <div className="flex-1" />

          {/* Labor panel */}
          {laborCycle && laborCycle.isActive ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {LABOR_TYPE_LABELS[laborCycle.type]} ×
              </span>
              {laborDone ? (
                <button
                  onClick={() => collectLaborMutation.mutate(laborCycle.id)}
                  className="px-3 py-1 text-xs bg-green-600 hover:bg-green-500 rounded font-bold"
                >
                  ✅ Topla (+{laborCycle.akceReward} ⚜)
                </button>
              ) : (
                <span className="font-mono text-green-400 text-sm">{formatTime(laborRemaining)}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={laborType}
                onChange={(e) => setLaborType(e.target.value)}
                className="bg-gray-700 text-xs px-2 py-1 rounded"
              >
                {Object.entries(LABOR_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v} (+{LABOR_TYPE_REWARDS[k]}⚜)</option>
                ))}
              </select>
              <button
                onClick={() => startLaborMutation.mutate(laborType)}
                disabled={startLaborMutation.isPending}
                className="px-3 py-1 text-xs bg-yellow-700 hover:bg-yellow-600 rounded font-bold"
              >
                ⚒️ Çalış (10 dk)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: Region info ──────────────────────────────────────── */}
      {selectedRegion ? (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-yellow-400">{selectedRegion.name}</h2>
                <p className="text-xs text-gray-400">{REGION_TYPE_LABELS[selectedRegion.type]}</p>
              </div>
              <button onClick={() => setSelectedRegion(null)} className="text-gray-500 hover:text-white text-xl leading-none">&times;</button>
            </div>

            {/* Faction / Governor */}
            <div className="mt-2 text-xs space-y-1">
              {selectedRegion.faction ? (
                <p className="text-blue-300">
                  🏴 Faksiyon: <b>{selectedRegion.faction.name}</b> [{selectedRegion.faction.tag}]
                </p>
              ) : (
                <p className="text-gray-500">🏴 Bağımsız</p>
              )}
              {selectedRegion.governor ? (
                <p className="text-purple-300">👑 Vali: <b>{selectedRegion.governor.username}</b></p>
              ) : (
                <p className="text-gray-500">👑 Yöneticisiz</p>
              )}
              {selectedRegion.specialResource && (
                <p className="text-green-300">🌟 Özel: <b>{selectedRegion.specialResource}</b></p>
              )}
            </div>

            {/* Stats */}
            <div className="mt-2 flex gap-3 text-xs text-gray-300">
              <span>📈 Ekonomi: {selectedRegion.economicValue}</span>
              <span>⚔️ Askeri: {selectedRegion.militaryValue}</span>
            </div>

            {/* Siege warning */}
            {selectedRegion.isUnderSiege && (
              <div className="mt-2 text-xs text-red-400 font-bold">🔥 Bu şehir kuşatma altında!</div>
            )}

            {/* Travel button */}
            {!isInSelectedRegion && (
              <button
                onClick={() => travelMutation.mutate(selectedRegion.id)}
                disabled={travelStatus?.isTraveling || travelMutation.isPending}
                className="mt-3 w-full py-2 text-sm font-bold bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
              >
                {travelStatus?.isTraveling
                  ? '🚶 Seyahatte...'
                  : `🚀 Seyahat Et (~5-20 dk, -5⚡)`}
              </button>
            )}
            {isInSelectedRegion && (
              <div className="mt-3 text-center text-xs text-yellow-400 font-bold py-2 bg-yellow-900/30 rounded">
                📍 Şu an buradasınız
              </div>
            )}
            {travelMutation.isError && (
              <p className="mt-1 text-xs text-red-400">{(travelMutation.error as Error).message}</p>
            )}
          </div>

          {/* NPC Traders */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-bold text-gray-300 mb-3">🏪 NPC Tüccar</h3>

            {!isInSelectedRegion && (
              <p className="text-xs text-gray-500 italic">Ticaret için bu şehirde olmanız gerekir.</p>
            )}

            {isInSelectedRegion && (
              <>
                {/* Tab */}
                <div className="flex gap-1 mb-3">
                  <button
                    onClick={() => setNpcTab('buy')}
                    className={`flex-1 py-1 text-xs rounded ${npcTab === 'buy' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    Satın Al
                  </button>
                  <button
                    onClick={() => setNpcTab('sell')}
                    className={`flex-1 py-1 text-xs rounded ${npcTab === 'sell' ? 'bg-red-700 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    Sat
                  </button>
                </div>

                <div className="space-y-2">
                  {npcOrders.length === 0 && (
                    <p className="text-xs text-gray-500 italic">Bu şehirde NPC emri yok.</p>
                  )}
                  {npcOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setNpcCommodity(order.commodity)}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-colors ${
                        npcCommodity === order.commodity
                          ? 'border-yellow-500 bg-gray-700'
                          : 'border-gray-600 bg-gray-750 hover:border-gray-500'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold capitalize">{order.commodity.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-400">
                          Stok: {order.stock}/{order.maxStock}
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-green-400">Al: {order.buyPrice} ⚜</p>
                        <p className="text-red-400">Sat: {order.sellPrice} ⚜</p>
                      </div>
                    </div>
                  ))}
                </div>

                {npcCommodity && (
                  <div className="mt-3 flex gap-2 items-center">
                    <input
                      type="number"
                      min={1}
                      value={npcQty}
                      onChange={(e) => setNpcQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 bg-gray-700 text-white text-xs px-2 py-1 rounded"
                    />
                    {npcTab === 'buy' ? (
                      <button
                        onClick={() => npcBuyMutation.mutate({ commodity: npcCommodity, quantity: npcQty })}
                        disabled={npcBuyMutation.isPending}
                        className="flex-1 py-1 text-xs bg-green-700 hover:bg-green-600 rounded font-bold"
                      >
                        Satın Al (
                        {(npcOrders.find((o) => o.commodity === npcCommodity)?.buyPrice ?? 0) * npcQty} ⚜)
                      </button>
                    ) : (
                      <button
                        onClick={() => npcSellMutation.mutate({ commodity: npcCommodity, quantity: npcQty })}
                        disabled={npcSellMutation.isPending}
                        className="flex-1 py-1 text-xs bg-red-700 hover:bg-red-600 rounded font-bold"
                      >
                        Sat (+
                        {(npcOrders.find((o) => o.commodity === npcCommodity)?.sellPrice ?? 0) * npcQty} ⚜)
                      </button>
                    )}
                  </div>
                )}
                {(npcBuyMutation.isError || npcSellMutation.isError) && (
                  <p className="mt-1 text-xs text-red-400">
                    {((npcBuyMutation.error || npcSellMutation.error) as Error).message}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* No region selected — hint */
        <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm text-gray-400">Bir şehre tıklayarak bilgi görün ve seyahat edin.</p>
          <div className="mt-6 text-xs text-gray-500 space-y-1">
            <p>🟡 Bulunduğun şehir</p>
            <p>🟢 Seyahat hedefi</p>
            <p>🔴 Kuşatma altında</p>
          </div>
        </div>
      )}
    </div>
  );
}
