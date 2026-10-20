import type { PromptCard } from "../../engine/use-card-deck";

export const MIN_RATING = 1;
export const MAX_RATING = 10;
export const WORST_CARDS_SHOWN = 5;

// The group's rating of each card, by card index. Unrated cards have no entry.
export type Ratings = Readonly<Record<number, number>>;

// Picking the rating a card already has clears it.
export function toggleRating(ratings: Ratings, cardIndex: number, value: number): Ratings {
  const next = { ...ratings };
  if (next[cardIndex] === value) delete next[cardIndex];
  else next[cardIndex] = Math.min(MAX_RATING, Math.max(MIN_RATING, Math.round(value)));
  return next;
}

export interface RatedCard {
  card: PromptCard;
  rating: number;
}

// Highest-rated cards first; equal ratings keep the order they were played in.
export function worstCards(cards: readonly PromptCard[], ratings: Ratings, limit = WORST_CARDS_SHOWN): RatedCard[] {
  return cards
    .flatMap((card, index) => (ratings[index] === undefined ? [] : [{ card, rating: ratings[index]!, index }]))
    .sort((a, b) => b.rating - a.rating || a.index - b.index)
    .slice(0, limit)
    .map(({ card, rating }) => ({ card, rating }));
}
