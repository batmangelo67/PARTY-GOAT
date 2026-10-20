import type { GameDefinition } from "../types";
import { BOMB_ID, BOMB_KINDS } from "./constants";
import { BombPlayScreen } from "./play-screen";
import { BombSetupScreen } from "./setup-screen";

export const bombGame: GameDefinition = {
  id: BOMB_ID,
  nameKey: "bomb.name",
  descriptionKey: "bomb.description",
  icon: "💣",
  acceptsKinds: BOMB_KINDS,
  SetupScreen: BombSetupScreen,
  PlayScreen: BombPlayScreen,
};
