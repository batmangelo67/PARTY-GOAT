import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { hydrateContent } from "../content/content-store";
import { errorMessage, logError } from "../engine/logger";
import { hydratePlayers } from "../engine/players-store";
import { Button, Notice, Screen, Section, Segmented, Toggle } from "../engine/ui";
import { LANGUAGES } from "../i18n/languages";
import { SPICE_LEVELS, spiceKey } from "../i18n/labels";
import { useT } from "../i18n/use-t";
import { readBackupFile, restoreBackup, saveBackupFile } from "../storage/backup-file";
import { clearHistory } from "../storage/history";
import { APP_NAME } from "./constants";
import { hydrateSettings, useSettingsStore } from "./settings-store";
import { THEME_NAMES, THEMES } from "./themes";

type Feedback = { tone: "info" | "error"; text: string } | null;

export function SettingsScreen() {
  const t = useT();
  const { language, sound, animations, theme, maxSpice, update } = useSettingsStore();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const languageOptions = LANGUAGES.map((code) => ({ value: code, label: t(`language.${code}`) }));

  const exportData = async () => {
    try {
      await saveBackupFile();
    } catch (error) {
      logError("Exporting backup", error);
      setFeedback({ tone: "error", text: t("settings.exportError", { reason: errorMessage(error) }) });
    }
  };

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const backup = await readBackupFile(file);
      if (!window.confirm(t("settings.importConfirm"))) return;
      await restoreBackup(backup);
      await Promise.all([hydrateSettings(), hydratePlayers(), hydrateContent()]);
      setFeedback({ tone: "info", text: t("settings.importSuccess") });
    } catch (error) {
      logError("Importing backup", error);
      setFeedback({ tone: "error", text: t("settings.importError", { reason: errorMessage(error), app: APP_NAME }) });
    }
  };

  const resetHistory = async () => {
    try {
      await clearHistory();
      setFeedback({ tone: "info", text: t("settings.resetHistoryDone") });
    } catch (error) {
      logError("Clearing history", error);
      setFeedback({ tone: "error", text: errorMessage(error) });
    }
  };

  return (
    <Screen title={t("settings.title")} backTo="/">
      {feedback && (
        <div className="mt-2">
          <Notice tone={feedback.tone}>{feedback.text}</Notice>
        </div>
      )}
      <Section title={t("settings.language")}>
        <Segmented ariaLabel={t("settings.language")} options={languageOptions} value={language} onChange={(language) => update({ language })} />
      </Section>
      <Section title={t("settings.theme")}>
        <div role="radiogroup" aria-label={t("settings.theme")} className="grid grid-cols-4 gap-2">
          {THEME_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={theme === name}
              onClick={() => update({ theme: name })}
              className={`flex min-h-tap flex-col items-center justify-center gap-1 rounded-2xl text-sm font-bold transition active:scale-[0.97] ${
                theme === name ? "bg-raised ring-2 ring-accent" : "bg-panel text-muted"
              }`}
            >
              <span aria-hidden className="h-6 w-6 rounded-full" style={{ backgroundColor: `rgb(${THEMES[name].accent})` }} />
              {t(`theme.${name}`)}
            </button>
          ))}
        </div>
      </Section>
      <Section title={t("settings.feel")}>
        <div className="flex flex-col gap-3">
          <Toggle label={t("settings.sound")} checked={sound} onChange={(sound) => update({ sound })} />
          <Toggle label={t("settings.animations")} checked={animations} onChange={(animations) => update({ animations })} />
        </div>
      </Section>
      <Section title={t("settings.spice")}>
        <p className="mb-3 text-sm text-muted">{t("settings.spiceHelp")}</p>
        <Segmented
          ariaLabel={t("settings.spice")}
          options={SPICE_LEVELS.map((level) => ({ value: level, label: t(spiceKey(level)) }))}
          value={maxSpice as (typeof SPICE_LEVELS)[number]}
          onChange={(maxSpice) => update({ maxSpice })}
        />
      </Section>
      <Section title={t("settings.packs")}>
        <p className="mb-3 text-sm text-muted">{t("settings.packsHelp")}</p>
        <Button variant="secondary" onClick={() => navigate("/packs", { state: { from: "/settings" } })}>
          {t("settings.openPacks")}
        </Button>
      </Section>
      <Section title={t("settings.backup")}>
        <p className="mb-3 text-sm text-muted">{t("settings.backupHelp")}</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={exportData}>
            {t("settings.export")}
          </Button>
          <Button variant="secondary" onClick={() => fileInput.current?.click()}>
            {t("settings.import")}
          </Button>
        </div>
        <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={importData} />
      </Section>
      <Section title={t("settings.history")}>
        <p className="mb-3 text-sm text-muted">{t("settings.historyHelp")}</p>
        <Button variant="secondary" onClick={resetHistory}>
          {t("settings.resetHistory")}
        </Button>
      </Section>
      <p className="mt-10 text-center text-sm text-muted">
        {APP_NAME} · {t("settings.about")}
      </p>
    </Screen>
  );
}
