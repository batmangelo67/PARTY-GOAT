// Shape data for the PARTY GOAT mascot (120x120 grid). Shared by the React component and the
// app icon generator so the character is drawn from one source.
export const GOAT_COLORS = {
  ink: "#0e0c13",
  fur: "#f6efe2",
  furShade: "#e6d8c1",
  horn: "#d9c7a6",
  blush: "#ff8fb8",
  hat: "#d7ff3e",
} as const;

export const GOAT_SHAPES = {
  hornLeft: "M47 34 C40 16 26 10 15 17 C27 17 35 24 39 38 Z",
  hornRight: "M73 34 C80 16 94 10 105 17 C93 17 85 24 81 38 Z",
  beard: "M54 92 C55 101 57 107 60 113 C63 107 65 101 66 92 Z",
  head: "M60 27 C80 27 88 41 86 58 C84 76 76 92 60 96 C44 92 36 76 34 58 C32 41 40 27 60 27 Z",
  hat: "M47 31 L73 31 L62 2 Z",
  hatStripes: "M51 22 L69 25 M55 13 L66 15.5",
  smile: "M53 86 Q60 92 67 86",
} as const;

// Ellipses as [cx, cy, rx, ry, rotation].
export const GOAT_EARS = {
  left: [25, 52, 15, 7, -18],
  right: [95, 52, 15, 7, 18],
  innerLeft: [24, 52, 8.5, 3, -18],
  innerRight: [96, 52, 8.5, 3, 18],
} as const;
