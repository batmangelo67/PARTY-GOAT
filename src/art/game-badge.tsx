import type { CSSProperties } from "react";
import type { GameDefinition } from "../games/types";

interface GameBadgeProps {
  game: Pick<GameDefinition, "Glyph" | "accent">;
  size?: number;
  className?: string;
}

// A game's icon: its glyph on a rounded tile in the game's accent colour.
export function GameBadge({ game, size = 56, className = "" }: GameBadgeProps) {
  const style: CSSProperties = { color: game.accent, width: size, height: size };
  return (
    <span className={`inline-flex shrink-0 ${className}`} style={style} aria-hidden>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <rect x="0" y="0" width="48" height="48" rx="14" fill="currentColor" />
        <path d="M6 10 Q14 4 24 4" stroke="#fff" strokeOpacity="0.35" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <game.Glyph />
      </svg>
    </span>
  );
}
