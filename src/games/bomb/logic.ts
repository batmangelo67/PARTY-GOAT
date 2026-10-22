import type { PackOf } from "../../content/schema";
import { pick, randomInt } from "../../engine/random";

export const FUSE_LENGTHS = ["short", "medium", "long"] as const;
export type FuseLength = (typeof FUSE_LENGTHS)[number];

export const FUSE_RANGES_SECONDS: Record<FuseLength, readonly [min: number, max: number]> = {
  short: [15, 30],
  medium: [25, 50],
  long: [40, 70],
};

export const CATEGORY_MODES = ["eachRound", "keep"] as const;
export type CategoryMode = (typeof CATEGORY_MODES)[number];

export const TICK_SLOWEST_MS = 1000;
export const TICK_FASTEST_MS = 120;

export function rollFuseMs(length: FuseLength): number {
  const [min, max] = FUSE_RANGES_SECONDS[length];
  return min * 1000 + randomInt((max - min) * 1000 + 1);
}

export interface Fuse {
  startedAt: number;
  durationMs: number;
}

// Timestamps, not accumulated ticks: a backgrounded app still explodes on time when it resumes.
export function elapsedMs(fuse: Fuse, now: number): number {
  return Math.max(0, now - fuse.startedAt);
}

export function hasExploded(fuse: Fuse, now: number): boolean {
  return elapsedMs(fuse, now) >= fuse.durationMs;
}

export function remainingMs(fuse: Fuse, now: number): number {
  return Math.max(0, fuse.durationMs - elapsedMs(fuse, now));
}

// Ticks speed up quadratically so the end feels urgent without leaking the exact fuse early on.
export function tickIntervalMs(fuse: Fuse, now: number): number {
  const progress = Math.min(1, elapsedMs(fuse, now) / fuse.durationMs);
  return Math.round(TICK_SLOWEST_MS - (TICK_SLOWEST_MS - TICK_FASTEST_MS) * progress ** 2);
}

export interface HolderState {
  index: number;
  history: number[];
}

export function startHolder(index: number): HolderState {
  return { index, history: [] };
}

export function passBomb(state: HolderState, playerCount: number): HolderState {
  return { index: (state.index + 1) % playerCount, history: [...state.history, state.index] };
}

export function undoPass(state: HolderState): HolderState {
  if (state.history.length === 0) return state;
  return { index: state.history[state.history.length - 1]!, history: state.history.slice(0, -1) };
}

export interface Category {
  itemId: string;
  title: string;
  example?: string;
}

// Each prompt is one category; skipping never lands on the same prompt when another exists.
export function pickCategory(packs: readonly PackOf<"prompts">[], currentItemId?: string): Category {
  const items = packs.flatMap((pack) => pack.items);
  const others = items.filter((item) => item.id !== currentItemId);
  const item = pick(others.length > 0 ? others : items);
  return { itemId: item.id, title: item.text, example: item.examples ? pick(item.examples) : undefined };
}

export function explosionRanking<T extends { id: string }>(players: readonly T[], explosions: Readonly<Record<string, number>>) {
  return players
    .map((player) => ({ ...player, explosions: explosions[player.id] ?? 0 }))
    .sort((a, b) => a.explosions - b.explosions);
}
