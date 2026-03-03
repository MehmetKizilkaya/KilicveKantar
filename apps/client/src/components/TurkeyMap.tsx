import { useState, useEffect, useRef } from 'react';
import turkeyMapRaw from '../assets/turkey.svg?raw';

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

interface TurkeyMapProps {
  regions: RegionInfo[];
  currentRegionId?: string | null;
  destinationRegionId?: string | null;
  onRegionClick?: (region: RegionInfo) => void;
}

// Color scheme per faction — up to 8 factions
const FACTION_COLORS = [
  '#c0392b', '#2980b9', '#27ae60', '#8e44ad',
  '#e67e22', '#16a085', '#f39c12', '#2c3e50',
];

// Region type colors (neutral / ungoverned)
const TYPE_COLORS: Record<string, string> = {
  AGRICULTURE: '#5d8a3c',
  INDUSTRIAL:  '#7a6040',
  TRADE:       '#2e7d9e',
  MILITARY:    '#7d3535',
  COASTAL:     '#2e6e8e',
};

function getFactionColor(factionId: string | null | undefined, factionColorMap: Map<string, string>): string {
  if (!factionId) return '#4a5568'; // ungoverned — dark gray
  return factionColorMap.get(factionId) ?? '#4a5568';
}

export default function TurkeyMap({ regions, currentRegionId, destinationRegionId, onRegionClick }: TurkeyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ name: string; type: string; x: number; y: number } | null>(null);
  const [factionColorMap] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>();
    let colorIdx = 0;
    for (const r of regions) {
      if (r.factionId && !map.has(r.factionId)) {
        map.set(r.factionId, FACTION_COLORS[colorIdx % FACTION_COLORS.length]);
        colorIdx++;
      }
    }
    return map;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Build a lookup: svgPathId → RegionInfo
    const regionByPathId = new Map<string, RegionInfo>();
    for (const r of regions) {
      regionByPathId.set(r.svgPathId, r);
    }

    // Style all paths
    const paths = container.querySelectorAll<SVGPathElement>('path[id]');
    paths.forEach((path) => {
      const region = regionByPathId.get(path.id);
      if (!region) return;

      const isCurrentLocation = region.id === currentRegionId;
      const isDestination = region.id === destinationRegionId;

      let fill = getFactionColor(region.factionId, factionColorMap);
      if (!region.factionId) {
        fill = TYPE_COLORS[region.type] ?? '#4a5568';
      }

      path.style.fill = fill;
      path.style.stroke = '#1a1a2e';
      path.style.strokeWidth = '0.8';
      path.style.cursor = 'pointer';
      path.style.transition = 'fill 0.2s, filter 0.2s';

      if (isCurrentLocation) {
        path.style.fill = '#f6c90e';  // gold — current location
        path.style.strokeWidth = '1.5';
        path.style.filter = 'drop-shadow(0 0 4px #f6c90e)';
      } else if (isDestination) {
        path.style.fill = '#48bb78';  // green — travel destination
        path.style.filter = 'drop-shadow(0 0 3px #48bb78)';
      } else if (region.isUnderSiege) {
        path.style.fill = '#fc8181';  // red — under siege
      }

      // Hover handlers
      path.onmouseenter = (e) => {
        if (!isCurrentLocation && !isDestination) {
          path.style.filter = 'brightness(1.3)';
        }
        const rect = container.getBoundingClientRect();
        setTooltip({
          name: region.name,
          type: region.type,
          x: (e as MouseEvent).clientX - rect.left,
          y: (e as MouseEvent).clientY - rect.top,
        });
      };
      path.onmouseleave = () => {
        if (!isCurrentLocation && !isDestination) {
          path.style.filter = region.isUnderSiege ? 'none' : 'none';
        }
        setTooltip(null);
      };
      path.onclick = () => {
        if (onRegionClick) onRegionClick(region);
      };
    });
  }, [regions, currentRegionId, destinationRegionId, factionColorMap, onRegionClick]);

  return (
    <div ref={containerRef} className="relative w-full h-full select-none" style={{ background: '#1a1a2e' }}>
      {/* Inject SVG */}
      <div
        className="w-full h-full"
        dangerouslySetInnerHTML={{ __html: turkeyMapRaw }}
        style={{ lineHeight: 0 }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none px-2 py-1 rounded text-xs font-bold bg-gray-900 text-white border border-gray-600 whitespace-nowrap"
          style={{ left: tooltip.x + 12, top: tooltip.y - 30 }}
        >
          {tooltip.name}
          <span className="ml-1 text-gray-400 font-normal">
            ({tooltip.type.toLowerCase()})
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 text-xs space-y-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#f6c90e' }} />
          <span className="text-gray-300">Bulunduğun Şehir</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#48bb78' }} />
          <span className="text-gray-300">Hedef Şehir</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#fc8181' }} />
          <span className="text-gray-300">Kuşatma Altında</span>
        </div>
      </div>
    </div>
  );
}
