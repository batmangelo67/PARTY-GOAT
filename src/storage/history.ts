import type { UsedByPack } from "../engine/history";
import { getDb, STORE_HISTORY } from "./db";

export async function readHistory(packIds: string[]): Promise<UsedByPack> {
  const db = await getDb();
  const entries = await Promise.all(packIds.map(async (id) => [id, (await db.get(STORE_HISTORY, id)) ?? []] as const));
  return Object.fromEntries(entries);
}

export async function writeHistory(usedByPack: UsedByPack): Promise<void> {
  const tx = (await getDb()).transaction(STORE_HISTORY, "readwrite");
  await Promise.all([...Object.entries(usedByPack).map(([id, used]) => tx.store.put(used, id)), tx.done]);
}

export async function clearHistory(): Promise<void> {
  await (await getDb()).clear(STORE_HISTORY);
}
