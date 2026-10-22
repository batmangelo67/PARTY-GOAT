import { lazy } from "react";
import { packAccess } from "../../engine/game-config";
import type { GameDefinition } from "../types";
import { useCircaConfig } from "./config-store";
import { CIRCA_ID, CIRCA_KINDS } from "./constants";
import { CIRCA_ACCENT, CircaGlyph } from "./icon";

export const circaGame: GameDefinition = {
  id: CIRCA_ID,
  nameKey: "circa.name",
  descriptionKey: "circa.description",
  accent: CIRCA_ACCENT,
  Glyph: CircaGlyph,
  acceptsKinds: CIRCA_KINDS,
  packs: packAccess(useCircaConfig),
  SetupScreen: lazy(() => import("./setup-screen").then((module) => ({ default: module.CircaSetupScreen }))),
  PlayScreen: lazy(() => import("./play-screen").then((module) => ({ default: module.CircaPlayScreen }))),
};
