import type { ComponentType } from "react";
import type { PackKind } from "../content/schema";
import type { PackAccess } from "../engine/game-config";
import type { MessageKey } from "../i18n/en";

export interface GameDefinition {
  id: string;
  nameKey: MessageKey;
  descriptionKey: MessageKey;
  // Accent colour and 48x48 glyph used for the game's badge, tile and in-game tint.
  accent: string;
  Glyph: ComponentType;
  acceptsKinds: readonly PackKind[];
  packs: PackAccess;
  SetupScreen: ComponentType;
  PlayScreen: ComponentType;
}
