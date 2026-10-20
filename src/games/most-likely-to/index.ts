import type { GameDefinition } from "../types";
import { MLT_ID, MLT_KINDS } from "./constants";
import { MltPlayScreen } from "./play-screen";
import { MltSetupScreen } from "./setup-screen";

export const mostLikelyToGame: GameDefinition = {
  id: MLT_ID,
  nameKey: "mlt.name",
  descriptionKey: "mlt.description",
  icon: "👉",
  acceptsKinds: MLT_KINDS,
  SetupScreen: MltSetupScreen,
  PlayScreen: MltPlayScreen,
};
