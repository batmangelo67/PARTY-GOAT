// Player ids marked on each card, by card index. Per-card state keeps Back/Next consistent.
export type CardMarks = readonly (readonly string[])[];

export function isMarked(marks: CardMarks, cardIndex: number, playerId: string): boolean {
  return marks[cardIndex]?.includes(playerId) ?? false;
}

export function toggleMark(marks: CardMarks, cardIndex: number, playerId: string): string[][] {
  const next = Array.from({ length: Math.max(marks.length, cardIndex + 1) }, (_, i) => [...(marks[i] ?? [])]);
  const card = next[cardIndex]!;
  next[cardIndex] = card.includes(playerId) ? card.filter((id) => id !== playerId) : [...card, playerId];
  return next;
}

// How many cards each player is marked on.
export function countMarks(marks: CardMarks, playerIds: readonly string[]): Record<string, number> {
  const counts = Object.fromEntries(playerIds.map((id) => [id, 0]));
  for (const card of marks) for (const id of card) if (id in counts) counts[id]!++;
  return counts;
}
