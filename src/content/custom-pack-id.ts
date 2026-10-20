import { randomId } from "../engine/random";

const MAX_SLUG_LENGTH = 24;
const RANDOM_SUFFIX_LENGTH = 6;

export function slugify(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/^-+|-+$/g, "");
  return slug || "pack";
}

export function newCustomPackId(title: string, takenIds: ReadonlySet<string> = new Set()): string {
  let id: string;
  do {
    id = `custom-${slugify(title)}-${randomId().slice(0, RANDOM_SUFFIX_LENGTH)}`;
  } while (takenIds.has(id));
  return id;
}
