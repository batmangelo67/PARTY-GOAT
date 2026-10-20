export const NHIE_MODES = ["classic", "fingers"] as const;
export type NhieMode = (typeof NHIE_MODES)[number];

export const MIN_FINGERS = 3;
export const MAX_FINGERS = 10;
export const DEFAULT_FINGERS = 5;

// Players tapped on each card, by card index. Fingers are derived from this so Back/Next stay consistent.
export type CardTaps = readonly (readonly string[])[];

export function fingersLeft(start: number, playerIds: readonly string[], taps: CardTaps): Record<string, number> {
  const left = Object.fromEntries(playerIds.map((id) => [id, start]));
  for (const card of taps) for (const id of card) if (id in left) left[id] = Math.max(0, left[id]! - 1);
  return left;
}

export function isTapped(taps: CardTaps, cardIndex: number, playerId: string): boolean {
  return taps[cardIndex]?.includes(playerId) ?? false;
}

export function canTap(fingers: Readonly<Record<string, number>>, taps: CardTaps, cardIndex: number, playerId: string): boolean {
  return isTapped(taps, cardIndex, playerId) || (fingers[playerId] ?? 0) > 0;
}

export function toggleTap(taps: CardTaps, cardIndex: number, playerId: string): string[][] {
  const next = Array.from({ length: Math.max(taps.length, cardIndex + 1) }, (_, i) => [...(taps[i] ?? [])]);
  const card = next[cardIndex]!;
  next[cardIndex] = card.includes(playerId) ? card.filter((id) => id !== playerId) : [...card, playerId];
  return next;
}

export function activePlayerIds(fingers: Readonly<Record<string, number>>): string[] {
  return Object.keys(fingers).filter((id) => fingers[id]! > 0);
}

export function isGameOver(fingers: Readonly<Record<string, number>>): boolean {
  return activePlayerIds(fingers).length <= 1;
}

export interface RankedPlayer<T> {
  player: T;
  fingers: number;
  rank: number;
}

// Most fingers left ranks first; equal fingers share a rank.
export function rankByFingers<T extends { id: string }>(players: readonly T[], fingers: Readonly<Record<string, number>>): RankedPlayer<T>[] {
  const sorted = [...players].sort((a, b) => (fingers[b.id] ?? 0) - (fingers[a.id] ?? 0));
  return sorted.map((player, i) => {
    const count = fingers[player.id] ?? 0;
    const firstWithCount = sorted.findIndex((p) => (fingers[p.id] ?? 0) === count);
    return { player, fingers: count, rank: (firstWithCount === -1 ? i : firstWithCount) + 1 };
  });
}

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
