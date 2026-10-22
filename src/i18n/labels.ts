import type { MessageKey } from "./en";
import type { Translate } from "./use-t";

const SPICE_KEYS = ["spice.0", "spice.1", "spice.2", "spice.3"] as const satisfies readonly MessageKey[];

export function spiceKey(level: number): MessageKey {
  return SPICE_KEYS[Math.min(Math.max(level, 0), SPICE_KEYS.length - 1)]!;
}

export const SPICE_LEVELS = [0, 1, 2, 3] as const;

const GROUP_KEYS: Record<string, MessageKey> = {
  adults: "folder.adults",
  classics: "folder.classics",
  entertainment: "folder.entertainment",
  family: "folder.family",
  "food-drink": "folder.food-drink",
  gaming: "folder.gaming",
  general: "folder.general",
  geography: "folder.geography",
  italy: "folder.italy",
  lifestyle: "folder.lifestyle",
  other: "folder.other",
  society: "folder.society",
  sports: "folder.sports",
  "tech-internet": "folder.tech-internet",
  themes: "folder.themes",
  "word-rules": "folder.word-rules",
};

const SECTION_KEYS: Record<string, MessageKey> = {
  basketball: "folder.section.basketball",
  football: "folder.section.football",
  other: "folder.section.other",
};

export function groupKey(id: string): MessageKey | undefined {
  return GROUP_KEYS[id];
}

export function sectionKey(id: string): MessageKey | undefined {
  return SECTION_KEYS[id];
}

// Imported packs may bring a folder id we have no words for; show the id itself, readable.
function readableId(id: string): string {
  const text = id.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function groupLabel(t: Translate, id: string): string {
  const key = groupKey(id);
  return key ? t(key) : readableId(id);
}

export function sectionLabel(t: Translate, id: string): string {
  const key = sectionKey(id);
  return key ? t(key) : readableId(id);
}
