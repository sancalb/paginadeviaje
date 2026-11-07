import { spawn } from "node:child_process";
import { mkdirSync, openSync, writeFileSync } from "node:fs";
mkdirSync("storage", { recursive: true });
const log = openSync("storage/preview.log", "a");
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "4191"],
  {
    cwd: process.cwd(),
    detached: true,
    windowsHide: true,
    stdio: ["ignore", log, log],
  },
);
writeFileSync(
  "storage/preview-pid.json",
  JSON.stringify({ pid: child.pid, port: 4191 }),
);
child.unref();
console.log("Discover Mexico: http://localhost:4191/en");
