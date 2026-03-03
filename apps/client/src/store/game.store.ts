import { create } from 'zustand';
import type { ChatMessage } from '@kilic-ve-kantar/shared';

interface Region {
  id: string;
  name: string;
  code: string;
  type: string;
  morale: number;
  economicValue: number;
  militaryValue: number;
  isUnderSiege: boolean;
  specialResource: string | null;
  svgPathId: string;
  factionId: string | null;
  governorId: string | null;
  faction: { name: string; tag: string } | null;
  governor: { username: string } | null;
}

interface GameState {
  regions: Region[];
  selectedRegionId: string | null;
  chatMessages: Record<string, ChatMessage[]>;
  activeChannel: string;
  newsItems: unknown[];
  onlineCount: number;

  setRegions: (regions: Region[]) => void;
  selectRegion: (id: string | null) => void;
  addChatMessage: (channel: string, msg: ChatMessage) => void;
  setActiveChannel: (channel: string) => void;
  prependNews: (item: unknown) => void;
  setOnlineCount: (n: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  regions: [],
  selectedRegionId: null,
  chatMessages: {},
  activeChannel: 'global',
  newsItems: [],
  onlineCount: 0,

  setRegions: (regions) => set({ regions }),

  selectRegion: (id) => set({ selectedRegionId: id }),

  addChatMessage: (channel, msg) =>
    set((s) => ({
      chatMessages: {
        ...s.chatMessages,
        [channel]: [...(s.chatMessages[channel] ?? []).slice(-199), msg],
      },
    })),

  setActiveChannel: (channel) => set({ activeChannel: channel }),

  prependNews: (item) =>
    set((s) => ({ newsItems: [item, ...s.newsItems].slice(0, 100) })),

  setOnlineCount: (onlineCount) => set({ onlineCount }),
}));
