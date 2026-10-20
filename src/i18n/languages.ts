export const LANGUAGES = ["en", "it"] as const;
export type Language = (typeof LANGUAGES)[number];

export function detectLanguage(browserLanguage: string | undefined): Language {
  return browserLanguage?.toLowerCase().startsWith("it") ? "it" : "en";
}
