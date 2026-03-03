export type FactionRole =
  | 'kagan'
  | 'bey'
  | 'commander'
  | 'trader'
  | 'journalist'
  | 'member';

export interface Faction {
  id: string;
  name: string;
  tag: string; // Short tag like [ANA]
  leaderId: string;
  description: string;
  memberCount: number;
  akceBalance: number;
  regionCount: number;
  weeklyPoints: number;
  totalPoints: number;
  shareCount: number;
  availableShares: number;
  sharePriceAkce: number;
  createdAt: string;
}

export interface FactionMember {
  playerId: string;
  factionId: string;
  role: FactionRole;
  joinedAt: string;
  contribution: number;
}

export interface FactionShare {
  id: string;
  factionId: string;
  totalShares: number;
  availableShares: number;
  currentPriceAkce: number;
  issuedAt: string;
}

export interface ShareHolding {
  id: string;
  playerId: string;
  factionId: string;
  shareCount: number;
  avgBuyPrice: number;
}

export interface DiplomaticRelation {
  id: string;
  faction1Id: string;
  faction2Id: string;
  type:
    | 'ceasefire'
    | 'free_trade'
    | 'military_alliance'
    | 'commodity_deal'
    | 'caravan_rights'
    | 'neutrality_pact';
  terms: Record<string, unknown>;
  startedAt: string;
  expiresAt: string | null;
  status: 'active' | 'expired' | 'broken';
}
