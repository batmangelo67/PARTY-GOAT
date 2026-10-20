import type { PackKind } from "../content/schema";
import { bombGame } from "./bomb";
import { impostorGame } from "./impostor";
import { neverHaveIEverGame } from "./never-have-i-ever";
import type { GameDefinition } from "./types";
import { whosTheLiarGame } from "./whos-the-liar";

export const GAMES: readonly GameDefinition[] = [impostorGame, whosTheLiarGame, bombGame, neverHaveIEverGame];

export function findGame(id: string | undefined): GameDefinition | undefined {
  return GAMES.find((game) => game.id === id);
}

export function gamesForKind(kind: PackKind): GameDefinition[] {
  return GAMES.filter((game) => game.acceptsKinds.includes(kind));
}
