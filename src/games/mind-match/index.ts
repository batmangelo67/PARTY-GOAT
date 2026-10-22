import { lazy } from "react";
import { packAccess } from "../../engine/game-config";
import type { GameDefinition } from "../types";
import { useMindConfig } from "./config-store";
import { MIND_ID, MIND_KINDS } from "./constants";
import { MIND_ACCENT, MindMatchGlyph } from "./icon";

export const mindMatchGame: GameDefinition = {
  id: MIND_ID,
  nameKey: "mind.name",
  descriptionKey: "mind.description",
  accent: MIND_ACCENT,
  Glyph: MindMatchGlyph,
  acceptsKinds: MIND_KINDS,
  packs: packAccess(useMindConfig),
  SetupScreen: lazy(() => import("./setup-screen").then((module) => ({ default: module.MindSetupScreen }))),
  PlayScreen: lazy(() => import("./play-screen").then((module) => ({ default: module.MindPlayScreen }))),
};
