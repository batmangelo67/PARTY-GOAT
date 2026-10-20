import type { NumericItem, PackOf } from "../../content/schema";
import { pick } from "../../engine/random";
import { assignHiddenRoles, scoreHiddenRoleRound } from "../../engine/roles";
import type { Language } from "../../i18n/languages";

export const CLOSEST_POINTS = 1;

export interface CircaRound {
  item: NumericItem;
  impostorId: string | null;
  starterId: string;
}

export function hasDecoy(item: NumericItem): boolean {
  return item.decoyQuestion !== undefined && item.decoyAnswer !== undefined;
}

// Impostor rounds need a decoy question; packs left without any are dropped.
export function packsWithDecoys(packs: readonly PackOf<"numeric">[]): PackOf<"numeric">[] {
  return packs
    .map((pack): PackOf<"numeric"> => ({ ...pack, items: pack.items.filter(hasDecoy) }))
    .filter((pack) => pack.items.length > 0);
}

export function buildCircaRound(item: NumericItem, playerIds: readonly string[], withImpostor: boolean): CircaRound {
  const impostorId = withImpostor ? [...assignHiddenRoles(playerIds, 1)][0]! : null;
  return { item, impostorId, starterId: pick(playerIds) };
}

export function questionFor(round: CircaRound, playerId: string): string {
  return playerId === round.impostorId ? round.item.decoyQuestion! : round.item.question;
}

export interface GuessRank {
  playerId: string;
  value: number;
  diff: number;
  rank: number;
}

// Closest guess first; equal distances share a rank. Players without a guess are left out.
export function rankGuesses(playerIds: readonly string[], guesses: Readonly<Record<string, number>>, truth: number): GuessRank[] {
  const scored = playerIds
    .filter((id) => id in guesses)
    .map((playerId) => ({ playerId, value: guesses[playerId]!, diff: Math.abs(guesses[playerId]! - truth) }))
    .sort((a, b) => a.diff - b.diff);
  return scored.map((entry) => ({ ...entry, rank: scored.findIndex((other) => other.diff === entry.diff) + 1 }));
}

export function closestPlayerIds(ranks: readonly GuessRank[]): string[] {
  return ranks.filter((entry) => entry.rank === 1).map((entry) => entry.playerId);
}

export function closestPoints(ranks: readonly GuessRank[]): Record<string, number> {
  return Object.fromEntries(closestPlayerIds(ranks).map((id) => [id, CLOSEST_POINTS]));
}

function mergePoints(...sets: Record<string, number>[]): Record<string, number> {
  const total: Record<string, number> = {};
  for (const set of sets) for (const [id, value] of Object.entries(set)) total[id] = (total[id] ?? 0) + value;
  return total;
}

// Impostor round: the usual catch/escape points, plus a point for the crew member closest to the truth.
export function scoreImpostorRound(round: CircaRound, playerIds: readonly string[], accusedId: string, crewRanks: readonly GuessRank[]): Record<string, number> {
  const hiddenIds = new Set([round.impostorId!]);
  return mergePoints(scoreHiddenRoleRound({ playerIds, hiddenIds, accusedId }), closestPoints(crewRanks));
}

export function formatNumber(value: number, language: Language): string {
  return new Intl.NumberFormat(language, { maximumFractionDigits: 3, useGrouping: false }).format(value);
}
