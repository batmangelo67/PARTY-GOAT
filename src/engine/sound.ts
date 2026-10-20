import { useSettingsStore } from "../app/settings-store";
import { logError } from "./logger";

type Cue = "reveal" | "tap" | "tick" | "end" | "tie" | "win" | "boom";

interface Note {
  frequency: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  noise?: boolean;
  gain?: number;
}

const CUES: Record<Cue, Note[]> = {
  reveal: [{ frequency: 660, start: 0, duration: 0.08 }],
  tap: [{ frequency: 880, start: 0, duration: 0.05, gain: 0.2 }],
  tick: [{ frequency: 1200, start: 0, duration: 0.04, type: "square", gain: 0.18 }],
  end: [
    { frequency: 523, start: 0, duration: 0.18 },
    { frequency: 392, start: 0.2, duration: 0.18 },
    { frequency: 262, start: 0.4, duration: 0.45, type: "sawtooth" },
  ],
  tie: [
    { frequency: 440, start: 0, duration: 0.12 },
    { frequency: 440, start: 0.16, duration: 0.12 },
  ],
  win: [
    { frequency: 523, start: 0, duration: 0.12 },
    { frequency: 659, start: 0.12, duration: 0.12 },
    { frequency: 784, start: 0.24, duration: 0.3 },
  ],
  boom: [
    { frequency: 900, start: 0, duration: 1.4, noise: true, gain: 0.9 },
    { frequency: 55, start: 0, duration: 1.2, type: "sine", gain: 0.9 },
    { frequency: 38, start: 0.05, duration: 1.4, type: "triangle", gain: 0.7 },
  ],
};

const DEFAULT_GAIN = 0.25;
const NOISE_SECONDS = 1.5;
const CRYPTO_CHUNK_BYTES = 65536;

let context: AudioContext | undefined;
let noiseBuffer: AudioBuffer | undefined;

type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext };

// iOS only allows audio after a user gesture, so call this from a tap handler.
export function unlockAudio(): void {
  try {
    const AudioContextClass = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioContextClass) return;
    context ??= new AudioContextClass();
    if (context.state !== "running") void context.resume();
    const silent = context.createBufferSource();
    silent.buffer = context.createBuffer(1, 1, 22050);
    silent.connect(context.destination);
    silent.start(0);
  } catch (error) {
    logError("Unlocking audio", error);
  }
}

// iOS suspends audio when the phone locks; the next tap or return to the app wakes it again.
export function installAudioUnlock(): void {
  const wake = () => {
    if (!context || context.state !== "running") unlockAudio();
  };
  for (const eventName of ["touchend", "click"] as const) document.addEventListener(eventName, wake, { capture: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && context && context.state !== "running") {
      context.resume().catch((error: unknown) => logError("Resuming audio", error));
    }
  });
}

function getNoiseBuffer(audio: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * NOISE_SECONDS), audio.sampleRate);
  const samples = buffer.getChannelData(0);
  const bytes = new Int8Array(samples.length);
  for (let offset = 0; offset < bytes.length; offset += CRYPTO_CHUNK_BYTES) {
    crypto.getRandomValues(bytes.subarray(offset, offset + CRYPTO_CHUNK_BYTES));
  }
  bytes.forEach((value, i) => (samples[i] = value / 128));
  noiseBuffer = buffer;
  return buffer;
}

interface Voice {
  source: AudioScheduledSourceNode;
  output: AudioNode;
}

function createVoice(audio: AudioContext, note: Note): Voice {
  if (note.noise) {
    const source = audio.createBufferSource();
    source.buffer = getNoiseBuffer(audio);
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = note.frequency;
    source.connect(filter);
    return { source, output: filter };
  }
  const oscillator = audio.createOscillator();
  oscillator.type = note.type ?? "triangle";
  oscillator.frequency.value = note.frequency;
  return { source: oscillator, output: oscillator };
}

export function playCue(cue: Cue): void {
  if (!useSettingsStore.getState().sound) return;
  if (!context || context.state !== "running") return;
  const now = context.currentTime;
  for (const note of CUES[cue]) {
    const { source, output } = createVoice(context, note);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now + note.start);
    gain.gain.exponentialRampToValueAtTime(note.gain ?? DEFAULT_GAIN, now + note.start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);
    output.connect(gain).connect(context.destination);
    source.start(now + note.start);
    source.stop(now + note.start + note.duration + 0.02);
  }
}
