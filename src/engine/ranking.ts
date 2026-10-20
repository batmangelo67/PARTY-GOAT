export interface RankedPlayer<T> {
  player: T;
  score: number;
  rank: number;
}

// Highest score ranks first; equal scores share a rank.
export function rankByScore<T extends { id: string }>(players: readonly T[], scores: Readonly<Record<string, number>>): RankedPlayer<T>[] {
  const sorted = [...players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  return sorted.map((player, i) => {
    const score = scores[player.id] ?? 0;
    const firstWithScore = sorted.findIndex((p) => (scores[p.id] ?? 0) === score);
    return { player, score, rank: (firstWithScore === -1 ? i : firstWithScore) + 1 };
  });
}
