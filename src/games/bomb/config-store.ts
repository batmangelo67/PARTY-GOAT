import { z } from "zod";
import { createGameConfig } from "../../engine/game-config";
import { BOMB_ID } from "./constants";
import { CATEGORY_MODES, FUSE_LENGTHS, type CategoryMode, type FuseLength } from "./logic";

export interface BombConfig {
  fuseLength: FuseLength;
  categoryMode: CategoryMode;
  showExample: boolean;
  packIds: string[] | null;
}

export const useBombConfig = createGameConfig<BombConfig>(
  BOMB_ID,
  { fuseLength: "medium", categoryMode: "eachRound", showExample: false, packIds: null },
  { fuseLength: z.enum(FUSE_LENGTHS), categoryMode: z.enum(CATEGORY_MODES), showExample: z.boolean() },
);
