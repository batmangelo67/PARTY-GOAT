import { useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router";
import { useT } from "../i18n/use-t";
import { setSettled } from "./game-session";
import { GameBadge } from "../art/game-badge";
import { useGameIdentity, useInGame } from "./in-game-context";

interface ScreenProps {
  title?: ReactNode;
  // Back as a history step (for screens opened from another screen), instead of a link to `backTo`.
  onBack?: () => void;
  // A result screen inside a game: leaving from it loses nothing, so no confirm.
  settled?: boolean;
  backTo?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

const BACK_CLASS = "-ml-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl text-muted active:bg-raised";

export function Screen({ title, backTo, onBack, footer, settled = false, children, className = "" }: ScreenProps) {
  const t = useT();
  const inGame = useInGame();
  const identity = useGameIdentity();
  useEffect(() => {
    if (!settled) return;
    setSettled(true);
    return () => setSettled(false);
  }, [settled]);
  const hasHeader = Boolean(title || backTo || onBack || inGame);
  return (
    <div className={`confetti-bg flex h-[100dvh] flex-col bg-ink ${className}`}>
      {hasHeader && (
        <header className="pt-safe px-safe flex min-h-[4.5rem] items-center gap-2 pb-2">
          {inGame ? (
            <button type="button" data-exit-ui="" aria-label={t("game.exit")} onClick={inGame.requestExit} className={BACK_CLASS}>
              ✕
            </button>
          ) : onBack ? (
            <button type="button" aria-label={t("common.back")} onClick={onBack} className={BACK_CLASS}>
              ←
            </button>
          ) : (
            backTo && (
              <Link to={backTo} aria-label={t("common.back")} className={BACK_CLASS}>
                ←
              </Link>
            )
          )}
          {identity && <GameBadge game={identity} size={32} />}
          <h1 className="truncate text-2xl font-black tracking-tight">{title}</h1>
        </header>
      )}
      <main className={`fade-in px-safe flex-1 overflow-y-auto overscroll-contain pb-6 ${hasHeader ? "" : "pt-safe"}`}>{children}</main>
      {footer && <footer className="px-safe pb-safe border-t border-line/60 bg-ink/90 pt-3 backdrop-blur">{footer}</footer>}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

// Chunky buttons: a dark bottom edge that the button sinks into when pressed.
const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink shadow-press active:translate-y-[3px] active:shadow-none",
  secondary: "bg-raised text-text shadow-press-sm active:translate-y-[2px] active:shadow-none active:bg-line",
  ghost: "bg-transparent text-muted active:bg-raised",
  danger: "bg-danger text-ink shadow-press active:translate-y-[3px] active:shadow-none",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`min-h-tap w-full rounded-2xl px-5 text-lg font-extrabold transition-[transform,box-shadow,filter] duration-75 disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function Section({ title, aside, children }: { title: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">{title}</h2>
        {aside && <span className="text-sm text-muted">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-tap w-full items-center justify-between gap-4 rounded-2xl bg-panel px-4 py-3 text-left active:bg-raised"
    >
      <span className="font-semibold">{label}</span>
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition ${checked ? "bg-accent" : "bg-line"}`}>
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-text transition-all ${checked ? "left-7 bg-accent-ink" : "left-1"}`}
        />
      </span>
    </button>
  );
}

interface SegmentedProps<T extends string | number> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function Segmented<T extends string | number>({ options, value, onChange, ariaLabel }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex gap-1 rounded-2xl bg-panel p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={`min-h-12 flex-1 rounded-xl px-2 text-base font-bold transition ${
            option.value === value ? "bg-accent text-accent-ink" : "text-muted active:bg-raised"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}

export function Stepper({ value, min, max, onChange, label }: StepperProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-panel p-1">
      <button
        type="button"
        aria-label={`${label} −`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="h-12 w-14 rounded-xl text-2xl font-bold active:bg-raised disabled:opacity-30"
      >
        −
      </button>
      <span className="text-2xl font-black tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`${label} +`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="h-12 w-14 rounded-xl text-2xl font-bold active:bg-raised disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error"; children: ReactNode }) {
  const toneClass = tone === "error" ? "border-danger/50 bg-danger/10 text-danger" : "border-line bg-panel text-muted";
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-2xl border px-4 py-3 text-sm ${toneClass}`}>
      {children}
    </p>
  );
}

export function BigCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pop-in flex flex-col items-center justify-center rounded-card bg-panel px-6 py-10 text-center shadow-card ring-1 ring-white/5 ${className}`}>
      {children}
    </div>
  );
}

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  role?: "radio";
}

// A pill toggle for filters; chips wrap or scroll instead of squeezing like a segmented control.
export function Chip({ label, active, onClick, role }: ChipProps) {
  return (
    <button
      type="button"
      role={role}
      aria-pressed={role ? undefined : active}
      aria-checked={role ? active : undefined}
      onClick={onClick}
      className={`min-h-11 min-w-11 shrink-0 rounded-full px-4 text-sm font-bold transition ${active ? "bg-text text-ink" : "bg-panel text-muted active:bg-raised"}`}
    >
      {label}
    </button>
  );
}

interface ChipGroupProps<T extends string | number> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function ChipGroup<T extends string | number>({ options, value, onChange, ariaLabel }: ChipGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Chip key={option.value} role="radio" label={option.label} active={option.value === value} onClick={() => onChange(option.value)} />
      ))}
    </div>
  );
}
