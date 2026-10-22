import { useMemo } from "react";
import { useSettingsStore } from "../app/settings-store";
import { useContentStore } from "./content-store";
import { packsOfKind } from "./items";
import { resolvePacks } from "./resolve-packs";
import type { PackKind, PackOf } from "./schema";

// The packs a game will draw from, resolving the default mix (null) against the current language and spice limit.
export function useSelectedPacks<K extends PackKind>(gameId: string, kind: K, packIds: readonly string[] | null): PackOf<K>[] {
  const packs = useContentStore((state) => state.packs);
  const language = useSettingsStore((state) => state.language);
  const maxSpice = useSettingsStore((state) => state.maxSpice);
  return useMemo(
    () => packsOfKind(resolvePacks(packs, { gameId, kinds: [kind], language, maxSpice }, packIds), kind),
    [packs, gameId, kind, language, maxSpice, packIds],
  );
}
