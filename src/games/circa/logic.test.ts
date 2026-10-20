import { describe, expect, it } from "vitest";
import type { NumericItem, PackOf } from "../../content/schema";
import { buildCircaRound, closestPoints, formatNumber, packsWithDecoys, questionFor, rankGuesses, scoreImpostorRound } from "./logic";

const ids = ["a", "b", "c", "d"];
const plain: NumericItem = { question: "How many bones?", answer: 206, unit: "bones" };
const withDecoy: NumericItem = { ...plain, decoyQuestion: "How many teeth?", decoyAnswer: 32 };

describe("circa: ranking", () => {
  it("ranks by distance and shares ranks on ties", () => {
    const ranks = rankGuesses(ids, { a: 200, b: 212, c: 150, d: 206 }, 206);
    expect(ranks.map((r) => [r.playerId, r.rank])).toEqual([["d", 1], ["a", 2], ["b", 2], ["c", 4]]);
    expect(closestPoints(ranks)).toEqual({ d: 1 });
  });

  it("gives every tied winner a point and skips players with no guess", () => {
    const ranks = rankGuesses(ids, { a: 10, b: 30 }, 20);
    expect(ranks.map((r) => r.playerId)).toEqual(["a", "b"]);
    expect(closestPoints(ranks)).toEqual({ a: 1, b: 1 });
  });
});

describe("circa: impostor", () => {
  it("only offers items that have a decoy question and answer", () => {
    const pack = { id: "p", title: "p", language: "en", spice: 0, games: ["circa"], kind: "numeric", source: "builtin", items: [{ ...plain, id: "p#1" }, { ...withDecoy, id: "p#2" }] } as PackOf<"numeric">;
    expect(packsWithDecoys([pack])[0]!.items.map((i) => i.id)).toEqual(["p#2"]);
    expect(packsWithDecoys([{ ...pack, items: [{ ...plain, id: "p#1" }] }])).toEqual([]);
  });

  it("shows the impostor the decoy question and everyone else the real one", () => {
    const round = buildCircaRound(withDecoy, ids, true);
    expect(questionFor(round, round.impostorId!)).toBe(withDecoy.decoyQuestion);
    const crewId = ids.find((id) => id !== round.impostorId)!;
    expect(questionFor(round, crewId)).toBe(withDecoy.question);
    expect(buildCircaRound(plain, ids, false).impostorId).toBeNull();
  });

  it("adds a point for the closest crew member on top of the catch points", () => {
    const round = { item: withDecoy, impostorId: "d", starterId: "a" };
    const crewRanks = rankGuesses(["a", "b", "c"], { a: 200, b: 206, c: 100 }, 206);
    expect(scoreImpostorRound(round, ids, "d", crewRanks)).toEqual({ a: 1, b: 2, c: 1, d: 0 });
    expect(scoreImpostorRound(round, ids, "a", crewRanks)).toEqual({ a: 0, b: 1, c: 0, d: 2 });
  });
});

describe("circa: number format", () => {
  it("keeps years plain and trims long decimals", () => {
    expect(formatNumber(1889, "en")).toBe("1889");
    expect(formatNumber(3.14159, "en")).toBe("3.142");
    expect(formatNumber(42.195, "en")).toBe("42.195");
    expect(formatNumber(3.5, "it")).toBe("3,5");
  });
});
