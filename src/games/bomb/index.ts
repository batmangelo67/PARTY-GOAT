import { lazy } from "react";
import { packAccess } from "../../engine/game-config";
import type { GameDefinition } from "../types";
import { useBombConfig } from "./config-store";
import { BOMB_ID, BOMB_KINDS } from "./constants";
import { BOMB_ACCENT, BombGlyph } from "./icon";

export const bombGame: GameDefinition = {
  id: BOMB_ID,
  nameKey: "bomb.name",
  descriptionKey: "bomb.description",
  accent: BOMB_ACCENT,
  Glyph: BombGlyph,
  acceptsKinds: BOMB_KINDS,
  packs: packAccess(useBombConfig),
  SetupScreen: lazy(() => import("./setup-screen").then((module) => ({ default: module.BombSetupScreen }))),
  PlayScreen: lazy(() => import("./play-screen").then((module) => ({ default: module.BombPlayScreen }))),
};
