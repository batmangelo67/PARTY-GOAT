import { create } from "zustand";
import { DEFAULT_FINGERS, type NhieMode } from "./logic";

export interface NhieConfig {
  mode: NhieMode;
  fingers: number;
  packIds: string[] | null;
}

interface NhieConfigState extends NhieConfig {
  update: (changes: Partial<NhieConfig>) => void;
  setPackIds: (packIds: string[]) => void;
}

export const useNhieConfig = create<NhieConfigState>((set) => ({
  mode: "classic",
  fingers: DEFAULT_FINGERS,
  packIds: null,
  update: (changes) => set(changes),
  setPackIds: (packIds) => set({ packIds }),
}));
