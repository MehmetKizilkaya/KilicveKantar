export type ChatChannel =
  | 'global'
  | 'trade'
  | 'mercenary_guild'
  | `region:${string}`
  | `faction:${string}`
  | `dm:${string}`;

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerVip: string;
  channel: string;
  content: string;
  createdAt: string;
}

export type ArticleType = 'news' | 'column' | 'propaganda' | 'advertisement' | 'interview';

export interface NewsArticle {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  type: ArticleType;
  targetRegionId: string | null;
  readCount: number;
  likeCount: number;
  propagandaStrength: number; // 0-100
  publishedAt: string;
  isApproved: boolean;
}

export interface AutoNewsEvent {
  id: string;
  type:
    | 'war_declared'
    | 'war_ended'
    | 'coup_success'
    | 'coup_failed'
    | 'caravan_robbed'
    | 'big_trade'
    | 'region_captured'
    | 'faction_formed';
  title: string;
  body: string;
  involvedPlayerIds: string[];
  involvedRegionIds: string[];
  createdAt: string;
}

export interface MercenaryProfile {
  id: string;
  playerId: string;
  playerName: string;
  playerLevel: number;
  specialization: string[];
  dailyRateAkce: number;
  dailyRateAltin: number;
  isAvailable: boolean;
  reputationScore: number;
  totalContracts: number;
  wins: number;
  description: string;
}

export type ContractType =
  | 'daily_raid'
  | 'defense_pact'
  | 'reconnaissance'
  | 'faction_alliance'
  | 'special_mission';

export interface MercenaryContract {
  id: string;
  employerId: string;
  mercenaryId: string;
  type: ContractType;
  durationDays: number;
  totalAkce: number;
  totalAltin: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'breached';
  startedAt: string | null;
  endedAt: string | null;
  employerRating: number | null;
  mercenaryRating: number | null;
}

export interface Notification {
  id: string;
  playerId: string;
  type:
    | 'war_declared'
    | 'caravan_attacked'
    | 'contract_offer'
    | 'auction_won'
    | 'labor_complete'
    | 'faction_message'
    | 'trade_offer'
    | 'market_alert';
  title: string;
  body: string;
  isRead: boolean;
  data: Record<string, unknown>;
  createdAt: string;
}
