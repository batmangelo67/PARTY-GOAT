import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
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
import { useT } from "../../i18n/use-t";
import { useLiarConfig } from "./config-store";
import { LIAR_ID } from "./constants";
import { LiarSecret } from "./liar-secret";
import { buildLiarRound, cleanAnswer } from "./logic";

type Phase = "pass" | "spoken" | "reveal" | "discussion" | "vote" | "result";

const SETUP_PATH = `/play/${LIAR_ID}/setup`;

export function LiarPlayScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const addPoints = useScoreboardStore((state) => state.addPoints);
  const config = useLiarConfig();
  const packs = useSelectedPacks("question-pairs", config.packIds);
  const valid = players.length >= MIN_PLAYERS && packs.length > 0;
  const typed = config.answerMode === "typed";
  const [phase, setPhase] = useState<Phase>("pass");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [accusedId, setAccusedId] = useState("");
  const [roundPoints, setRoundPoints] = useState<Record<string, number>>({});

  const { round, state, failure, reload } = useRoundLoader(valid, async () => {
    const { item } = await drawItem(packs);
    return buildLiarRound(item, players.map((p) => p.id), clampHiddenRoleCount(config.liarCount, players.length));
  });

  if (!valid) return <Navigate to={SETUP_PATH} replace />;
  if (state !== "ready" || !round) return <RoundStatus state={state} failure={failure} onRetry={reload} backTo={SETUP_PATH} />;

  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "?";
  const afterReveal = () => setPhase(config.minutes > 0 ? "discussion" : "vote");
  const caught = isCaught({ hiddenIds: round.liarIds, accusedId });

  const onVote = (accused: string) => {
    const points = scoreHiddenRoleRound({ playerIds: players.map((p) => p.id), hiddenIds: round.liarIds, accusedId: accused });
    addPoints(points);
    setRoundPoints(points);
    setAccusedId(accused);
    setPhase("result");
    playCue(round.liarIds.has(accused) ? "win" : "end");
  };

  const playAgain = () => {
    setPhase("pass");
    setAnswers({});
    setAccusedId("");
    void reload();
  };

  switch (phase) {
    case "pass":
      return (
        <PassPhone
          players={players}
          renderSecret={(player) => (
            <LiarSecret
              player={player}
              round={round}
              liarKnows={config.liarKnows}
              answer={typed ? answers[player.id] : undefined}
              onAnswer={typed ? (text) => setAnswers((current) => ({ ...current, [player.id]: text })) : undefined}
            />
          )}
          canHide={(player) => !typed || cleanAnswer(answers[player.id] ?? "") !== ""}
          onDone={() => setPhase(typed ? "reveal" : "spoken")}
        />
      );
    case "spoken":
      return (
        <StarterScreen
          starterName={nameOf(round.starterId)}
          help={t("liar.spoken.help", { name: nameOf(round.starterId) })}
          actionLabel={t("liar.spoken.showQuestion")}
          onNext={() => setPhase("reveal")}
        />
      );
    case "reveal":
      return (
        <Screen
          title={typed ? t("liar.reveal.title") : undefined}
          footer={<Button onClick={afterReveal}>{config.minutes > 0 ? t("round.toDiscussion") : t("round.toVote")}</Button>}
        >
          <div className={`flex flex-col gap-3 ${typed ? "" : "h-full justify-center"}`}>
            {typed && (
              <ul className="flex flex-col gap-2">
                {players.map((player) => (
                  <li key={player.id} className="pop-in rounded-2xl bg-panel px-4 py-3">
                    <p className="text-sm font-bold text-muted">{player.name}</p>
                    <p className="break-words text-2xl font-black">{cleanAnswer(answers[player.id] ?? "")}</p>
                  </li>
                ))}
              </ul>
            )}
            <RevealBlock label={t("liar.reveal.question")}>
              <span className="text-accent">{round.question}</span>
            </RevealBlock>
          </div>
        </Screen>
      );
    case "discussion":
      return <Timer seconds={config.minutes * 60} onFinish={() => setPhase("vote")} />;
    case "vote":
      return <Voting candidates={players} voterCount={players.length} onResult={onVote} />;
    case "result": {
      const liarNames = players.filter((p) => round.liarIds.has(p.id)).map((p) => p.name);
      return (
        <RoundResult
          headline={caught ? t("liar.result.caught") : t("liar.result.escaped")}
          caught={caught}
          roundPoints={roundPoints}
          onPlayAgain={playAgain}
          onBackToSetup={() => navigate(SETUP_PATH)}
        >
          <p className="text-lg text-muted">{t("round.accused", { name: nameOf(accusedId) })}</p>
          <RevealBlock label={liarNames.length > 1 ? t("liar.result.revealedMany") : t("liar.result.revealedOne")}>
            <span className="text-danger">{liarNames.join(", ")}</span>
          </RevealBlock>
          <RevealBlock label={t("liar.result.question")}>{round.question}</RevealBlock>
          <RevealBlock label={t("liar.result.liarQuestion")}>
            <span className="text-danger">{round.liarQuestion}</span>
          </RevealBlock>
        </RoundResult>
      );
    }
  }
}
