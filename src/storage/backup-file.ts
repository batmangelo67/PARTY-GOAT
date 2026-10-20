import { exportBackup, parseBackup, restoreBackup, type Backup } from "./backup";
import { datedFileName, saveJsonFile } from "./json-file";

export async function saveBackupFile(): Promise<void> {
  const backup = await exportBackup();
  await saveJsonFile(datedFileName("party-goat-backup"), JSON.stringify(backup, null, 2));
}

export async function readBackupFile(file: File): Promise<Backup> {
  let json: unknown;
  try {
    json = JSON.parse(await file.text());
  } catch {
    throw new Error("the file is not valid JSON");
  }
  return parseBackup(json);
}

export { restoreBackup };
