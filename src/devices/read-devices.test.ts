import { describe, expect, it } from "vitest";
import { DeviceConfigError, parseDevices } from "./read-devices.js";

describe("parseDevices", () => {
  it("returns devices when the config is valid", () => {
    const raw = '[{ "name": "google", "host": "https://www.google.com" }]';

    const devices = parseDevices(raw, "test.json");

    expect(devices).toEqual([{ name: "google", host: "https://www.google.com" }]);
  });

  it("throws when the file is not valid JSON", () => {
    expect(() => parseDevices("{oops", "test.json")).toThrow(DeviceConfigError);
  });

  it("throws when the config is not an array", () => {
    expect(() => parseDevices('{ "name": "a" }', "test.json")).toThrow(/must be a JSON array/);
  });

  it("names the offending index when an entry is missing host", () => {
    const raw = '[{ "name": "a", "host": "h" }, { "name": "b" }]';

    expect(() => parseDevices(raw, "test.json")).toThrow(/index 1/);
  });

  it("throws when the array is empty", () => {
    expect(() => parseDevices("[]", "test.json")).toThrow(/contains no devices/);
  });

  it("throws when an entry is not an object", () => {
    expect(() => parseDevices('["google.com"]', "test.json")).toThrow(/not an object/);
  });

  it("throws when an entry is missing name", () => {
    expect(() => parseDevices('[{ "host": "h" }]', "test.json")).toThrow(/missing a non-empty "name"/);
  });
});