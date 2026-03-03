export type Commodity =
  | 'wheat'
  | 'iron'
  | 'wood'
  | 'stone'
  | 'wool'
  | 'cotton'
  | 'copper'
  | 'salt'
  | 'olive_oil'
  | 'sword'
  | 'shield'
  | 'armor'
  | 'bread'
  | 'cloth'
  | 'ship'
  | 'gunpowder'
  | 'silk'
  | 'gold_ornament'
  | 'firearm';

export type CommodityTier = 'raw' | 'processed' | 'luxury';

export const COMMODITY_TIERS: Record<Commodity, CommodityTier> = {
  wheat: 'raw',
  iron: 'raw',
  wood: 'raw',
  stone: 'raw',
  wool: 'raw',
  cotton: 'raw',
  copper: 'raw',
  salt: 'raw',
  olive_oil: 'raw',
  sword: 'processed',
  shield: 'processed',
  armor: 'processed',
  bread: 'processed',
  cloth: 'processed',
  ship: 'processed',
  gunpowder: 'processed',
  silk: 'luxury',
  gold_ornament: 'luxury',
  firearm: 'luxury',
};

export const BASE_PRICES: Record<Commodity, number> = {
  wheat: 50,
  iron: 120,
  wood: 80,
  stone: 60,
  wool: 100,
  cotton: 90,
  copper: 150,
  salt: 70,
  olive_oil: 110,
  sword: 500,
  shield: 300,
  armor: 800,
  bread: 80,
  cloth: 250,
  ship: 3000,
  gunpowder: 400,
  silk: 1200,
  gold_ornament: 2000,
  firearm: 1500,
};

export interface MarketOrder {
  id: string;
  playerId: string;
  regionId: string;
  commodity: Commodity;
  orderType: 'buy' | 'sell';
  quantity: number;
  pricePerUnit: number;
  currency: 'akce' | 'altin';
  filledQuantity: number;
  status: 'open' | 'filled' | 'cancelled';
  createdAt: string;
}

export interface AuctionListing {
  id: string;
  sellerId: string;
  sellerName: string;
  itemType: 'commodity' | 'unit' | 'special';
  itemData: Record<string, unknown>;
  startingPrice: number;
  buyNowPrice: number | null;
  currency: 'akce' | 'altin';
  currentBid: number;
  currentBidderId: string | null;
  endsAt: string;
  status: 'active' | 'sold' | 'expired' | 'cancelled';
}

export interface Caravan {
  id: string;
  ownerId: string;
  ownerName: string;
  originRegionId: string;
  destinationRegionId: string;
  cargo: Partial<Record<Commodity, number>>;
  guardCount: number;
  status: 'preparing' | 'traveling' | 'arrived' | 'robbed';
  departureAt: string;
  arrivalAt: string;
  isInsured: boolean;
  insuranceCoverage: number;
}

export interface TradeOffer {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  offeredItems: {
    akce?: number;
    altin?: number;
    commodities?: Partial<Record<Commodity, number>>;
  };
  requestedItems: {
    akce?: number;
    altin?: number;
    commodities?: Partial<Record<Commodity, number>>;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  expiresAt: string;
  createdAt: string;
}
