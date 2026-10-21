import { z } from "zod";
import { createGameConfig } from "../../engine/game-config";
import { MIND_ID } from "./constants";
import { MIND_MODES, type MindMode } from "./logic";

export interface MindConfig {
  mode: MindMode;
  packIds: string[] | null;
}

export const useMindConfig = createGameConfig<MindConfig>(MIND_ID, { mode: "spoken", packIds: null }, { mode: z.enum(MIND_MODES) });
