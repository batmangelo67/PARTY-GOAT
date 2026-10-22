import { Link } from "react-router";
import { GameBadge } from "../art/game-badge";
import { useSelectedPacks } from "../content/use-selected-packs";
import { usePlayLogStore } from "../engine/play-log-store";
import { usePlayersStore } from "../engine/players-store";
import type { GameDefinition } from "../games/types";
import { findGame } from "../games/registry";
import { useT } from "../i18n/use-t";
import { QUICK_START_PARAM } from "./constants";

function PlayAgainLink({ game }: { game: GameDefinition }) {
  const t = useT();
  const playerCount = usePlayersStore((state) => state.players.length);
  const packIds = game.packs.usePackIds();
  const packs = useSelectedPacks(game.id, game.acceptsKinds[0]!, packIds);
  return (
    <Link
      to={`/play/${game.id}/setup?${QUICK_START_PARAM}=1`}
      className="pop-in flex min-h-24 items-center gap-4 rounded-card bg-accent px-5 py-4 text-accent-ink active:brightness-90"
    >
      <GameBadge game={game} size={56} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold uppercase tracking-widest opacity-70">{t("home.playAgain")}</span>
        <span className="block truncate text-2xl font-black leading-tight">{t(game.nameKey)}</span>
        <span className="block truncate text-sm font-semibold opacity-80">
          {t("home.quickSummary", { players: playerCount, packs: packIds === null ? t("packs.mix", { count: packs.length }) : t("packs.chosen", { count: packs.length }) })}
        </span>
      </span>
      <span aria-hidden className="text-4xl font-black">
        ▶
      </span>
    </Link>
  );
}

// The last game played, one tap from home with the same players, packs and options.
export function PlayAgainCard() {
  const lastGameId = usePlayLogStore((state) => state.log.games[0]);
  const game = findGame(lastGameId);
  return game ? <PlayAgainLink game={game} /> : null;
}
