import { useCallback } from "react";
import { useSettingsStore } from "../app/settings-store";
import { en, type MessageKey, type Messages } from "./en";
import { it } from "./it";
import type { Language } from "./languages";

const DICTIONARIES: Record<Language, Messages> = { en, it };

export type TranslateVars = Record<string, string | number>;
export type Translate = (key: MessageKey, vars?: TranslateVars) => string;

export function translate(language: Language, key: MessageKey, vars?: TranslateVars): string {
  const template = DICTIONARIES[language][key];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function useT(): Translate {
  const language = useSettingsStore((state) => state.language);
  return useCallback((key, vars) => translate(language, key, vars), [language]);
}
