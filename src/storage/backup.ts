import { z } from "zod";
import { BACKUP_FORMAT_VERSION, DEFAULT_MAX_SPICE, DEFAULT_THEME, MAX_SPICE } from "../app/constants";
import { THEME_NAMES } from "../app/themes";
import { packFileSchema } from "../content/schema";
import { playerSchema } from "../engine/players";
import { LANGUAGES } from "../i18n/languages";
import { getDb, STORE_CUSTOM_PACKS, STORE_HISTORY, STORE_KV } from "./db";
import { KV_PLAYERS, KV_SETTINGS } from "./kv";

const BACKUP_APP_ID = "party-goat";

// Fields added after the first release have defaults so older backups and saved settings still load.
export const settingsSchema = z.object({
  language: z.enum(LANGUAGES),
  sound: z.boolean().default(true),
  animations: z.boolean().default(true),
  theme: z.enum(THEME_NAMES).default(DEFAULT_THEME),
  maxSpice: z.number().int().min(0).max(MAX_SPICE).default(DEFAULT_MAX_SPICE),
});
export type StoredSettings = z.infer<typeof settingsSchema>;

export const backupSchema = z.object({
  app: z.literal(BACKUP_APP_ID),
  version: z.literal(BACKUP_FORMAT_VERSION),
  exportedAt: z.string(),
  settings: settingsSchema.optional(),
  players: z.array(playerSchema),
  customPacks: z.array(packFileSchema),
  history: z.record(z.string(), z.array(z.string())),
});
export type Backup = z.infer<typeof backupSchema>;

export function parseBackup(json: unknown): Backup {
  const result = backupSchema.safeParse(json);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.join(".") || "file";
    throw new Error(`${path}: ${issue?.message ?? "invalid data"}`);
  }
  return result.data;
}

export async function exportBackup(): Promise<Backup> {
  const db = await getDb();
  const [settings, players, customPacks, historyKeys, historyValues] = await Promise.all([
    db.get(STORE_KV, KV_SETTINGS),
    db.get(STORE_KV, KV_PLAYERS),
    db.getAll(STORE_CUSTOM_PACKS),
    db.getAllKeys(STORE_HISTORY),
    db.getAll(STORE_HISTORY),
  ]);
  return parseBackup({
    app: BACKUP_APP_ID,
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: settings ?? undefined,
    players: players ?? [],
    customPacks,
    history: Object.fromEntries(historyKeys.map((key, i) => [key, historyValues[i] ?? []])),
  });
}

// Replaces everything in one transaction so a failed import leaves old data intact.
export async function restoreBackup(backup: Backup): Promise<void> {
  const db = await getDb();
  const tx = db.transaction([STORE_KV, STORE_CUSTOM_PACKS, STORE_HISTORY], "readwrite");
  const kv = tx.objectStore(STORE_KV);
  const packs = tx.objectStore(STORE_CUSTOM_PACKS);
  const history = tx.objectStore(STORE_HISTORY);
  await Promise.all([
    kv.clear(),
    packs.clear(),
    history.clear(),
    ...(backup.settings ? [kv.put(backup.settings, KV_SETTINGS)] : []),
    kv.put(backup.players, KV_PLAYERS),
    ...backup.customPacks.map((pack) => packs.put({ ...pack, source: "custom" }, pack.id)),
    ...Object.entries(backup.history).map(([id, used]) => history.put(used, id)),
    tx.done,
  ]);
}
