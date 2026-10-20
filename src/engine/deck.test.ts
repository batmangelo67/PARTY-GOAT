import { describe, expect, it } from "vitest";
import { deckBack, deckForward, needsNewCard, type Deck } from "./deck";
import { pickUnused, type UsedByPack } from "./history";

describe("deck", () => {
  it("goes back and forward through seen cards without drawing", () => {
    let deck: Deck<string> = { cards: ["one", "two"], index: 1 };
    deck = deckBack(deck);
    expect(deck.index).toBe(0);
    expect(needsNewCard(deck)).toBe(false);
    deck = deckForward(deck);
    expect(deck).toEqual({ cards: ["one", "two"], index: 1 });
    expect(deckBack(deckBack(deck)).index).toBe(0);
  });

  it("never repeats a card until the pack is exhausted", () => {
    const pool = Array.from({ length: 12 }, (_, i) => ({ id: `p#${i}`, packId: "p" }));
    let used: UsedByPack = {};
    const draw = () => {
      const result = pickUnused(pool, used);
      used = result.usedByPack;
      return result.item.id;
    };
    let deck: Deck<string> = { cards: [draw()], index: 0 };
    for (let i = 1; i < pool.length; i++) deck = deckForward(deck, draw());
    expect(new Set(deck.cards).size).toBe(pool.length);
    deck = deckForward(deck, draw());
    expect(deck.cards).toHaveLength(pool.length + 1);
  });
});
