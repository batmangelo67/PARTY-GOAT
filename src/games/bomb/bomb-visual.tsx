// The bomb, drawn in the game's colour. Its beat speeds up with the fuse.
export function BombVisual({ beatMs, active }: { beatMs: number; active: boolean }) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-hidden
      className={`h-[min(10rem,20dvh)] w-[min(10rem,20dvh)] ${active ? "beat" : ""}`}
      style={active ? { animationDuration: `${beatMs}ms` } : undefined}
    >
      <path d="M78 34 C 86 18, 98 22, 102 12" fill="none" className="stroke-muted" strokeWidth="5" strokeLinecap="round" />
      <rect x="66" y="30" width="18" height="14" rx="3" transform="rotate(35 75 37)" className="fill-line" />
      <circle cx="56" cy="70" r="38" className="fill-raised stroke-game" strokeWidth="5" />
      <path d="M33 62 A24 24 0 0 1 48 43" fill="none" stroke="#f4f1ea" strokeOpacity="0.35" strokeWidth="6" strokeLinecap="round" />
      {active ? (
        <path d="M103 1 L106 8 L113 11 L106 14 L103 21 L100 14 L93 11 L100 8 Z" fill="#fff3b0" className="pulse-warning" />
      ) : (
        <circle cx="103" cy="11" r="5" className="fill-muted" />
      )}
    </svg>
  );
}
