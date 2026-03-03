// Tick durations in milliseconds
export const TICK_INTERVALS = {
  MICRO: 15 * 60 * 1000,     // 15 minutes
  MACRO: 6 * 60 * 60 * 1000, // 6 hours
  WAR: 30 * 60 * 1000,       // 30 minutes
  WEEKLY: 7 * 24 * 60 * 60 * 1000, // 1 week
} as const;

// Energy costs per action
export const ENERGY_COSTS = {
  DECLARE_WAR: 30,
  RAID: 20,
  WRITE_ARTICLE: 5,
  DIPLOMATIC_MESSAGE: 2,
  MARKET_ORDER: 1,
  SIGN_CONTRACT: 10,
  COUP_ATTEMPT: 40,
} as const;

// Max energy by VIP plan
export const MAX_ENERGY = {
  free: 100,
  trader: 150,
  commander: 175,
  sultan: 200,
} as const;

// Energy regen per hour
export const ENERGY_REGEN = {
  free: 5,
  trader: 7,
  commander: 9,
  sultan: 12,
} as const;

// Premium labor restart costs
export const LABOR_RESTART_COST = {
  free: null,        // cannot instant restart
  trader: 10,
  commander: 8,
  sultan: 6,
} as const;

export const LABOR_EXTEND_COST_ALTIN = 5; // Per extension

// Auction fees
export const AUCTION_FEE_PERCENT = 2;

// Max auction listings by VIP
export const MAX_AUCTION_LISTINGS = {
  free: 10,
  trader: 25,
  commander: 40,
  sultan: 60,
} as const;

// Chat rate limits (seconds between messages)
export const CHAT_RATE_LIMIT = {
  free: 10,
  trader: 5,
  commander: 3,
  sultan: 1,
} as const;

// War related
export const WAR_ANNOUNCEMENT_MINUTES = 30;
export const WAR_COOLDOWN_MACRO_TICKS = 2;
export const NEWBIE_PROTECTION_DAYS = 7;

// Morale thresholds
export const MORALE_THRESHOLDS = {
  INVINCIBLE: 80,
  NORMAL: 60,
  WEAKENED: 40,
  NEAR_COLLAPSE: 20,
  COLLAPSED: 0,
} as const;

// Coup conditions
export const COUP_MORALE_THRESHOLD = 30;
export const COUP_ACTIVITY_MACRO_TICKS = 5;
export const COUP_PREPARATION_MACRO_TICKS = 3;

// Gold exchange
export const ALTIN_PACKS = [
  { id: 'small', altin: 100, bonus: 0, priceTL: 19.99 },
  { id: 'medium', altin: 300, bonus: 50, priceTL: 49.99 },
  { id: 'large', altin: 700, bonus: 150, priceTL: 99.99 },
  { id: 'treasury', altin: 1500, bonus: 400, priceTL: 199.99 },
  { id: 'sultan', altin: 3500, bonus: 1000, priceTL: 399.99 },
] as const;

export const VIP_PLANS = [
  {
    id: 'trader',
    nameTR: 'Tüccar',
    priceTL: 29.99,
    priceAltin: 60,
    dailyAltinBonus: 3,
  },
  {
    id: 'commander',
    nameTR: 'Komutan',
    priceTL: 59.99,
    priceAltin: 120,
    dailyAltinBonus: 5,
  },
  {
    id: 'sultan',
    nameTR: 'Sultan',
    priceTL: 99.99,
    priceAltin: 200,
    dailyAltinBonus: 10,
  },
] as const;
