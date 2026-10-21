import { lazy } from "react";
import { packAccess } from "../../engine/game-config";
import type { GameDefinition } from "../types";
import { useTenConfig } from "./config-store";
import { TEN_ID, TEN_KINDS } from "./constants";
import { TEN_ACCENT, TenOutOfTenGlyph } from "./icon";

export const tenOutOfTenGame: GameDefinition = {
  id: TEN_ID,
  nameKey: "ten.name",
  descriptionKey: "ten.description",
  accent: TEN_ACCENT,
  Glyph: TenOutOfTenGlyph,
  acceptsKinds: TEN_KINDS,
  packs: packAccess(useTenConfig),
  SetupScreen: lazy(() => import("./setup-screen").then((module) => ({ default: module.TenSetupScreen }))),
  PlayScreen: lazy(() => import("./play-screen").then((module) => ({ default: module.TenPlayScreen }))),
};
