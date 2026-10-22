import type { Pack } from "./schema";

export type PickerFilter = "all" | "recent" | "starred";

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  const set = new Set(a);
  return a.length === b.length && b.every((id) => set.has(id));
}

// Choosing exactly the default packs is the same as the default mix, so it is stored as null and
// keeps following new packs and the language setting.
export function normalizeSelection(selected: readonly string[], defaultIds: readonly string[]): string[] | null {
  return sameSet(selected, defaultIds) ? null : [...selected];
}

export function toggleSelection(packIds: readonly string[] | null, defaultIds: readonly string[], packId: string): string[] | null {
  const current = packIds ?? defaultIds;
  const next = current.includes(packId) ? current.filter((id) => id !== packId) : [...current, packId];
  return normalizeSelection(next, defaultIds);
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Packs written without a group (custom or imported ones) sit in the "other" folder.
export const FALLBACK_GROUP = "other";

// null means "every folder" (or every section of the chosen folder).
export interface PickerFolder {
  group: string | null;
  section: string | null;
}

export const ALL_FOLDERS: PickerFolder = { group: null, section: null };

export function packGroup(pack: Pick<Pack, "group">): string {
  return pack.group ?? FALLBACK_GROUP;
}

export function inFolder(pack: Pick<Pack, "group" | "section">, { group, section }: PickerFolder): boolean {
  return (group === null || packGroup(pack) === group) && (section === null || pack.section === section);
}

function sortByLabel(ids: Iterable<string>, label: (id: string) => string): string[] {
  return [...new Set(ids)].sort(
    (a, b) => Number(a === FALLBACK_GROUP) - Number(b === FALLBACK_GROUP) || label(a).localeCompare(label(b)),
  );
}

interface FolderLabels {
  group: (id: string) => string;
  section: (id: string) => string;
}

// The folder chips: every group among the packs, plus the sections of the chosen group. A row with one
// choice says nothing, so it comes back empty. A chosen folder that is no longer there falls back to all.
export function folderChips(packs: readonly Pick<Pack, "group" | "section">[], folder: PickerFolder, labels: FolderLabels) {
  const groups = sortByLabel(packs.map(packGroup), labels.group);
  const group = folder.group !== null && groups.includes(folder.group) ? folder.group : null;
  const sectionIds = packs.filter((pack) => group !== null && packGroup(pack) === group).map((pack) => pack.section);
  const sections = sortByLabel(sectionIds.filter((id): id is string => id !== undefined), labels.section);
  const section = folder.section !== null && sections.includes(folder.section) ? folder.section : null;
  return {
    groups: groups.length > 1 ? groups : [],
    sections: sections.length > 1 ? sections : [],
    active: { group: groups.length > 1 ? group : null, section: sections.length > 1 ? section : null },
  };
}

interface PickerListOptions {
  filter: PickerFilter;
  query: string;
  recentIds: readonly string[];
  favoriteIds: readonly string[];
  folder?: PickerFolder;
}

// The rows the picker shows: search across all titles, or one of the shortcut lists inside the chosen folder;
// recents keep their order.
export function pickerRows<P extends Pack>(allPacks: readonly P[], { filter, query, recentIds, favoriteIds, folder = ALL_FOLDERS }: PickerListOptions): P[] {
  const needle = normalize(query);
  if (needle) return allPacks.filter((pack) => normalize(pack.title).includes(needle));
  const packs = allPacks.filter((pack) => inFolder(pack, folder));
  if (filter === "recent") return recentIds.map((id) => packs.find((pack) => pack.id === id)).filter((pack): pack is P => Boolean(pack));
  const favorites = new Set(favoriteIds);
  const rows = filter === "starred" ? packs.filter((pack) => favorites.has(pack.id)) : [...packs];
  return rows.sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)) || a.title.localeCompare(b.title));
}
