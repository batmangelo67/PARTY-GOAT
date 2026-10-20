import type { ItemOf, PackKind, PackOf, WithId } from "../content/schema";
import { readHistory, writeHistory } from "../storage/history";
import { runStorageTask } from "../storage/status-store";
import { pickUnused } from "./history";

export interface DrawnItem<K extends PackKind> {
  item: WithId<ItemOf<K>>;
  pack: PackOf<K>;
}

// Draws a fresh item across the given packs and records it in the no-repeat history.
export async function drawItem<K extends PackKind>(packs: PackOf<K>[]): Promise<DrawnItem<K>> {
  const pool = packs.flatMap((pack) => pack.items.map((item) => ({ ...item, packId: pack.id })));
  const used = (await runStorageTask("Loading history", () => readHistory(packs.map((p) => p.id)))) ?? {};
  const { item, usedByPack } = pickUnused(pool, used);
  void runStorageTask("Saving history", () => writeHistory(usedByPack));
  const { packId, ...rest } = item;
  const pack = packs.find((p) => p.id === packId)!;
  return { item: rest as unknown as WithId<ItemOf<K>>, pack };
}
