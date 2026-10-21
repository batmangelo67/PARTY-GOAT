import { INK, LINE } from "../../art/glyph";

// Game icon glyph, drawn on a 48x48 grid over the game's accent colour (see art/game-badge.tsx).
export const IMPOSTOR_ACCENT = "#c08bff";

export function ImpostorGlyph() {
  return (
    <>
      <path d="M4 18 L9 20 M44 18 L39 20" {...LINE} />
      <path d="M8 20 C8 14 15 12 24 15.5 C33 12 40 14 40 20 C40 29.5 33 33.5 27 30.5 C25.4 29.7 22.6 29.7 21 30.5 C15 33.5 8 29.5 8 20 Z" fill={INK} />
      <ellipse cx="16.5" cy="22" rx="4.2" ry="3" fill="currentColor" />
      <ellipse cx="31.5" cy="22" rx="4.2" ry="3" fill="currentColor" />
      <path d="M21 38 Q24 35.5 27 38" {...LINE} />
    </>
  );
}
