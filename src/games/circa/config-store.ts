import { z } from "zod";
import { DEFAULT_DISCUSSION_MINUTES } from "../../app/constants";
import { createGameConfig } from "../../engine/game-config";
import { DISCUSSION_MINUTES_SCHEMA, type DiscussionMinutes } from "../../engine/discussion-minutes";
import { CIRCA_ID } from "./constants";

export interface CircaConfig {
  impostor: boolean;
  minutes: DiscussionMinutes;
  packIds: string[] | null;
}

export const useCircaConfig = createGameConfig<CircaConfig>(
  CIRCA_ID,
  { impostor: false, minutes: DEFAULT_DISCUSSION_MINUTES, packIds: null },
  { impostor: z.boolean(), minutes: DISCUSSION_MINUTES_SCHEMA },
);
