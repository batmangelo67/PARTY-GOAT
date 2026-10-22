import { describe, expect, it } from "vitest";
import type { PackOf } from "../../content/schema";
import { braveryScores, fitsChoice, hasCardsFor, nextPlayerIndex, recordOutcome, type TodStats } from "./logic";

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
  it("fits the chosen type plus untyped cards", () => {
    const items = pack("a", ["truth", "dare", undefined]).items;
    expect(items.filter((item) => fitsChoice(item, "truth")).map((i) => i.type)).toEqual(["truth", undefined]);
    expect(items.filter((item) => fitsChoice(item, "dare")).map((i) => i.type)).toEqual(["dare", undefined]);
  });

  it("knows when no card fits a choice", () => {
    expect(hasCardsFor([pack("b", ["dare"])], "truth")).toBe(false);
    expect(hasCardsFor([pack("b", ["dare"]), pack("c", [undefined])], "truth")).toBe(true);
    expect(hasCardsFor([], "dare")).toBe(false);
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
