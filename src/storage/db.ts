import { openDB, type DBSchema, type IDBPDatabase } from "idb";

const DB_NAME = "party-goat";
const DB_VERSION = 1;

export const STORE_KV = "kv";
export const STORE_CUSTOM_PACKS = "customPacks";
export const STORE_HISTORY = "history";

// Values are validated by the caller after reading: the database is a trust boundary.
export interface PartyGoatDb extends DBSchema {
  kv: { key: string; value: unknown };
  customPacks: { key: string; value: unknown };
  history: { key: string; value: string[] };
}

let dbPromise: Promise<IDBPDatabase<PartyGoatDb>> | undefined;

export function getDb(): Promise<IDBPDatabase<PartyGoatDb>> {
  dbPromise ??= openDB<PartyGoatDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_KV);
      db.createObjectStore(STORE_CUSTOM_PACKS);
      db.createObjectStore(STORE_HISTORY);
    },
  }).catch((error: unknown) => {
    dbPromise = undefined;
    throw error;
  });
  return dbPromise;
}
