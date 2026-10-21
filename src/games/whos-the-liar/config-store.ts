import { z } from "zod";
import { DEFAULT_DISCUSSION_MINUTES, MAX_PLAYERS } from "../../app/constants";
import { createGameConfig } from "../../engine/game-config";
import { DISCUSSION_MINUTES_SCHEMA, type DiscussionMinutes } from "../../engine/discussion-minutes";
import { LIAR_ID } from "./constants";
import { ANSWER_MODES, type AnswerMode } from "./logic";

export interface LiarConfig {
  liarCount: number;
  answerMode: AnswerMode;
  liarKnows: boolean;
  minutes: DiscussionMinutes;
  packIds: string[] | null;
}

export const useLiarConfig = createGameConfig<LiarConfig>(
  LIAR_ID,
  { liarCount: 1, answerMode: "typed", liarKnows: false, minutes: DEFAULT_DISCUSSION_MINUTES, packIds: null },
  {
    liarCount: z.number().int().min(1).max(MAX_PLAYERS),
    answerMode: z.enum(ANSWER_MODES),
    liarKnows: z.boolean(),
    minutes: DISCUSSION_MINUTES_SCHEMA,
  },
);
