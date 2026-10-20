import { useT } from "../i18n/use-t";
import { PlayerEditor } from "../engine/player-editor";
import { Scoreboard } from "../engine/scoreboard";
import { useScoreboardStore } from "../engine/scoreboard-store";
import { Button, Screen, Section } from "../engine/ui";

export function PlayersScreen() {
  const t = useT();
  const resetScores = useScoreboardStore((state) => state.resetScores);
  return (
    <Screen title={t("players.title")} backTo="/">
      <PlayerEditor />
      <Section title={t("scoreboard.title")}>
        <Scoreboard />
        <Button variant="ghost" className="mt-2" onClick={resetScores}>
          {t("scoreboard.reset")}
        </Button>
      </Section>
    </Screen>
  );
}
