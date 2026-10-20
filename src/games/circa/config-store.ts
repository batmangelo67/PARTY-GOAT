import { create } from "zustand";
import { DEFAULT_DISCUSSION_MINUTES } from "../../app/constants";
import type { DiscussionMinutes } from "../../engine/setup-fields";

export interface CircaConfig {
  impostor: boolean;
  minutes: DiscussionMinutes;
  packIds: string[] | null;
}

interface CircaConfigState extends CircaConfig {
  update: (changes: Partial<CircaConfig>) => void;
  setPackIds: (packIds: string[]) => void;
}

export const useCircaConfig = create<CircaConfigState>((set) => ({
  impostor: false,
  minutes: DEFAULT_DISCUSSION_MINUTES,
  packIds: null,
  update: (changes) => set(changes),
  setPackIds: (packIds) => set({ packIds }),
}));
