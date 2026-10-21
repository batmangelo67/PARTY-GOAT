import { INK, LINE } from "../../art/glyph";

// Game icon glyph, drawn on a 48x48 grid over the game's accent colour (see art/game-badge.tsx).
export const FORBIDDEN_ACCENT = "#3ee0a6";

export function ForbiddenWordsGlyph() {
  return (
    <>
      <path d="M16 20 H31 M16 27 H27" {...LINE} />
      <circle cx="24" cy="24" r="16" fill="none" stroke={INK} strokeWidth={4.2} />
      <path d="M13 13 L35 35" stroke={INK} strokeWidth={4.2} strokeLinecap="round" />
    </>
  );
}
