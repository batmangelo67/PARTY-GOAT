import type { PackFile } from "../content/schema";
import { getDb, STORE_CUSTOM_PACKS, STORE_HISTORY } from "./db";

export async function readCustomPacks(): Promise<unknown[]> {
  return (await getDb()).getAll(STORE_CUSTOM_PACKS);
}

// All packs are written in one transaction: either every pack is saved or none is.
export async function saveCustomPacks(packs: readonly PackFile[]): Promise<void> {
  const tx = (await getDb()).transaction(STORE_CUSTOM_PACKS, "readwrite");
  await Promise.all([...packs.map((pack) => tx.store.put({ ...pack, source: "custom" }, pack.id)), tx.done]);
}

export async function deleteCustomPack(packId: string): Promise<void> {
  const tx = (await getDb()).transaction([STORE_CUSTOM_PACKS, STORE_HISTORY], "readwrite");
  await Promise.all([tx.objectStore(STORE_CUSTOM_PACKS).delete(packId), tx.objectStore(STORE_HISTORY).delete(packId), tx.done]);
}
