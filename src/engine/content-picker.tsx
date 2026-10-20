import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSettingsStore } from "../app/settings-store";
import { useContentStore } from "../content/content-store";
import { filterPickerPacks } from "../content/pack-filter";
import type { PackKind } from "../content/schema";
import { useT } from "../i18n/use-t";
import { SPICE_LEVELS, spiceKey } from "../i18n/labels";
import { Notice, Segmented } from "./ui";

interface ContentPickerProps {
  gameId: string;
  kinds: readonly PackKind[];
  selectedIds: string[] | null;
  onChange: (ids: string[]) => void;
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 rounded-full px-4 text-sm font-bold transition ${active ? "bg-info text-ink" : "bg-panel text-muted"}`}
    >
      {label}
    </button>
  );
}

export function ContentPicker({ gameId, kinds, selectedIds, onChange }: ContentPickerProps) {
  const t = useT();
  const packs = useContentStore((state) => state.packs);
  const language = useSettingsStore((state) => state.language);
  const [allLanguages, setAllLanguages] = useState(false);
  const maxSpice = useSettingsStore((state) => state.maxSpice);
  const updateSettings = useSettingsStore((state) => state.update);
  const visible = useMemo(
    () => filterPickerPacks(packs, { gameId, kinds, language, allLanguages, maxSpice }),
    [packs, gameId, kinds, language, allLanguages, maxSpice],
  );

  const location = useLocation();
  const navigate = useNavigate();
  const createdPackId = (location.state as { createdPackId?: string } | null)?.createdPackId;

  // Coming back from the pack editor: reveal and select the pack that was just created.
  useEffect(() => {
    if (!createdPackId) return;
    const created = packs.find((p) => p.id === createdPackId);
    if (created && kinds.includes(created.kind) && created.games.includes(gameId)) {
      if (created.language !== language) setAllLanguages(true);
      if (created.spice > maxSpice) updateSettings({ maxSpice: created.spice });
      onChange([...new Set([...(selectedIds ?? visible.map((p) => p.id)), created.id])]);
    }
    navigate(location.pathname + location.search, { replace: true, state: null });
  }, [createdPackId]);

  useEffect(() => {
    if (createdPackId) return;
    const visibleIds = new Set(visible.map((p) => p.id));
    if (selectedIds === null) onChange([...visibleIds]);
    else if (selectedIds.some((id) => !visibleIds.has(id))) onChange(selectedIds.filter((id) => visibleIds.has(id)));
  }, [visible, selectedIds, onChange, createdPackId]);

  const selected = new Set(selectedIds ?? []);
  const toggle = (id: string) => onChange(selected.has(id) ? [...selected].filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <FilterChip label={t("picker.allLanguages")} active={allLanguages} onClick={() => setAllLanguages(!allLanguages)} />
      </div>
      <Segmented
        ariaLabel={t("picker.spiceLimit")}
        options={SPICE_LEVELS.map((level) => ({ value: level, label: t(spiceKey(level)) }))}
        value={maxSpice as (typeof SPICE_LEVELS)[number]}
        onChange={(level) => updateSettings({ maxSpice: level })}
      />
      {visible.length === 0 && <Notice>{t("picker.empty")}</Notice>}
      <button
        type="button"
        onClick={() =>
          navigate(`/packs/new?kind=${kinds[0]}&game=${gameId}&returnTo=${encodeURIComponent(location.pathname)}`)
        }
        className="min-h-tap rounded-2xl border-2 border-dashed border-line px-4 font-bold text-muted active:bg-raised"
      >
        {t("picker.newPack")}
      </button>
      {visible.map((pack) => {
        const checked = selected.has(pack.id);
        return (
          <button
            key={pack.id}
            type="button"
            role="checkbox"
            aria-checked={checked}
            onClick={() => toggle(pack.id)}
            className={`flex min-h-tap items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${checked ? "bg-raised ring-2 ring-accent" : "bg-panel"}`}
          >
            <span
              aria-hidden
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-lg font-black ${checked ? "bg-accent text-accent-ink" : "border-2 border-line"}`}
            >
              {checked ? "✓" : ""}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold">{pack.title}</span>
              <span className="block text-sm text-muted">
                {t("picker.items", { count: pack.items.length })} · {t(spiceKey(pack.spice))}
                {pack.source === "custom" && ` · ${t("source.custom")}`}
              </span>
            </span>
            <span className="rounded-md bg-ink px-2 py-1 text-xs font-bold text-muted">{t(`language.short.${pack.language}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
