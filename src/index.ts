import { readDevices, DeviceConfigError } from "./devices/read-devices.js";

async function main(): Promise<void> {
  const devices = await readDevices("devices.json");
  console.log(`Loaded ${devices.length} devices:`);
  for (const device of devices) {
    console.log(`  ${device.name} -> ${device.host}`);
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