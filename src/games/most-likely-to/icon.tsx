import { INK, LINE } from "../../art/glyph";

// Game icon glyph, drawn on a 48x48 grid over the game's accent colour (see art/game-badge.tsx).
export const MLT_ACCENT = "#5cc8ff";

export function MostLikelyToGlyph() {
  return (
    <>
      <path d="M24 5 V18 M18 13 L24 19 L30 13" {...LINE} strokeWidth={3.6} />
      <circle cx="10" cy="33" r="5" fill={INK} opacity="0.55" />
      <circle cx="38" cy="33" r="5" fill={INK} opacity="0.55" />
      <circle cx="24" cy="32" r="7.5" fill={INK} />
      <path d="M20.5 33.5 Q24 36.5 27.5 33.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
    </>
  );
}
