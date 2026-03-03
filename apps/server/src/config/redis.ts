import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 0,
  enableReadyCheck: false,
  lazyConnect: true,
  // Stop retrying after first failure so we don't spam the console
  retryStrategy: (times) => (times > 2 ? null : 200 * times),
});

let redisAvailable = false;
redis.on('connect', () => { redisAvailable = true; console.log('✅ Redis connected'); });
redis.on('error', () => { /* silently ignore repeated errors */ });

export { redisAvailable };

// Key helpers
export const redisKeys = {
  playerSession: (id: string) => `player:session:${id}`,
  chatHistory: (channel: string) => `chat:history:${channel}`,
  marketPrice: (regionId: string, commodity: string) =>
    `market:price:${regionId}:${commodity}`,
  tickLock: (type: string) => `tick:lock:${type}`,
  energyTimer: (playerId: string) => `energy:timer:${playerId}`,
  onlinePlayers: () => 'online:players',
};
