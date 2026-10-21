import { INK, LINE } from "../../art/glyph";

// Game icon glyph, drawn on a 48x48 grid over the game's accent colour (see art/game-badge.tsx).
export const CIRCA_ACCENT = "#35d6cf";

export function CircaGlyph() {
  return (
    <>
      <path d="M7 31 A17 17 0 0 1 41 31" fill="none" stroke={INK} strokeWidth={4.2} strokeLinecap="round" />
      <path d="M12 21 L14.5 23 M24 14 V17 M36 21 L33.5 23" {...LINE} />
      <path d="M24 31 L32.5 19" {...LINE} strokeWidth={3.6} />
      <circle cx="24" cy="31" r="3.6" fill={INK} />
      <path d="M15 40 Q19.5 37 24 40 Q28.5 43 33 40" {...LINE} />
    </>
  );
}
