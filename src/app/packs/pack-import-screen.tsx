import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { storeCustomPacks, useContentStore } from "../../content/content-store";
import {
  collisionChoices,
  DEFAULT_COLLISION_CHOICE,
  findCollision,
  PackImportError,
  planImport,
  readImportText,
  type CollisionChoice,
  type ImportRead,
  type ImportSummary,
} from "../../content/pack-import";
import { errorMessage, logError } from "../../engine/logger";
import { Button, Notice, Screen, Section, Segmented } from "../../engine/ui";
import { useT } from "../../i18n/use-t";

function ImportSummaryView({ summary, onDone }: { summary: ImportSummary; onDone: () => void }) {
  const t = useT();
  return (
    <Screen title={t("import.summary")} footer={<Button onClick={onDone}>{t("import.done")}</Button>}>
      <ul className="flex flex-col gap-2 text-lg font-bold">
        <li>{t("import.added", { count: summary.added.length })}</li>
        <li>{t("import.replaced", { count: summary.replaced.length })}</li>
        <li>{t("import.skipped", { count: summary.skipped.length })}</li>
        <li className={summary.rejected.length ? "text-danger" : ""}>{t("import.rejected", { count: summary.rejected.length })}</li>
      </ul>
      <ul className="mt-3 flex flex-col gap-1 text-sm text-muted">
        {summary.rejected.map((rejection) => (
          <li key={rejection.index}>
            {rejection.label}: {t("import.badField", { field: rejection.field })}
          </li>
        ))}
      </ul>
    </Screen>
  );
}

export function PackImportScreen() {
  const t = useT();
  const navigate = useNavigate();
  const packs = useContentStore((state) => state.packs);
  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [read, setRead] = useState<ImportRead | null>(null);
  const [choices, setChoices] = useState<Record<number, CollisionChoice>>({});
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const existing = packs.map(({ id, source }) => ({ id, source }));

  const check = (input: string) => {
    setRead(null);
    setChoices({});
    try {
      setRead(readImportText(input));
      setError("");
    } catch (readError) {
      setError(readError instanceof PackImportError ? t(`import.error.${readError.code}`) : errorMessage(readError));
    }
  };

  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const content = await file.text();
      setText(content);
      check(content);
    } catch (fileError) {
      logError("Reading import file", fileError);
      setError(t("import.error.readFile", { reason: errorMessage(fileError) }));
    }
  };

  const runImport = async () => {
    if (!read) return;
    const plan = planImport(read, existing, choices);
    try {
      await storeCustomPacks(plan.toSave);
      setSummary(plan.summary);
    } catch (saveError) {
      logError("Importing packs", saveError);
      setError(t("import.saveError", { reason: errorMessage(saveError) }));
    }
  };

  if (summary) return <ImportSummaryView summary={summary} onDone={() => navigate("/packs", { replace: true })} />;

  return (
    <Screen
      title={t("import.title")}
      backTo="/packs"
      footer={
        read ? (
          <Button disabled={read.candidates.length === 0} onClick={runImport}>
            {t("import.confirm")}
          </Button>
        ) : (
          <Button disabled={!text.trim()} onClick={() => check(text)}>
            {t("import.check")}
          </Button>
        )
      }
    >
      <p className="text-sm text-muted">{t("import.help")}</p>
      <textarea
        value={text}
        rows={8}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder={t("import.placeholder")}
        aria-label={t("import.placeholder")}
        onChange={(e) => {
          setText(e.target.value);
          setRead(null);
        }}
        className="mt-3 w-full rounded-2xl border-2 border-line bg-ink p-4 font-mono text-sm outline-none focus:border-accent"
      />
      <Button variant="secondary" className="mt-2" onClick={() => fileInput.current?.click()}>
        {t("import.pickFile")}
      </Button>
      <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={loadFile} />
      {error && (
        <div className="mt-3">
          <Notice tone="error">❌ {error}</Notice>
        </div>
      )}
      {read && (
        <Section title={t("packs.count", { count: read.candidates.length })}>
          {read.candidates.length === 0 && <Notice tone="error">{t("import.nothingValid")}</Notice>}
          <ul className="flex flex-col gap-2">
            {read.candidates.map(({ index, pack }) => {
              const collision = findCollision(pack, existing);
              return (
                <li key={index} className="rounded-2xl bg-panel px-4 py-3">
                  <p className="font-bold">{pack.title}</p>
                  <p className="text-sm text-muted">
                    {t(`kind.${pack.kind}`)} · {t("picker.items", { count: pack.items.length })} · {t(`language.short.${pack.language}`)}
                  </p>
                  {collision && (
                    <div className="mt-2">
                      <p className="mb-2 text-sm text-danger">{t("import.collision", { title: pack.id })}</p>
                      <Segmented
                        ariaLabel={t("import.collision", { title: pack.id })}
                        options={collisionChoices(collision).map((choice) => ({ value: choice, label: t(`import.choice.${choice}`) }))}
                        value={choices[index] ?? DEFAULT_COLLISION_CHOICE}
                        onChange={(choice) => setChoices({ ...choices, [index]: choice })}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {read.rejected.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-danger">
              {read.rejected.map((rejection) => (
                <li key={rejection.index}>
                  ❌ {rejection.label}: {t("import.badField", { field: rejection.field })}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </Screen>
  );
}
