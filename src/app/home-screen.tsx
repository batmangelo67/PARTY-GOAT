import type { CSSProperties } from "react";
import { Link } from "react-router";
import { GameBadge } from "../art/game-badge";
import { hexToChannels } from "../art/game-theme";
import { Goat } from "../art/goat";
import { usePlayersStore } from "../engine/players-store";
import { Screen, Section } from "../engine/ui";
import { GAMES } from "../games/registry";
import type { GameDefinition } from "../games/types";
import { useT } from "../i18n/use-t";
import { APP_NAME } from "./constants";
import { PlayAgainCard } from "./play-again-card";

function GameTile({ game, index }: { game: GameDefinition; index: number }) {
  const t = useT();
  const style = {
    "--game": hexToChannels(game.accent),
    animationDelay: `${index * 35}ms`,
    backgroundImage: "linear-gradient(155deg, rgb(var(--game) / 0.22), transparent 58%)",
  } as CSSProperties;
  return (
    <Link
      to={`/play/${game.id}/setup`}
      style={style}
      className="pop-in flex min-h-36 flex-col gap-3 rounded-card bg-panel p-4 shadow-card ring-1 ring-white/5 transition active:scale-[0.97]"
    >
      <GameBadge game={game} size={48} />
      <span>
        <span className="block text-lg font-black leading-tight">{t(game.nameKey)}</span>
        <span className="mt-1 line-clamp-2 text-sm leading-snug text-muted">{t(game.descriptionKey)}</span>
      </span>
    </Link>
  );
}

export function HomeScreen() {
  const t = useT();
  const playerCount = usePlayersStore((state) => state.players.length);
  return (
    <Screen>
      <header className="flex items-center justify-between gap-2 pt-4">
        <div className="min-w-0">
          <h1 className="text-[2.75rem] font-black leading-[0.9] tracking-tighter text-accent">{APP_NAME}</h1>
          <p className="mt-2 text-base font-semibold text-muted">{t("home.tagline")}</p>
        </div>
        <Goat mood="happy" size={92} className="float shrink-0 text-accent" title={APP_NAME} />
      </header>
      <div className="mt-5">
        <PlayAgainCard />
      </div>
      <Section title={t("home.games")}>
        <nav className="grid grid-cols-2 gap-3">
          {GAMES.map((game, index) => (
            <GameTile key={game.id} game={game} index={index} />
          ))}
        </nav>
      </Section>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Link
          to="/players"
          className="col-span-3 flex min-h-tap items-center justify-between gap-3 rounded-2xl bg-panel px-4 py-3 shadow-card ring-1 ring-white/5 active:bg-raised"
        >
          <span className="font-bold">{t("home.players")}</span>
          <span className="text-sm text-muted">
            {playerCount > 0 ? t("home.playersSummary", { count: playerCount }) : t("home.noPlayers")}
          </span>
        </Link>
        <Link to="/packs" className="col-span-2 flex min-h-tap items-center justify-center rounded-2xl bg-panel px-3 font-bold active:bg-raised">
          {t("home.packs")}
        </Link>
        <Link to="/settings" className="flex min-h-tap items-center justify-center rounded-2xl bg-panel px-3 text-center font-bold active:bg-raised">
          {t("home.settings")}
        </Link>
      </div>
    </Screen>
  );
}
