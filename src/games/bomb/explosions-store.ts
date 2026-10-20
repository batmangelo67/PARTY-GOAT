import { create } from "zustand";

interface ExplosionsState {
  explosions: Record<string, number>;
  addExplosion: (playerId: string) => void;
  resetExplosions: () => void;
}

export const useExplosionsStore = create<ExplosionsState>((set) => ({
  explosions: {},
  addExplosion: (playerId) =>
    set(({ explosions }) => ({ explosions: { ...explosions, [playerId]: (explosions[playerId] ?? 0) + 1 } })),
  resetExplosions: () => set({ explosions: {} }),
}));
