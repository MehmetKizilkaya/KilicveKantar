export type VipPlan = 'free' | 'trader' | 'commander' | 'sultan';
export type PlayerRole = 'player' | 'moderator' | 'admin';

export interface Player {
  id: string;
  username: string;
  email: string;
  akceBalance: number;
  altinBalance: number;
  energy: number;
  maxEnergy: number;
  tradeXp: number;
  militaryXp: number;
  tradeLevel: number;
  militaryLevel: number;
  vipPlan: VipPlan;
  vipExpiresAt: string | null;
  reputationScore: number;
  homeRegionId: string | null;
  currentRegionId: string | null;
  destinationRegionId: string | null;
  travelEndsAt: string | null;
  factionId: string | null;
  role: PlayerRole;
  createdAt: string;
}

export interface PlayerPublicProfile {
  id: string;
  username: string;
  tradeLevel: number;
  militaryLevel: number;
  reputationScore: number;
  factionId: string | null;
  factionName: string | null;
  homeRegionId: string | null;
  homeRegionName: string | null;
  vipPlan: VipPlan;
  badges: string[];
  totalBattles: number;
  battleWins: number;
  weeklyTradeVolume: number;
  mercenaryContracts: number;
  articleCount: number;
}

export interface LaborCycle {
  id: string;
  playerId: string;
  type: LaborType;
  startedAt: string;
  endsAt: string;
  isActive: boolean;
  autoChainEnabled: boolean;
  extendedCount: number;
  akceReward: number;
}

export type LaborType =
  | 'basic_worker'
  | 'craftsman'
  | 'trader'
  | 'soldier';

// All labor durations are 10 minutes for accessibility
export const LABOR_DURATIONS: Record<LaborType, { normal: number; premium: number }> = {
  basic_worker: { normal: 10, premium: 10 },
  craftsman:    { normal: 10, premium: 10 },
  trader:       { normal: 10, premium: 10 },
  soldier:      { normal: 10, premium: 10 },
};

export const LABOR_REWARDS: Record<LaborType, number> = {
  basic_worker: 150,
  craftsman:    350,
  trader:       600,
  soldier:      250,
};
