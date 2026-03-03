export type RegionType = 'agriculture' | 'industrial' | 'trade' | 'military' | 'coastal';

export interface Region {
  id: string;
  name: string;
  code: string; // TR-34 etc.
  type: RegionType;
  controlledBy: string | null; // faction id
  governorId: string | null; // player id
  morale: number; // 0-100
  population: number;
  economicValue: number;
  militaryValue: number;
  isUnderSiege: boolean;
  specialResource: string | null;
  neighbors: string[]; // region ids
  svgPathId: string; // SVG path identifier
}

export interface RegionStats {
  regionId: string;
  ironStock: number;
  woodStock: number;
  wheatStock: number;
  cottonStock: number;
  saltStock: number;
  copperStock: number;
  taxRate: number; // 0-30
  defenseLevel: number; // 0-10
  garrisonSize: number;
  lastUpdated: string;
}

export const STRATEGIC_REGIONS: Record<string, { bonus: string; description: string }> = {
  istanbul: {
    bonus: 'sea_trade_50',
    description: 'Boğaz kontrolü, deniz ticareti +%50',
  },
  ankara: {
    bonus: 'coup_resistance',
    description: 'Siyasi merkez, darbe direnci yüksek',
  },
  izmir: {
    bonus: 'export_limit_high',
    description: 'Ege kapısı, ihracat limiti yüksek',
  },
  bursa: {
    bonus: 'production_20',
    description: 'Sanayi merkezi, üretim hızı +%20',
  },
  konya: {
    bonus: 'wheat_2x',
    description: 'Buğday üretimi x2',
  },
  erzurum: {
    bonus: 'defense_30',
    description: 'Doğu kalesi, savunma +%30',
  },
};
