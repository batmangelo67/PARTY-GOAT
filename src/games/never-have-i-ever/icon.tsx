import { INK } from "../../art/glyph";

// Game icon glyph, drawn on a 48x48 grid over the game's accent colour (see art/game-badge.tsx).
export const NHIE_ACCENT = "#ff8fd0";

export function NeverHaveIEverGlyph() {
  return (
    <>
      <path d="M13 27 V13.5 A3 3 0 0 1 19 13.5 V24 V9.5 A3 3 0 0 1 25 9.5 V24 V12 A3 3 0 0 1 31 12 V26 L33.5 22.5 A3 3 0 0 1 38.5 25.5 L32 36 C30 39.5 27 41 23.5 41 H22 C17 41 13 37 13 32 Z" fill={INK} />
      <path d="M19 30 Q22 33 26 30" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
    </>
  );
}
