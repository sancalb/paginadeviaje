import { spawn } from "node:child_process";
import { openSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createConnection } from "node:net";
const listening = await new Promise((done) => {
  const socket = createConnection({ host: "127.0.0.1", port: 4180 });
  socket.on("connect", () => {
    socket.destroy();
    done(true);
  });
  socket.on("error", () => done(false));
});
if (!listening) {
  mkdirSync("storage", { recursive: true });
  const log = openSync("storage/original-preview.log", "a");
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: resolve(".."),
    env: { ...process.env, PORT: "4180", HOST: "127.0.0.1" },
    windowsHide: true,
    detached: true,
    stdio: ["ignore", log, log],
  });
  writeFileSync(
    "storage/original-preview-pid.json",
    JSON.stringify({ pid: child.pid, port: 4180 }),
  );
  child.unref();
}
console.log("Original deviaje.mx preview: http://localhost:4180/");
