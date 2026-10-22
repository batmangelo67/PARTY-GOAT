import { errorMessage } from "../engine/logger";
import { readCustomPacks } from "../storage/custom-packs";
import { withItemIds } from "./items";
import { packFileSchema, type Pack, type PackFile, type PackSource } from "./schema";

// Lazy so each pack becomes its own chunk; the service worker precaches them for offline use.
const BUILTIN_PACK_MODULES = import.meta.glob<unknown>("./packs/*/*/*.json", { import: "default" });

type PackEntry = [origin: string, raw: unknown];

export interface PackLoadResult {
  packs: Pack[];
  errors: string[];
}

export interface BuiltinPackImport {
  entries: PackEntry[];
  errors: string[];
}

// A pack chunk that fails to load is reported on its own so the other packs still load.
export async function importBuiltinPacks(): Promise<BuiltinPackImport> {
  const result: BuiltinPackImport = { entries: [], errors: [] };
  await Promise.all(
    Object.entries(BUILTIN_PACK_MODULES).map(async ([path, load]) => {
      try {
        result.entries.push([path, await load()]);
      } catch (error) {
        result.errors.push(`Pack "${path}" could not be loaded: ${errorMessage(error)}`);
      }
    }),
  );
  result.entries.sort(([a], [b]) => a.localeCompare(b));
  return result;
}

export function parsePackFile(raw: unknown, origin: string): PackFile {
  const result = packFileSchema.safeParse(raw);
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  throw new Error(`Pack "${origin}" is invalid at ${issue?.path.join(".") || "root"}: ${issue?.message}`);
}

export function parsePacks(entries: PackEntry[], source: PackSource): PackLoadResult {
  const result: PackLoadResult = { packs: [], errors: [] };
  for (const [origin, raw] of entries) {
    try {
      result.packs.push(withItemIds(parsePackFile(raw, origin), source));
    } catch (error) {
      result.errors.push(errorMessage(error));
    }
  }
  return result;
}

export async function loadBuiltinPacks(): Promise<PackLoadResult> {
  const imported = await importBuiltinPacks();
  const parsed = parsePacks(imported.entries, "builtin");
  return { packs: parsed.packs, errors: [...imported.errors, ...parsed.errors] };
}

// Builtin packs win on id clashes so a custom pack can't shadow shipped content.
export function mergePacks(builtin: Pack[], custom: Pack[]): Pack[] {
  const builtinIds = new Set(builtin.map((p) => p.id));
  return [...builtin, ...custom.filter((p) => !builtinIds.has(p.id))];
}

export async function loadCustomPacks(): Promise<PackLoadResult> {
  const raws = await readCustomPacks();
  return parsePacks(
    raws.map((raw, i) => [`custom #${i + 1}`, raw]),
    "custom",
  );
}
