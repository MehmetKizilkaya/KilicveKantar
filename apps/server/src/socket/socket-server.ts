import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@kilic-ve-kantar/shared';
import { socketAuthenticate } from '../middleware/auth';
import { ChatService } from '../services/chat.service';
import { env } from '../config/env';

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: env.CLIENT_URL,
        credentials: true,
      },
      pingTimeout: 60000,
    },
  );

  // Auth middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) {
      next(new Error('Token gerekli'));
      return;
    }
    try {
      const { playerId, username, factionId } = await socketAuthenticate(token);
      socket.data.playerId = playerId;
      socket.data.username = username;
      socket.data.factionId = factionId;
      next();
    } catch {
      next(new Error('Geçersiz token'));
    }
  });

  io.on('connection', (socket) => {
    const { playerId, username, factionId } = socket.data;
    console.log(`🔌 ${username} bağlandı (${socket.id})`);

    // Player joins own room for private notifications
    socket.join(`player:${playerId}`);

    // Always join global channel
    socket.join('channel:global');
    socket.join('channel:trade');
    socket.join('channel:mercenary_guild');

    // Join faction channel if applicable
    if (factionId) {
      socket.join(`channel:faction:${factionId}`);
    }

    // ─── Chat ──────────────────────────────────────────────────────────────

    socket.on('chat:send', async ({ channel, content }) => {
      try {
        const message = await ChatService.sendMessage(playerId, channel, content);
        // Broadcast to all in channel
        io.to(`channel:${channel}`).emit('chat:message', message);
      } catch (err) {
        socket.emit('notification', {
          id: `err-${Date.now()}`,
          playerId,
          type: 'faction_message',
          title: 'Hata',
          body: (err as Error).message,
          isRead: false,
          data: {},
          createdAt: new Date().toISOString(),
        });
      }
    });

    socket.on('chat:join_channel', (channel) => {
      socket.join(`channel:${channel}`);
    });

    socket.on('chat:leave_channel', (channel) => {
      socket.leave(`channel:${channel}`);
    });

    // ─── Region subscription ───────────────────────────────────────────────

    socket.on('region:subscribe', (regionId) => {
      socket.join(`region:${regionId}`);
    });

    socket.on('region:unsubscribe', (regionId) => {
      socket.leave(`region:${regionId}`);
    });

    // ─── Disconnect ────────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      console.log(`🔌 ${username} ayrıldı`);
    });
  });

  return io;
}
