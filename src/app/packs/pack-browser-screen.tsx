import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useContentStore } from "../../content/content-store";
import { filterPackList } from "../../content/pack-filter";
import { PACK_KINDS, PACK_SOURCES } from "../../content/schema";
import { errorMessage, logError } from "../../engine/logger";
import { Button, Notice, Screen, Section, Segmented } from "../../engine/ui";
import { SPICE_LEVELS, spiceKey } from "../../i18n/labels";
import { useT } from "../../i18n/use-t";
import { useSettingsStore } from "../settings-store";
import { usePackBrowserFilters } from "./browser-store";
import { exportPacks } from "./pack-export";

export function PackBrowserScreen() {
  const t = useT();
  const navigate = useNavigate();
  const backTo = (useLocation().state as { from?: string } | null)?.from ?? "/";
  const packs = useContentStore((state) => state.packs);
  const language = useSettingsStore((state) => state.language);
  const filters = usePackBrowserFilters();
  const [feedback, setFeedback] = useState("");
  const visible = useMemo(
    () => filterPackList(packs, { ...filters, language: filters.allLanguages ? "all" : language }),
    [packs, filters, language],
  );

  const exportAllCustom = async () => {
    const custom = packs.filter((p) => p.source === "custom");
    if (custom.length === 0) return setFeedback(t("packs.exportAllEmpty"));
    try {
      await exportPacks(custom, "custom-packs", true);
    } catch (error) {
      logError("Exporting custom packs", error);
      setFeedback(t("packs.exportError", { reason: errorMessage(error) }));
    }
  };

  return (
    <Screen title={t("packs.title")} backTo={backTo}>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => navigate("/packs/new")}>{t("packs.new")}</Button>
        <Button variant="secondary" onClick={() => navigate("/packs/import")}>
          {t("packs.import")}
        </Button>
      </div>
      <Button variant="ghost" className="mt-2" onClick={exportAllCustom}>
        {t("packs.exportAll")}
      </Button>
      {feedback && <Notice>{feedback}</Notice>}

      <input
        type="search"
        value={filters.query}
        placeholder={t("packs.search")}
        aria-label={t("packs.search")}
        onChange={(e) => filters.update({ query: e.target.value })}
        className="mt-4 min-h-tap w-full rounded-2xl border-2 border-line bg-ink px-4 font-bold outline-none focus:border-accent"
      />
      <Section title={t("packs.filterLanguage")}>
        <Segmented
          ariaLabel={t("packs.filterLanguage")}
          options={[
            { value: "ui", label: t(`language.${language}`) },
            { value: "all", label: t("packs.all") },
          ]}
          value={filters.allLanguages ? "all" : "ui"}
          onChange={(value) => filters.update({ allLanguages: value === "all" })}
        />
      </Section>
      <Section title={t("packs.filterKind")}>
        <Segmented
          ariaLabel={t("packs.filterKind")}
          options={[{ value: "all", label: t("packs.all") }, ...PACK_KINDS.map((kind) => ({ value: kind, label: t(`kind.${kind}`) }))]}
          value={filters.kind}
          onChange={(kind) => filters.update({ kind })}
        />
      </Section>
      <Section title={t("packs.filterSpice")} aside={t(spiceKey(filters.maxSpice))}>
        <Segmented
          ariaLabel={t("packs.filterSpice")}
          options={SPICE_LEVELS.map((level) => ({ value: level, label: String(level) }))}
          value={filters.maxSpice as (typeof SPICE_LEVELS)[number]}
          onChange={(maxSpice) => filters.update({ maxSpice })}
        />
      </Section>
      <Section title={t("packs.filterSource")}>
        <Segmented
          ariaLabel={t("packs.filterSource")}
          options={[{ value: "all", label: t("packs.all") }, ...PACK_SOURCES.map((source) => ({ value: source, label: t(`source.${source}`) }))]}
          value={filters.source}
          onChange={(source) => filters.update({ source })}
        />
      </Section>

      <Section title={t("packs.count", { count: visible.length })}>
        {visible.length === 0 && <Notice>{t("picker.empty")}</Notice>}
        <ul className="flex flex-col gap-2">
          {visible.map((pack) => (
            <li key={pack.id}>
              <Link to={`/packs/${pack.id}`} className="flex min-h-tap items-center gap-3 rounded-2xl bg-panel px-4 py-3 active:bg-raised">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{pack.title}</span>
                  <span className="block text-sm text-muted">
                    {t(`kind.${pack.kind}`)} · {t("picker.items", { count: pack.items.length })} · {t(spiceKey(pack.spice))}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1 text-xs font-bold">
                  <span className="rounded-md bg-ink px-2 py-1 text-muted">{t(`language.short.${pack.language}`)}</span>
                  <span className={`rounded-md px-2 py-1 ${pack.source === "custom" ? "bg-info text-ink" : "bg-ink text-muted"}`}>
                    {t(`source.${pack.source}`)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </Screen>
  );
}
