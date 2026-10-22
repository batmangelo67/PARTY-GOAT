import { z } from "zod";
import { DIFFICULTIES, type Difficulty } from "./schema";

export const DIFFICULTY_FILTERS = ["all", ...DIFFICULTIES] as const;
export type DifficultyFilter = (typeof DIFFICULTY_FILTERS)[number];
export const DIFFICULTY_FILTER_SCHEMA = z.enum(DIFFICULTY_FILTERS);

// Items written without a difficulty (older or custom packs) count as medium.
const UNRATED: Difficulty = "medium";

export function matchesDifficulty(item: { difficulty?: Difficulty }, filter: DifficultyFilter): boolean {
  return filter === "all" || (item.difficulty ?? UNRATED) === filter;
}

export function countMatchingItems(packs: readonly { items: readonly { difficulty?: Difficulty }[] }[], filter: DifficultyFilter): number {
  return packs.reduce((total, pack) => total + pack.items.filter((item) => matchesDifficulty(item, filter)).length, 0);
}
