export type UnitType =
  | 'infantry'
  | 'cavalry'
  | 'archer'
  | 'artillery'
  | 'special_forces'
  | 'sailor'
  | 'mercenary';

export interface UnitStats {
  type: UnitType;
  power: number;
  speed: number;
  costAkce: number;
  trainingMinutes: number;
  description: string;
}

export const UNIT_STATS: Record<UnitType, UnitStats> = {
  infantry: {
    type: 'infantry',
    power: 10,
    speed: 1,
    costAkce: 500,
    trainingMinutes: 60,
    description: 'Temel, kitlesel',
  },
  cavalry: {
    type: 'cavalry',
    power: 25,
    speed: 3,
    costAkce: 1500,
    trainingMinutes: 120,
    description: 'Baskın uzmanı',
  },
  archer: {
    type: 'archer',
    power: 15,
    speed: 2,
    costAkce: 800,
    trainingMinutes: 90,
    description: 'Uzak mesafe',
  },
  artillery: {
    type: 'artillery',
    power: 40,
    speed: 0.5,
    costAkce: 3000,
    trainingMinutes: 240,
    description: 'Bina hasarı, moral kırma',
  },
  special_forces: {
    type: 'special_forces',
    power: 50,
    speed: 3,
    costAkce: 5000,
    trainingMinutes: 360,
    description: 'Darbe ve casusluk',
  },
  sailor: {
    type: 'sailor',
    power: 20,
    speed: 4,
    costAkce: 1200,
    trainingMinutes: 100,
    description: 'Kıyı bölgeleri',
  },
  mercenary: {
    type: 'mercenary',
    power: 0,
    speed: 0,
    costAkce: 0,
    trainingMinutes: 0,
    description: 'Kiralık oyuncu',
  },
};

export interface War {
  id: string;
  attackerFactionId: string | null;
  attackerPlayerId: string;
  defenderFactionId: string | null;
  defenderPlayerId: string | null;
  targetRegionId: string;
  status: 'declared' | 'active' | 'finished';
  declaredAt: string;
  startsAt: string;
  endsAt: string | null;
  attackerPower: number;
  defenderPower: number;
  result: 'attacker_wins' | 'defender_wins' | 'draw' | null;
  loot: number;
}

export interface Raid {
  id: string;
  attackerId: string;
  targetRegionId: string;
  unitCount: number;
  unitType: UnitType;
  status: 'active' | 'success' | 'failed';
  startedAt: string;
  endsAt: string;
  loot: number | null;
}

export interface CoupAttempt {
  id: string;
  organizerId: string;
  targetRegionId: string;
  status: 'preparing' | 'launched' | 'success' | 'failed';
  startedAt: string;
  launchesAt: string;
  resourceSpent: number;
}
