import type { PackOf, PromptItem } from "../../content/schema";

export const TOD_CHOICES = ["truth", "dare"] as const;
export type TodChoice = (typeof TOD_CHOICES)[number];
export type TodOutcome = "done" | "skipped";

export type TodStats = Readonly<Record<string, Readonly<Record<TodOutcome, number>>>>;

type PromptPack = PackOf<"prompts">;

// Cards without a type (e.g. from the pack editor) work for both choices.
export function fitsChoice(item: Pick<PromptItem, "type">, choice: TodChoice): boolean {
  return item.type === undefined || item.type === choice;
}

export function hasCardsFor(packs: readonly PromptPack[], choice: TodChoice): boolean {
  return packs.some((pack) => pack.items.some((item) => fitsChoice(item, choice)));
}

export function nextPlayerIndex(current: number, playerCount: number): number {
  return playerCount === 0 ? 0 : (current + 1) % playerCount;
}

export function recordOutcome(stats: TodStats, playerId: string, outcome: TodOutcome): TodStats {
  const previous = stats[playerId] ?? { done: 0, skipped: 0 };
  return { ...stats, [playerId]: { ...previous, [outcome]: previous[outcome] + 1 } };
}

// Braver players rank higher: every skipped card cancels one finished card.
export function braveryScores(stats: TodStats, playerIds: readonly string[]): Record<string, number> {
  return Object.fromEntries(playerIds.map((id) => [id, (stats[id]?.done ?? 0) - (stats[id]?.skipped ?? 0)]));
}
