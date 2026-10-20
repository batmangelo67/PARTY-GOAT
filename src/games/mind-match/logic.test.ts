import { describe, expect, it } from "vitest";
import { findMatches, matchPoints, nextPromptWords, normalizeWord } from "./logic";

const ids = ["a", "b", "c", "d"];

describe("mind match: matching", () => {
  it("ignores case, accents and extra spaces", () => {
    expect(normalizeWord("  CaFFè  ")).toBe("caffe");
    expect(normalizeWord("Ice   Cream")).toBe("ice cream");
  });

  it("finds players who wrote the same word", () => {
    const answers = { a: "Moon", b: "moon ", c: "Sun", d: "SUN" };
    const matches = findMatches(ids, answers);
    expect(matches).toEqual([
      { word: "Moon", playerIds: ["a", "b"] },
      { word: "Sun", playerIds: ["c", "d"] },
    ]);
  });

  it("finds nothing when every word differs or is empty", () => {
    expect(findMatches(ids, { a: "Moon", b: "Sun", c: "", d: "  " })).toEqual([]);
  });

  it("awards a point to each matching player", () => {
    expect(matchPoints({ word: "Moon", playerIds: ["a", "b"] })).toEqual({ a: 1, b: 1 });
  });
});

describe("mind match: next prompt", () => {
  it("lists each distinct word once, in table order", () => {
    expect(nextPromptWords(ids, { a: "Moon", b: "Sun", c: "moon", d: "Star" })).toEqual(["Moon", "Sun", "Star"]);
  });
});
