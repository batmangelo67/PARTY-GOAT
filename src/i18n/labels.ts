import type { MessageKey } from "./en";

const SPICE_KEYS = ["spice.0", "spice.1", "spice.2", "spice.3"] as const satisfies readonly MessageKey[];

export function spiceKey(level: number): MessageKey {
  return SPICE_KEYS[Math.min(Math.max(level, 0), SPICE_KEYS.length - 1)]!;
}

export const SPICE_LEVELS = [0, 1, 2, 3] as const;
