import { describe, expect, it } from "vitest";
import { countMarks, isMarked, toggleMark } from "./card-marks";
import { rankByScore } from "./ranking";

describe("card marks", () => {
  it("toggles a mark on one card without touching others", () => {
    const marks = toggleMark(toggleMark([], 2, "a"), 0, "b");
    expect(isMarked(marks, 2, "a")).toBe(true);
    expect(isMarked(marks, 0, "a")).toBe(false);
    expect(isMarked(toggleMark(marks, 2, "a"), 2, "a")).toBe(false);
  });

  it("counts the cards each player is marked on", () => {
    const marks = toggleMark(toggleMark(toggleMark([], 0, "a"), 1, "a"), 1, "b");
    expect(countMarks(marks, ["a", "b", "c"])).toEqual({ a: 2, b: 1, c: 0 });
  });
});

describe("rankByScore", () => {
  it("ranks highest first and shares ranks on ties", () => {
    const ranked = rankByScore([{ id: "a" }, { id: "b" }, { id: "c" }], { a: 1, b: 3, c: 1 });
    expect(ranked.map((r) => [r.player.id, r.rank])).toEqual([["b", 1], ["a", 2], ["c", 2]]);
  });
});
