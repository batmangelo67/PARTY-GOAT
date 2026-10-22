import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { storeCustomPacks, useContentStore } from "../../content/content-store";
import { MIN_CUSTOM_ITEMS, parseItemLines } from "../../content/pack-text";
import { PACK_KINDS, type PackKind } from "../../content/schema";
import { errorMessage, logError } from "../../engine/logger";
import { Button, ChipGroup, Notice, Screen, Section, Segmented } from "../../engine/ui";
import { gamesForKind } from "../../games/registry";
import { SPICE_LEVELS, spiceKey } from "../../i18n/labels";
import { LANGUAGES } from "../../i18n/languages";
import { useT } from "../../i18n/use-t";
import { useSettingsStore } from "../settings-store";
import { defaultGames, draftFromPack, draftProblems, draftToPackFile, emptyDraft, type PackDraft } from "./pack-draft";

const MAX_LISTED_ERRORS = 8;
const TITLE_MAX_LENGTH = 40;

function isPackKind(value: string | null): value is PackKind {
  return PACK_KINDS.includes(value as PackKind);
}

function useInitialDraft(): { draft: PackDraft; editingId?: string } {
  const t = useT();
  const { packId } = useParams();
  const [params] = useSearchParams();
  const packs = useContentStore((state) => state.packs);
  const language = useSettingsStore((state) => state.language);
  const editing = packs.find((p) => p.id === packId && p.source === "custom");
  if (editing) return { draft: draftFromPack(editing), editingId: editing.id };
  const source = packs.find((p) => p.id === params.get("from"));
  if (source) return { draft: draftFromPack(source, t("pack.copySuffix", { title: source.title })) };
  const kind = params.get("kind");
  return { draft: emptyDraft(isPackKind(kind) ? kind : "words", language) };
}

export function PackEditorScreen() {
  const t = useT();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo");
  const packs = useContentStore((state) => state.packs);
  const initial = useInitialDraft();
  const [draft, setDraft] = useState(initial.draft);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const parsed = useMemo(() => parseItemLines(draft.kind, draft.text), [draft.kind, draft.text]);
  const problems = draftProblems(draft, parsed);
  const update = (changes: Partial<PackDraft>) => setDraft((current) => ({ ...current, ...changes }));

  const toggleGame = (id: string) =>
    update({ games: draft.games.includes(id) ? draft.games.filter((g) => g !== id) : [...draft.games, id] });

  const save = async () => {
    setSaving(true);
    try {
      const pack = draftToPackFile(draft, initial.editingId, new Set(packs.map((p) => p.id)));
      await storeCustomPacks([pack]);
      if (returnTo) navigate(returnTo, { replace: true, state: { createdPackId: pack.id } });
      else navigate(`/packs/${pack.id}`, { replace: true });
    } catch (error) {
      logError("Saving custom pack", error);
      setSaveError(t("editor.saveError", { reason: errorMessage(error) }));
      setSaving(false);
    }
  };

  return (
    <Screen
      title={initial.editingId ? t("editor.editTitle") : t("editor.newTitle")}
      backTo={returnTo ?? (initial.editingId ? `/packs/${initial.editingId}` : "/packs")}
      footer={
        <div className="flex flex-col gap-2">
          {problems[0] && (
            <p className="text-center text-sm font-semibold text-danger">{t(problems[0], { min: MIN_CUSTOM_ITEMS })}</p>
          )}
          <Button disabled={problems.length > 0 || saving} onClick={save}>
            {t("editor.save")}
          </Button>
        </div>
      }
    >
      {saveError && <Notice tone="error">❌ {saveError}</Notice>}
      <Section title={t("editor.title")}>
        <input
          value={draft.title}
          maxLength={TITLE_MAX_LENGTH}
          placeholder={t("editor.titlePlaceholder")}
          aria-label={t("editor.title")}
          onChange={(e) => update({ title: e.target.value })}
          className="min-h-tap w-full rounded-2xl border-2 border-line bg-ink px-4 font-bold outline-none focus:border-accent"
        />
      </Section>
      <Section title={t("editor.language")}>
        <Segmented
          ariaLabel={t("editor.language")}
          options={LANGUAGES.map((code) => ({ value: code, label: t(`language.${code}`) }))}
          value={draft.language}
          onChange={(language) => update({ language })}
        />
      </Section>
      {!initial.editingId && (
        <Section title={t("editor.kind")}>
          <ChipGroup
            ariaLabel={t("editor.kind")}
            options={PACK_KINDS.map((kind) => ({ value: kind, label: t(`kind.${kind}`) }))}
            value={draft.kind}
            onChange={(kind) => update({ kind, games: defaultGames(kind) })}
          />
        </Section>
      )}
      <Section title={t("editor.spice")} aside={t(spiceKey(draft.spice))}>
        <Segmented
          ariaLabel={t("editor.spice")}
          options={SPICE_LEVELS.map((level) => ({ value: level, label: String(level) }))}
          value={draft.spice as (typeof SPICE_LEVELS)[number]}
          onChange={(spice) => update({ spice })}
        />
      </Section>
      <Section title={t("editor.games")}>
        <div className="flex flex-wrap gap-2">
          {gamesForKind(draft.kind).map((game) => (
            <button
              key={game.id}
              type="button"
              role="checkbox"
              aria-checked={draft.games.includes(game.id)}
              onClick={() => toggleGame(game.id)}
              className={`min-h-11 rounded-full px-4 text-sm font-bold ${draft.games.includes(game.id) ? "bg-accent text-accent-ink" : "bg-panel text-muted"}`}
            >
              {t(game.nameKey)}
            </button>
          ))}
        </div>
      </Section>
      <Section title={t("editor.items")} aside={t("editor.itemCount", { count: parsed.items.length, min: MIN_CUSTOM_ITEMS })}>
        <p className="mb-2 text-sm text-muted">{t(`editor.format.${draft.kind}`)}</p>
        <textarea
          value={draft.text}
          rows={12}
          spellCheck={false}
          aria-label={t("editor.items")}
          onChange={(e) => update({ text: e.target.value })}
          className="w-full rounded-2xl border-2 border-line bg-ink p-4 font-semibold leading-relaxed outline-none focus:border-accent"
        />
        {parsed.errors.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1 text-sm text-danger" role="alert">
            {parsed.errors.slice(0, MAX_LISTED_ERRORS).map((error) => (
              <li key={error.line}>{t("editor.lineError", { line: error.line, message: t(`lineError.${error.code}`) })}</li>
            ))}
            {parsed.errors.length > MAX_LISTED_ERRORS && (
              <li>{t("editor.moreErrors", { count: parsed.errors.length - MAX_LISTED_ERRORS })}</li>
            )}
          </ul>
        )}
      </Section>
    </Screen>
  );
}
