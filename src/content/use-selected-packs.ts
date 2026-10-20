import { useMemo } from "react";
import { useContentStore } from "./content-store";
import { packsOfKind } from "./items";
import type { PackKind, PackOf } from "./schema";

export function useSelectedPacks<K extends PackKind>(kind: K, packIds: readonly string[] | null): PackOf<K>[] {
  const packs = useContentStore((state) => state.packs);
  return useMemo(() => {
    const ids = new Set(packIds ?? []);
    return packsOfKind(packs, kind).filter((pack) => ids.has(pack.id));
  }, [packs, kind, packIds]);
}
