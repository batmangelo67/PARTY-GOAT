const UINT32_RANGE = 2 ** 32;

// Uniform integer in [0, maxExclusive) using rejection sampling to avoid modulo bias.
export function randomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > UINT32_RANGE) {
    throw new RangeError(`randomInt needs a whole number between 1 and 2^32, got ${maxExclusive}`);
  }
  const limit = UINT32_RANGE - (UINT32_RANGE % maxExclusive);
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0]!;
  } while (value >= limit);
  return value % maxExclusive;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export function pick<T>(items: readonly T[]): T {
  if (items.length === 0) throw new RangeError("pick needs at least one item");
  return items[randomInt(items.length)]!;
}

export function pickMany<T>(items: readonly T[], count: number): T[] {
  if (!Number.isInteger(count) || count < 0 || count > items.length) {
    throw new RangeError(`pickMany can't take ${count} of ${items.length} items`);
  }
  return shuffle(items).slice(0, count);
}

export function randomId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
