import { create } from "zustand";
import { z } from "zod";
import { KV_PLAYERS, readValue, writeValue } from "../storage/kv";
import { runStorageTask } from "../storage/status-store";
import { checkPlayerName, cleanPlayerName, playerSchema, type Player } from "./players";
import { randomId } from "./random";

interface PlayersState {
  players: Player[];
  addPlayer: (name: string) => void;
  renamePlayer: (id: string, name: string) => void;
  removePlayer: (id: string) => void;
}

function persist(players: Player[]): void {
  void runStorageTask("Saving players", () => writeValue(KV_PLAYERS, players));
}

export const usePlayersStore = create<PlayersState>((set, get) => ({
  players: [],
  addPlayer: (name) => {
    if (checkPlayerName(get().players, name)) return;
    const players = [...get().players, { id: randomId(), name: cleanPlayerName(name) }];
    set({ players });
    persist(players);
  },
  renamePlayer: (id, name) => {
    if (checkPlayerName(get().players, name, id)) return;
    const players = get().players.map((p) => (p.id === id ? { ...p, name: cleanPlayerName(name) } : p));
    set({ players });
    persist(players);
  },
  removePlayer: (id) => {
    const players = get().players.filter((p) => p.id !== id);
    set({ players });
    persist(players);
  },
}));

export async function hydratePlayers(): Promise<void> {
  const stored = await runStorageTask("Loading players", () => readValue(KV_PLAYERS));
  const parsed = z.array(playerSchema).safeParse(stored);
  if (parsed.success) usePlayersStore.setState({ players: parsed.data });
}
