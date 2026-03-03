import type { ChatMessage, Notification } from './social';
import type { War } from './military';
import type { Caravan } from './economy';

// Events emitted from server to client
export interface ServerToClientEvents {
  'war:declared': (war: War) => void;
  'war:tick_result': (data: { warId: string; attackerPower: number; defenderPower: number }) => void;
  'war:ended': (data: { warId: string; result: string; loot: number }) => void;
  'chat:message': (message: ChatMessage) => void;
  'news:published': (data: { id: string; title: string; type: string }) => void;
  'caravan:attacked': (caravan: Partial<Caravan>) => void;
  'caravan:arrived': (data: { caravanId: string; loot: number }) => void;
  'auction:bid': (data: { listingId: string; newBid: number; bidderId: string }) => void;
  'auction:won': (data: { listingId: string; winnerId: string; finalPrice: number }) => void;
  'contract:offer': (data: { contractId: string; employerName: string }) => void;
  'labor:completed': (data: { cycleId: string; reward: number }) => void;
  'market:price_alert': (data: { commodity: string; regionId: string; price: number }) => void;
  'notification': (notification: Notification) => void;
  'region:captured': (data: { regionId: string; newOwnerId: string; newOwnerName: string }) => void;
  'player:energy_updated': (energy: number) => void;
  'player:balance_updated': (data: { akce: number; altin: number }) => void;
  'tick:micro': (timestamp: string) => void;
}

// Events emitted from client to server
export interface ClientToServerEvents {
  'chat:send': (data: { channel: string; content: string }) => void;
  'chat:join_channel': (channel: string) => void;
  'chat:leave_channel': (channel: string) => void;
  'bid:place': (data: { listingId: string; amount: number }) => void;
  'contract:accept': (contractId: string) => void;
  'contract:reject': (contractId: string) => void;
  'labor:restart': (data: { type: string; useAltin: boolean }) => void;
  'region:subscribe': (regionId: string) => void;
  'region:unsubscribe': (regionId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  playerId: string;
  username: string;
  factionId: string | null;
}
