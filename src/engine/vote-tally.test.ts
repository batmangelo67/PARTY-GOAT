import { describe, expect, it } from "vitest";
import { tallyVotes } from "./vote-tally";

describe("vote tally", () => {
  it("returns none when nobody voted", () => {
    expect(tallyVotes({})).toEqual({ kind: "none" });
    expect(tallyVotes({ a: 0, b: 0 })).toEqual({ kind: "none" });
  });

  it("returns the single top player", () => {
    expect(tallyVotes({ a: 1, b: 3, c: 2 })).toEqual({ kind: "winner", playerId: "b" });
  });

  it("returns every tied leader for a revote", () => {
    expect(tallyVotes({ a: 2, b: 2, c: 1 })).toEqual({ kind: "tie", playerIds: ["a", "b"] });
  });

  it("resolves a revote among tied players", () => {
    const first = tallyVotes({ a: 2, b: 2, c: 1 });
    expect(first.kind).toBe("tie");
    expect(tallyVotes({ a: 1, b: 3 })).toEqual({ kind: "winner", playerId: "b" });
  });
});
