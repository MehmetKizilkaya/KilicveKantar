import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import turkeyMapRaw from '../assets/turkey.svg?raw';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegionInfo {
  id: string;
  name: string;
  code: string;
  type: string;
  svgPathId: string;
  factionId?: string | null;
  governorId?: string | null;
  isUnderSiege?: boolean;
  economicValue?: number;
  militaryValue?: number;
}

export interface TurkeyMapProps {
  regions: RegionInfo[];
  currentRegionId?: string | null;
  destinationRegionId?: string | null;
  onRegionClick?: (region: RegionInfo) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FACTION_COLORS = [
  '#c0392b', '#2980b9', '#27ae60', '#8e44ad',
  '#e67e22', '#16a085', '#f39c12', '#1a5276',
];

const TYPE_COLORS: Record<string, string> = {
  AGRICULTURE: '#3d6b35',
  INDUSTRIAL:  '#5c4520',
  TRADE:       '#1e5f7a',
  MILITARY:    '#6b2020',
  COASTAL:     '#15546b',
};

// SVG natural dimensions (from the file)
const SVG_W = 1000;
const SVG_H = 422;
const MIN_SCALE = 0.5;
const MAX_SCALE = 8;

// Pre-process SVG once: fix lowercase viewbox → viewBox
const PROCESSED_SVG = turkeyMapRaw.replace(/\bviewbox\b/gi, 'viewBox');

// ─── Component ────────────────────────────────────────────────────────────────

export default function TurkeyMap({
  regions,
  currentRegionId,
  destinationRegionId,
  onRegionClick,
}: TurkeyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan / zoom state (tx, ty = offset of SVG top-left from container top-left)
  const tx = useRef(0);
  const ty = useRef(0);
  const sc = useRef(1);
  const [, forceRender] = useState(0);
  const redraw = useCallback(() => forceRender((n) => n + 1), []);

  // Pointer tracking
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  // Single-pointer: pan & tap
  const panOrigin = useRef<{ cx: number; cy: number; tx0: number; ty0: number } | null>(null);
  const tapOrigin = useRef<{ x: number; y: number; t: number; id: number } | null>(null);
  // Two-pointer: pinch zoom
  const pinchStart = useRef<{
    dist: number; midX: number; midY: number;
    tx0: number; ty0: number; sc0: number;
  } | null>(null);
  // Double-tap
  const lastTapAt = useRef(0);

  // Tooltip (desktop hover)
  const [tooltip, setTooltip] = useState<{ name: string; code: string; cx: number; cy: number } | null>(null);
  // Visual tap ripple
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  // ── Lookups ─────────────────────────────────────────────────────────────────

  const regionByPathId = useMemo(() => {
    const m = new Map<string, RegionInfo>();
    for (const r of regions) m.set(r.svgPathId, r);
    return m;
  }, [regions]);

  const factionColorMap = useMemo(() => {
    const m = new Map<string, string>();
    let i = 0;
    for (const r of regions) {
      if (r.factionId && !m.has(r.factionId))
        m.set(r.factionId, FACTION_COLORS[i++ % FACTION_COLORS.length]);
    }
    return m;
  }, [regions]);

  // ── Style SVG paths whenever data changes ────────────────────────────────────

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const paths = el.querySelectorAll<SVGPathElement>('path[id]');
    paths.forEach((path) => {
      const r = regionByPathId.get(path.id);
      if (!r) {
        path.style.fill = '#1e293b';
        path.style.cursor = 'default';
        path.setAttribute('pointer-events', 'none');
        return;
      }

      const isHere = r.id === currentRegionId;
      const isDest = r.id === destinationRegionId;

      // Base color
      let fill = r.factionId
        ? (factionColorMap.get(r.factionId) ?? '#4a5568')
        : (TYPE_COLORS[r.type] ?? '#374151');

      path.style.fill = fill;
      path.style.stroke = '#0a0f1a';
      path.style.strokeWidth = '0.6';
      path.style.cursor = 'pointer';
      path.style.transition = 'fill 0.15s';
      path.setAttribute('pointer-events', 'all');

      if (isHere) {
        path.style.fill = '#f6c90e';
        path.style.stroke = '#c9a100';
        path.style.strokeWidth = '1.5';
        path.style.filter = 'drop-shadow(0 0 4px rgba(246,201,14,0.7))';
      } else if (isDest) {
        path.style.fill = '#4ade80';
        path.style.stroke = '#16a34a';
        path.style.strokeWidth = '1.5';
        path.style.filter = 'drop-shadow(0 0 4px rgba(74,222,128,0.6))';
      } else if (r.isUnderSiege) {
        path.style.fill = '#f87171';
        path.style.filter = 'none';
      } else {
        path.style.filter = 'none';
      }
    });
  }, [regions, currentRegionId, destinationRegionId, regionByPathId, factionColorMap]);

  // ── Fit to container on mount / resize ──────────────────────────────────────

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      const scaleToFit = Math.min((width / SVG_W) * 0.95, (height / SVG_H) * 0.95);
      sc.current = scaleToFit;
      tx.current = (width - SVG_W * scaleToFit) / 2;
      ty.current = (height - SVG_H * scaleToFit) / 2;
      redraw();
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [redraw]);

  // ── Helper: apply bounded pan ────────────────────────────────────────────────

  const applyTransform = useCallback((newTx: number, newTy: number, newSc: number) => {
    sc.current = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newSc));
    tx.current = newTx;
    ty.current = newTy;
    redraw();
  }, [redraw]);

  // ── Zoom toward a screen point ────────────────────────────────────────────────

  const zoomAt = useCallback((ox: number, oy: number, factor: number) => {
    const newSc = Math.max(MIN_SCALE, Math.min(MAX_SCALE, sc.current * factor));
    const ratio = newSc / sc.current;
    applyTransform(
      ox - (ox - tx.current) * ratio,
      oy - (oy - ty.current) * ratio,
      newSc,
    );
  }, [applyTransform]);

  // ── Fit (reset) ─────────────────────────────────────────────────────────────

  const fitMap = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const s = Math.min((width / SVG_W) * 0.95, (height / SVG_H) * 0.95);
    applyTransform((width - SVG_W * s) / 2, (height - SVG_H * s) / 2, s);
  }, [applyTransform]);

  // ── Pointer events (main interaction surface) ────────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Prevent browser scroll/zoom on this element
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (ptrs.current.size === 1) {
      // Potential tap or pan
      tapOrigin.current = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId };
      panOrigin.current = { cx: e.clientX, cy: e.clientY, tx0: tx.current, ty0: ty.current };
      pinchStart.current = null;
    } else if (ptrs.current.size === 2) {
      // Start pinch — cancel any pending tap
      tapOrigin.current = null;
      panOrigin.current = null;
      const [a, b] = Array.from(ptrs.current.values());
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const el = containerRef.current!;
      const rect = el.getBoundingClientRect();
      pinchStart.current = {
        dist,
        midX: midX - rect.left,
        midY: midY - rect.top,
        tx0: tx.current,
        ty0: ty.current,
        sc0: sc.current,
      };
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (ptrs.current.size === 1 && panOrigin.current) {
      const dx = e.clientX - panOrigin.current.cx;
      const dy = e.clientY - panOrigin.current.cy;

      // Cancel tap if dragged
      if (tapOrigin.current && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
        tapOrigin.current = null;
      }

      if (!tapOrigin.current) {
        tx.current = panOrigin.current.tx0 + dx;
        ty.current = panOrigin.current.ty0 + dy;
        redraw();
      }
    } else if (ptrs.current.size === 2 && pinchStart.current) {
      const [a, b] = Array.from(ptrs.current.values());
      const newDist = Math.hypot(b.x - a.x, b.y - a.y);
      const newMidX = (a.x + b.x) / 2;
      const newMidY = (a.y + b.y) / 2;
      const el = containerRef.current!;
      const rect = el.getBoundingClientRect();
      const { dist: d0, midX: mx0, midY: my0, tx0, ty0, sc0 } = pinchStart.current;

      const newSc = Math.max(MIN_SCALE, Math.min(MAX_SCALE, sc0 * (newDist / d0)));
      // The SVG point under the initial pinch center must stay fixed
      const svgX = (mx0 - tx0) / sc0;
      const svgY = (my0 - ty0) / sc0;
      // Pan delta from pinch center movement
      const panDx = (newMidX - rect.left) - mx0;
      const panDy = (newMidY - rect.top) - my0;

      tx.current = mx0 + panDx - svgX * newSc;
      ty.current = my0 + panDy - svgY * newSc;
      sc.current = newSc;
      redraw();
    }
  }, [redraw]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (tapOrigin.current && tapOrigin.current.id === e.pointerId) {
      const elapsed = Date.now() - tapOrigin.current.t;
      const dx = e.clientX - tapOrigin.current.x;
      const dy = e.clientY - tapOrigin.current.y;
      const isTap = elapsed < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10;

      if (isTap) {
        const now = Date.now();
        if (now - lastTapAt.current < 350) {
          // Double tap → zoom in 2×
          lastTapAt.current = 0;
          const el = containerRef.current;
          if (el) {
            const rect = el.getBoundingClientRect();
            zoomAt(e.clientX - rect.left, e.clientY - rect.top, 2);
          }
        } else {
          lastTapAt.current = now;

          // Find region under tap using elementFromPoint (works through CSS transforms)
          const el = document.elementFromPoint(e.clientX, e.clientY);
          const path = el?.closest?.('path[id]') as SVGPathElement | null;
          if (path) {
            const region = regionByPathId.get(path.id);
            if (region) {
              onRegionClick?.(region);
              // Ripple feedback
              const container = containerRef.current;
              if (container) {
                const rect = container.getBoundingClientRect();
                setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                setTimeout(() => setRipple(null), 500);
              }
            }
          }
        }
      }
      tapOrigin.current = null;
    }

    ptrs.current.delete(e.pointerId);
    if (ptrs.current.size === 0) {
      panOrigin.current = null;
      pinchStart.current = null;
    } else if (ptrs.current.size === 1) {
      // One finger lifted during pinch → restart pan
      pinchStart.current = null;
      const [remaining] = Array.from(ptrs.current.values());
      panOrigin.current = { cx: remaining.x, cy: remaining.y, tx0: tx.current, ty0: ty.current };
    }
  }, [regionByPathId, onRegionClick, zoomAt]);

  // ── Mouse wheel zoom (desktop) ────────────────────────────────────────────────

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor);
  }, [zoomAt]);

  // ── Desktop hover tooltip ────────────────────────────────────────────────────

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const path = el?.closest?.('path[id]') as SVGPathElement | null;
    if (path) {
      const r = regionByPathId.get(path.id);
      if (r) {
        const container = containerRef.current!;
        const rect = container.getBoundingClientRect();
        setTooltip({ name: r.name, code: r.code, cx: e.clientX - rect.left, cy: e.clientY - rect.top });
        return;
      }
    }
    setTooltip(null);
  }, [regionByPathId]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background: '#0d1117', touchAction: 'none', cursor: 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setTooltip(null)}
    >
      {/* SVG — positioned absolutely, CSS-transformed for pan/zoom */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SVG_W,
          height: SVG_H,
          transformOrigin: '0 0',
          transform: `translate(${tx.current}px, ${ty.current}px) scale(${sc.current})`,
          willChange: 'transform',
        }}
        dangerouslySetInnerHTML={{ __html: PROCESSED_SVG }}
      />

      {/* Tap ripple feedback */}
      {ripple && (
        <div
          style={{
            position: 'absolute',
            left: ripple.x - 24,
            top: ripple.y - 24,
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '2px solid rgba(246,201,14,0.8)',
            background: 'rgba(246,201,14,0.15)',
            pointerEvents: 'none',
            animation: 'kvk-ripple 0.5s ease-out forwards',
          }}
        />
      )}

      {/* Hover tooltip (desktop) */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 bg-gray-900/95 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-white whitespace-nowrap shadow-xl"
          style={{
            left: Math.min(tooltip.cx + 14, (containerRef.current?.clientWidth ?? 400) - 180),
            top: Math.max(tooltip.cy - 44, 4),
          }}
        >
          <span className="font-bold">{tooltip.name}</span>
          <span className="text-gray-400 ml-1.5">{tooltip.code}</span>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-16 left-2 text-xs bg-black/60 rounded-lg p-2 space-y-1 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: '#f6c90e' }} />
          <span className="text-gray-300">Bulunduğun Şehir</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: '#4ade80' }} />
          <span className="text-gray-300">Hedef</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: '#f87171' }} />
          <span className="text-gray-300">Kuşatma</span>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-16 right-2 flex flex-col gap-1">
        {[
          { label: '+', title: 'Yaklaştır', factor: 1.5 },
          { label: '−', title: 'Uzaklaştır', factor: 1 / 1.5 },
        ].map(({ label, title, factor }) => (
          <button
            key={label}
            title={title}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              const el = containerRef.current;
              if (!el) return;
              const { width, height } = el.getBoundingClientRect();
              zoomAt(width / 2, height / 2, factor);
            }}
            className="w-9 h-9 bg-gray-800/90 border border-gray-600 text-white rounded-lg text-lg font-bold flex items-center justify-center hover:bg-gray-700 active:scale-95 transition-transform"
          >
            {label}
          </button>
        ))}
        <button
          title="Haritayı Sıfırla"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={fitMap}
          className="w-9 h-9 bg-gray-800/90 border border-gray-600 text-white rounded-lg text-sm flex items-center justify-center hover:bg-gray-700 active:scale-95 transition-transform"
        >
          ⊡
        </button>
      </div>
    </div>
  );
}
