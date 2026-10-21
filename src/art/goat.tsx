import type { ReactNode } from "react";
import { GOAT_COLORS, GOAT_EARS, GOAT_SHAPES } from "./goat-paths";

// The PARTY GOAT mascot, drawn in code. One head, a party hat that follows the theme accent,
// and a handful of moods. Keep every mood on the same skeleton so the character stays recognisable.

export type GoatMood = "happy" | "wink" | "shock" | "party" | "sleepy" | "sly";

const { ink: INK, fur: FUR, furShade: FUR_SHADE, horn: HORN, blush: BLUSH } = GOAT_COLORS;

const STROKE = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const LINE = { ...STROKE, fill: "none" };

function Eyes({ mood }: { mood: GoatMood }) {
  switch (mood) {
    case "wink":
      return (
        <>
          <ellipse cx="49" cy="56" rx="4.2" ry="5.2" fill={INK} />
          <circle cx="50.6" cy="54" r="1.5" fill="#fff" />
          <path d="M66 57 Q71 52 76 57" {...LINE} />
        </>
      );
    case "shock":
      return (
        <>
          <circle cx="48" cy="55" r="7.5" fill="#fff" {...STROKE} />
          <circle cx="72" cy="55" r="7.5" fill="#fff" {...STROKE} />
          <circle cx="48" cy="56" r="2.6" fill={INK} />
          <circle cx="72" cy="56" r="2.6" fill={INK} />
        </>
      );
    case "party":
      return (
        <>
          <path d="M44 58 Q49 50 54 58" {...LINE} strokeWidth={3} />
          <path d="M66 58 Q71 50 76 58" {...LINE} strokeWidth={3} />
        </>
      );
    case "sleepy":
      return (
        <>
          <path d="M44 57 Q49 61 54 57" {...LINE} />
          <path d="M66 57 Q71 61 76 57" {...LINE} />
        </>
      );
    case "sly":
      return (
        <>
          <path d="M43 52 L54 54.5" {...LINE} />
          <path d="M77 52 L66 54.5" {...LINE} />
          <ellipse cx="50" cy="58.5" rx="4.2" ry="2.6" fill={INK} />
          <ellipse cx="72" cy="58.5" rx="4.2" ry="2.6" fill={INK} />
        </>
      );
    default:
      return (
        <>
          <ellipse cx="49" cy="56" rx="4.2" ry="5.2" fill={INK} />
          <ellipse cx="71" cy="56" rx="4.2" ry="5.2" fill={INK} />
          <circle cx="50.6" cy="54" r="1.5" fill="#fff" />
          <circle cx="72.6" cy="54" r="1.5" fill="#fff" />
        </>
      );
  }
}

function Mouth({ mood }: { mood: GoatMood }) {
  switch (mood) {
    case "shock":
      return <ellipse cx="60" cy="88" rx="4" ry="5" fill={INK} />;
    case "party":
      return (
        <>
          <path d="M51 85 Q60 97 69 85 Z" fill={INK} {...STROKE} />
          <path d="M55.5 89.5 Q60 94 64.5 89.5 Q60 87.5 55.5 89.5 Z" fill={BLUSH} />
        </>
      );
    case "wink":
    case "sly":
      return <path d="M53 87 Q61 91 68 84" {...LINE} />;
    case "sleepy":
      return <ellipse cx="60" cy="88" rx="2.6" ry="2" fill={INK} />;
    default:
      return <path d={GOAT_SHAPES.smile} {...LINE} />;
  }
}

function Ellipse({ shape, fill, stroked = false }: { shape: readonly [number, number, number, number, number]; fill: string; stroked?: boolean }) {
  const [cx, cy, rx, ry, rotation] = shape;
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} transform={`rotate(${rotation} ${cx} ${cy})`} {...(stroked ? STROKE : {})} />;
}

function Extras({ mood }: { mood: GoatMood }) {
  if (mood === "sleepy") {
    return (
      <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M92 30 h8 l-8 9 h8" />
        <path d="M104 14 h6 l-6 7 h6" />
      </g>
    );
  }
  if (mood === "party") {
    return (
      <g>
        <rect x="8" y="22" width="5" height="9" rx="1.5" fill="currentColor" transform="rotate(-25 10 26)" />
        <rect x="104" y="40" width="5" height="9" rx="1.5" fill={BLUSH} transform="rotate(30 106 44)" />
        <circle cx="16" cy="72" r="3" fill="#7fd7ff" />
        <circle cx="106" cy="76" r="2.6" fill="currentColor" />
        <path d="M100 10 l3 6 l6 1 l-5 4 l1 6 l-5 -3 l-5 3 l1 -6 l-5 -4 l6 -1 Z" fill="#ffd34d" />
      </g>
    );
  }
  if (mood === "shock") {
    return (
      <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M14 40 l8 4" />
        <path d="M10 54 h9" />
        <path d="M106 40 l-8 4" />
        <path d="M110 54 h-9" />
      </g>
    );
  }
  return null;
}

interface GoatProps {
  mood?: GoatMood;
  size?: number | string;
  className?: string;
  title?: string;
  hat?: boolean;
}

// `color` (currentColor) paints the party hat and accents, so the mascot follows the theme.
export function Goat({ mood = "happy", size = 96, className = "", title, hat = true }: GoatProps) {
  const hatTilt = mood === "shock" ? 28 : mood === "sleepy" ? -18 : 12;
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <Extras mood={mood} />
      <path d={GOAT_SHAPES.hornLeft} fill={HORN} {...STROKE} />
      <path d={GOAT_SHAPES.hornRight} fill={HORN} {...STROKE} />
      <Ellipse shape={GOAT_EARS.left} fill={FUR} stroked />
      <Ellipse shape={GOAT_EARS.right} fill={FUR} stroked />
      <Ellipse shape={GOAT_EARS.innerLeft} fill={BLUSH} />
      <Ellipse shape={GOAT_EARS.innerRight} fill={BLUSH} />
      <path d={GOAT_SHAPES.beard} fill={FUR_SHADE} {...STROKE} />
      <path d={GOAT_SHAPES.head} fill={FUR} {...STROKE} />
      <ellipse cx="60" cy="81" rx="17" ry="13" fill={FUR_SHADE} />
      <ellipse cx="54.5" cy="77" rx="2.2" ry="1.5" fill={INK} />
      <ellipse cx="65.5" cy="77" rx="2.2" ry="1.5" fill={INK} />
      <ellipse cx="41" cy="68" rx="5" ry="3" fill={BLUSH} opacity="0.55" />
      <ellipse cx="79" cy="68" rx="5" ry="3" fill={BLUSH} opacity="0.55" />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      {hat && (
        <g transform={`rotate(${hatTilt} 60 31)`}>
          <path d={GOAT_SHAPES.hat} fill="currentColor" {...STROKE} />
          <path d={GOAT_SHAPES.hatStripes} stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.45" />
          <circle cx="62" cy="3" r="4.5" fill="#fff" {...STROKE} />
        </g>
      )}
    </svg>
  );
}

// The goat peeking up from the bottom edge of a card, for empty and waiting states.
export function PeekingGoat({ mood = "happy", children }: { mood?: GoatMood; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Goat mood={mood} size={88} className="text-accent" />
      {children}
    </div>
  );
}
