import { MIN_PLAYERS } from "../app/constants";
import { pickMany } from "./random";

export const HIDDEN_ROLE_POINTS = {
  crewCatch: 1,
  hiddenSurvives: 2,
  caughtButGuessed: 1,
} as const;

export function maxHiddenRoles(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount - 1) / 2));
}

export function clampHiddenRoleCount(count: number, playerCount: number): number {
  return Math.min(Math.max(1, count), maxHiddenRoles(playerCount));
}

export function assignHiddenRoles(playerIds: readonly string[], count: number): Set<string> {
  if (playerIds.length < MIN_PLAYERS) {
    throw new RangeError(`need at least ${MIN_PLAYERS} players, got ${playerIds.length}`);
  }
  const max = maxHiddenRoles(playerIds.length);
  if (!Number.isInteger(count) || count < 1 || count > max) {
    throw new RangeError(`${playerIds.length} players allow 1 to ${max} hidden roles, got ${count}`);
  }
  return new Set(pickMany(playerIds, count));
}

interface HiddenRoleRound {
  playerIds: readonly string[];
  hiddenIds: ReadonlySet<string>;
  accusedId: string;
  accusedGuessedSecret?: boolean;
}

export function isCaught(round: Pick<HiddenRoleRound, "hiddenIds" | "accusedId">): boolean {
  return round.hiddenIds.has(round.accusedId);
}

export function scoreHiddenRoleRound(round: HiddenRoleRound): Record<string, number> {
  const caught = isCaught(round);
  const points: Record<string, number> = {};
  for (const id of round.playerIds) {
    if (!round.hiddenIds.has(id)) {
      points[id] = caught ? HIDDEN_ROLE_POINTS.crewCatch : 0;
    } else if (id !== round.accusedId) {
      points[id] = HIDDEN_ROLE_POINTS.hiddenSurvives;
    } else {
      points[id] = round.accusedGuessedSecret ? HIDDEN_ROLE_POINTS.caughtButGuessed : 0;
    }
  }
  return points;
}
