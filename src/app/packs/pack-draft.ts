import { newCustomPackId } from "../../content/custom-pack-id";
import { toPackFile } from "../../content/items";
import { formatItemLines, MIN_CUSTOM_ITEMS, parseItemLines, type ParsedLines } from "../../content/pack-text";
import { packFileSchema, type Pack, type PackFile, type PackKind } from "../../content/schema";
import { gamesForKind } from "../../games/registry";
import type { MessageKey } from "../../i18n/en";
import type { Language } from "../../i18n/languages";

export interface PackDraft {
  title: string;
  language: Language;
  kind: PackKind;
  spice: number;
  games: string[];
  text: string;
}

export function defaultGames(kind: PackKind): string[] {
  return gamesForKind(kind).map((game) => game.id);
}

export function emptyDraft(kind: PackKind, language: Language): PackDraft {
  return { title: "", language, kind, spice: 0, games: defaultGames(kind), text: "" };
}

export function draftFromPack(pack: Pack, title = pack.title): PackDraft {
  const file = toPackFile(pack);
  return {
    title,
    language: pack.language,
    kind: pack.kind,
    spice: pack.spice,
    games: pack.games.filter((id) => defaultGames(pack.kind).includes(id)),
    text: formatItemLines(pack.kind, file.items),
  };
}

export function draftProblems(draft: PackDraft, parsed: ParsedLines<PackKind>): MessageKey[] {
  const problems: MessageKey[] = [];
  if (!draft.title.trim()) problems.push("editor.needTitle");
  if (draft.games.length === 0) problems.push("editor.needGames");
  if (parsed.errors.length > 0) problems.push("editor.fixErrors");
  if (parsed.items.length < MIN_CUSTOM_ITEMS) problems.push("editor.needItems");
  return problems;
}

export function draftToPackFile(draft: PackDraft, id: string | undefined, takenIds: ReadonlySet<string>): PackFile {
  const { items } = parseItemLines(draft.kind, draft.text);
  return packFileSchema.parse({
    id: id ?? newCustomPackId(draft.title, takenIds),
    title: draft.title.trim(),
    language: draft.language,
    spice: draft.spice,
    kind: draft.kind,
    games: draft.games,
    items,
  });
}
