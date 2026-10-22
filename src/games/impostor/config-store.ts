import { z } from "zod";
import { DEFAULT_DISCUSSION_MINUTES, MAX_PLAYERS } from "../../app/constants";
import { createGameConfig } from "../../engine/game-config";
import { DISCUSSION_MINUTES_SCHEMA, type DiscussionMinutes } from "../../engine/discussion-minutes";
import { IMPOSTOR_ID } from "./constants";
import { CLUE_MODES, type ClueMode } from "./logic";

export interface ImpostorConfig {
  impostorCount: number;
  clueMode: ClueMode;
  knowEachOther: boolean;
  canGuess: boolean;
  minutes: DiscussionMinutes;
  packIds: string[] | null;
}

export const useImpostorConfig = createGameConfig<ImpostorConfig>(
  IMPOSTOR_ID,
  { impostorCount: 1, clueMode: "category", knowEachOther: false, canGuess: true, minutes: DEFAULT_DISCUSSION_MINUTES, packIds: null },
  {
    impostorCount: z.number().int().min(1).max(MAX_PLAYERS),
    clueMode: z.enum(CLUE_MODES),
    knowEachOther: z.boolean(),
    canGuess: z.boolean(),
    minutes: DISCUSSION_MINUTES_SCHEMA,
  },
);
