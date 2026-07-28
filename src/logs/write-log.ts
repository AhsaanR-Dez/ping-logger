import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { LogEntry } from "./log-entry.interface.js";

export function logFileName(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}.json`;
}

export function isLogEntry(value: unknown): value is LogEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "host" in value &&
    typeof value.host === "string" &&
    "statusCode" in value &&
    (value.statusCode === null || typeof value.statusCode === "number") &&
    "ms" in value &&
    typeof value.ms === "number"
  );
}

export interface AppendResult {
  readonly file: string;
  readonly allEntries: readonly LogEntry[];
}

export async function appendEntries(
  directory: string,
  entries: readonly LogEntry[],
  now: Date = new Date(),
): Promise<AppendResult> {
  await mkdir(directory, { recursive: true });
  const file = join(directory, logFileName(now));

  let existing: LogEntry[] = [];
  try {
    const parsed: unknown = JSON.parse(await readFile(file, "utf8"));
    if (Array.isArray(parsed)) {
      existing = parsed.filter(isLogEntry);
    }
  } catch {
    existing = [];
  }

  const allEntries = [...existing, ...entries];
  await writeFile(file, `${JSON.stringify(allEntries, null, 2)}\n`, "utf8");

  return { file, allEntries };
}