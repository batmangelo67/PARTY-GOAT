import { en, type MessageKey } from "../../../src/i18n/en";
import { it } from "../../../src/i18n/it";

export type Lang = "en" | "it";

const DICTIONARIES: Record<Lang, Record<MessageKey, string>> = { en, it };

// Same interpolation as the app's useT, so the harness can find buttons by their visible label.
export function tr(lang: Lang, key: MessageKey, params: Record<string, string | number> = {}): string {
  return DICTIONARIES[lang][key].replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
}

// A label with placeholders as a regex, e.g. "I'm {name}, show me" -> /^I'm .+, show me$/.
export function trPattern(lang: Lang, key: MessageKey): RegExp {
  const escaped = DICTIONARIES[lang][key].replace(/[.*+?^$()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\\?\{\w+\\?\}/g, ".+")}$`);
}

export function langOf(projectName: string): Lang {
  return projectName.endsWith("-it") ? "it" : "en";
}
