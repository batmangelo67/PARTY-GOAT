import { describe, expect, it } from "vitest";
import { assignHiddenRoles, clampHiddenRoleCount, HIDDEN_ROLE_POINTS, maxHiddenRoles, scoreHiddenRoleRound } from "./roles";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`);

describe("hidden role assignment", () => {
  it("allows floor((players - 1) / 2) hidden roles", () => {
    expect(maxHiddenRoles(3)).toBe(1);
    expect(maxHiddenRoles(5)).toBe(2);
    expect(maxHiddenRoles(6)).toBe(2);
    expect(maxHiddenRoles(12)).toBe(5);
  });

  it("clamps requested counts into the allowed range", () => {
    expect(clampHiddenRoleCount(4, 5)).toBe(2);
    expect(clampHiddenRoleCount(0, 8)).toBe(1);
  });

  it("assigns exactly the requested number of distinct players", () => {
    const players = ids(9);
    const hidden = assignHiddenRoles(players, 4);
    expect(hidden.size).toBe(4);
    for (const id of hidden) expect(players).toContain(id);
  });

  it("rejects too many hidden roles or too few players", () => {
    expect(() => assignHiddenRoles(ids(6), 3)).toThrow(RangeError);
    expect(() => assignHiddenRoles(ids(5), 0)).toThrow(RangeError);
    expect(() => assignHiddenRoles(ids(2), 1)).toThrow(RangeError);
  });

  it("picks every player roughly equally often", () => {
    const players = ids(4);
    const rounds = 8000;
    const counts = Object.fromEntries(players.map((id) => [id, 0]));
    for (let i = 0; i < rounds; i++) for (const id of assignHiddenRoles(players, 1)) counts[id]! += 1;
    const expected = rounds / players.length;
    for (const id of players) expect(Math.abs(counts[id]! - expected)).toBeLessThan(expected * 0.1);
  });
});

describe("hidden role scoring", () => {
  const playerIds = ids(5);
  const hiddenIds = new Set(["p0", "p1"]);

  it("gives the crew a point when a hidden player is caught", () => {
    const points = scoreHiddenRoleRound({ playerIds, hiddenIds, accusedId: "p0" });
    expect(points).toEqual({ p0: 0, p1: HIDDEN_ROLE_POINTS.hiddenSurvives, p2: 1, p3: 1, p4: 1 });
  });

  it("rewards a caught player who guessed the secret", () => {
    const points = scoreHiddenRoleRound({ playerIds, hiddenIds, accusedId: "p0", accusedGuessedSecret: true });
    expect(points.p0).toBe(HIDDEN_ROLE_POINTS.caughtButGuessed);
  });

  it("rewards every hidden player when the crew votes out an innocent", () => {
    const points = scoreHiddenRoleRound({ playerIds, hiddenIds, accusedId: "p3" });
    expect(points).toEqual({ p0: 2, p1: 2, p2: 0, p3: 0, p4: 0 });
  });
});
