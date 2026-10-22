// Shared drawing constants for the game glyphs: ink strokes on a 48x48 grid.
export const INK = "#0e0c13";

export const LINE = {
  fill: "none",
  stroke: INK,
  strokeWidth: 3.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;
