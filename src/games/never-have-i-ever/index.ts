import { lazy } from "react";
import { packAccess } from "../../engine/game-config";
import type { GameDefinition } from "../types";
import { useNhieConfig } from "./config-store";
import { NHIE_ID, NHIE_KINDS } from "./constants";
import { NHIE_ACCENT, NeverHaveIEverGlyph } from "./icon";

export const neverHaveIEverGame: GameDefinition = {
  id: NHIE_ID,
  nameKey: "nhie.name",
  descriptionKey: "nhie.description",
  accent: NHIE_ACCENT,
  Glyph: NeverHaveIEverGlyph,
  acceptsKinds: NHIE_KINDS,
  packs: packAccess(useNhieConfig),
  SetupScreen: lazy(() => import("./setup-screen").then((module) => ({ default: module.NhieSetupScreen }))),
  PlayScreen: lazy(() => import("./play-screen").then((module) => ({ default: module.NhiePlayScreen }))),
};
