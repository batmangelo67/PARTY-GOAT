import type { ComponentType, CSSProperties, ReactNode } from "react";
import { GameIdentityContext } from "../engine/in-game-context";

// "#ff6a3d" -> "255 106 61", the channel format Tailwind's `game` colour reads from --game.
export function hexToChannels(hex: string): string {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? [...value].map((c) => c + c).join("") : value;
  const number = Number.parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(number)) return "215 255 62";
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255].join(" ");
}

// Paints everything inside with the game's colour (`text-game`, `bg-game/15`, the background glow)
// and tells Screen which game badge to show in the header.
export function GameTheme({ game, children }: { game: { accent: string; Glyph: ComponentType }; children: ReactNode }) {
  const style = { "--game": hexToChannels(game.accent) } as CSSProperties;
  return (
    <GameIdentityContext.Provider value={game}>
      <div className="contents" style={style}>
        {children}
      </div>
    </GameIdentityContext.Provider>
  );
}
