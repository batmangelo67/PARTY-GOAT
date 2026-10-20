export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function logError(context: string, error: unknown): void {
  console.error(`❌ ${context} — ${errorMessage(error)}`, error);
}
