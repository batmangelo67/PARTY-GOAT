import { describe, expect, it } from "vitest";
import { addTurnScore, planTurn, splitTeams, totalTurns, turnScore, winningTeam } from "./logic";

const ids = ["a", "b", "c", "d", "e"];

describe("forbidden words: teams", () => {
  it("splits everyone into two teams, the first taking the extra player", () => {
    const [first, second] = splitTeams(ids);
    expect(first).toHaveLength(3);
    expect(second).toHaveLength(2);
    expect([...first, ...second].sort()).toEqual(ids);
  });
});

describe("forbidden words: turns", () => {
  const teams = [["a", "b", "c"], ["d", "e"]] as const;

  it("alternates teams and rotates the describer inside each team", () => {
    const plan = Array.from({ length: 6 }, (_, turn) => planTurn(teams, turn));
    expect(plan.map((p) => p.team)).toEqual([0, 1, 0, 1, 0, 1]);
    expect(plan.map((p) => p.describerId)).toEqual(["a", "d", "b", "e", "c", "d"]);
  });

  it("gives each team the chosen number of turns", () => {
    expect(totalTurns(3)).toBe(6);
  });
});

describe("forbidden words: scoring", () => {
  it("adds correct guesses and subtracts banned words, even below zero", () => {
    expect(turnScore(5, 2)).toBe(3);
    expect(turnScore(1, 3)).toBe(-2);
  });

  it("adds points to the right team and picks the winner", () => {
    let scores = addTurnScore([0, 0], 0, 4);
    scores = addTurnScore(scores, 1, 6);
    expect(scores).toEqual([4, 6]);
    expect(winningTeam(scores)).toBe(1);
    expect(winningTeam([3, 3])).toBeNull();
  });
});
