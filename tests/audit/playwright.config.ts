import { defineConfig, devices } from "@playwright/test";

// UX audit harness. Runs against the production build (`vite preview`) so the service worker and
// offline behaviour are real. WebKit is the primary engine (closest to iOS Safari); Chromium is a
// secondary check on one viewport.
//
// Viewports use the full standalone screen size (Home Screen app, no Safari toolbars).

// AUDIT_PORT / AUDIT_DIST let a second build be audited side by side with the main one.
const PORT = Number(process.env.AUDIT_PORT ?? 4317);
const DIST = process.env.AUDIT_DIST ?? "dist";

const VIEWPORTS = {
  se: { width: 375, height: 667, device: "iPhone SE (3rd gen)" },
  i15: { width: 393, height: 852, device: "iPhone 15" },
  promax: { width: 430, height: 932, device: "iPhone 15 Pro Max" },
} as const;

const LOCALES = { en: "en-US", it: "it-IT" } as const;

type ViewportKey = keyof typeof VIEWPORTS;
type LocaleKey = keyof typeof LOCALES;

function webkitProject(viewport: ViewportKey, lang: LocaleKey) {
  const preset = VIEWPORTS[viewport];
  return {
    name: `webkit-${viewport}-${lang}`,
    use: {
      ...devices[preset.device],
      viewport: { width: preset.width, height: preset.height },
      locale: LOCALES[lang],
      deviceScaleFactor: 2,
    },
  };
}

function chromiumProject(lang: LocaleKey) {
  const preset = VIEWPORTS.i15;
  return {
    name: `chromium-i15-${lang}`,
    use: {
      ...devices["Pixel 7"],
      browserName: "chromium" as const,
      viewport: { width: preset.width, height: preset.height },
      locale: LOCALES[lang],
      deviceScaleFactor: 2,
    },
  };
}

export default defineConfig({
  testDir: ".",
  outputDir: `../../docs/audit/runs/test-output-${process.env.AUDIT_LABEL ?? "latest"}`,
  timeout: 240_000,
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}/`,
    serviceWorkers: "allow",
    trace: "off",
    screenshot: "off",
    reducedMotion: "reduce",
  },
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort --outDir ${DIST}`,
    port: PORT,
    reuseExistingServer: true,
    cwd: "../..",
  },
  projects: [
    webkitProject("se", "en"),
    webkitProject("se", "it"),
    webkitProject("i15", "en"),
    webkitProject("i15", "it"),
    webkitProject("promax", "en"),
    webkitProject("promax", "it"),
    chromiumProject("en"),
    chromiumProject("it"),
  ],
});
