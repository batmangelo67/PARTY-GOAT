import { describe, expect, it } from "vitest";
import { withItemIds } from "../../content/items";
import type { PackOf } from "../../content/schema";
import {
  explosionRanking,
  FUSE_LENGTHS,
  FUSE_RANGES_SECONDS,
  hasExploded,
  passBomb,
  pickCategory,
  remainingMs,
  rollFuseMs,
  startHolder,
  tickIntervalMs,
  TICK_FASTEST_MS,
  TICK_SLOWEST_MS,
  undoPass,
} from "./logic";

describe("bomb fuse", () => {
  it.each(FUSE_LENGTHS)("%s fuse always stays inside its range", (length) => {
    const [min, max] = FUSE_RANGES_SECONDS[length];
    for (let i = 0; i < 2000; i++) {
      const fuse = rollFuseMs(length);
      expect(fuse).toBeGreaterThanOrEqual(min * 1000);
      expect(fuse).toBeLessThanOrEqual(max * 1000);
    }
  });

  it("ticks get shorter as time runs out", () => {
    const fuse = { startedAt: 1000, durationMs: 30000 };
    const intervals = [0, 10000, 20000, 25000, 29000, 30000].map((t) => tickIntervalMs(fuse, 1000 + t));
    expect(intervals[0]).toBe(TICK_SLOWEST_MS);
    expect(intervals.at(-1)).toBe(TICK_FASTEST_MS);
    for (let i = 1; i < intervals.length; i++) expect(intervals[i]!).toBeLessThan(intervals[i - 1]!);
  });

  it("explodes exactly when the fuse runs out", () => {
    const fuse = { startedAt: 500, durationMs: 20000 };
    expect(hasExploded(fuse, 20499)).toBe(false);
    expect(hasExploded(fuse, 20500)).toBe(true);
  });

  it("still explodes after a long background gap", () => {
    const fuse = { startedAt: 0, durationMs: 25000 };
    expect(hasExploded(fuse, 5000)).toBe(false);
    const resumedAt = 5000 + 10 * 60 * 1000;
    expect(hasExploded(fuse, resumedAt)).toBe(true);
    expect(remainingMs(fuse, resumedAt)).toBe(0);
    expect(tickIntervalMs(fuse, resumedAt)).toBe(TICK_FASTEST_MS);
  });
});

describe("bomb holder", () => {
  it("advances in list order and wraps", () => {
    let state = startHolder(1);
    state = passBomb(state, 3);
    expect(state.index).toBe(2);
    state = passBomb(state, 3);
    expect(state.index).toBe(0);
  });

  it("undoes passes one at a time and stops at the start", () => {
    let state = passBomb(passBomb(startHolder(0), 4), 4);
    state = undoPass(state);
    expect(state.index).toBe(1);
    state = undoPass(undoPass(state));
    expect(state).toEqual(startHolder(0));
  });
});

describe("bomb categories and ranking", () => {
  const pack = (id: string, examples?: string[]) =>
    withItemIds(
      { id, title: id, language: "en", spice: 0, kind: "prompts", games: ["bomb"], items: [{ text: `${id} prompt`, examples }] },
      "builtin",
    ) as PackOf<"prompts">;

  it("picks a different category when it can", () => {
    const packs = [pack("a"), pack("b")];
    const current = pickCategory(packs);
    for (let i = 0; i < 50; i++) expect(pickCategory(packs, current.itemId).itemId).not.toBe(current.itemId);
    const only = pack("a");
    expect(pickCategory([only], only.items[0]!.id)).toEqual({ itemId: only.items[0]!.id, title: "a prompt", example: undefined });
  });

  it("shows one of the prompt's examples", () => {
    const examples = ["one", "two", "three"];
    for (let i = 0; i < 20; i++) expect(examples).toContain(pickCategory([pack("a", examples)]).example);
  });

  it("ranks fewest explosions first", () => {
    const players = [{ id: "x" }, { id: "y" }, { id: "z" }];
    expect(explosionRanking(players, { x: 2, z: 1 }).map((p) => p.id)).toEqual(["y", "z", "x"]);
  });
});
