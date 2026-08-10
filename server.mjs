import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import { getGoogleReviews, reviewRefreshIntervalDays } from "./lib/google-reviews.mjs";

const root = resolve(process.cwd());
const hasExplicitPort = Boolean(process.env.PORT);
const preferredPort = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";

const allowedRootFiles = new Set(["index.html", "styles.css", "script.js"]);
const allowedPublicPath = /^public[/\\]/;
const allowedDataPath = /^data[/\\].+\.json$/;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
};

function isWithinRoot(filePath) {
  const pathFromRoot = relative(root, filePath);
  return pathFromRoot === "" || (!pathFromRoot.startsWith("..") && !isAbsolute(pathFromRoot));
}

function canServeStaticFile(filePath) {
  const pathFromRoot = relative(root, filePath);
  return allowedRootFiles.has(pathFromRoot) || allowedPublicPath.test(pathFromRoot) || allowedDataPath.test(pathFromRoot);
}

function resolveRequestPath(url) {
  const requestUrl = new URL(url, "http://localhost");
  const cleanPath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
  const normalized = normalize(cleanPath || "index.html");
  const resolved = resolve(root, normalized);

  if (!isWithinRoot(resolved)) {
    return join(root, "index.html");
  }

  if (existsSync(resolved) && statSync(resolved).isDirectory()) {
    return join(resolved, "index.html");
  }

  if (existsSync(resolved) && canServeStaticFile(resolved)) {
    return resolved;
  }

  return join(root, "index.html");
}

function isLocalRequest(request) {
  const address = request.socket.remoteAddress || "";
  return address === "::1" || address === "127.0.0.1" || address === "::ffff:127.0.0.1";
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function start(port) {
  const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url || "/", "http://localhost");

    if (requestUrl.pathname === "/api/google-reviews") {
      if (request.method !== "GET") {
        sendJson(response, 405, { error: "Method not allowed" });
        return;
      }

      const local = isLocalRequest(request);
      const forceRefresh = local && requestUrl.searchParams.get("refresh") === "1";
      const simulateError = local && requestUrl.searchParams.get("simulate_error") === "1";
      const result = await getGoogleReviews({ forceRefresh, simulateError });

      sendJson(response, 200, {
        ...result.data,
        meta: {
          status: result.status,
          stale: result.stale,
          available: result.available,
          refreshIntervalDays: reviewRefreshIntervalDays,
          manualRefreshAllowed: local,
        },
      });
      return;
    }

    const filePath = resolveRequestPath(request.url || "/");
    const extension = extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });

    createReadStream(filePath).pipe(response);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && !hasExplicitPort && port < preferredPort + 20) {
      start(port + 1);
      return;
    }
    throw error;
  });

  server.listen(port, host, () => {
    console.log(`deviaje local: http://localhost:${port}`);
  });
}

start(preferredPort);
