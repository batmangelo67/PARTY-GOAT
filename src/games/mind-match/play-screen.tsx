import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { MIN_PLAYERS } from "../../app/constants";
import { useSelectedPacks } from "../../content/use-selected-packs";
import { drawItem } from "../../engine/draw-item";
import { PassPhone } from "../../engine/pass-phone";
import { usePlayersStore } from "../../engine/players-store";
import { RoundResult } from "../../engine/round-result";
import { RoundStatus } from "../../engine/round-status";
import { useScoreboardStore } from "../../engine/scoreboard-store";
import { playCue } from "../../engine/sound";
import { BigCard, Button, Screen } from "../../engine/ui";
import { useRoundLoader } from "../../engine/use-round-loader";
import { useT } from "../../i18n/use-t";
import { useMindConfig } from "./config-store";
import { MIND_ID } from "./constants";
import { cleanWord, findMatches, matchPoints, nextPromptWords, normalizeWord, type MatchGroup } from "./logic";
import { MindSecret } from "./mind-secret";
import { PromptWords } from "./prompt-words";

const SETUP_PATH = `/play/${MIND_ID}/setup`;
const STARTER_ATTEMPTS = 3;

type Phase = "write" | "reveal" | "spoken" | "result";

export function MindPlayScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const addPoints = useScoreboardStore((state) => state.addPoints);
  const config = useMindConfig();
  const packs = useSelectedPacks("words", config.packIds);
  const typed = config.mode === "typed";
  const valid = packs.length > 0 && (!typed || players.length >= MIN_PLAYERS);

  const [phase, setPhase] = useState<Phase>(typed ? "write" : "spoken");
  const [round, setRound] = useState(1);
  const [promptWords, setPromptWords] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [match, setMatch] = useState<MatchGroup | null>(null);
  const [roundPoints, setRoundPoints] = useState<Record<string, number>>({});

  const { state, failure, reload } = useRoundLoader(valid, async () => {
    const first = (await drawItem(packs)).item.word;
    let second = first;
    for (let attempt = 0; attempt < STARTER_ATTEMPTS && normalizeWord(second) === normalizeWord(first); attempt++) {
      second = (await drawItem(packs)).item.word;
    }
    setPromptWords([first, second]);
  });

  if (!valid) return <Navigate to={SETUP_PATH} replace />;
  if (state !== "ready") return <RoundStatus state={state} failure={failure} onRetry={reload} backTo={SETUP_PATH} />;

  const playerIds = players.map((p) => p.id);
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "?";

  const finish = (group: MatchGroup | null) => {
    const points = group ? matchPoints(group) : {};
    addPoints(points);
    setRoundPoints(points);
    setMatch(group);
    setPhase("result");
    playCue("win");
  };

  const afterReveal = () => {
    const group = findMatches(playerIds, answers)[0];
    if (group) return finish(group);
    setPromptWords(nextPromptWords(playerIds, answers));
    setAnswers({});
    setRound(round + 1);
    setPhase("write");
  };

  const playAgain = () => {
    setRound(1);
    setAnswers({});
    setMatch(null);
    setPhase(typed ? "write" : "spoken");
    void reload();
  };

  switch (phase) {
    case "write":
      return (
        <PassPhone
          key={round}
          players={players}
          renderSecret={(player) => (
            <MindSecret
              words={promptWords}
              answer={answers[player.id] ?? ""}
              onAnswer={(text) => setAnswers((current) => ({ ...current, [player.id]: text }))}
            />
          )}
          canHide={(player) => cleanWord(answers[player.id] ?? "") !== ""}
          onDone={() => setPhase("reveal")}
        />
      );
    case "reveal": {
      const group = findMatches(playerIds, answers)[0];
      return (
        <Screen title={t("mind.reveal.title")} footer={<Button onClick={afterReveal}>{group ? t("mind.reveal.toResult") : t("mind.reveal.next")}</Button>}>
          <ul className="mt-2 flex flex-col gap-2">
            {players.map((player) => (
              <li key={player.id} className="pop-in rounded-2xl bg-panel px-4 py-3">
                <p className="text-sm font-bold text-muted">{player.name}</p>
                <p className="break-words text-2xl font-black">{cleanWord(answers[player.id] ?? "")}</p>
              </li>
            ))}
          </ul>
          <p className={`mt-4 text-lg font-bold ${group ? "text-accent" : "text-muted"}`}>
            {group ? t("mind.reveal.match", { word: group.word }) : t("mind.reveal.noMatch")}
          </p>
        </Screen>
      );
    }
    case "spoken":
      return (
        <Screen
          backTo={SETUP_PATH}
          title={t("mind.play.round", { number: round })}
          footer={
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setRound(round + 1);
                  playCue("tap");
                }}
              >
                {t("mind.play.again")}
              </Button>
              <Button onClick={() => finish(null)}>{t("mind.play.matched")}</Button>
            </div>
          }
        >
          <div className="flex h-full flex-col justify-center gap-4">
            <BigCard key={round}>
              <PromptWords words={promptWords} />
              <p className="mt-6 text-lg text-muted">{t("mind.play.spokenHelp")}</p>
            </BigCard>
          </div>
        </Screen>
      );
    case "result":
      return (
        <RoundResult
          headline={t("mind.result.title")}
          caught
          roundPoints={roundPoints}
          onPlayAgain={playAgain}
          onBackToSetup={() => navigate(SETUP_PATH)}
        >
          <p className="text-xl text-muted">{t("mind.result.rounds", { count: round })}</p>
          {match && <p className="text-xl font-bold">{t("mind.result.players", { names: match.playerIds.map(nameOf).join(", ") })}</p>}
        </RoundResult>
      );
  }
}
