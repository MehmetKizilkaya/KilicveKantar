import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { useGameStore } from '../../store/game.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

const REGION_TYPE_COLORS: Record<string, string> = {
  AGRICULTURE: '#4a7c40',
  INDUSTRIAL:  '#5a6a7a',
  TRADE:       '#8a6d3b',
  MILITARY:    '#7a3b3b',
  COASTAL:     '#3b6a8a',
};

const FACTION_COLORS = [
  '#c9a227', '#7c3aed', '#dc2626', '#059669', '#0891b2',
  '#d97706', '#be185d', '#0369a1', '#65a30d', '#9333ea',
];

export default function TurkeyMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { regions, selectedRegionId, selectRegion } = useGameStore();

  const { data: regionsData } = useQuery({
    queryKey: ['regions'],
    queryFn: () => api.get('/regions').then((r) => r.data),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (regionsData) {
      useGameStore.getState().setRegions(regionsData);
    }
  }, [regionsData]);

  // Build faction color map
  const factionColorMap = useRef<Map<string, string>>(new Map());
  useEffect(() => {
    const factions = [...new Set(regions.map((r) => r.factionId).filter(Boolean))];
    factions.forEach((fid, i) => {
      if (fid && !factionColorMap.current.has(fid)) {
        factionColorMap.current.set(fid, FACTION_COLORS[i % FACTION_COLORS.length]);
      }
    });
  }, [regions]);

  const getRegionColor = useCallback(
    (svgPathId: string) => {
      const region = regions.find((r) => r.svgPathId === svgPathId);
      if (!region) return '#1a1815';
      if (region.factionId) {
        return factionColorMap.current.get(region.factionId) ?? REGION_TYPE_COLORS[region.type];
      }
      return REGION_TYPE_COLORS[region.type] ?? '#2d2926';
    },
    [regions],
  );

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Update colors without re-rendering paths
    svg.selectAll<SVGPathElement, unknown>('path[data-id]').each(function () {
      const el = d3.select(this);
      const id = el.attr('data-id');
      if (!id) return;
      const color = getRegionColor(id);
      el.attr('fill', color);

      const region = regions.find((r) => r.svgPathId === id);
      if (region?.isUnderSiege) {
        el.attr('stroke', '#ff4444').attr('stroke-width', '2');
      } else if (region?.id === selectedRegionId) {
        el.attr('stroke', '#f59e0b').attr('stroke-width', '2');
      } else {
        el.attr('stroke', '#2d2926').attr('stroke-width', '0.5');
      }
    });
  }, [regions, selectedRegionId, getRegionColor]);

  const handlePathClick = useCallback(
    (svgPathId: string) => {
      const region = regions.find((r) => r.svgPathId === svgPathId);
      if (region) selectRegion(region.id);
    },
    [regions, selectRegion],
  );

  const showTooltip = useCallback(
    (e: React.MouseEvent, svgPathId: string) => {
      const region = regions.find((r) => r.svgPathId === svgPathId);
      if (!region || !tooltipRef.current) return;

      tooltipRef.current.style.display = 'block';
      tooltipRef.current.style.left = `${e.clientX + 12}px`;
      tooltipRef.current.style.top = `${e.clientY - 10}px`;
      tooltipRef.current.innerHTML = `
        <div class="font-semibold text-gold-400">${region.name}</div>
        <div class="text-xs text-game-muted">${region.type}</div>
        ${region.faction ? `<div class="text-xs text-game-muted">Fraksiyon: <span class="text-game-text">${region.faction.name}</span></div>` : ''}
        ${region.governor ? `<div class="text-xs text-game-muted">Vali: <span class="text-game-text">${region.governor.username}</span></div>` : '<div class="text-xs text-game-muted">Bağımsız</div>'}
        ${region.isUnderSiege ? '<div class="text-xs text-red-400 font-bold">⚔️ KUŞATMA ALTINDA</div>' : ''}
        <div class="text-xs text-game-muted mt-1">Ekonomi: <span class="text-green-400">${region.economicValue}</span></div>
      `;
    },
    [regions],
  );

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current) tooltipRef.current.style.display = 'none';
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* SVG map — paths are embedded with data-id matching svgPathId */}
      <svg
        ref={svgRef}
        viewBox="0 0 1000 500"
        className="turkey-map w-full h-full"
        onClick={(e) => {
          const target = e.target as SVGPathElement;
          const id = target.getAttribute('data-id');
          if (id) handlePathClick(id);
        }}
        onMouseMove={(e) => {
          const target = e.target as SVGPathElement;
          const id = target.getAttribute('data-id');
          if (id) showTooltip(e, id);
        }}
        onMouseLeave={hideTooltip}
      >
        <TurkeyPaths />
      </svg>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed hidden z-50 pointer-events-none bg-game-surface border border-game-border
                   rounded-lg px-3 py-2 text-sm shadow-xl text-game-text"
        style={{ display: 'none' }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 panel p-3 space-y-1.5 text-xs">
        {Object.entries(REGION_TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
            <span className="text-game-muted">
              {type === 'AGRICULTURE' ? 'Tarım'
                : type === 'INDUSTRIAL' ? 'Sanayi'
                : type === 'TRADE' ? 'Ticaret'
                : type === 'MILITARY' ? 'Askeri'
                : 'Kıyı'}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-game-border">
          <div className="w-3 h-3 rounded-sm flex-shrink-0 border-2 border-red-500 bg-transparent" />
          <span className="text-game-muted">Kuşatma altında</span>
        </div>
      </div>
    </div>
  );
}

// Simplified Turkey SVG paths — actual game would use real geographic data
// These are placeholder paths arranged roughly in Turkey's shape
function TurkeyPaths() {
  const paths = TURKEY_SVG_PATHS;
  return (
    <>
      {paths.map((p) => (
        <path
          key={p.id}
          data-id={p.id}
          d={p.d}
          fill="#1a1815"
          stroke="#2d2926"
          strokeWidth="0.5"
          className="cursor-pointer hover:brightness-125 transition-all duration-150"
        />
      ))}
    </>
  );
}

// Simplified placeholder paths for 81 Turkish provinces
// In production, replace with accurate GeoJSON-derived SVG paths
const TURKEY_SVG_PATHS: { id: string; d: string }[] = [
  // Row 1 — far west
  { id: 'tr-22', d: 'M 50 180 L 90 175 L 95 210 L 55 215 Z' },   // Edirne
  { id: 'tr-39', d: 'M 90 175 L 130 170 L 135 205 L 95 210 Z' },  // Kırklareli
  { id: 'tr-59', d: 'M 80 210 L 130 205 L 135 240 L 85 245 Z' },  // Tekirdağ
  { id: 'tr-34', d: 'M 130 170 L 175 175 L 178 215 L 135 210 Z' }, // İstanbul
  { id: 'tr-77', d: 'M 175 190 L 205 185 L 210 215 L 178 218 Z' }, // Yalova

  // Row 2 — northwest
  { id: 'tr-17', d: 'M 85 245 L 135 240 L 138 280 L 90 285 Z' },  // Çanakkale
  { id: 'tr-10', d: 'M 135 240 L 185 238 L 188 275 L 138 278 Z' }, // Balıkesir
  { id: 'tr-41', d: 'M 178 215 L 225 212 L 228 250 L 182 253 Z' }, // Kocaeli
  { id: 'tr-54', d: 'M 225 212 L 268 215 L 272 252 L 228 250 Z' }, // Sakarya
  { id: 'tr-74', d: 'M 268 190 L 310 188 L 312 222 L 270 225 Z' }, // Bartın

  // Row 3 — west Aegean / Marmara
  { id: 'tr-35', d: 'M 90 285 L 138 280 L 140 330 L 93 335 Z' },  // İzmir
  { id: 'tr-45', d: 'M 138 278 L 185 275 L 188 315 L 140 318 Z' }, // Manisa
  { id: 'tr-16', d: 'M 185 238 L 235 235 L 238 272 L 188 275 Z' }, // Bursa
  { id: 'tr-11', d: 'M 235 235 L 280 232 L 282 268 L 238 272 Z' }, // Bilecik
  { id: 'tr-67', d: 'M 280 205 L 325 202 L 328 238 L 282 242 Z' }, // Zonguldak

  // Row 4 — middle west
  { id: 'tr-09', d: 'M 93 335 L 140 330 L 142 370 L 96 374 Z' },  // Aydın
  { id: 'tr-48', d: 'M 96 374 L 142 370 L 144 410 L 99 414 Z' },  // Muğla
  { id: 'tr-20', d: 'M 140 318 L 188 315 L 190 355 L 142 358 Z' }, // Denizli
  { id: 'tr-64', d: 'M 188 315 L 235 312 L 238 350 L 190 353 Z' }, // Uşak
  { id: 'tr-43', d: 'M 235 272 L 282 268 L 284 308 L 238 312 Z' }, // Kütahya
  { id: 'tr-03', d: 'M 282 268 L 328 265 L 330 302 L 284 306 Z' }, // Afyon

  // Central west/middle
  { id: 'tr-26', d: 'M 285 232 L 332 228 L 335 268 L 288 272 Z' }, // Eskişehir
  { id: 'tr-14', d: 'M 332 205 L 378 202 L 380 238 L 335 242 Z' }, // Bolu
  { id: 'tr-78', d: 'M 325 202 L 368 198 L 370 232 L 328 235 Z' }, // Karabük
  { id: 'tr-57', d: 'M 368 175 L 415 172 L 417 208 L 370 212 Z' }, // Sinop

  // Central Anatolia
  { id: 'tr-06', d: 'M 335 242 L 390 238 L 393 278 L 338 282 Z' }, // Ankara
  { id: 'tr-71', d: 'M 390 238 L 435 235 L 437 272 L 393 275 Z' }, // Kırıkkale
  { id: 'tr-18', d: 'M 378 202 L 423 198 L 425 236 L 380 240 Z' }, // Çankırı
  { id: 'tr-05', d: 'M 423 172 L 470 168 L 472 205 L 425 208 Z' }, // Amasya
  { id: 'tr-55', d: 'M 415 148 L 463 144 L 465 178 L 417 182 Z' }, // Samsun

  { id: 'tr-40', d: 'M 390 278 L 435 275 L 437 312 L 392 315 Z' }, // Kırşehir
  { id: 'tr-66', d: 'M 435 272 L 480 268 L 482 305 L 437 308 Z' }, // Yozgat
  { id: 'tr-19', d: 'M 470 205 L 515 202 L 517 238 L 472 242 Z' }, // Çorum
  { id: 'tr-60', d: 'M 480 168 L 528 164 L 530 200 L 482 204 Z' }, // Tokat

  // South central
  { id: 'tr-32', d: 'M 235 350 L 282 347 L 284 385 L 238 388 Z' }, // Isparta
  { id: 'tr-15', d: 'M 190 355 L 238 352 L 240 390 L 192 393 Z' }, // Burdur
  { id: 'tr-07', d: 'M 142 410 L 238 405 L 240 445 L 145 450 Z' }, // Antalya
  { id: 'tr-70', d: 'M 282 350 L 335 347 L 337 385 L 284 388 Z' }, // Karaman
  { id: 'tr-42', d: 'M 338 282 L 393 278 L 395 320 L 340 323 Z' }, // Konya

  { id: 'tr-50', d: 'M 437 308 L 482 305 L 484 342 L 440 345 Z' }, // Nevşehir
  { id: 'tr-38', d: 'M 482 272 L 528 268 L 530 305 L 484 308 Z' }, // Kayseri
  { id: 'tr-51', d: 'M 437 345 L 482 342 L 484 378 L 440 380 Z' }, // Niğde
  { id: 'tr-68', d: 'M 393 318 L 440 315 L 442 352 L 395 355 Z' }, // Aksaray

  // South
  { id: 'tr-01', d: 'M 340 385 L 430 382 L 432 422 L 342 425 Z' }, // Adana
  { id: 'tr-33', d: 'M 280 385 L 340 382 L 342 422 L 282 425 Z' }, // Mersin
  { id: 'tr-80', d: 'M 430 382 L 480 378 L 482 418 L 432 422 Z' }, // Osmaniye
  { id: 'tr-31', d: 'M 480 378 L 540 374 L 542 414 L 482 418 Z' }, // Hatay

  // East
  { id: 'tr-58', d: 'M 528 200 L 578 196 L 580 232 L 530 236 Z' }, // Sivas
  { id: 'tr-44', d: 'M 530 232 L 578 228 L 580 265 L 532 268 Z' }, // Malatya
  { id: 'tr-27', d: 'M 540 374 L 592 370 L 594 408 L 542 412 Z' }, // Gaziantep
  { id: 'tr-79', d: 'M 592 370 L 635 366 L 637 405 L 594 408 Z' }, // Kilis
  { id: 'tr-46', d: 'M 480 345 L 530 342 L 532 380 L 482 382 Z' }, // Kahramanmaraş

  // Further east
  { id: 'tr-53', d: 'M 580 148 L 628 144 L 630 180 L 582 183 Z' }, // Rize
  { id: 'tr-08', d: 'M 628 144 L 675 140 L 677 176 L 630 180 Z' }, // Artvin
  { id: 'tr-28', d: 'M 530 148 L 578 144 L 580 180 L 532 183 Z' }, // Giresun
  { id: 'tr-61', d: 'M 578 130 L 628 126 L 630 162 L 580 166 Z' }, // Trabzon
  { id: 'tr-52', d: 'M 528 130 L 578 126 L 580 162 L 530 165 Z' }, // Ordu

  { id: 'tr-24', d: 'M 578 196 L 628 192 L 630 228 L 580 232 Z' }, // Erzincan
  { id: 'tr-23', d: 'M 532 268 L 580 265 L 582 300 L 534 303 Z' }, // Elazığ
  { id: 'tr-63', d: 'M 594 340 L 645 336 L 647 374 L 596 378 Z' }, // Şanlıurfa
  { id: 'tr-47', d: 'M 645 336 L 695 332 L 697 370 L 647 374 Z' }, // Mardin
  { id: 'tr-21', d: 'M 580 300 L 628 296 L 630 335 L 582 338 Z' }, // Diyarbakır
  { id: 'tr-02', d: 'M 534 303 L 582 300 L 584 338 L 536 341 Z' }, // Adıyaman

  // Far east
  { id: 'tr-25', d: 'M 628 176 L 680 172 L 682 208 L 630 212 Z' }, // Erzurum
  { id: 'tr-36', d: 'M 680 160 L 730 156 L 732 192 L 682 196 Z' }, // Kars
  { id: 'tr-75', d: 'M 730 140 L 778 136 L 780 172 L 732 176 Z' }, // Ardahan
  { id: 'tr-69', d: 'M 628 212 L 678 208 L 680 245 L 630 248 Z' }, // Bayburt
  { id: 'tr-12', d: 'M 630 248 L 680 244 L 682 280 L 632 283 Z' }, // Bingöl
  { id: 'tr-76', d: 'M 778 156 L 820 152 L 822 188 L 780 192 Z' }, // Iğdır
  { id: 'tr-04', d: 'M 730 192 L 778 188 L 780 224 L 732 228 Z' }, // Ağrı
  { id: 'tr-65', d: 'M 730 224 L 778 220 L 780 258 L 732 262 Z' }, // Van
  { id: 'tr-13', d: 'M 680 280 L 728 276 L 730 312 L 682 315 Z' }, // Bitlis
  { id: 'tr-49', d: 'M 682 244 L 730 240 L 732 276 L 684 280 Z' }, // Muş
  { id: 'tr-62', d: 'M 580 265 L 630 261 L 632 298 L 582 301 Z' }, // Tunceli
  { id: 'tr-56', d: 'M 730 312 L 778 308 L 780 344 L 732 348 Z' }, // Siirt
  { id: 'tr-72', d: 'M 697 336 L 745 332 L 747 368 L 699 372 Z' }, // Batman
  { id: 'tr-30', d: 'M 780 308 L 828 304 L 830 340 L 782 344 Z' }, // Hakkari
  { id: 'tr-73', d: 'M 778 344 L 826 340 L 828 376 L 780 380 Z' }, // Şırnak
];
