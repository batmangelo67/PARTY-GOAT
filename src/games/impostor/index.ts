import type { GameDefinition } from "../types";
import { IMPOSTOR_ID, IMPOSTOR_KINDS } from "./constants";
import { ImpostorPlayScreen } from "./play-screen";
import { ImpostorSetupScreen } from "./setup-screen";

export const impostorGame: GameDefinition = {
  id: IMPOSTOR_ID,
  nameKey: "impostor.name",
  descriptionKey: "impostor.description",
  icon: "🕵️",
  acceptsKinds: IMPOSTOR_KINDS,
  SetupScreen: ImpostorSetupScreen,
  PlayScreen: ImpostorPlayScreen,
};
