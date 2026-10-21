import { INK, LINE } from "../../art/glyph";

// Game icon glyph, drawn on a 48x48 grid over the game's accent colour (see art/game-badge.tsx).
export const BOMB_ACCENT = "#ff6a3d";

export function BombGlyph() {
  return (
    <>
      <circle cx="21" cy="28" r="13.5" fill={INK} />
      <rect x="25" y="13" width="8" height="6" rx="1.5" fill={INK} transform="rotate(40 29 16)" />
      <path d="M31 13 Q34 6 41 8" {...LINE} />
      <path d="M41 3 L42.4 6.6 L46 8 L42.4 9.4 L41 13 L39.6 9.4 L36 8 L39.6 6.6 Z" fill="#fff8d6" />
      <path d="M13.5 25 A8.5 8.5 0 0 1 19 19.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </>
  );
}
