import { lazy } from "react";
import { packAccess } from "../../engine/game-config";
import type { GameDefinition } from "../types";
import { useLiarConfig } from "./config-store";
import { LIAR_ID, LIAR_KINDS } from "./constants";
import { LIAR_ACCENT, WhosTheLiarGlyph } from "./icon";

export const whosTheLiarGame: GameDefinition = {
  id: LIAR_ID,
  nameKey: "liar.name",
  descriptionKey: "liar.description",
  accent: LIAR_ACCENT,
  Glyph: WhosTheLiarGlyph,
  acceptsKinds: LIAR_KINDS,
  packs: packAccess(useLiarConfig),
  SetupScreen: lazy(() => import("./setup-screen").then((module) => ({ default: module.LiarSetupScreen }))),
  PlayScreen: lazy(() => import("./play-screen").then((module) => ({ default: module.LiarPlayScreen }))),
};
