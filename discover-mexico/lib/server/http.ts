export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export function failure(error: unknown, requestId?: string) {
  const safe =
    error instanceof ApiError
      ? error
      : new ApiError(503, "SERVICE_UNAVAILABLE");
  return json(
    { error: safe.code, ...(requestId ? { requestId } : {}) },
    safe.status,
    safe.status === 429 ? { "Retry-After": "60" } : {},
  );
}

export async function readJson(
  request: Request,
  maxBytes = 16 * 1024,
): Promise<unknown> {
  if (
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get("content-type") || "",
    )
  ) {
    throw new ApiError(415, "JSON_REQUIRED");
  }
  const encoding = request.headers.get("content-encoding");
  if (encoding && encoding !== "identity")
    throw new ApiError(415, "ENCODING_NOT_SUPPORTED");
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes)) {
    throw new ApiError(413, "BODY_TOO_LARGE");
  }
  if (!request.body) throw new ApiError(400, "INVALID_JSON");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new ApiError(413, "BODY_TOO_LARGE");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "INVALID_JSON");
  } finally {
    reader.releaseLock();
  }
}

export function checkOrigin(request: Request, configuredOrigin?: string) {
  const expected = configuredOrigin
    ? new URL(configuredOrigin).origin
    : new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (origin && origin !== expected)
    throw new ApiError(403, "ORIGIN_NOT_ALLOWED");
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new ApiError(403, "ORIGIN_NOT_ALLOWED");
}

export function serviceUrl(raw: string, production: boolean): URL {
  const url = new URL(raw);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    (url.protocol !== "https:" &&
      !(local && !production && url.protocol === "http:")) ||
    url.username ||
    url.password ||
    url.hash ||
    url.search ||
    /(^|\.)(searchapi\.io|serpapi\.com|hotelbeds\.com)$/.test(url.hostname)
  ) {
    throw new ApiError(503, "SERVICE_CONFIGURATION_INVALID");
  }
  return url;
}
