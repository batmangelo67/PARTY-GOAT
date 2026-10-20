import { create } from "zustand";

export interface TodConfig {
  allowSkip: boolean;
  packIds: string[] | null;
}

interface TodConfigState extends TodConfig {
  update: (changes: Partial<TodConfig>) => void;
  setPackIds: (packIds: string[]) => void;
}

export const useTodConfig = create<TodConfigState>((set) => ({
  allowSkip: true,
  packIds: null,
  update: (changes) => set(changes),
  setPackIds: (packIds) => set({ packIds }),
}));
