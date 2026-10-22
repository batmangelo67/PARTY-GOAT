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

// Picks a candidate not used since its pack's candidates were last exhausted; exhausted ones reset first.
// `items` is every item of the packs, so history for items outside the candidates (another difficulty) is kept.
export function pickUnused<T extends PoolItem>(
  items: readonly T[],
  usedByPack: UsedByPack,
  isCandidate: (item: T) => boolean = () => true,
): { item: T; usedByPack: UsedByPack } {
  const candidates = items.filter(isCandidate);
  if (candidates.length === 0) throw new RangeError("there are no items to pick from");
  const candidateIds = groupIdsByPack(candidates);
  const next: UsedByPack = {};
  for (const [packId, ids] of groupIdsByPack(items)) {
    if (!candidateIds.has(packId)) continue;
    const pool = candidateIds.get(packId)!;
    const stillValid = [...new Set(usedByPack[packId] ?? [])].filter((id) => ids.has(id));
    const exhausted = stillValid.filter((id) => pool.has(id)).length >= pool.size;
    next[packId] = exhausted ? stillValid.filter((id) => !pool.has(id)) : stillValid;
  }
  const used = new Set(Object.values(next).flat());
  const item = pick(candidates.filter((candidate) => !used.has(candidate.id)));
  next[item.packId] = [...(next[item.packId] ?? []), item.id];
  return { item, usedByPack: next };
}
