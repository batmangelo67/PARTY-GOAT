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

interface PickerListOptions {
  filter: PickerFilter;
  query: string;
  recentIds: readonly string[];
  favoriteIds: readonly string[];
}

// The rows the picker shows: search across titles, or one of the shortcut lists; recents keep their order.
export function pickerRows<P extends Pack>(packs: readonly P[], { filter, query, recentIds, favoriteIds }: PickerListOptions): P[] {
  const needle = normalize(query);
  if (needle) return packs.filter((pack) => normalize(pack.title).includes(needle));
  if (filter === "recent") return recentIds.map((id) => packs.find((pack) => pack.id === id)).filter((pack): pack is P => Boolean(pack));
  const favorites = new Set(favoriteIds);
  const rows = filter === "starred" ? packs.filter((pack) => favorites.has(pack.id)) : [...packs];
  return rows.sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)) || a.title.localeCompare(b.title));
}
