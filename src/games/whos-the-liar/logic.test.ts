import { describe, expect, it } from "vitest";
import { MAX_ANSWER_LENGTH } from "../../app/constants";
import { buildLiarRound, cleanAnswer, questionFor } from "./logic";

describe("who's the liar round", () => {
  const item = { question: "Best age to get married?", liarQuestion: "Best age to have kids?" };
  const playerIds = ["a", "b", "c", "d"];

  it("gives liars the liar question and everyone else the main one", () => {
    const round = buildLiarRound(item, playerIds, 1);
    for (const id of playerIds) {
      expect(questionFor(round, id)).toBe(round.liarIds.has(id) ? item.liarQuestion : item.question);
    }
    expect(round.liarIds.size).toBe(1);
  });

  it("cleans and caps answers", () => {
    expect(cleanAnswer("  twenty   five ")).toBe("twenty five");
    expect(cleanAnswer("x".repeat(200))).toHaveLength(MAX_ANSWER_LENGTH);
  });
});
