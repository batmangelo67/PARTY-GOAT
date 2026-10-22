import { useEffect, useRef } from "react";
import { randomInt } from "../engine/random";

const PIECES = 70;
const DURATION_MS = 1400;
const GRAVITY = 0.0016;
const COLORS = ["#d7ff3e", "#ff8fd0", "#5cc8ff", "#ffd447", "#c08bff", "#3ee0a6"];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  angle: number;
  color: string;
  w: number;
  h: number;
}

function unit(): number {
  return randomInt(10_000) / 10_000;
}

function launch(width: number, height: number, colors: readonly string[]): Piece[] {
  return Array.from({ length: PIECES }, () => ({
    x: width / 2 + (unit() - 0.5) * width * 0.3,
    y: height * 0.35,
    vx: (unit() - 0.5) * 0.9,
    vy: -0.45 - unit() * 0.55,
    spin: (unit() - 0.5) * 0.02,
    angle: unit() * Math.PI,
    color: colors[randomInt(colors.length)]!,
    w: 6 + unit() * 6,
    h: 4 + unit() * 4,
  }));
}

function reducedMotion(): boolean {
  return document.documentElement.dataset.motion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// A one-shot confetti burst on a canvas over the screen. Never blocks taps, never loops,
// and does nothing when motion is reduced.
export function ConfettiBurst({ colors = COLORS }: { colors?: readonly string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || reducedMotion()) return;
    const ratio = window.devicePixelRatio || 1;
    const { innerWidth: width, innerHeight: height } = window;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);
    const pieces = launch(width, height, colors);
    const start = performance.now();
    let last = start;
    let frame = 0;

    const draw = (now: number) => {
      const dt = Math.min(now - last, 40);
      last = now;
      const fade = Math.max(0, 1 - (now - start) / DURATION_MS);
      context.clearRect(0, 0, width, height);
      context.globalAlpha = fade;
      for (const piece of pieces) {
        piece.vy += GRAVITY * dt;
        piece.x += piece.vx * dt;
        piece.y += piece.vy * dt;
        piece.angle += piece.spin * dt;
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.angle);
        context.fillStyle = piece.color;
        context.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
        context.restore();
      }
      if (fade > 0) frame = requestAnimationFrame(draw);
      else context.clearRect(0, 0, width, height);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [colors]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-30 h-full w-full" />;
}
