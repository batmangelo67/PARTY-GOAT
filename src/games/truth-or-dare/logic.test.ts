import { describe, expect, it } from "vitest";
import type { PackOf } from "../../content/schema";
import { braveryScores, nextPlayerIndex, packsForChoice, recordOutcome, type TodStats } from "./logic";

function pack(id: string, types: (("truth" | "dare") | undefined)[]): PackOf<"prompts"> {
  return {
    id,
    title: id,
    language: "en",
    spice: 0,
    games: ["truth-or-dare"],
    kind: "prompts",
    source: "builtin",
    items: types.map((type, i) => ({ id: `${id}#${i}`, text: `card ${i}`, type })),
  };
}

describe("truth or dare: cards", () => {
  it("keeps only the chosen type plus untyped cards, and drops emptied packs", () => {
    const packs = [pack("a", ["truth", "dare", undefined]), pack("b", ["dare"])];
    const truths = packsForChoice(packs, "truth");
    expect(truths.map((p) => p.id)).toEqual(["a"]);
    expect(truths[0]!.items.map((i) => i.type)).toEqual(["truth", undefined]);
    expect(packsForChoice(packs, "dare").map((p) => p.items.length)).toEqual([2, 1]);
  });
});

describe("truth or dare: turns", () => {
  it("wraps around the table", () => {
    expect(nextPlayerIndex(0, 3)).toBe(1);
    expect(nextPlayerIndex(2, 3)).toBe(0);
    expect(nextPlayerIndex(0, 0)).toBe(0);
  });

  it("counts outcomes per player and scores bravery", () => {
    let stats: TodStats = {};
    stats = recordOutcome(stats, "a", "done");
    stats = recordOutcome(stats, "a", "done");
    stats = recordOutcome(stats, "a", "skipped");
    stats = recordOutcome(stats, "b", "skipped");
    expect(stats.a).toEqual({ done: 2, skipped: 1 });
    expect(braveryScores(stats, ["a", "b", "c"])).toEqual({ a: 1, b: -1, c: 0 });
  });
});
