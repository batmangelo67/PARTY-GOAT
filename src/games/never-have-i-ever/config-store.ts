import { z } from "zod";
import { createGameConfig } from "../../engine/game-config";
import { NHIE_ID } from "./constants";
import { DEFAULT_FINGERS, MAX_FINGERS, MIN_FINGERS, NHIE_MODES, type NhieMode } from "./logic";

export interface NhieConfig {
  mode: NhieMode;
  fingers: number;
  packIds: string[] | null;
}

export const useNhieConfig = createGameConfig<NhieConfig>(
  NHIE_ID,
  { mode: "classic", fingers: DEFAULT_FINGERS, packIds: null },
  { mode: z.enum(NHIE_MODES), fingers: z.number().int().min(MIN_FINGERS).max(MAX_FINGERS) },
);
