import { create } from "zustand";
import { detectLanguage, type Language } from "../i18n/languages";
import { settingsSchema } from "../storage/backup";
import { KV_SETTINGS, readValue, writeValue } from "../storage/kv";
import { runStorageTask } from "../storage/status-store";

interface SettingsState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: detectLanguage(typeof navigator === "undefined" ? undefined : navigator.language),
  setLanguage: (language) => {
    set({ language });
    void runStorageTask("Saving settings", () => writeValue(KV_SETTINGS, { language }));
  },
}));

export async function hydrateSettings(): Promise<void> {
  const stored = await runStorageTask("Loading settings", () => readValue(KV_SETTINGS));
  const parsed = settingsSchema.safeParse(stored);
  if (parsed.success) useSettingsStore.setState({ language: parsed.data.language });
}
