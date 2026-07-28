import type { LogEntry } from "./log-entry.interface.js";

export const DEFAULT_DOWN_THRESHOLD = 3;

export function isDown(entry: LogEntry): boolean {
  return entry.statusCode === null || entry.statusCode >= 400;
}

export function trailingDownStreak(entries: readonly LogEntry[]): number {
  let streak = 0;

  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (entry === undefined || !isDown(entry)) {
      break;
    }
    streak++;
  }

  return streak;
}

export function groupByHost(entries: readonly LogEntry[]): Map<string, LogEntry[]> {
  const byHost = new Map<string, LogEntry[]>();

  for (const entry of entries) {
    const existing = byHost.get(entry.host);
    if (existing === undefined) {
      byHost.set(entry.host, [entry]);
    } else {
      existing.push(entry);
    }
  }

  return byHost;
}

export function findDownDevices(
  entries: readonly LogEntry[],
  threshold: number = DEFAULT_DOWN_THRESHOLD,
): string[] {
  const downHosts: string[] = [];

  for (const [host, hostEntries] of groupByHost(entries)) {
    if (trailingDownStreak(hostEntries) >= threshold) {
      downHosts.push(host);
    }
  }

  return downHosts;
}