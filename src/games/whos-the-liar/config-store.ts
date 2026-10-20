import { create } from "zustand";
import { DEFAULT_DISCUSSION_MINUTES } from "../../app/constants";
import type { DiscussionMinutes } from "../../engine/setup-fields";
import type { AnswerMode } from "./logic";

export interface LiarConfig {
  liarCount: number;
  answerMode: AnswerMode;
  liarKnows: boolean;
  minutes: DiscussionMinutes;
  packIds: string[] | null;
}

interface LiarConfigState extends LiarConfig {
  update: (changes: Partial<LiarConfig>) => void;
  setPackIds: (packIds: string[]) => void;
}

export const useLiarConfig = create<LiarConfigState>((set) => ({
  liarCount: 1,
  answerMode: "typed",
  liarKnows: false,
  minutes: DEFAULT_DISCUSSION_MINUTES,
  packIds: null,
  update: (changes) => set(changes),
  setPackIds: (packIds) => set({ packIds }),
}));
