import type { PackOf, WordItem } from "../../content/schema";
import { pick } from "../../engine/random";
import { assignHiddenRoles } from "../../engine/roles";

export const CLUE_MODES = ["none", "category", "hint", "both"] as const;
export type ClueMode = (typeof CLUE_MODES)[number];

export interface ImpostorClues {
  category?: string;
  hint?: string;
}

// A mode that needs a missing hint falls back to the category so the impostor never sees an empty clue.
export function resolveClues(mode: ClueMode, category: string, hint: string | undefined): ImpostorClues {
  switch (mode) {
    case "none":
      return {};
    case "category":
      return { category };
    case "hint":
      return hint ? { hint } : { category };
    case "both":
      return hint ? { category, hint } : { category };
  }
}

export function countHints(packs: readonly PackOf<"words">[]): { withHint: number; total: number } {
  const items = packs.flatMap((pack) => pack.items);
  return { withHint: items.filter((item) => item.hint).length, total: items.length };
}

export interface ImpostorRound {
  word: string;
  clues: ImpostorClues;
  impostorIds: Set<string>;
  starterId: string;
}

export function buildImpostorRound(
  item: WordItem,
  category: string,
  mode: ClueMode,
  playerIds: readonly string[],
  impostorCount: number,
): ImpostorRound {
  return {
    word: item.word,
    clues: resolveClues(mode, category, item.hint),
    impostorIds: assignHiddenRoles(playerIds, impostorCount),
    starterId: pick(playerIds),
  };
}
