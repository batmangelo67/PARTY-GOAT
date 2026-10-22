import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { MIN_PLAYERS } from "../app/constants";
import type { Pack } from "../content/schema";
import { useT } from "../i18n/use-t";
import { PlayerEditor } from "./player-editor";
import { usePlayersStore } from "./players-store";
import { StartFooter } from "./setup-fields";
import { Screen, Section } from "./ui";

const PACK_TITLES_SHOWN = 3;

// The roster as one compact row once enough players are in; the full editor only when needed.
export function SetupPlayers({ min = MIN_PLAYERS, hint }: { min?: number; hint?: ReactNode }) {
  const t = useT();
  const players = usePlayersStore((state) => state.players);
  const [editing, setEditing] = useState(players.length < min);
  const toggle =
    players.length >= min ? (
      <button type="button" onClick={() => setEditing(!editing)} className="-my-2 min-h-11 rounded-full px-3 font-bold text-accent active:bg-raised">
        {editing ? t("setup.done") : t("setup.editPlayers")}
      </button>
    ) : undefined;

  return (
    <Section title={t("setup.players")} aside={toggle}>
      {editing ? (
        <PlayerEditor />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={t("setup.editPlayers")}
          className="flex min-h-tap w-full flex-wrap items-center gap-2 rounded-2xl bg-panel px-3 py-3 text-left active:bg-raised"
        >
          {players.map((player) => (
            <span key={player.id} data-player-name="" className="rounded-full bg-raised px-3 py-1 font-bold">
              {player.name}
            </span>
          ))}
        </button>
      )}
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
    </Section>
  );
}

// One row that says what the game will draw from; the picker is a tap away.
export function PackSummary({ gameId, packs, isMix }: { gameId: string; packs: readonly Pack[]; isMix: boolean }) {
  const t = useT();
  const titles = packs.slice(0, PACK_TITLES_SHOWN).map((pack) => pack.title);
  const extra = packs.length - titles.length;
  return (
    <Section title={t("picker.title")}>
      <Link
        to={`/play/${gameId}/packs`}
        className="flex min-h-tap items-center justify-between gap-3 rounded-2xl bg-panel px-4 py-3 active:bg-raised"
      >
        <span className="min-w-0">
          <span className="block font-bold">{isMix ? t("packs.mix", { count: packs.length }) : t("packs.chosen", { count: packs.length })}</span>
          <span data-ellipsis="" className="block truncate text-sm text-muted">
            {titles.join(", ")}
            {extra > 0 && ` +${extra}`}
          </span>
        </span>
        <span className="shrink-0 font-bold text-accent">{t("packs.change")} ›</span>
      </Link>
    </Section>
  );
}

// Options that rarely matter stay folded until someone asks for them.
export function MoreOptions({ children }: { children: ReactNode }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-tap w-full items-center justify-between rounded-2xl border border-line px-4 font-bold text-muted active:bg-raised"
      >
        {open ? t("setup.fewer") : t("setup.more")}
        <span aria-hidden className={`transition ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {open && <div className="fade-in">{children}</div>}
    </div>
  );
}

interface SetupLayoutProps {
  title: string;
  gameId: string;
  problems: string[];
  packs: readonly Pack[];
  isMix: boolean;
  onBeforeStart?: () => void;
  players?: ReactNode;
  more?: ReactNode;
  children?: ReactNode;
}

// Shared setup screen: players, packs, the one or two options that matter, everything else folded.
export function SetupLayout({ title, gameId, problems, packs, isMix, onBeforeStart, players, more, children }: SetupLayoutProps) {
  return (
    <Screen
      title={title}
      backTo="/"
      footer={<StartFooter problems={problems} packIds={packs.map((pack) => pack.id)} onBeforeStart={onBeforeStart} />}
    >
      {players}
      <PackSummary gameId={gameId} packs={packs} isMix={isMix} />
      {children}
      {more && <MoreOptions>{more}</MoreOptions>}
    </Screen>
  );
}
