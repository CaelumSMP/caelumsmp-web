// Reads and writes data/content.json. Server-only (uses the filesystem).
// ponytail: one JSON file, whole-file writes. Fine for a handful of editors; move to a database when several people edit at once.
import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { seed, type Content } from "./content";

const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "content.json");
export const UPLOADS = path.join(DIR, "uploads");

// Missing sections fall back to the seed, so adding a new section later needs no migration.
// Actions use readContent (always fresh); pages use getContent (read once per request).
export async function readContent(): Promise<Content> {
  try {
    const saved = JSON.parse(await fs.readFile(FILE, "utf8")) as Partial<Content>;
    return structuredClone({ ...seed, ...saved, settings: { ...seed.settings, ...saved.settings } });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(seed); // a copy: callers mutate it
    throw e;
  }
}
export const getContent = cache(readContent);

// Write to a temp file and rename, so a crash mid-write never leaves a half-written file.
export async function saveContent(next: Content) {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2));
  await fs.rename(tmp, FILE);
}
