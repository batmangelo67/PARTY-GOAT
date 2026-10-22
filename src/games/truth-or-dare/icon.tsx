import { INK } from "../../art/glyph";

// Game icon glyph, drawn on a 48x48 grid over the game's accent colour (see art/game-badge.tsx).
export const TOD_ACCENT = "#ff5c7a";

export function TruthOrDareGlyph() {
  return (
    <>
      <rect x="9" y="6" width="30" height="36" rx="6" fill={INK} />
      <path d="M12.5 38.5 L35.5 9.5" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M14 13.5 H23 M18.5 13.5 V23" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" />
      <path d="M30.5 38 C26.5 38 24.5 35 25.5 32 C26.5 29 29.5 28 28.5 24 C32 26 35 29 35 33 C35 36 33 38 30.5 38 Z" fill="currentColor" />
    </>
  );
}
