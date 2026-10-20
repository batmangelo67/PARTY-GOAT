import type { Language } from "../i18n/languages";
import type { Pack, PackKind, PackSource } from "./schema";

export interface PackListFilters {
  language: Language | "all";
  kind: PackKind | "all";
  maxSpice: number;
  source: PackSource | "all";
  query: string;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function filterPackList(packs: readonly Pack[], filters: PackListFilters): Pack[] {
  const query = normalize(filters.query);
  return packs
    .filter(
      (pack) =>
        (filters.language === "all" || pack.language === filters.language) &&
        (filters.kind === "all" || pack.kind === filters.kind) &&
        (filters.source === "all" || pack.source === filters.source) &&
        pack.spice <= filters.maxSpice &&
        (!query || normalize(pack.title).includes(query)),
    )
    .sort((a, b) => a.title.localeCompare(b.title));
}
