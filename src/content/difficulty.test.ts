import { describe, expect, it } from "vitest";
import { countMatchingItems, DIFFICULTY_FILTER_SCHEMA, matchesDifficulty } from "./difficulty";

const packs = [
  { items: [{ difficulty: "easy" as const }, { difficulty: "hard" as const }, {}] },
  { items: [{ difficulty: "medium" as const }, { difficulty: "easy" as const }] },
];

describe("difficulty filter", () => {
  it("keeps every item when set to all", () => {
    expect(countMatchingItems(packs, "all")).toBe(5);
  });

  it("keeps only items of the chosen level", () => {
    expect(countMatchingItems(packs, "easy")).toBe(2);
    expect(countMatchingItems(packs, "hard")).toBe(1);
  });

  it("treats items without a difficulty as medium", () => {
    expect(matchesDifficulty({}, "medium")).toBe(true);
    expect(matchesDifficulty({}, "easy")).toBe(false);
    expect(countMatchingItems(packs, "medium")).toBe(2);
  });

  it("returns zero when nothing matches", () => {
    expect(countMatchingItems([{ items: [{ difficulty: "easy" }] }], "hard")).toBe(0);
  });

  it("rejects an unknown stored level", () => {
    expect(DIFFICULTY_FILTER_SCHEMA.safeParse("brutal").success).toBe(false);
    expect(DIFFICULTY_FILTER_SCHEMA.safeParse("hard").success).toBe(true);
  });
});
