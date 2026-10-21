import { z } from "zod";
import { createGameConfig } from "../../engine/game-config";
import { MLT_ID } from "./constants";

export interface MltConfig {
  tally: boolean;
  packIds: string[] | null;
}

export const useMltConfig = createGameConfig<MltConfig>(MLT_ID, { tally: false, packIds: null }, { tally: z.boolean() });
