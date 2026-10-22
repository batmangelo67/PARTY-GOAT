import { useState } from "react";
import { Navigate } from "react-router";
import { MIN_PLAYERS } from "../../app/constants";
import { useSelectedPacks } from "../../content/use-selected-packs";
import { drawItem } from "../../engine/draw-item";
import { PassPhone } from "../../engine/pass-phone";
import { usePlayersStore } from "../../engine/players-store";
import { clampHiddenRoleCount, isCaught, scoreHiddenRoleRound } from "../../engine/roles";
import { RevealBlock, RoundResult } from "../../engine/round-result";
import { RoundStatus } from "../../engine/round-status";
import { useScoreboardStore } from "../../engine/scoreboard-store";
import { playCue } from "../../engine/sound";
import { StarterScreen } from "../../engine/starter-screen";
import { Timer } from "../../engine/timer";
import { Button, Screen } from "../../engine/ui";
import { useRoundLoader } from "../../engine/use-round-loader";
import { Voting } from "../../engine/voting";
import { useLeaveGame } from "../../engine/use-leave-game";
import { useT } from "../../i18n/use-t";
import { useImpostorConfig } from "./config-store";
import { IMPOSTOR_ID } from "./constants";
import { ImpostorSecret } from "./impostor-secret";
import { buildImpostorRound } from "./logic";

type Phase = "pass" | "starter" | "discussion" | "vote" | "guess" | "result";

const SETUP_PATH = `/play/${IMPOSTOR_ID}/setup`;

export function ImpostorPlayScreen() {
  const t = useT();
  const leave = useLeaveGame();
  const players = usePlayersStore((state) => state.players);
  const addPoints = useScoreboardStore((state) => state.addPoints);
  const config = useImpostorConfig();
  const packs = useSelectedPacks(IMPOSTOR_ID, "words", config.packIds);
  const valid = players.length >= MIN_PLAYERS && packs.length > 0;
  const [phase, setPhase] = useState<Phase>("pass");
  const [accusedId, setAccusedId] = useState("");
  const [guessed, setGuessed] = useState(false);
  const [roundPoints, setRoundPoints] = useState<Record<string, number>>({});

  const { round, state, failure, reload } = useRoundLoader(valid, async () => {
    const { item, pack } = await drawItem(packs);
    const playerIds = players.map((p) => p.id);
    return buildImpostorRound(item, pack.title, config.clueMode, playerIds, clampHiddenRoleCount(config.impostorCount, players.length));
  });

  if (!valid) return <Navigate to={SETUP_PATH} replace />;
  if (state !== "ready" || !round) return <RoundStatus state={state} failure={failure} onRetry={reload} />;

  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "?";
  const playerIds = players.map((p) => p.id);
  const caught = isCaught({ hiddenIds: round.impostorIds, accusedId });

  const finish = (accused: string, accusedGuessed: boolean) => {
    const points = scoreHiddenRoleRound({ playerIds, hiddenIds: round.impostorIds, accusedId: accused, accusedGuessedSecret: accusedGuessed });
    addPoints(points);
    setRoundPoints(points);
    setGuessed(accusedGuessed);
    setPhase("result");
    playCue(round.impostorIds.has(accused) ? "win" : "end");
  };

  const onVote = (accused: string) => {
    setAccusedId(accused);
    if (round.impostorIds.has(accused) && config.canGuess) setPhase("guess");
    else finish(accused, false);
  };

  const playAgain = () => {
    setPhase("pass");
    setAccusedId("");
    void reload();
  };

  switch (phase) {
    case "pass":
      return (
        <PassPhone
          players={players}
          renderSecret={(player) => <ImpostorSecret player={player} players={players} round={round} knowEachOther={config.knowEachOther} />}
          onDone={() => setPhase("starter")}
        />
      );
    case "starter":
      return (
        <StarterScreen
          starterName={nameOf(round.starterId)}
          help={t("impostor.starter.help")}
          actionLabel={config.minutes > 0 ? t("round.toDiscussion") : t("round.toVote")}
          onNext={() => setPhase(config.minutes > 0 ? "discussion" : "vote")}
        />
      );
    case "discussion":
      return <Timer seconds={config.minutes * 60} onFinish={() => setPhase("vote")} />;
    case "vote":
      return <Voting candidates={players} voterCount={players.length} onResult={onVote} />;
    case "guess":
      return (
        <Screen
          footer={
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => finish(accusedId, false)}>
                {t("impostor.guess.wrong")}
              </Button>
              <Button onClick={() => finish(accusedId, true)}>{t("impostor.guess.correct")}</Button>
            </div>
          }
        >
          <div className="flex h-full flex-col justify-center gap-4 text-center">
            <p className="pop-in text-4xl font-black text-accent">{t("impostor.guess.title", { name: nameOf(accusedId) })}</p>
            <p className="text-lg text-muted">{t("impostor.guess.help", { name: nameOf(accusedId) })}</p>
          </div>
        </Screen>
      );
    case "result": {
      const impostorNames = playerIds.filter((id) => round.impostorIds.has(id)).map(nameOf);
      return (
        <RoundResult
          headline={caught ? t("impostor.result.caught") : t("impostor.result.escaped")}
          caught={caught}
          roundPoints={roundPoints}
          onPlayAgain={playAgain}
          onBackToSetup={() => leave("setup")}
        >
          <p className="text-lg text-muted">{t("round.accused", { name: nameOf(accusedId) })}</p>
          <RevealBlock label={impostorNames.length > 1 ? t("impostor.result.revealedMany") : t("impostor.result.revealedOne")}>
            <span className="text-danger">{impostorNames.join(", ")}</span>
          </RevealBlock>
          <RevealBlock label={t("impostor.result.word")}>{round.word}</RevealBlock>
          {guessed && <p className="font-bold text-info">{t("impostor.result.guessed", { name: nameOf(accusedId) })}</p>}
        </RoundResult>
      );
    }
  }
}
