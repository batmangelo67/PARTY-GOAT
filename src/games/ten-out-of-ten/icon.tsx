import { INK, LINE } from "../../art/glyph";

// Game icon glyph, drawn on a 48x48 grid over the game's accent colour (see art/game-badge.tsx).
export const TEN_ACCENT = "#ffd447";

export function TenOutOfTenGlyph() {
  return (
    <>
      <path d="M9 15 L15 10.5 V38" {...LINE} strokeWidth={4.6} />
      <ellipse cx="30.5" cy="24.5" rx="8.5" ry="13" fill="none" stroke={INK} strokeWidth={4.6} />
      <path d="M38 6 L39.2 9.6 L43 9.6 L40 12 L41 15.6 L38 13.4 L35 15.6 L36 12 L33 9.6 L36.8 9.6 Z" fill={INK} />
    </>
  );
}
