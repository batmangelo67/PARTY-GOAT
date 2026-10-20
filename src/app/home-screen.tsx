import { Link } from "react-router";
import { useT } from "../i18n/use-t";
import { GAMES } from "../games/registry";
import { usePlayersStore } from "../engine/players-store";
import { Screen } from "../engine/ui";
import { APP_NAME } from "./constants";

export function HomeScreen() {
  const t = useT();
  const playerCount = usePlayersStore((state) => state.players.length);
  return (
    <Screen>
      <div className="pt-6">
        <h1 className="text-5xl font-black leading-none tracking-tighter text-accent">{APP_NAME}</h1>
        <p className="mt-2 text-lg text-muted">{t("home.tagline")}</p>
      </div>
      <nav className="mt-8 grid grid-cols-2 gap-3">
        {GAMES.map((game, index) => (
          <Link
            key={game.id}
            style={{ animationDelay: `${index * 50}ms` }}
            to={`/play/${game.id}/setup`}
            className="pop-in flex min-h-44 flex-col justify-between rounded-card bg-panel p-4 active:scale-[0.98] active:bg-raised"
          >
            <span className="text-4xl" aria-hidden>
              {game.icon}
            </span>
            <span>
              <span className="block text-xl font-black leading-tight">{t(game.nameKey)}</span>
              <span className="mt-1 line-clamp-3 block text-sm text-muted">{t(game.descriptionKey)}</span>
            </span>
          </Link>
        ))}
      </nav>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link to="/players" className="col-span-2 flex min-h-tap flex-col justify-center rounded-2xl bg-panel px-4 py-3 active:bg-raised">
          <span className="font-bold">{t("home.players")}</span>
          <span className="text-sm text-muted">
            {playerCount > 0 ? t("home.playersSummary", { count: playerCount }) : t("home.noPlayers")}
          </span>
        </Link>
        <Link to="/packs" className="flex min-h-tap items-center justify-center rounded-2xl bg-panel px-3 font-bold active:bg-raised">
          {t("home.packs")}
        </Link>
        <Link to="/settings" className="flex min-h-tap items-center justify-center rounded-2xl bg-panel px-3 text-center font-bold active:bg-raised">
          {t("home.settings")}
        </Link>
      </div>
    </Screen>
  );
}
