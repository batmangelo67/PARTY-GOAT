import { describe, expect, it } from "vitest";
import { MAX_PLAYERS } from "../app/constants";
import { checkPlayerName, cleanPlayerName } from "./players";

const players = [
  { id: "1", name: "Giulia" },
  { id: "2", name: "Marco" },
];

describe("player names", () => {
  it("cleans whitespace", () => {
    expect(cleanPlayerName("  Anna   Maria ")).toBe("Anna Maria");
  });

  it("flags empty and duplicate names, ignoring case", () => {
    expect(checkPlayerName(players, "   ")).toBe("empty");
    expect(checkPlayerName(players, "marco")).toBe("duplicate");
    expect(checkPlayerName(players, "Sara")).toBeNull();
  });

  it("lets a player keep their own name when renaming", () => {
    expect(checkPlayerName(players, "Marco", "2")).toBeNull();
  });

  it("refuses new players past the maximum", () => {
    const full = Array.from({ length: MAX_PLAYERS }, (_, i) => ({ id: `${i}`, name: `P${i}` }));
    expect(checkPlayerName(full, "Extra")).toBe("full");
  });
});
