import { create } from "zustand";

export interface MltConfig {
  tally: boolean;
  packIds: string[] | null;
}

interface MltConfigState extends MltConfig {
  update: (changes: Partial<MltConfig>) => void;
  setPackIds: (packIds: string[]) => void;
}

export const useMltConfig = create<MltConfigState>((set) => ({
  tally: false,
  packIds: null,
  update: (changes) => set(changes),
  setPackIds: (packIds) => set({ packIds }),
}));
