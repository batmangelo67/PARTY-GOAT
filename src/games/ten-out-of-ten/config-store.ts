import { z } from "zod";
import { createGameConfig } from "../../engine/game-config";
import { TEN_ID } from "./constants";

export interface TenConfig {
  rate: boolean;
  packIds: string[] | null;
}

export const useTenConfig = createGameConfig<TenConfig>(TEN_ID, { rate: false, packIds: null }, { rate: z.boolean() });
