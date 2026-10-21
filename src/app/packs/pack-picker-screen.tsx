import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { MAX_SPICE } from "../constants";
import { useSettingsStore } from "../settings-store";
import { useContentStore } from "../../content/content-store";
import { filterPickerPacks } from "../../content/pack-filter";
import { pickerRows, toggleSelection, type PickerFilter } from "../../content/picker-selection";
import { defaultPacks } from "../../content/resolve-packs";
import type { Pack } from "../../content/schema";
import { usePlayLogStore } from "../../engine/play-log-store";
import { pick } from "../../engine/random";
import { Button, Chip, Notice, Screen } from "../../engine/ui";
import { findGame } from "../../games/registry";
import { spiceKey } from "../../i18n/labels";
import { useT } from "../../i18n/use-t";

const FILTERS: readonly PickerFilter[] = ["all", "recent", "starred"];

function PackRow({ pack, checked, starred, onToggle, onStar }: { pack: Pack; checked: boolean; starred: boolean; onToggle: () => void; onStar: () => void }) {
  const t = useT();
  return (
    <li className={`flex items-stretch rounded-2xl transition ${checked ? "bg-raised ring-2 ring-accent" : "bg-panel"}`}>
      <button type="button" role="checkbox" aria-checked={checked} onClick={onToggle} className="flex min-h-tap min-w-0 flex-1 items-center gap-3 py-3 pl-4 text-left">
        <span
          aria-hidden
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-lg font-black ${checked ? "bg-accent text-accent-ink" : "border-2 border-line"}`}
        >
          {checked ? "✓" : ""}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block break-words font-bold">{pack.title}</span>
          <span className="block text-sm text-muted">
            {t("picker.items", { count: pack.items.length })} · {t(spiceKey(pack.spice))} · {t(`language.short.${pack.language}`)}
            {pack.source === "custom" && ` · ${t("source.custom")}`}
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-pressed={starred}
        aria-label={t(starred ? "picker.unstar" : "picker.star", { title: pack.title })}
        onClick={onStar}
        className={`w-tap shrink-0 rounded-r-2xl text-2xl active:bg-line ${starred ? "text-accent" : "text-muted"}`}
      >
        {starred ? "★" : "☆"}
      </button>
    </li>
  );
}

// One-level pack picker for a game: search first, shortcut lists, one-tap mix or surprise.
export function PackPickerScreen() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const game = findGame(useParams().gameId);
  const allPacks = useContentStore((state) => state.packs);
  const language = useSettingsStore((state) => state.language);
  const maxSpice = useSettingsStore((state) => state.maxSpice);
  const updateSettings = useSettingsStore((state) => state.update);
  const { log, favorites, toggleFavorite } = usePlayLogStore();
  const packIds = game?.packs.usePackIds() ?? null;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PickerFilter>("all");
  const [allLanguages, setAllLanguages] = useState(() => (packIds ?? []).some((id) => allPacks.find((p) => p.id === id)?.language !== language));

  const scope = useMemo(() => (game ? { gameId: game.id, kinds: game.acceptsKinds, language, maxSpice } : null), [game, language, maxSpice]);
  const defaultIds = useMemo(() => (scope ? defaultPacks(allPacks, scope).map((p) => p.id) : []), [allPacks, scope]);
  const visible = useMemo(() => (scope ? filterPickerPacks(allPacks, { ...scope, allLanguages }) : []), [allPacks, scope, allLanguages]);
  const selected = new Set(packIds ?? defaultIds);
  const createdPackId = (location.state as { createdPackId?: string } | null)?.createdPackId;

  // Back from "+ New pack": select the new pack, then return to the picker entry underneath.
  useEffect(() => {
    if (!game || !createdPackId) return;
    const created = allPacks.find((p) => p.id === createdPackId);
    if (created) {
      if (created.spice > maxSpice) updateSettings({ maxSpice: created.spice });
      game.packs.setPackIds([...new Set([...(packIds ?? defaultIds), created.id])]);
    }
    void navigate(-1);
  }, [createdPackId]);

  if (!game || !scope) return <Navigate to="/" replace />;

  const rows = pickerRows(visible, { filter, query, recentIds: log.packs[game.id] ?? [], favoriteIds: favorites });
  const count = visible.filter((p) => selected.has(p.id)).length;
  const done = () => void navigate(-1);
  const surprise = () => {
    if (visible.length === 0) return;
    game.packs.setPackIds([pick(visible).id]);
    done();
  };
  const emptyKey = query ? "picker.empty" : filter === "recent" ? "picker.noRecent" : filter === "starred" ? "picker.noStarred" : "picker.empty";

  return (
    <Screen
      title={t("picker.title")}
      onBack={done}
      footer={
        <Button disabled={count === 0} onClick={done}>
          {packIds === null ? t("picker.useMix", { count }) : t("picker.use", { count })}
        </Button>
      }
    >
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("picker.search")}
        aria-label={t("picker.search")}
        autoComplete="off"
        enterKeyHint="search"
        className="min-h-tap w-full rounded-2xl border-2 border-line bg-ink px-4 font-bold outline-none focus:border-accent"
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant={packIds === null ? "primary" : "secondary"} className="text-base" onClick={() => game.packs.setPackIds(null)}>
          {t("picker.mixAll")}
        </Button>
        <Button variant="secondary" className="text-base" onClick={surprise}>
          {t("picker.surprise")}
        </Button>
      </div>
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((key) => (
          <Chip key={key} label={t(`picker.filter.${key}`)} active={!query && filter === key} onClick={() => setFilter(key)} />
        ))}
        <Chip label={t("picker.allLanguages")} active={allLanguages} onClick={() => setAllLanguages(!allLanguages)} />
        <Chip
          label={t("picker.spice", { level: t(spiceKey(maxSpice)) })}
          active={maxSpice > 0}
          onClick={() => updateSettings({ maxSpice: (maxSpice + 1) % (MAX_SPICE + 1) })}
        />
      </div>
      <div className="mt-3 flex min-h-11 items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-widest text-muted">{t("picker.selected", { count })}</span>
        <button
          type="button"
          disabled={count === 0}
          onClick={() => game.packs.setPackIds([])}
          className="min-h-11 rounded-full px-3 font-bold text-accent active:bg-raised disabled:opacity-40"
        >
          {t("picker.clear")}
        </button>
      </div>
      <ul className="mt-1 flex flex-col gap-2">
        {rows.map((pack) => (
          <PackRow
            key={pack.id}
            pack={pack}
            checked={selected.has(pack.id)}
            starred={favorites.includes(pack.id)}
            onToggle={() => game.packs.setPackIds(toggleSelection(packIds, defaultIds, pack.id))}
            onStar={() => toggleFavorite(pack.id)}
          />
        ))}
      </ul>
      {rows.length === 0 && (
        <div className="mt-3">
          <Notice>{t(emptyKey)}</Notice>
        </div>
      )}
      <button
        type="button"
        onClick={() =>
          void navigate(`/packs/new?kind=${game.acceptsKinds[0]}&game=${game.id}&returnTo=${encodeURIComponent(location.pathname)}`)
        }
        className="mt-3 min-h-tap w-full rounded-2xl border-2 border-dashed border-line px-4 font-bold text-muted active:bg-raised"
      >
        {t("picker.newPack")}
      </button>
    </Screen>
  );
}
