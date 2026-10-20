import { describe, expect, it } from "vitest";
import { toggleMark as toggleTap } from "../../engine/card-marks";
import { rankByScore } from "../../engine/ranking";
import {
  activePlayerIds,
  canTap,
  fingersLeft,
  isGameOver,
} from "./logic";

const ids = ["a", "b", "c"];

describe("never have I ever: fingers", () => {
  it("each tap on a card costs one finger", () => {
    let taps = toggleTap([], 0, "a");
    taps = toggleTap(taps, 2, "a");
    taps = toggleTap(taps, 2, "b");
    expect(fingersLeft(3, ids, taps)).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("tapping again on the same card gives the finger back", () => {
    const taps = toggleTap(toggleTap([], 0, "a"), 0, "a");
    expect(fingersLeft(3, ids, taps)).toEqual({ a: 3, b: 3, c: 3 });
  });

  it("eliminates a player at zero and blocks further taps", () => {
    let taps = toggleTap([], 0, "a");
    taps = toggleTap(taps, 1, "a");
    taps = toggleTap(taps, 2, "a");
    const fingers = fingersLeft(3, ids, taps);
    expect(fingers.a).toBe(0);
    expect(activePlayerIds(fingers)).toEqual(["b", "c"]);
    expect(canTap(fingers, taps, 3, "a")).toBe(false);
    expect(canTap(fingers, taps, 2, "a")).toBe(true);
  });

  it("ends when one player is left and ranks them first", () => {
    let taps: string[][] = [];
    for (let card = 0; card < 3; card++) taps = toggleTap(toggleTap(taps, card, "a"), card, "b");
    const fingers = fingersLeft(3, ids, taps);
    expect(isGameOver(fingers)).toBe(true);
    const ranking = rankByScore(ids.map((id) => ({ id })), fingers);
    expect(ranking[0]).toMatchObject({ player: { id: "c" }, score: 3, rank: 1 });
    expect(ranking.slice(1).map((r) => r.rank)).toEqual([2, 2]);
  });

  it("is not over while two players still have fingers", () => {
    expect(isGameOver(fingersLeft(3, ids, [["a"]]))).toBe(false);
  });
});
