import { lazy } from "react";
import { packAccess } from "../../engine/game-config";
import type { GameDefinition } from "../types";
import { useForbiddenConfig } from "./config-store";
import { FORBIDDEN_ID, FORBIDDEN_KINDS } from "./constants";
import { FORBIDDEN_ACCENT, ForbiddenWordsGlyph } from "./icon";

export const forbiddenWordsGame: GameDefinition = {
  id: FORBIDDEN_ID,
  nameKey: "forbidden.name",
  descriptionKey: "forbidden.description",
  accent: FORBIDDEN_ACCENT,
  Glyph: ForbiddenWordsGlyph,
  acceptsKinds: FORBIDDEN_KINDS,
  packs: packAccess(useForbiddenConfig),
  SetupScreen: lazy(() => import("./setup-screen").then((module) => ({ default: module.ForbiddenSetupScreen }))),
  PlayScreen: lazy(() => import("./play-screen").then((module) => ({ default: module.ForbiddenPlayScreen }))),
};
