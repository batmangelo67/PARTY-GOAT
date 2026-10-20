import { create } from "zustand";
import type { MindMode } from "./logic";

export interface MindConfig {
  mode: MindMode;
  packIds: string[] | null;
}

interface MindConfigState extends MindConfig {
  update: (changes: Partial<MindConfig>) => void;
  setPackIds: (packIds: string[]) => void;
}

export const useMindConfig = create<MindConfigState>((set) => ({
  mode: "spoken",
  packIds: null,
  update: (changes) => set(changes),
  setPackIds: (packIds) => set({ packIds }),
}));
