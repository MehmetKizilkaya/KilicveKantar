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

export const LABOR_DURATIONS: Record<LaborType, { normal: number; premium: number }> = {
  basic_worker: { normal: 4 * 60, premium: 3 * 60 },
  craftsman: { normal: 6 * 60, premium: 4 * 60 },
  trader: { normal: 8 * 60, premium: 5 * 60 },
  soldier: { normal: 3 * 60, premium: 2 * 60 },
};

export const LABOR_REWARDS: Record<LaborType, number> = {
  basic_worker: 200,
  craftsman: 500,
  trader: 800,
  soldier: 300,
};
