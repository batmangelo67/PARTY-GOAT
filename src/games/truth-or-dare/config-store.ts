import { z } from "zod";
import { createGameConfig } from "../../engine/game-config";
import { TOD_ID } from "./constants";

export interface TodConfig {
  allowSkip: boolean;
  packIds: string[] | null;
}

export const useTodConfig = createGameConfig<TodConfig>(TOD_ID, { allowSkip: true, packIds: null }, { allowSkip: z.boolean() });
