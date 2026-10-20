import type { ComponentType } from "react";
import type { PackKind } from "../content/schema";
import type { MessageKey } from "../i18n/en";

export interface GameDefinition {
  id: string;
  nameKey: MessageKey;
  descriptionKey: MessageKey;
  icon: string;
  acceptsKinds: readonly PackKind[];
  SetupScreen: ComponentType;
  PlayScreen: ComponentType;
}
