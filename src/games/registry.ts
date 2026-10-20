import type { PackKind } from "../content/schema";
import { bombGame } from "./bomb";
import { circaGame } from "./circa";
import { forbiddenWordsGame } from "./forbidden-words";
import { impostorGame } from "./impostor";
import { mindMatchGame } from "./mind-match";
import { mostLikelyToGame } from "./most-likely-to";
import { neverHaveIEverGame } from "./never-have-i-ever";
import { tenOutOfTenGame } from "./ten-out-of-ten";
import { truthOrDareGame } from "./truth-or-dare";
import type { GameDefinition } from "./types";
import { whosTheLiarGame } from "./whos-the-liar";

export const GAMES: readonly GameDefinition[] = [
  impostorGame,
  whosTheLiarGame,
  bombGame,
  neverHaveIEverGame,
  truthOrDareGame,
  mostLikelyToGame,
  tenOutOfTenGame,
  forbiddenWordsGame,
  mindMatchGame,
  circaGame,
];

export function findGame(id: string | undefined): GameDefinition | undefined {
  return GAMES.find((game) => game.id === id);
}

export function gamesForKind(kind: PackKind): GameDefinition[] {
  return GAMES.filter((game) => game.acceptsKinds.includes(kind));
}
