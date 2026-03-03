import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthPlayer {
  id: string;
  username: string;
  email: string;
  akceBalance: number;
  altinBalance: number;
  energy: number;
  tradeLevel: number;
  militaryLevel: number;
  tradeXp?: number;
  militaryXp?: number;
  vipPlan: string;
  role: string;
  factionId: string | null;
  homeRegionId: string | null;
}

interface AuthState {
  player: AuthPlayer | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (player: AuthPlayer, accessToken: string, refreshToken: string) => void;
  updatePlayer: (updates: Partial<AuthPlayer>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      player: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (player, accessToken, refreshToken) =>
        set({ player, accessToken, refreshToken }),

      updatePlayer: (updates) =>
        set((s) => ({
          player: s.player ? { ...s.player, ...updates } : null,
        })),

      logout: () =>
        set({ player: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'kv-auth',
      partialize: (s) => ({
        player: s.player,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
    },
  ),
);
