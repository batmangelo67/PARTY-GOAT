export const MAX_RECENT_GAMES = 6;
export const MAX_RECENT_PACKS = 12;

export interface PlayLog {
  // Most recent first, one entry per game.
  games: string[];
  // Per game, the packs used in recent rounds, most recent first.
  packs: Record<string, string[]>;
}

export const EMPTY_PLAY_LOG: PlayLog = { games: [], packs: {} };

function moveToFront(list: readonly string[], items: readonly string[], max: number): string[] {
  const front = [...new Set(items)];
  return [...front, ...list.filter((item) => !front.includes(item))].slice(0, max);
}

// Records a started game: it becomes the "play again" game, its packs become its recents.
export function recordPlay(log: PlayLog, gameId: string, packIds: readonly string[]): PlayLog {
  return {
    games: moveToFront(log.games, [gameId], MAX_RECENT_GAMES),
    packs: { ...log.packs, [gameId]: moveToFront(log.packs[gameId] ?? [], packIds, MAX_RECENT_PACKS) },
  };
}

export function toggleFavorite(favorites: readonly string[], packId: string): string[] {
  return favorites.includes(packId) ? favorites.filter((id) => id !== packId) : [...favorites, packId];
}
