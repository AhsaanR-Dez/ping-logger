import { describe, expect, it } from "vitest";
import type { LogEntry } from "./log-entry.interface.js";
import { findDownDevices, isDown, trailingDownStreak } from "./down-streak.js";

function entry(host: string, statusCode: number | null): LogEntry {
  return { host, statusCode, ms: 1 };
}

describe("isDown", () => {
  it("treats a missing response as down", () => {
    expect(isDown(entry("a", null))).toBe(true);
  });

  it("treats 4xx and 5xx as down", () => {
    expect(isDown(entry("a", 404))).toBe(true);
    expect(isDown(entry("a", 500))).toBe(true);
  });

  it("treats 2xx and 3xx as up", () => {
    expect(isDown(entry("a", 200))).toBe(false);
    expect(isDown(entry("a", 301))).toBe(false);
  });
});

describe("trailingDownStreak", () => {
  it("counts only the runs at the end", () => {
    const entries = [entry("a", null), entry("a", 200), entry("a", 500), entry("a", null)];

    expect(trailingDownStreak(entries)).toBe(2);
  });

  it("returns 0 when the most recent run was up", () => {
    const entries = [entry("a", null), entry("a", null), entry("a", 200)];

    expect(trailingDownStreak(entries)).toBe(0);
  });

  it("returns 0 for no entries", () => {
    expect(trailingDownStreak([])).toBe(0);
  });
});

describe("findDownDevices", () => {
  it("flags a host down for 3 runs in a row", () => {
    const entries = [
      entry("a", 200), entry("b", 200),
      entry("a", null), entry("b", 200),
      entry("a", 500), entry("b", 200),
      entry("a", null), entry("b", 200),
    ];

    expect(findDownDevices(entries)).toEqual(["a"]);
  });

  it("does not flag a host that recovered", () => {
    const entries = [entry("a", null), entry("a", null), entry("a", null), entry("a", 200)];

    expect(findDownDevices(entries)).toEqual([]);
  });

  it("respects a custom threshold", () => {
    const entries = [entry("a", 200), entry("a", 503), entry("a", 503)];

    expect(findDownDevices(entries, 2)).toEqual(["a"]);
  });
});