import type { GameDefinition } from "../types";
import { CIRCA_ID, CIRCA_KINDS } from "./constants";
import { CircaPlayScreen } from "./play-screen";
import { CircaSetupScreen } from "./setup-screen";

export const circaGame: GameDefinition = {
  id: CIRCA_ID,
  nameKey: "circa.name",
  descriptionKey: "circa.description",
  icon: "🎯",
  acceptsKinds: CIRCA_KINDS,
  SetupScreen: CircaSetupScreen,
  PlayScreen: CircaPlayScreen,
};
