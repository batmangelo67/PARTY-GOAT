import { describe, expect, it } from "vitest";
import { toggleRating, worstCards } from "./logic";

const cards = ["a", "b", "c", "d"].map((id) => ({ id, text: `card ${id}` }));

describe("10/10 but: ratings", () => {
  it("sets a rating, clamps it, and clears it when picked again", () => {
    let ratings = toggleRating({}, 0, 7);
    expect(ratings).toEqual({ 0: 7 });
    expect(toggleRating(ratings, 1, 99)).toEqual({ 0: 7, 1: 10 });
    expect(toggleRating(ratings, 0, 7)).toEqual({});
    ratings = toggleRating(ratings, 0, 3);
    expect(ratings).toEqual({ 0: 3 });
  });

  it("lists only rated cards, worst first, ties in play order", () => {
    const ranked = worstCards(cards, { 0: 4, 1: 9, 3: 9 }, 5);
    expect(ranked.map((r) => [r.card.id, r.rating])).toEqual([["b", 9], ["d", 9], ["a", 4]]);
  });

  it("limits the list", () => {
    expect(worstCards(cards, { 0: 1, 1: 2, 2: 3, 3: 4 }, 2).map((r) => r.card.id)).toEqual(["d", "c"]);
  });
});
