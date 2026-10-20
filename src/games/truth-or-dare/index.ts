import type { GameDefinition } from "../types";
import { TOD_ID, TOD_KINDS } from "./constants";
import { TodPlayScreen } from "./play-screen";
import { TodSetupScreen } from "./setup-screen";

export const truthOrDareGame: GameDefinition = {
  id: TOD_ID,
  nameKey: "tod.name",
  descriptionKey: "tod.description",
  icon: "🎲",
  acceptsKinds: TOD_KINDS,
  SetupScreen: TodSetupScreen,
  PlayScreen: TodPlayScreen,
};
