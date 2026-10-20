import type { GameDefinition } from "../types";
import { FORBIDDEN_ID, FORBIDDEN_KINDS } from "./constants";
import { ForbiddenPlayScreen } from "./play-screen";
import { ForbiddenSetupScreen } from "./setup-screen";

export const forbiddenWordsGame: GameDefinition = {
  id: FORBIDDEN_ID,
  nameKey: "forbidden.name",
  descriptionKey: "forbidden.description",
  icon: "🚫",
  acceptsKinds: FORBIDDEN_KINDS,
  SetupScreen: ForbiddenSetupScreen,
  PlayScreen: ForbiddenPlayScreen,
};
