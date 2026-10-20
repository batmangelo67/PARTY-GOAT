import { pick } from "./random";

export type UsedByPack = Record<string, string[]>;

export interface PoolItem {
  id: string;
  packId: string;
}

function groupIdsByPack(items: readonly PoolItem[]): Map<string, Set<string>> {
  const groups = new Map<string, Set<string>>();
  for (const item of items) {
    const ids = groups.get(item.packId) ?? new Set<string>();
    ids.add(item.id);
    groups.set(item.packId, ids);
  }
  return groups;
}

// Picks an item not used since its pack was last exhausted; exhausted packs reset first.
export function pickUnused<T extends PoolItem>(items: readonly T[], usedByPack: UsedByPack): { item: T; usedByPack: UsedByPack } {
  if (items.length === 0) throw new RangeError("there are no items to pick from");
  const next: UsedByPack = {};
  for (const [packId, ids] of groupIdsByPack(items)) {
    const stillValid = [...new Set(usedByPack[packId] ?? [])].filter((id) => ids.has(id));
    next[packId] = stillValid.length >= ids.size ? [] : stillValid;
  }
  const used = new Set(Object.values(next).flat());
  const item = pick(items.filter((candidate) => !used.has(candidate.id)));
  next[item.packId] = [...(next[item.packId] ?? []), item.id];
  return { item, usedByPack: next };
}
