import { pingAll } from "./devices/ping-device.js";
import { DeviceConfigError, readDevices } from "./devices/read-devices.js";
import { DEFAULT_DOWN_THRESHOLD, findDownDevices } from "./logs/down-streak.js";
import { appendEntries } from "./logs/write-log.js";

async function main(): Promise<void> {
  const devices = await readDevices("devices.json");
  console.log(`Pinging ${devices.length} devices...`);

  const entries = await pingAll(devices);
  for (const entry of entries) {
    const status = entry.statusCode ?? "no response";
    console.log(`  ${entry.host} -> ${status} (${entry.ms}ms)`);
  }

  const { file, allEntries } = await appendEntries("logs", entries);
  console.log(`Wrote ${entries.length} entries to ${file}`);

  const downHosts = findDownDevices(allEntries);
  if (downHosts.length > 0) {
    console.warn(`\nDown ${DEFAULT_DOWN_THRESHOLD} or more runs in a row:`);
    for (const host of downHosts) {
      console.warn(`  ${host}`);
    }
  }
}

main().catch((error: unknown) => {
  if (error instanceof DeviceConfigError) {
    console.error(`Config error: ${error.message}`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});