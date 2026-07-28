import { readFile } from "node:fs/promises";
import type { Device } from "./device.interface.js";

export class DeviceConfigError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DeviceConfigError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toDevice(value: unknown, index: number): Device {
  if (!isRecord(value)) {
    throw new DeviceConfigError(`Device at index ${index} is not an object.`);
  }
  if (!isNonEmptyString(value["name"])) {
    throw new DeviceConfigError(`Device at index ${index} is missing a non-empty "name".`);
  }
  if (!isNonEmptyString(value["host"])) {
    throw new DeviceConfigError(`Device "${value["name"]}" (index ${index}) is missing a non-empty "host".`);
  }
  return { name: value["name"], host: value["host"] };
}

export function parseDevices(raw: string, source: string): Device[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (cause) {
      throw new DeviceConfigError(`Device config at "${source}" is not valid JSON.`, { cause });
    }
  
    if (!Array.isArray(parsed)) {
      throw new DeviceConfigError(`Device config at "${source}" must be a JSON array.`);
    }
  
    const entries: unknown[] = parsed;
    const devices = entries.map(toDevice);
  
    if (devices.length === 0) {
      throw new DeviceConfigError(`Device config at "${source}" contains no devices.`);
    }
  
    return devices;
  }
  
  export async function readDevices(path: string): Promise<Device[]> {
    let raw: string;
    try {
      raw = await readFile(path, "utf8");
    } catch (cause) {
      throw new DeviceConfigError(`Could not read device config at "${path}".`, { cause });
    }
    return parseDevices(raw, path);
  }