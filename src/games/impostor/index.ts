import { lazy } from "react";
import { packAccess } from "../../engine/game-config";
import type { GameDefinition } from "../types";
import { useImpostorConfig } from "./config-store";
import { IMPOSTOR_ID, IMPOSTOR_KINDS } from "./constants";
import { IMPOSTOR_ACCENT, ImpostorGlyph } from "./icon";

export const impostorGame: GameDefinition = {
  id: IMPOSTOR_ID,
  nameKey: "impostor.name",
  descriptionKey: "impostor.description",
  accent: IMPOSTOR_ACCENT,
  Glyph: ImpostorGlyph,
  acceptsKinds: IMPOSTOR_KINDS,
  packs: packAccess(useImpostorConfig),
  SetupScreen: lazy(() => import("./setup-screen").then((module) => ({ default: module.ImpostorSetupScreen }))),
  PlayScreen: lazy(() => import("./play-screen").then((module) => ({ default: module.ImpostorPlayScreen }))),
};
