// Original placeholder art: a round bomb with a curled fuse and a spark.
export function BombVisual({ beatMs, active }: { beatMs: number; active: boolean }) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-hidden
      className={`h-40 w-40 ${active ? "beat" : ""}`}
      style={active ? { animationDuration: `${beatMs}ms` } : undefined}
    >
      <path d="M78 34 C 86 18, 98 22, 102 12" fill="none" stroke="#a29cb0" strokeWidth="5" strokeLinecap="round" />
      <rect x="66" y="30" width="18" height="14" rx="3" transform="rotate(35 75 37)" fill="#353042" />
      <circle cx="56" cy="70" r="38" fill="#25212f" stroke="#353042" strokeWidth="4" />
      <ellipse cx="42" cy="56" rx="10" ry="6" transform="rotate(-35 42 56)" fill="#f4f1ea" opacity="0.25" />
      <circle cx="103" cy="11" r={active ? 8 : 5} fill={active ? "#ff5d55" : "#a29cb0"} />
      {active && <circle cx="103" cy="11" r="4" fill="#d7ff3e" />}
    </svg>
  );
}
