import { INK } from "../../art/glyph";

// Game icon glyph, drawn on a 48x48 grid over the game's accent colour (see art/game-badge.tsx).
export const MIND_ACCENT = "#8aa6ff";

export function MindMatchGlyph() {
  return (
    <>
      <circle cx="17.5" cy="24" r="11.5" fill={INK} />
      <circle cx="30.5" cy="24" r="11.5" fill={INK} opacity="0.6" />
      <path d="M24 15 L25.6 21.4 L32 23 L25.6 24.6 L24 31 L22.4 24.6 L16 23 L22.4 21.4 Z" fill="#fff8d6" />
    </>
  );
}
