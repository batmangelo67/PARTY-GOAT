import type { GameDefinition } from "../types";
import { MIND_ID, MIND_KINDS } from "./constants";
import { MindPlayScreen } from "./play-screen";
import { MindSetupScreen } from "./setup-screen";

export const mindMatchGame: GameDefinition = {
  id: MIND_ID,
  nameKey: "mind.name",
  descriptionKey: "mind.description",
  icon: "🧠",
  acceptsKinds: MIND_KINDS,
  SetupScreen: MindSetupScreen,
  PlayScreen: MindPlayScreen,
};
