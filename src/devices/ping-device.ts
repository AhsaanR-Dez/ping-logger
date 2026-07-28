import type { Device } from "./device.interface.js";
import type { LogEntry } from "../logs/log-entry.interface.js";

const TIMEOUT_MS = 5000;

export async function pingDevice(device: Device): Promise<LogEntry> {
  const start = performance.now();

  try {
    const response = await fetch(device.host, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    await response.body?.cancel();

    return {
      host: device.host,
      statusCode: response.status,
      ms: Math.round(performance.now() - start),
    };
  } catch {
    return {
      host: device.host,
      statusCode: null,
      ms: Math.round(performance.now() - start),
    };
  }
}

export async function pingAll(devices: readonly Device[]): Promise<LogEntry[]> {
  return Promise.all(devices.map((device) => pingDevice(device)));
}