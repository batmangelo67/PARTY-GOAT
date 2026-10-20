import { getDb, STORE_KV } from "./db";

export const KV_SETTINGS = "settings";
export const KV_PLAYERS = "players";

export async function readValue(key: string): Promise<unknown> {
  return (await getDb()).get(STORE_KV, key);
}

export async function writeValue(key: string, value: unknown): Promise<void> {
  await (await getDb()).put(STORE_KV, value, key);
}
