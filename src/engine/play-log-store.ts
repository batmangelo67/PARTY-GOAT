import { create } from "zustand";
import { z } from "zod";
import { readValue, writeValue } from "../storage/kv";
import { runStorageTask } from "../storage/status-store";
import { EMPTY_PLAY_LOG, recordPlay, toggleFavorite, type PlayLog } from "./play-log";

const KV_PLAY_LOG = "play-log";
const KV_FAVORITES = "favorite-packs";

const playLogSchema = z.object({ games: z.array(z.string()), packs: z.record(z.string(), z.array(z.string())) });
const favoritesSchema = z.array(z.string());

interface PlayLogState {
  log: PlayLog;
  favorites: string[];
  logPlay: (gameId: string, packIds: readonly string[]) => void;
  toggleFavorite: (packId: string) => void;
}

// Which games were played last and with which packs, plus starred packs. Drives the home
// "play again" card and the picker's Recent and Starred shortcuts.
export const usePlayLogStore = create<PlayLogState>((set, get) => ({
  log: EMPTY_PLAY_LOG,
  favorites: [],
  logPlay: (gameId, packIds) => {
    const log = recordPlay(get().log, gameId, packIds);
    set({ log });
    void runStorageTask("Saving recent games", () => writeValue(KV_PLAY_LOG, log));
  },
  toggleFavorite: (packId) => {
    const favorites = toggleFavorite(get().favorites, packId);
    set({ favorites });
    void runStorageTask("Saving starred packs", () => writeValue(KV_FAVORITES, favorites));
  },
}));

export async function hydratePlayLog(): Promise<void> {
  const [log, favorites] = await Promise.all([
    runStorageTask("Loading recent games", () => readValue(KV_PLAY_LOG)),
    runStorageTask("Loading starred packs", () => readValue(KV_FAVORITES)),
  ]);
  const parsedLog = playLogSchema.safeParse(log);
  const parsedFavorites = favoritesSchema.safeParse(favorites);
  usePlayLogStore.setState({
    ...(parsedLog.success ? { log: parsedLog.data } : {}),
    ...(parsedFavorites.success ? { favorites: parsedFavorites.data } : {}),
  });
}
