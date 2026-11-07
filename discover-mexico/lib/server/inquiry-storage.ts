import { z } from "zod";
import { ApiError, serviceUrl } from "./http";
import type { Inquiry } from "./inquiry-schema";
import type { kommoCommand } from "./kommo";

export type DurableSubmission = {
  requestId: string;
  idempotencyKey: string;
  fingerprint: string;
  clientKey: string;
  inquiry: Inquiry;
  integration: ReturnType<typeof kommoCommand>;
};

const capabilities = z.object({
  protocol: z.literal("discover-mexico.inquiries.v1"),
  durable: z.literal(true),
  atomicIdempotency: z.literal(true),
  distributedRateLimit: z.literal(true),
  transactionalOutbox: z.literal(true),
  kommo: z.literal("ready"),
});
const receipt = z.object({
  protocol: z.literal("discover-mexico.inquiries.v1"),
  requestId: z.string().uuid(),
  idempotencyKey: z.string().uuid(),
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  durable: z.literal(true),
  status: z.enum(["queued", "delivered"]),
});

async function boundedResponse(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) throw new ApiError(503, "STORAGE_PROTOCOL_ERROR");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        throw new Error("limit");
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(503, "STORAGE_PROTOCOL_ERROR");
  } finally {
    reader.releaseLock();
  }
}

// The gateway owns the durable transaction and Kommo worker; this process never stores lead PII.
export async function submitDurably(
  submission: DurableSubmission,
  env: NodeJS.ProcessEnv,
  transport: typeof fetch = fetch,
) {
  if (!env.INQUIRIES_STORAGE_URL || !env.INQUIRIES_STORAGE_TOKEN)
    throw new ApiError(503, "LIVE_STORAGE_REQUIRED");
  const url = serviceUrl(
    env.INQUIRIES_STORAGE_URL,
    env.NODE_ENV === "production",
  );
  const headers = {
    Authorization: `Bearer ${env.INQUIRIES_STORAGE_TOKEN}`,
    "Content-Type": "application/json",
  };
  const ready = await transport(`${url.href.replace(/\/$/, "")}/capabilities`, {
    headers,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(5000),
  });
  if (
    !ready.ok ||
    !capabilities.safeParse(await boundedResponse(ready)).success
  ) {
    throw new ApiError(503, "DURABLE_KOMMO_INTEGRATION_NOT_READY");
  }
  const response = await transport(`${url.href.replace(/\/$/, "")}/inquiries`, {
    method: "POST",
    headers: { ...headers, "Idempotency-Key": submission.idempotencyKey },
    body: JSON.stringify({
      ...submission,
      protocol: "discover-mexico.inquiries.v1",
      rateLimit: { limit: 5, windowSeconds: 600 },
      idempotencyTtlSeconds: 86400,
    }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
  if (response.status === 409) throw new ApiError(409, "IDEMPOTENCY_CONFLICT");
  if (response.status === 429) throw new ApiError(429, "RATE_LIMITED");
  if (!response.ok) throw new ApiError(503, "DURABLE_SUBMISSION_UNAVAILABLE");
  const parsed = receipt.safeParse(await boundedResponse(response));
  if (
    !parsed.success ||
    parsed.data.idempotencyKey !== submission.idempotencyKey ||
    parsed.data.fingerprint !== submission.fingerprint
  ) {
    throw new ApiError(503, "STORAGE_PROTOCOL_ERROR");
  }
  return parsed.data;
}
