import { newCustomPackId } from "./custom-pack-id";
import { toPackFile } from "./items";
import { packFileSchema, type Pack, type PackFile, type PackSource } from "./schema";

export type ImportFailure = "empty" | "invalidJson" | "notPacks";

export class PackImportError extends Error {
  constructor(public readonly code: ImportFailure) {
    super(`Pack import failed: ${code}`);
  }
}

export interface ImportCandidate {
  index: number;
  pack: PackFile;
}

export interface ImportRejection {
  index: number;
  label: string;
  field: string;
}

export interface ImportRead {
  candidates: ImportCandidate[];
  rejected: ImportRejection[];
}

function rejectionLabel(raw: unknown, index: number): string {
  if (raw && typeof raw === "object") {
    const { title, id } = raw as { title?: unknown; id?: unknown };
    if (typeof title === "string" && title.trim()) return title;
    if (typeof id === "string" && id.trim()) return id;
  }
  return `#${index + 1}`;
}

function withoutSource(pack: PackFile): PackFile {
  const { source: _source, ...rest } = pack;
  return rest as PackFile;
}

// Accepts one pack object or an array of packs; invalid entries are rejected one by one, never silently dropped.
export function readImportText(text: string): ImportRead {
  if (!text.trim()) throw new PackImportError("empty");
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new PackImportError("invalidJson");
  }
  const entries: unknown[] = Array.isArray(json) ? json : json && typeof json === "object" ? [json] : [];
  if (!Array.isArray(json) && entries.length === 0) throw new PackImportError("notPacks");
  if (entries.length === 0) throw new PackImportError("empty");

  const read: ImportRead = { candidates: [], rejected: [] };
  entries.forEach((raw, index) => {
    const result = packFileSchema.safeParse(raw);
    if (result.success) {
      read.candidates.push({ index, pack: withoutSource(result.data) });
    } else {
      const issue = result.error.issues[0];
      read.rejected.push({ index, label: rejectionLabel(raw, index), field: issue?.path.join(".") || "kind" });
    }
  });
  return read;
}

export type CollisionChoice = "overwrite" | "keepBoth" | "skip";

export interface ExistingPack {
  id: string;
  source: PackSource;
}

export function collisionChoices(existing: ExistingPack): CollisionChoice[] {
  return existing.source === "builtin" ? ["keepBoth", "skip"] : ["overwrite", "keepBoth", "skip"];
}

export function findCollision(pack: PackFile, existing: readonly ExistingPack[]): ExistingPack | undefined {
  return existing.find((p) => p.id === pack.id);
}

export interface ImportSummary {
  added: string[];
  replaced: string[];
  skipped: string[];
  rejected: ImportRejection[];
}

export interface ImportPlan {
  toSave: PackFile[];
  summary: ImportSummary;
}

export const DEFAULT_COLLISION_CHOICE: CollisionChoice = "keepBoth";

export function planImport(
  read: ImportRead,
  existing: readonly ExistingPack[],
  choices: Readonly<Record<number, CollisionChoice>>,
): ImportPlan {
  const plan: ImportPlan = { toSave: [], summary: { added: [], replaced: [], skipped: [], rejected: [...read.rejected] } };
  const taken = new Set(existing.map((p) => p.id));
  const savedIds = new Set<string>();

  for (const { index, pack } of read.candidates) {
    const collision = findCollision(pack, existing);
    let choice = collision ? (choices[index] ?? DEFAULT_COLLISION_CHOICE) : null;
    if (choice === "overwrite" && collision && !collisionChoices(collision).includes("overwrite")) choice = "keepBoth";
    if (!collision && savedIds.has(pack.id)) choice = "keepBoth";

    if (choice === "skip") {
      plan.summary.skipped.push(pack.title);
      continue;
    }
    const id = choice === "keepBoth" ? newCustomPackId(pack.title, taken) : pack.id;
    taken.add(id);
    savedIds.add(id);
    plan.toSave.push({ ...pack, id });
    (choice === "overwrite" ? plan.summary.replaced : plan.summary.added).push(pack.title);
  }
  return plan;
}

export function exportablePack(pack: Pack): PackFile {
  return withoutSource(toPackFile(pack));
}

export function packsToJson(packs: readonly Pack[], asArray: boolean): string {
  const files = packs.map(exportablePack);
  return JSON.stringify(asArray ? files : files[0], null, 2);
}
