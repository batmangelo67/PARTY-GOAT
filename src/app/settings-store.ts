import { create } from "zustand";
import { detectLanguage } from "../i18n/languages";
import { settingsSchema, type StoredSettings } from "../storage/backup";
import { KV_SETTINGS, readValue, writeValue } from "../storage/kv";
import { runStorageTask } from "../storage/status-store";
import { DEFAULT_MAX_SPICE, DEFAULT_THEME } from "./constants";

interface SettingsState extends StoredSettings {
  update: (changes: Partial<StoredSettings>) => void;
}

function pickSettings(state: StoredSettings): StoredSettings {
  const { language, sound, animations, theme, maxSpice } = state;
  return { language, sound, animations, theme, maxSpice };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: detectLanguage(typeof navigator === "undefined" ? undefined : navigator.language),
  sound: true,
  animations: true,
  theme: DEFAULT_THEME,
  maxSpice: DEFAULT_MAX_SPICE,
  update: (changes) => {
    set(changes);
    void runStorageTask("Saving settings", () => writeValue(KV_SETTINGS, pickSettings(get())));
  },
}));

export async function hydrateSettings(): Promise<void> {
  const stored = await runStorageTask("Loading settings", () => readValue(KV_SETTINGS));
  const parsed = settingsSchema.safeParse(stored);
  if (parsed.success) useSettingsStore.setState(parsed.data);
}
