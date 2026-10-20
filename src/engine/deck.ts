export interface Deck<T> {
  cards: T[];
  index: number;
}

export function deckBack<T>(deck: Deck<T>): Deck<T> {
  return { ...deck, index: Math.max(0, deck.index - 1) };
}

export function needsNewCard<T>(deck: Deck<T>): boolean {
  return deck.index >= deck.cards.length - 1;
}

// Moves forward through cards already seen, or appends a freshly drawn card at the end.
export function deckForward<T>(deck: Deck<T>, drawn?: T): Deck<T> {
  if (!needsNewCard(deck)) return { ...deck, index: deck.index + 1 };
  if (drawn === undefined) return deck;
  return { cards: [...deck.cards, drawn], index: deck.cards.length };
}
