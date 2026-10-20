import { create } from "zustand";

export interface TenConfig {
  rate: boolean;
  packIds: string[] | null;
}

interface TenConfigState extends TenConfig {
  update: (changes: Partial<TenConfig>) => void;
  setPackIds: (packIds: string[]) => void;
}

export const useTenConfig = create<TenConfigState>((set) => ({
  rate: false,
  packIds: null,
  update: (changes) => set(changes),
  setPackIds: (packIds) => set({ packIds }),
}));
