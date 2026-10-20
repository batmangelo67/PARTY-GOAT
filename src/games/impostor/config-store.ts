import { create } from "zustand";
import { DEFAULT_DISCUSSION_MINUTES } from "../../app/constants";
import type { DiscussionMinutes } from "../../engine/setup-fields";
import type { ClueMode } from "./logic";

export interface ImpostorConfig {
  impostorCount: number;
  clueMode: ClueMode;
  knowEachOther: boolean;
  canGuess: boolean;
  minutes: DiscussionMinutes;
  packIds: string[] | null;
}

interface ImpostorConfigState extends ImpostorConfig {
  update: (changes: Partial<ImpostorConfig>) => void;
  setPackIds: (packIds: string[]) => void;
}

export const useImpostorConfig = create<ImpostorConfigState>((set) => ({
  impostorCount: 1,
  clueMode: "category",
  knowEachOther: false,
  canGuess: true,
  minutes: DEFAULT_DISCUSSION_MINUTES,
  packIds: null,
  update: (changes) => set(changes),
  setPackIds: (packIds) => set({ packIds }),
}));
