import { z } from "zod";
import { DIFFICULTY_FILTER_SCHEMA, type DifficultyFilter } from "../../content/difficulty";
import { createGameConfig } from "../../engine/game-config";
import { FORBIDDEN_ID } from "./constants";
import {
  DEFAULT_TURNS_PER_TEAM,
  DEFAULT_TURN_SECONDS,
  MAX_TURNS_PER_TEAM,
  MIN_TURNS_PER_TEAM,
  TURN_SECONDS_OPTIONS,
  type TurnSeconds,
} from "./logic";

export interface ForbiddenConfig {
  seconds: TurnSeconds;
  turnsPerTeam: number;
  difficulty: DifficultyFilter;
  packIds: string[] | null;
}

export const useForbiddenConfig = createGameConfig<ForbiddenConfig>(
  FORBIDDEN_ID,
  { seconds: DEFAULT_TURN_SECONDS, turnsPerTeam: DEFAULT_TURNS_PER_TEAM, difficulty: "all", packIds: null },
  {
    seconds: z.literal([...TURN_SECONDS_OPTIONS]), turnsPerTeam: z.number().int().min(MIN_TURNS_PER_TEAM).max(MAX_TURNS_PER_TEAM),
    difficulty: DIFFICULTY_FILTER_SCHEMA,
  },
);
