import type { GameDefinition } from "../types";
import { LIAR_ID, LIAR_KINDS } from "./constants";
import { LiarPlayScreen } from "./play-screen";
import { LiarSetupScreen } from "./setup-screen";

export const whosTheLiarGame: GameDefinition = {
  id: LIAR_ID,
  nameKey: "liar.name",
  descriptionKey: "liar.description",
  icon: "🤥",
  acceptsKinds: LIAR_KINDS,
  SetupScreen: LiarSetupScreen,
  PlayScreen: LiarPlayScreen,
};
