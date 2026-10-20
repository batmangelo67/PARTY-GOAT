import { isMarked, type CardMarks } from "../../engine/card-marks";

export const NHIE_MODES = ["classic", "fingers"] as const;
export type NhieMode = (typeof NHIE_MODES)[number];

export const MIN_FINGERS = 3;
export const MAX_FINGERS = 10;
export const DEFAULT_FINGERS = 5;

export function fingersLeft(start: number, playerIds: readonly string[], taps: CardMarks): Record<string, number> {
  const left = Object.fromEntries(playerIds.map((id) => [id, start]));
  for (const card of taps) for (const id of card) if (id in left) left[id] = Math.max(0, left[id]! - 1);
  return left;
}

export function canTap(fingers: Readonly<Record<string, number>>, taps: CardMarks, cardIndex: number, playerId: string): boolean {
  return isMarked(taps, cardIndex, playerId) || (fingers[playerId] ?? 0) > 0;
}

export function activePlayerIds(fingers: Readonly<Record<string, number>>): string[] {
  return Object.keys(fingers).filter((id) => fingers[id]! > 0);
}

export function isGameOver(fingers: Readonly<Record<string, number>>): boolean {
  return activePlayerIds(fingers).length <= 1;
}
