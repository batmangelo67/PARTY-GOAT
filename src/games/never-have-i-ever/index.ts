import type { GameDefinition } from "../types";
import { NHIE_ID, NHIE_KINDS } from "./constants";
import { NhiePlayScreen } from "./play-screen";
import { NhieSetupScreen } from "./setup-screen";

export const neverHaveIEverGame: GameDefinition = {
  id: NHIE_ID,
  nameKey: "nhie.name",
  descriptionKey: "nhie.description",
  icon: "🙊",
  acceptsKinds: NHIE_KINDS,
  SetupScreen: NhieSetupScreen,
  PlayScreen: NhiePlayScreen,
};
