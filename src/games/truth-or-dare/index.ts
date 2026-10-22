import { lazy } from "react";
import { packAccess } from "../../engine/game-config";
import type { GameDefinition } from "../types";
import { useTodConfig } from "./config-store";
import { TOD_ID, TOD_KINDS } from "./constants";
import { TOD_ACCENT, TruthOrDareGlyph } from "./icon";

export const truthOrDareGame: GameDefinition = {
  id: TOD_ID,
  nameKey: "tod.name",
  descriptionKey: "tod.description",
  accent: TOD_ACCENT,
  Glyph: TruthOrDareGlyph,
  acceptsKinds: TOD_KINDS,
  packs: packAccess(useTodConfig),
  SetupScreen: lazy(() => import("./setup-screen").then((module) => ({ default: module.TodSetupScreen }))),
  PlayScreen: lazy(() => import("./play-screen").then((module) => ({ default: module.TodPlayScreen }))),
};
