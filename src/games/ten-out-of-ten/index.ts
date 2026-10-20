import type { GameDefinition } from "../types";
import { TEN_ID, TEN_KINDS } from "./constants";
import { TenPlayScreen } from "./play-screen";
import { TenSetupScreen } from "./setup-screen";

export const tenOutOfTenGame: GameDefinition = {
  id: TEN_ID,
  nameKey: "ten.name",
  descriptionKey: "ten.description",
  icon: "🔟",
  acceptsKinds: TEN_KINDS,
  SetupScreen: TenSetupScreen,
  PlayScreen: TenPlayScreen,
};
