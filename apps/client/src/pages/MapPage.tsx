import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

// ─── Constants ────────────────────────────────────────────────────────────────

const REGION_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  AGRICULTURE: { label: 'Tarım', icon: '🌾', color: 'text-green-400' },
  INDUSTRIAL:  { label: 'Sanayi', icon: '⚒️', color: 'text-orange-400' },
  TRADE:       { label: 'Ticaret', icon: '💰', color: 'text-blue-400' },
  MILITARY:    { label: 'Askeri', icon: '⚔️', color: 'text-red-400' },
  COASTAL:     { label: 'Kıyı', icon: '⚓', color: 'text-cyan-400' },
};

const LABOR_TYPE_LABELS: Record<string, { label: string; icon: string; reward: number }> = {
  basic_worker: { label: 'İşçi',   icon: '⛏️',  reward: 150 },
  craftsman:    { label: 'Usta',   icon: '🔨',  reward: 350 },
  trader:       { label: 'Tüccar', icon: '📦',  reward: 600 },
  soldier:      { label: 'Asker',  icon: '🗡️',  reward: 250 },
};

const COMMODITY_LABELS: Record<string, string> = {
  wheat: 'Buğday', bread: 'Ekmek', olive_oil: 'Zeytinyağı', iron: 'Demir',
  wood: 'Ahşap', stone: 'Taş', coal: 'Kömür', cloth: 'Kumaş',
  silk: 'İpek', gold_ornament: 'Altın Süs', sword: 'Kılıç',
  shield: 'Kalkan', armor: 'Zırh', salt: 'Tuz', fish: 'Balık',
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    if (targetMs <= 0) { setRemaining(0); return; }
    const iv = setInterval(() => {
      const r = Math.max(0, targetMs - Date.now());
      setRemaining(r);
      if (r === 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [targetMs]);
  return remaining;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const h = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return mobile;
}

function fmt(ms: number) {
  if (ms <= 0) return '00:00';
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ─── Bottom Sheet (Mobile) ────────────────────────────────────────────────────

type SheetLevel = 'closed' | 'peek' | 'half' | 'full';

// Snap translateY values (from bottom, as fraction of sheet height 90vh)
// peek  = only top 120px visible   → translate = 90vh - 120px
// half  = 50% visible              → translate = 45vh
// full  = fully open               → translate = 0
const SHEET_SNAP_STYLE: Record<SheetLevel, string> = {
  closed: 'translateY(100%)',
  peek:   'translateY(calc(90vh - 120px))',
  half:   'translateY(44vh)',
  full:   'translateY(0)',
};

interface BottomSheetProps {
  level: SheetLevel;
  onLevelChange: (l: SheetLevel) => void;
  onClose: () => void;
  children: React.ReactNode;
}

function BottomSheet({ level, onLevelChange, onClose, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startTransform: number } | null>(null);
  const [liveY, setLiveY] = useState<number | null>(null); // null = snap to level

  // Get current translateY in pixels for snap levels
  function snapPx(l: SheetLevel): number {
    const vh = window.innerHeight;
    const sheetH = vh * 0.9;
    if (l === 'closed') return sheetH;
    if (l === 'peek')   return sheetH - 120;
    if (l === 'half')   return sheetH * 0.44;
    return 0;
  }

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startY: e.clientY,
      startTransform: liveY ?? snapPx(level),
    };
  }, [liveY, level]);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    if (!dragRef.current) return;
    const dy = e.clientY - dragRef.current.startY;
    const newY = Math.max(0, dragRef.current.startTransform + dy);
    setLiveY(newY);
  }, []);

  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    if (!dragRef.current) return;
    const dy = e.clientY - dragRef.current.startY;
    const velocity = dy; // positive = dragged down
    const cur = dragRef.current.startTransform + dy;
    const vh = window.innerHeight;
    const sheetH = vh * 0.9;
    dragRef.current = null;
    setLiveY(null);

    // Snap logic
    if (velocity > 80 || cur > sheetH * 0.85) {
      // dragged down hard → close
      onClose();
    } else if (cur < sheetH * 0.2) {
      onLevelChange('full');
    } else if (cur < sheetH * 0.6) {
      onLevelChange('half');
    } else {
      onLevelChange('peek');
    }
  }, [onClose, onLevelChange]);

  const transform = liveY !== null
    ? `translateY(${liveY}px)`
    : SHEET_SNAP_STYLE[level];

  const isVisible = level !== 'closed' || liveY !== null;

  return (
    <>
      {/* Backdrop — tap to close */}
      {(level === 'half' || level === 'full') && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          style={{ pointerEvents: 'auto' }}
          onPointerDown={onClose}
        />
      )}

      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 rounded-t-2xl shadow-2xl border-t border-gray-700"
        style={{
          height: '90vh',
          transform,
          transition: liveY !== null ? 'none' : 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform',
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Content (scrollable in full mode) */}
        <div
          className="overflow-y-auto"
          style={{ height: 'calc(100% - 32px)' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

// ─── Region Detail Panel content ──────────────────────────────────────────────

interface RegionPanelProps {
  region: Region;
  isHere: boolean;
  isTraveling: boolean;
  npcOrders: NpcOrder[];
  npcTab: 'buy' | 'sell';
  setNpcTab: (t: 'buy' | 'sell') => void;
  npcCommodity: string;
  setNpcCommodity: (c: string) => void;
  npcQty: number;
  setNpcQty: (n: number) => void;
  onTravel: () => void;
  onNpcBuy: () => void;
  onNpcSell: () => void;
  travelPending: boolean;
  npcPending: boolean;
  travelError?: string;
  npcError?: string;
  onClose?: () => void;
  sheetLevel?: SheetLevel;
  onSheetLevel?: (l: SheetLevel) => void;
}

function RegionPanel({
  region, isHere, isTraveling, npcOrders, npcTab, setNpcTab,
  npcCommodity, setNpcCommodity, npcQty, setNpcQty,
  onTravel, onNpcBuy, onNpcSell, travelPending, npcPending,
  travelError, npcError, onClose, onSheetLevel,
}: RegionPanelProps) {
  const typeInfo = REGION_TYPE_LABELS[region.type] ?? { label: region.type, icon: '📍', color: 'text-gray-400' };
  const selectedOrder = npcOrders.find((o) => o.commodity === npcCommodity);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-4 pt-1 pb-3 border-b border-gray-700/60 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">{region.name}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`text-xs font-medium ${typeInfo.color}`}>
                {typeInfo.icon} {typeInfo.label}
              </span>
              {region.faction && (
                <span className="text-xs text-blue-300 truncate">
                  🏴 {region.faction.tag}
                </span>
              )}
              {region.governor && (
                <span className="text-xs text-purple-300 truncate">
                  👑 {region.governor.username}
                </span>
              )}
            </div>
            {region.isUnderSiege && (
              <div className="mt-1 text-xs font-bold text-red-400 animate-pulse">
                🔥 Kuşatma Altında!
              </div>
            )}
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none flex-shrink-0 p-1">×</button>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-2 text-xs text-gray-400">
          <span>📈 {region.economicValue}</span>
          <span>⚔️ {region.militaryValue}</span>
          {region.specialResource && (
            <span className="text-yellow-400">🌟 {region.specialResource}</span>
          )}
        </div>

        {/* ── 3 CTA buttons ── */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {/* Travel */}
          {!isHere ? (
            <button
              onClick={onTravel}
              disabled={isTraveling || travelPending}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-blue-900/60 border border-blue-700/60 hover:bg-blue-800/70 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-medium text-blue-300"
            >
              <span className="text-lg">🚀</span>
              {isTraveling ? 'Seyahatte' : 'Seyahat Et'}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-yellow-900/40 border border-yellow-600/40 text-xs font-medium text-yellow-400">
              <span className="text-lg">📍</span>
              Buradasın
            </div>
          )}

          {/* NPC Trade */}
          <button
            onClick={() => onSheetLevel?.('full')}
            disabled={!isHere}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-green-900/60 border border-green-700/60 hover:bg-green-800/70 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-medium text-green-300"
          >
            <span className="text-lg">🏪</span>
            NPC Ticaret
          </button>

          {/* War */}
          <button
            disabled={isHere}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-red-900/60 border border-red-700/60 hover:bg-red-800/70 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-medium text-red-300"
          >
            <span className="text-lg">⚔️</span>
            Saldır
          </button>
        </div>

        {travelError && (
          <p className="mt-2 text-xs text-red-400">{travelError}</p>
        )}
      </div>

      {/* ── NPC Trader section (visible when half/full or desktop) ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-300">🏪 NPC Tüccar</h3>
          {!isHere && (
            <span className="text-xs text-gray-500 italic">Ticaret için buraya gel</span>
          )}
        </div>

        {isHere && (
          <>
            {/* Buy / Sell tabs */}
            <div className="flex gap-1 mb-3 bg-gray-800 rounded-lg p-0.5">
              {(['buy', 'sell'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNpcTab(t)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    npcTab === t
                      ? t === 'buy' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t === 'buy' ? '🛒 Satın Al' : '💸 Sat'}
                </button>
              ))}
            </div>

            {/* Orders list */}
            <div className="space-y-1.5">
              {npcOrders.length === 0 && (
                <p className="text-xs text-gray-500 italic text-center py-4">NPC emri yok.</p>
              )}
              {npcOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setNpcCommodity(order.commodity)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                    npcCommodity === order.commodity
                      ? 'border-yellow-500 bg-yellow-900/30'
                      : 'border-gray-700/60 bg-gray-800/50 hover:border-gray-600 active:scale-[0.98]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {COMMODITY_LABELS[order.commodity] ?? order.commodity}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${Math.round((order.stock / order.maxStock) * 48)}px`, minWidth: 4 }}
                      />
                      <span className="text-xs text-gray-500">{order.stock}/{order.maxStock}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-green-400 font-medium">{order.buyPrice.toLocaleString('tr-TR')} ⚜</p>
                    <p className="text-red-400">{order.sellPrice.toLocaleString('tr-TR')} ⚜</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quantity + action button */}
            {npcCommodity && (
              <div className="mt-3 bg-gray-800/70 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNpcQty(Math.max(1, npcQty - 1))}
                    className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 font-bold text-white transition-colors"
                  >−</button>
                  <input
                    type="number" min={1} value={npcQty}
                    onChange={(e) => setNpcQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center bg-gray-700 rounded-lg py-1.5 text-sm text-white"
                  />
                  <button
                    onClick={() => setNpcQty(npcQty + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 font-bold text-white transition-colors"
                  >+</button>
                </div>

                {npcTab === 'buy' ? (
                  <button
                    onClick={onNpcBuy}
                    disabled={npcPending || (selectedOrder?.stock ?? 0) === 0}
                    className="w-full py-2.5 text-sm font-bold rounded-xl bg-green-700 hover:bg-green-600 active:scale-[0.98] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                  >
                    {npcPending ? '⏳...' : `Satın Al — ${((selectedOrder?.buyPrice ?? 0) * npcQty).toLocaleString('tr-TR')} ⚜`}
                  </button>
                ) : (
                  <button
                    onClick={onNpcSell}
                    disabled={npcPending}
                    className="w-full py-2.5 text-sm font-bold rounded-xl bg-red-700 hover:bg-red-600 active:scale-[0.98] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                  >
                    {npcPending ? '⏳...' : `Sat — +${((selectedOrder?.sellPrice ?? 0) * npcQty).toLocaleString('tr-TR')} ⚜`}
                  </button>
                )}

                {npcError && <p className="text-xs text-red-400">{npcError}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const { accessToken: token, player } = useAuthStore();
  const qc = useQueryClient();
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const isMobile = useIsMobile();

  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [sheetLevel, setSheetLevel] = useState<SheetLevel>('closed');
  const [npcTab, setNpcTab] = useState<'buy' | 'sell'>('buy');
  const [npcQty, setNpcQty] = useState(1);
  const [npcCommodity, setNpcCommodity] = useState('');
  const [laborType, setLaborType] = useState('basic_worker');
  const [travelError, setTravelError] = useState('');
  const [npcError, setNpcError] = useState('');

  // ── Queries ────────────────────────────────────────────────────────────────

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

  // ── Countdown timers ──────────────────────────────────────────────────────

  const travelEndMs = travelStatus?.travelEndsAt ? new Date(travelStatus.travelEndsAt).getTime() : 0;
  const laborEndMs  = laborCycle?.endsAt ? new Date(laborCycle.endsAt).getTime() : 0;
  const travelRemaining = useCountdown(travelEndMs);
  const laborRemaining  = useCountdown(laborEndMs);

  useEffect(() => {
    if (travelEndMs > 0 && travelRemaining === 0) {
      refetchTravel();
      qc.invalidateQueries({ queryKey: ['regions'] });
    }
  }, [travelRemaining, travelEndMs, refetchTravel, qc]);

  useEffect(() => {
    if (laborEndMs > 0 && laborRemaining === 0) refetchLabor();
  }, [laborRemaining, laborEndMs, refetchLabor]);

  // ── Mutations ────────────────────────────────────────────────────────────

  const travelMutation = useMutation({
    mutationFn: (destinationRegionId: string) =>
      fetch(`${API}/travel/start`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationRegionId }),
      }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    onSuccess: () => {
      setTravelError('');
      qc.invalidateQueries({ queryKey: ['travel-status'] });
      qc.invalidateQueries({ queryKey: ['regions'] });
    },
    onError: (err) => setTravelError((err as Error).message),
  });

  const npcBuyMutation = useMutation({
    mutationFn: ({ commodity, quantity }: { commodity: string; quantity: number }) =>
      fetch(`${API}/npc/${selectedRegion!.id}/buy`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ commodity, quantity }),
      }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    onSuccess: () => {
      setNpcError('');
      qc.invalidateQueries({ queryKey: ['npc-orders', selectedRegion?.id] });
      qc.invalidateQueries({ queryKey: ['auth-me'] });
    },
    onError: (err) => setNpcError((err as Error).message),
  });

  const npcSellMutation = useMutation({
    mutationFn: ({ commodity, quantity }: { commodity: string; quantity: number }) =>
      fetch(`${API}/npc/${selectedRegion!.id}/sell`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ commodity, quantity }),
      }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    onSuccess: () => {
      setNpcError('');
      qc.invalidateQueries({ queryKey: ['npc-orders', selectedRegion?.id] });
      qc.invalidateQueries({ queryKey: ['auth-me'] });
    },
    onError: (err) => setNpcError((err as Error).message),
  });

  const startLaborMutation = useMutation({
    mutationFn: (type: string) =>
      fetch(`${API}/labor/start`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    onSuccess: () => refetchLabor(),
  });

  const collectLaborMutation = useMutation({
    mutationFn: (cycleId: string) =>
      fetch(`${API}/labor/${cycleId}/collect`, { method: 'POST', headers })
        .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    onSuccess: () => {
      refetchLabor();
      qc.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });

  // ── Derived ──────────────────────────────────────────────────────────────

  const currentRegionId = travelStatus?.currentRegion?.id ?? player?.homeRegionId;
  const destRegionId    = travelStatus?.destination?.id;
  const isInSelected    = selectedRegion?.id === currentRegionId;
  const laborDone       = laborCycle?.isActive && laborRemaining === 0;

  const handleRegionClick = useCallback((info: RegionInfo) => {
    const full = regions.find((r) => r.id === info.id) ?? null;
    setSelectedRegion(full);
    setNpcCommodity('');
    setNpcQty(1);
    setTravelError('');
    setNpcError('');
    if (full) setSheetLevel('peek');
  }, [regions]);

  const handleClose = useCallback(() => {
    setSelectedRegion(null);
    setSheetLevel('closed');
  }, []);

  // Shared panel props
  const panelProps: RegionPanelProps | null = selectedRegion ? {
    region: selectedRegion,
    isHere: isInSelected,
    isTraveling: travelStatus?.isTraveling ?? false,
    npcOrders,
    npcTab,
    setNpcTab,
    npcCommodity,
    setNpcCommodity,
    npcQty,
    setNpcQty,
    onTravel: () => travelMutation.mutate(selectedRegion.id),
    onNpcBuy: () => npcBuyMutation.mutate({ commodity: npcCommodity, quantity: npcQty }),
    onNpcSell: () => npcSellMutation.mutate({ commodity: npcCommodity, quantity: npcQty }),
    travelPending: travelMutation.isPending,
    npcPending: npcBuyMutation.isPending || npcSellMutation.isPending,
    travelError,
    npcError,
    onClose: handleClose,
    sheetLevel,
    onSheetLevel: setSheetLevel,
  } : null;

  // ── Labor bottom bar ──────────────────────────────────────────────────────

  const LaborBar = (
    <div className="flex items-center gap-3 px-3 py-2 bg-gray-900/95 border-t border-gray-700/70 flex-shrink-0">
      {/* Location */}
      <div className="text-xs min-w-0">
        <span className="text-gray-500">📍 </span>
        <span className="font-semibold text-yellow-400 truncate">
          {travelStatus?.currentRegion?.name ?? '—'}
        </span>
        {travelStatus?.isTraveling && (
          <span className="ml-1 text-blue-400 font-mono">→ {fmt(travelRemaining)}</span>
        )}
      </div>

      <div className="flex-1" />

      {/* Labor */}
      {laborCycle?.isActive ? (
        laborDone ? (
          <button
            onClick={() => collectLaborMutation.mutate(laborCycle.id)}
            disabled={collectLaborMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-700 hover:bg-green-600 rounded-lg font-bold transition-colors"
          >
            ✅ +{laborCycle.akceReward} ⚜ Topla
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400">{LABOR_TYPE_LABELS[laborCycle.type]?.icon}</span>
            <span className="font-mono text-green-400">{fmt(laborRemaining)}</span>
          </div>
        )
      ) : (
        <div className="flex items-center gap-1.5">
          <select
            value={laborType}
            onChange={(e) => setLaborType(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-xs px-2 py-1.5 rounded-lg text-gray-200"
          >
            {Object.entries(LABOR_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label} (+{v.reward}⚜)</option>
            ))}
          </select>
          <button
            onClick={() => startLaborMutation.mutate(laborType)}
            disabled={startLaborMutation.isPending}
            className="px-3 py-1.5 text-xs bg-yellow-700 hover:bg-yellow-600 rounded-lg font-bold transition-colors whitespace-nowrap"
          >
            ⚒️ 10 dk
          </button>
        </div>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-950 text-white">

      {/* ── Travel banner ──────────────────────────────────────────────────── */}
      {travelStatus?.isTraveling && (
        <div className="absolute top-3 left-1/2 z-30 -translate-x-1/2 flex items-center gap-2 bg-blue-950/95 border border-blue-600 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-200 shadow-xl pointer-events-none">
          <span className="animate-bounce">🚶</span>
          <span>{travelStatus.destination?.name}</span>
          <span className="font-mono text-blue-400">{fmt(travelRemaining)}</span>
        </div>
      )}

      {/* ── DESKTOP layout: map + right panel ─────────────────────────────── */}
      {!isMobile && (
        <div className="flex flex-1 min-h-0">
          {/* Map */}
          <div className="flex-1 relative min-w-0">
            <TurkeyMap
              regions={regions}
              currentRegionId={currentRegionId}
              destinationRegionId={destRegionId}
              onRegionClick={handleRegionClick}
            />
          </div>

          {/* Desktop right panel */}
          <div className="w-80 flex flex-col border-l border-gray-700/60 bg-gray-900 overflow-hidden">
            {selectedRegion && panelProps ? (
              <RegionPanel {...panelProps} />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
                <div className="text-5xl mb-4 opacity-30">🗺️</div>
                <p className="text-sm text-gray-500">Bir şehre tıkla</p>
                <div className="mt-6 space-y-2 text-xs text-gray-600">
                  <p>🟡 Bulunduğun şehir</p>
                  <p>🟢 Hedef şehir</p>
                  <p>🔴 Kuşatma altında</p>
                </div>
              </div>
            )}
            {LaborBar}
          </div>
        </div>
      )}

      {/* ── MOBILE layout: full map + bottom sheet ─────────────────────────── */}
      {isMobile && (
        <div className="flex-1 relative min-h-0 flex flex-col">
          {/* Full-screen map */}
          <div className="flex-1 relative">
            <TurkeyMap
              regions={regions}
              currentRegionId={currentRegionId}
              destinationRegionId={destRegionId}
              onRegionClick={handleRegionClick}
            />
          </div>

          {/* Labor bar (always visible at bottom on mobile) */}
          {LaborBar}

          {/* Bottom sheet */}
          {selectedRegion && panelProps && (
            <BottomSheet
              level={sheetLevel}
              onLevelChange={setSheetLevel}
              onClose={handleClose}
            >
              <RegionPanel {...panelProps} />
            </BottomSheet>
          )}
        </div>
      )}
    </div>
  );
}
