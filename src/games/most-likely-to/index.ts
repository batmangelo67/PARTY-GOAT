import { lazy } from "react";
import { packAccess } from "../../engine/game-config";
import type { GameDefinition } from "../types";
import { useMltConfig } from "./config-store";
import { MLT_ID, MLT_KINDS } from "./constants";
import { MLT_ACCENT, MostLikelyToGlyph } from "./icon";

export const mostLikelyToGame: GameDefinition = {
  id: MLT_ID,
  nameKey: "mlt.name",
  descriptionKey: "mlt.description",
  accent: MLT_ACCENT,
  Glyph: MostLikelyToGlyph,
  acceptsKinds: MLT_KINDS,
  packs: packAccess(useMltConfig),
  SetupScreen: lazy(() => import("./setup-screen").then((module) => ({ default: module.MltSetupScreen }))),
  PlayScreen: lazy(() => import("./play-screen").then((module) => ({ default: module.MltPlayScreen }))),
};
