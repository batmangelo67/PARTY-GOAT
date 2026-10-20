import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { hydrateContent } from "../content/content-store";
import { errorMessage, logError } from "../engine/logger";
import { hydratePlayers } from "../engine/players-store";
import { Button, Notice, Screen, Section, Segmented } from "../engine/ui";
import { LANGUAGES } from "../i18n/languages";
import { useT } from "../i18n/use-t";
import { readBackupFile, restoreBackup, saveBackupFile } from "../storage/backup-file";
import { clearHistory } from "../storage/history";
import { APP_NAME } from "./constants";
import { hydrateSettings, useSettingsStore } from "./settings-store";

type Feedback = { tone: "info" | "error"; text: string } | null;

export function SettingsScreen() {
  const t = useT();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
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
        <Segmented ariaLabel={t("settings.language")} options={languageOptions} value={language} onChange={setLanguage} />
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
