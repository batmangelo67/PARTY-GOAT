import { create } from "zustand";
import type { CategoryMode, FuseLength } from "./logic";

export interface BombConfig {
  fuseLength: FuseLength;
  categoryMode: CategoryMode;
  showExample: boolean;
  packIds: string[] | null;
}

interface BombConfigState extends BombConfig {
  update: (changes: Partial<BombConfig>) => void;
  setPackIds: (packIds: string[]) => void;
}

export const useBombConfig = create<BombConfigState>((set) => ({
  fuseLength: "medium",
  categoryMode: "eachRound",
  showExample: false,
  packIds: null,
  update: (changes) => set(changes),
  setPackIds: (packIds) => set({ packIds }),
}));
