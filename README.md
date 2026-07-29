# ping-logger

A small command line tool that pings a list of devices, records how each one responded, and warns you about anything that has been down several runs in a row.

This is Warm-up A of my full-stack TypeScript internship roadmap.

## Requirements

- Node 24 or newer

## Setup

```bash
git clone https://github.com/AhsaanR-Dez/ping-logger.git
cd ping-logger
npm install
```

## Configuring devices

Devices are listed in `devices.json` at the root of the project. Every entry needs a `name` and a `host`:

```json
[
  { "name": "google", "host": "https://www.google.com" },
  { "name": "github", "host": "https://api.github.com" }
]
```

If the file is missing, isn't valid JSON, isn't an array, or has an entry with a missing `name` or `host`, the tool stops and tells you which entry is the problem instead of crashing with a stack trace.

## Running it

```bash
npm run dev
```

Output looks like this:

```
Pinging 3 devices...
  https://www.google.com -> 200 (183ms)
  https://api.github.com -> 200 (153ms)
  https://this-host-does-not-exist.invalid -> no response (41ms)
Wrote 3 entries to logs/2026-07-28.json
```

## The log files

Each run appends to `logs/YYYY-MM-DD.json`, so one file per day with every run of that day inside it. The folder is created on the first run and is not committed to the repo.

```json
[
  {
    "host": "https://www.google.com",
    "statusCode": 200,
    "ms": 183
  },
  {
    "host": "https://this-host-does-not-exist.invalid",
    "statusCode": null,
    "ms": 41
  }
]
```

`statusCode` is `null` when there was no HTTP response at all, which covers DNS failures, refused connections, and requests that hit the 5 second timeout. If there's a number there, the server responded, even if it responded with an error.

## Down-streak warnings

After writing the log, the tool checks the whole day's history for each host. A host counts as down when its status code is `null` or 400 and above. If the **last 3 runs in a row** were all down, it gets flagged:

```
Down 3 or more runs in a row:
  https://this-host-does-not-exist.invalid
```

Only the runs at the end count. A host that was down five times and then came back up isn't flagged, because it recovered.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the tool straight from the TypeScript source |
| `npm run typecheck` | Type checks everything without emitting files |
| `npm test` | Runs the test suite with a coverage report |
| `npm run test:watch` | Runs the tests in watch mode |
| `npm run build` | Compiles to `dist/` |
| `npm start` | Runs the compiled output in `dist/` |

`npm run dev` skips type checking, so use `npm run typecheck` to actually verify types.

## Project layout

```
src/
  index.ts                      entry point, wires everything together
  devices/
    device.interface.ts         the Device type
    read-devices.ts             reads and validates devices.json
    read-devices.test.ts
    ping-device.ts              pings one device, and all of them in parallel
  logs/
    log-entry.interface.ts      the LogEntry type
    write-log.ts                appends entries to the daily log file
    down-streak.ts              works out which hosts are down
    down-streak.test.ts
```

## Tests

```bash
npm test
```

16 tests covering the config parsing and the down-streak logic. The file reading inside `readDevices` isn't covered. I left that on purpose. Testing it would mean mocking `node:fs` just to check that `readFile` fails when the file isn't there, which didn't seem worth it.