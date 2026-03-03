import { prisma } from '../config/prisma';
import { redis, redisKeys } from '../config/redis';
import type { ChatMessage } from '@kilic-ve-kantar/shared';
import { CHAT_RATE_LIMIT } from '@kilic-ve-kantar/shared';

const HISTORY_LIMIT = 100;

export const ChatService = {
  async sendMessage(
    playerId: string,
    channel: string,
    content: string,
  ): Promise<ChatMessage> {
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { username: true, vipPlan: true, factionId: true },
    });

    // Rate limit check via Redis
    const rateLimitKey = `chat:ratelimit:${playerId}`;
    const vipKey = player.vipPlan.toLowerCase() as keyof typeof CHAT_RATE_LIMIT;
    const limitSeconds = CHAT_RATE_LIMIT[vipKey];

    const lastMessage = await redis.get(rateLimitKey);
    if (lastMessage) {
      throw new Error(`Çok hızlı mesaj gönderiyorsunuz. ${limitSeconds} saniye bekleyin.`);
    }
    await redis.setex(rateLimitKey, limitSeconds, '1');

    // Validate channel access
    if (channel.startsWith('faction:')) {
      const factionId = channel.replace('faction:', '');
      if (player.factionId !== factionId) {
        throw new Error('Bu kanala erişim izniniz yok');
      }
    }
    if (channel.startsWith('dm:')) {
      // DMs are between two specific players
      const [, targetId] = channel.split(':');
      const canonical = [playerId, targetId].sort().join(':');
      channel = `dm:${canonical}`;
    }

    // Content sanitization
    const sanitized = content.trim().slice(0, 500);
    if (!sanitized) throw new Error('Boş mesaj gönderilemez');

    const msg = await prisma.chatMessage.create({
      data: { playerId, channel, content: sanitized },
    });

    const message: ChatMessage = {
      id: msg.id,
      playerId,
      playerName: player.username,
      playerVip: player.vipPlan,
      channel,
      content: sanitized,
      createdAt: msg.createdAt.toISOString(),
    };

    // Cache in Redis for history
    const histKey = redisKeys.chatHistory(channel);
    await redis.lpush(histKey, JSON.stringify(message));
    await redis.ltrim(histKey, 0, HISTORY_LIMIT - 1);
    await redis.expire(histKey, 3600 * 24);

    return message;
  },

  async getHistory(channel: string, limit = 50): Promise<ChatMessage[]> {
    const histKey = redisKeys.chatHistory(channel);
    const cached = await redis.lrange(histKey, 0, limit - 1);

    if (cached.length > 0) {
      return cached.map((m) => JSON.parse(m) as ChatMessage).reverse();
    }

    // Fallback to DB
    const messages = await prisma.chatMessage.findMany({
      where: { channel },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { player: { select: { username: true, vipPlan: true } } },
    });

    return messages
      .reverse()
      .map((m) => ({
        id: m.id,
        playerId: m.playerId,
        playerName: m.player.username,
        playerVip: m.player.vipPlan,
        channel: m.channel,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      }));
  },
};
