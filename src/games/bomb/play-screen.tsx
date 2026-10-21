import { useRef, useState, type ButtonHTMLAttributes } from "react";
import { Navigate } from "react-router";
import { MIN_PLAYERS } from "../../app/constants";
import { useSelectedPacks } from "../../content/use-selected-packs";
import { usePlayersStore } from "../../engine/players-store";
import { randomInt } from "../../engine/random";
import { ScoreList } from "../../engine/score-list";
import { playCue, unlockAudio } from "../../engine/sound";
import { Button, Screen, Section } from "../../engine/ui";
import { useLeaveGame } from "../../engine/use-leave-game";
import { useT } from "../../i18n/use-t";
import { BombVisual } from "./bomb-visual";
import { useBombConfig } from "./config-store";
import { BOMB_ID } from "./constants";
import { useExplosionsStore } from "./explosions-store";
import { explosionRanking, passBomb, pickCategory, rollFuseMs, startHolder, undoPass, type Fuse, type HolderState } from "./logic";
import { useFuse } from "./use-fuse";

type Phase = "ready" | "running" | "exploded" | "over";

function BigActionButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`w-full rounded-3xl bg-accent font-black tracking-tight text-accent-ink transition active:scale-[0.98] active:brightness-90 ${className}`}
      {...props}
    />
  );
}

const SETUP_PATH = `/play/${BOMB_ID}/setup`;

export function BombPlayScreen() {
  const t = useT();
  const leave = useLeaveGame();
  const players = usePlayersStore((state) => state.players);
  const config = useBombConfig();
  const packs = useSelectedPacks(BOMB_ID, "words", config.packIds);
  const { explosions, addExplosion, resetExplosions } = useExplosionsStore();
  const valid = players.length >= MIN_PLAYERS && packs.length > 0;

  const [phase, setPhase] = useState<Phase>("ready");
  const [category, setCategory] = useState(() => (packs.length > 0 ? pickCategory(packs) : null));
  const [holder, setHolder] = useState<HolderState>(() => startHolder(randomInt(Math.max(players.length, 1))));
  const [fuse, setFuse] = useState<Fuse | null>(null);
  const [loserId, setLoserId] = useState("");
  const holderRef = useRef(holder);
  holderRef.current = holder;

  const explode = () => {
    const loser = players[holderRef.current.index];
    setFuse(null);
    setPhase("exploded");
    playCue("boom");
    if (loser) {
      setLoserId(loser.id);
      addExplosion(loser.id);
    }
  };
  const tickMs = useFuse(fuse, explode);

  if (!valid || !category) return <Navigate to={SETUP_PATH} replace />;

  const holderName = players[holder.index]?.name ?? "?";
  const skipCategory = () => setCategory(pickCategory(packs, category.packId));

  const lightFuse = () => {
    unlockAudio();
    setFuse({ startedAt: performance.now(), durationMs: rollFuseMs(config.fuseLength) });
    setPhase("running");
  };

  const nextRound = () => {
    const loserIndex = players.findIndex((p) => p.id === loserId);
    setHolder(startHolder(Math.max(loserIndex, 0)));
    if (config.categoryMode === "eachRound") skipCategory();
    setPhase("ready");
  };

  const newGame = () => {
    resetExplosions();
    setHolder(startHolder(randomInt(players.length)));
    skipCategory();
    setPhase("ready");
  };

  const ranking = explosionRanking(players, explosions);
  const rankingList = (
    <ScoreList
      rows={ranking.map((row) => ({
        id: row.id,
        name: row.name,
        rank: ranking.findIndex((r) => r.explosions === row.explosions) + 1,
        value: `💥 ${row.explosions}`,
      }))}
    />
  );

  const categoryBlock = (
    <div className="text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-muted">{t("bomb.play.category")}</p>
      <p className="mt-1 break-words text-5xl font-black leading-tight tracking-tight text-accent">{category.title}</p>
      {config.showExample && <p className="mt-2 text-lg text-muted">{t("bomb.play.example", { word: category.example })}</p>}
    </div>
  );

  if (phase === "ready") {
    return (
      <Screen
        footer={
          <div className="flex flex-col gap-2">
            <BigActionButton className="min-h-20 text-3xl" onClick={lightFuse}>
              {t("bomb.play.light")}
            </BigActionButton>
            <Button variant="ghost" onClick={skipCategory}>
              {t("bomb.play.skip")}
            </Button>
          </div>
        }
      >
        <div className="flex min-h-full flex-col items-center justify-center gap-6 py-6">
          {categoryBlock}
          <BombVisual beatMs={tickMs} active={false} />
          <p className="text-2xl font-black">{t("bomb.play.starts", { name: holderName })}</p>
          <p className="text-center text-muted">{t("bomb.play.help")}</p>
        </div>
      </Screen>
    );
  }

  if (phase === "running") {
    return (
      <Screen
        footer={
          <div className="flex flex-col gap-2">
            <BigActionButton className="min-h-[22dvh] text-5xl" onClick={() => setHolder(passBomb(holder, players.length))}>
              {t("bomb.play.pass")}
            </BigActionButton>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" disabled={holder.history.length === 0} onClick={() => setHolder(undoPass(holder))}>
                {t("bomb.play.undo")}
              </Button>
              <Button variant="ghost" onClick={skipCategory}>
                {t("bomb.play.skip")}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex min-h-full flex-col items-center justify-center gap-3 py-2">
          {categoryBlock}
          <p key={holder.index} className="pop-in text-center text-3xl font-black">
            {t("bomb.play.holder", { name: holderName })}
          </p>
          <BombVisual beatMs={tickMs} active />
        </div>
      </Screen>
    );
  }

  if (phase === "exploded") {
    return (
      <Screen settled
        className="flash-white"
        footer={
          <div className="flex flex-col gap-2">
            <Button onClick={nextRound}>{t("bomb.boom.next")}</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setPhase("over")}>
                {t("bomb.boom.end")}
              </Button>
              <Button variant="ghost" onClick={() => leave("setup")}>
                {t("common.backToSetup")}
              </Button>
            </div>
          </div>
        }
      >
        <h1 className="pop-in pt-10 text-center text-5xl font-black leading-tight text-danger">
          {t("bomb.boom.title", { name: players.find((p) => p.id === loserId)?.name ?? "?" })}
        </h1>
        <Section title={t("bomb.boom.scores")}>{rankingList}</Section>
      </Screen>
    );
  }

  return (
    <Screen settled
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => leave("setup")}>
            {t("common.backToSetup")}
          </Button>
          <Button onClick={newGame}>{t("common.newGame")}</Button>
        </div>
      }
    >
      <h1 className="pt-8 text-4xl font-black">{t("bomb.over.title")}</h1>
      {ranking[0] && <p className="mt-2 text-xl font-bold text-accent">{t("bomb.over.winner", { name: ranking[0].name })}</p>}
      <Section title={t("bomb.boom.scores")}>{rankingList}</Section>
    </Screen>
  );
}
