import type { Language } from "../i18n/languages";
import { filterPickerPacks } from "./pack-filter";
import type { Pack, PackKind } from "./schema";

export interface PackScope {
  gameId: string;
  kinds: readonly PackKind[];
  language: Language;
  maxSpice: number;
}

// The packs a game would mix by default: its own language first, any language if there are none.
export function defaultPacks(packs: readonly Pack[], scope: PackScope): Pack[] {
  const local = filterPickerPacks(packs, { ...scope, allLanguages: false });
  return local.length > 0 ? local : filterPickerPacks(packs, { ...scope, allLanguages: true });
}

// null means "the default mix"; a list keeps the group's own choice (any language), minus packs
// that were deleted or are now above the spice limit.
export function resolvePacks(packs: readonly Pack[], scope: PackScope, packIds: readonly string[] | null): Pack[] {
  if (packIds === null) return defaultPacks(packs, scope);
  const chosen = new Set(packIds);
  return filterPickerPacks(packs, { ...scope, allLanguages: true }).filter((pack) => chosen.has(pack.id));
}

export function isDefaultMix(packIds: readonly string[] | null): boolean {
  return packIds === null;
}
