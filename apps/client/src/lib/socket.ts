import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@kilic-ve-kantar/shared';
import { useAuthStore } from '../store/auth.store';
import { useGameStore } from '../store/game.store';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: GameSocket | null = null;

export function getSocket(): GameSocket {
  if (!socket) {
    throw new Error('Socket henüz bağlı değil');
  }
  return socket;
}

export function connectSocket(): GameSocket {
  if (socket?.connected) return socket;

  const token = useAuthStore.getState().accessToken;
  socket = io({
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  }) as GameSocket;

  // ─── Global socket event handlers ─────────────────────────────────────────

  socket.on('connect', () => {
    console.log('🔌 Socket bağlandı');
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket ayrıldı:', reason);
  });

  socket.on('chat:message', (msg) => {
    useGameStore.getState().addChatMessage(msg.channel, msg);
  });

  socket.on('news:published', (item) => {
    useGameStore.getState().prependNews(item);
  });

  socket.on('notification', (notif) => {
    // Shown as toast - handled in NotificationCenter component
    window.dispatchEvent(new CustomEvent('kv:notification', { detail: notif }));
  });

  socket.on('labor:completed', (data) => {
    window.dispatchEvent(new CustomEvent('kv:labor_done', { detail: data }));
    // Refetch player balance
    window.dispatchEvent(new CustomEvent('kv:refetch_player'));
  });

  socket.on('player:balance_updated', ({ akce, altin }) => {
    useAuthStore.getState().updatePlayer({ akceBalance: akce, altinBalance: altin });
  });

  socket.on('player:energy_updated', (energy) => {
    useAuthStore.getState().updatePlayer({ energy });
  });

  socket.on('war:declared', (war) => {
    useGameStore.getState().prependNews({
      id: war.id,
      type: 'war_declared',
      title: 'Savaş İlan Edildi!',
      body: `Bölgeye saldırı başladı.`,
      createdAt: war.declaredAt,
    });
  });

  socket.on('region:captured', (data) => {
    // Update region in store
    const regions = useGameStore.getState().regions;
    const updated = regions.map((r) =>
      r.id === data.regionId
        ? { ...r, governorId: data.newOwnerId, governor: { username: data.newOwnerName } }
        : r,
    );
    useGameStore.getState().setRegions(updated);
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
