import { describe, expect, it } from "vitest";
import { withItemIds } from "../../content/items";
import type { PackOf } from "../../content/schema";
import { buildImpostorRound, countHints, resolveClues } from "./logic";

describe("impostor clue modes", () => {
  it("shows nothing in none mode", () => {
    expect(resolveClues("none", "Food", "Italian")).toEqual({});
  });

  it("shows the category in category mode", () => {
    expect(resolveClues("category", "Food", "Italian")).toEqual({ category: "Food" });
  });

  it("shows the hint in hint mode", () => {
    expect(resolveClues("hint", "Food", "Italian")).toEqual({ hint: "Italian" });
  });

  it("shows both in both mode", () => {
    expect(resolveClues("both", "Food", "Italian")).toEqual({ category: "Food", hint: "Italian" });
  });

  it("falls back to the category when the hint is missing", () => {
    expect(resolveClues("hint", "Food", undefined)).toEqual({ category: "Food" });
    expect(resolveClues("both", "Food", undefined)).toEqual({ category: "Food" });
    expect(resolveClues("hint", "Food", "")).toEqual({ category: "Food" });
  });
});

describe("impostor round", () => {
  const playerIds = ["a", "b", "c", "d", "e"];

  it("assigns the requested impostors and a starter from the players", () => {
    const round = buildImpostorRound({ word: "Pizza", hint: "Italian" }, "Food", "both", playerIds, 2);
    expect(round.impostorIds.size).toBe(2);
    expect(playerIds).toContain(round.starterId);
    expect(round.word).toBe("Pizza");
    expect(round.clues).toEqual({ category: "Food", hint: "Italian" });
  });

  it("refuses more impostors than allowed", () => {
    expect(() => buildImpostorRound({ word: "Pizza" }, "Food", "none", playerIds, 3)).toThrow(RangeError);
  });

  it("counts how many words have hints", () => {
    const pack = withItemIds(
      { id: "en-test", title: "Test", language: "en", spice: 0, kind: "words", games: ["impostor"], items: [{ word: "A", hint: "x" }, { word: "B" }] },
      "custom",
    ) as PackOf<"words">;
    expect(countHints([pack])).toEqual({ withHint: 1, total: 2 });
  });
});
