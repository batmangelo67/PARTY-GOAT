import type { ItemOf, Pack, PackFile, PackKind, PackOf, PackSource } from "./schema";

function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function itemKey(pack: PackFile, index: number): string {
  switch (pack.kind) {
    case "words":
      return pack.items[index]!.word;
    case "question-pairs": {
      const item = pack.items[index]!;
      return `${item.question}|${item.liarQuestion}`;
    }
    case "prompts":
      return pack.items[index]!.text;
  }
}

// Content-derived so ids survive reordering items inside a pack.
export function itemId(pack: PackFile, index: number): string {
  return `${pack.id}#${fnv1a(itemKey(pack, index).trim().toLowerCase())}`;
}

export function withItemIds(pack: PackFile, source: PackSource): Pack {
  const items = pack.items.map((item: ItemOf<PackKind>, index) => ({ ...item, id: itemId(pack, index) }));
  return { ...pack, source, items } as Pack;
}

export function packsOfKind<K extends PackKind>(packs: Pack[], kind: K): PackOf<K>[] {
  return packs.filter((pack) => pack.kind === kind) as unknown as PackOf<K>[];
}

export function toPackFile(pack: Pack): PackFile {
  const items = pack.items.map(({ id: _id, ...item }) => item);
  return { ...pack, items } as PackFile;
}
