import type { Page } from "@playwright/test";

// Injected before the app loads. Replaces the Wake Lock API with a counting fake and counts audio
// voices, so the audit can detect leaked locks and sounds that keep playing after an exit.
function installProbes(): void {
  const probe = { activeLocks: 0, lockRequests: 0, voices: 0, voiceTimes: [] as number[] };
  (window as unknown as { __audit: typeof probe }).__audit = probe;

  // Like the real API, the system drops every lock when the page is hidden.
  const live = new Set<() => void>();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") [...live].forEach((release) => release());
  });
  const fakeWakeLock = {
    request: async () => {
      probe.lockRequests += 1;
      probe.activeLocks += 1;
      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        live.delete(release);
        probe.activeLocks -= 1;
      };
      live.add(release);
      return {
        released: false,
        type: "screen",
        addEventListener() {},
        removeEventListener() {},
        release: async () => release(),
      };
    },
  };
  Object.defineProperty(navigator, "wakeLock", { value: fakeWakeLock, configurable: true });

  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (AudioContextClass) {
    const countVoice = () => {
      probe.voices += 1;
      probe.voiceTimes.push(Date.now());
    };
    const originalOscillator = AudioContextClass.prototype.createOscillator;
    AudioContextClass.prototype.createOscillator = function patchedOscillator(this: AudioContext) {
      countVoice();
      return originalOscillator.call(this);
    };
    const originalBufferSource = AudioContextClass.prototype.createBufferSource;
    AudioContextClass.prototype.createBufferSource = function patchedBufferSource(this: AudioContext) {
      countVoice();
      return originalBufferSource.call(this);
    };
  }
}

export interface ProbeState {
  activeLocks: number;
  lockRequests: number;
  voices: number;
  voiceTimes: number[];
}

export interface ErrorLog {
  console: string[];
  page: string[];
}

export async function instrument(page: Page): Promise<ErrorLog> {
  await page.addInitScript(installProbes);
  const log: ErrorLog = { console: [], page: [] };
  page.on("console", (message) => {
    if (message.type() === "error") log.console.push(message.text().slice(0, 300));
  });
  page.on("pageerror", (error) => log.page.push(String(error).slice(0, 300)));
  return log;
}

export async function readProbe(page: Page): Promise<ProbeState> {
  return page.evaluate(() => (window as unknown as { __audit: ProbeState }).__audit);
}

// Simulates the app going to the background and back (home button, lock screen, app switcher).
export async function setVisibility(page: Page, state: "hidden" | "visible"): Promise<void> {
  await page.evaluate((next) => {
    Object.defineProperty(document, "visibilityState", { value: next, configurable: true });
    Object.defineProperty(document, "hidden", { value: next === "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
}
