import { create } from "zustand";

interface ScoreboardState {
  scores: Record<string, number>;
  addPoints: (points: Record<string, number>) => void;
  resetScores: () => void;
}

export const useScoreboardStore = create<ScoreboardState>((set) => ({
  scores: {},
  addPoints: (points) =>
    set(({ scores }) => {
      const next = { ...scores };
      for (const [id, value] of Object.entries(points)) next[id] = (next[id] ?? 0) + value;
      return { scores: next };
    }),
  resetScores: () => set({ scores: {} }),
}));
