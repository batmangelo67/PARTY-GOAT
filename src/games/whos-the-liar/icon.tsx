import { INK } from "../../art/glyph";

// Game icon glyph, drawn on a 48x48 grid over the game's accent colour (see art/game-badge.tsx).
export const LIAR_ACCENT = "#ffb23d";

export function WhosTheLiarGlyph() {
  return (
    <>
      <path d="M9 10 H39 A4 4 0 0 1 43 14 V29 A4 4 0 0 1 39 33 H22 L13 40 V33 H9 A4 4 0 0 1 5 29 V14 A4 4 0 0 1 9 10 Z" fill={INK} />
      <path d="M12 22 L17 17 L22 23 L27 17 L32 23 L36 18" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}
