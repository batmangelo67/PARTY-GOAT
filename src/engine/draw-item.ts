import type { ItemOf, PackKind, PackOf, WithId } from "../content/schema";
import { readHistory, writeHistory } from "../storage/history";
import { runStorageTask } from "../storage/status-store";
import { pickUnused } from "./history";

export interface DrawnItem<K extends PackKind> {
  item: WithId<ItemOf<K>>;
  pack: PackOf<K>;
}

// Draws a fresh item across the given packs (optionally only matching items) and records it in the no-repeat history.
export async function drawItem<K extends PackKind>(
  packs: PackOf<K>[],
  matches: (item: WithId<ItemOf<K>>) => boolean = () => true,
): Promise<DrawnItem<K>> {
  const pool = packs.flatMap((pack) => (pack.items as WithId<ItemOf<K>>[]).map((item) => ({ item, id: item.id, packId: pack.id })));
  const used = (await runStorageTask("Loading history", () => readHistory(packs.map((p) => p.id)))) ?? {};
  const { item: picked, usedByPack } = pickUnused(pool, used, (entry) => matches(entry.item));
  void runStorageTask("Saving history", () => writeHistory(usedByPack));
  const pack = packs.find((p) => p.id === picked.packId)!;
  return { item: picked.item, pack };
}
