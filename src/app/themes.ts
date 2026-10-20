// Accent colours as space-separated RGB channels so Tailwind can apply opacity modifiers.
export const THEMES = {
  lime: { accent: "215 255 62", accentInk: "27 33 0" },
  pink: { accent: "255 111 181", accentInk: "42 6 24" },
  sky: { accent: "92 200 255", accentInk: "4 32 46" },
  orange: { accent: "255 162 62", accentInk: "45 21 0" },
} as const;

export type ThemeName = keyof typeof THEMES;
export const THEME_NAMES = Object.keys(THEMES) as [ThemeName, ...ThemeName[]];

export function applyAppearance(theme: ThemeName, animations: boolean): void {
  const root = document.documentElement;
  root.style.setProperty("--accent", THEMES[theme].accent);
  root.style.setProperty("--accent-ink", THEMES[theme].accentInk);
  root.dataset.motion = animations ? "on" : "off";
}
