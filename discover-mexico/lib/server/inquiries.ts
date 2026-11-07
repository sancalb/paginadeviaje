import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { ApiError, checkOrigin, failure, json, readJson } from "./http";
import { inquirySchema, travelContext } from "./inquiry-schema";
import { submitDurably } from "./inquiry-storage";
import { kommoCommand, kommoRules } from "./kommo";

const uuid = z.string().uuid();
type StoredResponse = {
  fingerprint: string;
  expires: number;
  data: { mode: "development"; requestId: string; whatsappUrl: string };
};

export function createInquiryHandler(
  options: {
    env?: NodeJS.ProcessEnv;
    now?: () => number;
    transport?: typeof fetch;
  } = {},
) {
  const env = options.env || process.env;
  const now = options.now || Date.now;
  const developmentSalt = randomBytes(32).toString("hex");
  const responses = new Map<string, StoredResponse>();
  const buckets = new Map<string, { count: number; expires: number }>();
  const digest = (value: string, live: boolean) =>
    createHmac("sha256", live ? env.RATE_LIMIT_HMAC_KEY! : developmentSalt)
      .update(value)
      .digest("hex");

  return async function POST(request: Request) {
    let requestId: string = randomUUID();
    try {
      const mode = env.INQUIRIES_MODE || "development";
      if (!["live", "development"].includes(mode))
        throw new ApiError(503, "INQUIRIES_MODE_INVALID");
      const live = mode === "live";
      if (
        live &&
        (!env.APP_ORIGIN ||
          !env.INQUIRIES_STORAGE_URL ||
          !env.INQUIRIES_STORAGE_TOKEN ||
          (env.RATE_LIMIT_HMAC_KEY?.length || 0) < 32)
      ) {
        throw new ApiError(503, "LIVE_CONFIGURATION_REQUIRED");
      }
      checkOrigin(request, env.APP_ORIGIN);
      const key = request.headers.get("idempotency-key") || "";
      if (!uuid.safeParse(key).success)
        throw new ApiError(400, "IDEMPOTENCY_KEY_REQUIRED");
      // Only a platform-overwritten header may be trusted. Default is one conservative shared bucket.
      const ip = env.TRUSTED_CLIENT_IP_HEADER
        ? (
            request.headers.get(env.TRUSTED_CLIENT_IP_HEADER) || "unattributed"
          ).slice(0, 128)
        : "unattributed";
      const clientKey = digest(ip, live);
      const time = now();
      for (const [id, value] of buckets)
        if (value.expires <= time) buckets.delete(id);
      for (const [id, value] of responses)
        if (value.expires <= time) responses.delete(id);
      const bucket = buckets.get(clientKey) || {
        count: 0,
        expires: time + 60000,
      };
      if (
        bucket.count >= 20 ||
        (!buckets.has(clientKey) && buckets.size >= 10000)
      )
        throw new ApiError(429, "RATE_LIMITED");
      bucket.count += 1;
      buckets.set(clientKey, bucket);
      const result = inquirySchema.safeParse(await readJson(request));
      if (!result.success) throw new ApiError(422, "INQUIRY_INVALID");
      const inquiry = result.data;
      if (
        inquiry.website ||
        inquiry.startedAt > time - 1500 ||
        inquiry.startedAt < time - 86400000
      ) {
        throw new ApiError(422, "INQUIRY_REJECTED");
      }
      if (
        inquiry.dates.start &&
        inquiry.dates.start < new Date(time).toISOString().slice(0, 10)
      )
        throw new ApiError(422, "TRAVEL_DATES_PAST");
      const fingerprint = digest(JSON.stringify(inquiry), live);
      if (live) {
        const integration = kommoCommand(
          inquiry,
          kommoRules(env.KOMMO_RULES_JSON),
          requestId,
        );
        const stored = await submitDurably(
          {
            requestId,
            idempotencyKey: key,
            fingerprint,
            clientKey,
            inquiry,
            integration,
          },
          env,
          options.transport,
        );
        requestId = stored.requestId;
        return json(
          { mode: "live", requestId, status: stored.status },
          stored.status === "delivered" ? 200 : 202,
        );
      }
      const previous = responses.get(key);
      if (previous) {
        if (previous.fingerprint !== fingerprint)
          throw new ApiError(409, "IDEMPOTENCY_CONFLICT");
        return json(previous.data);
      }
      if (responses.size >= 10000) throw new ApiError(429, "RATE_LIMITED");
      const number = env.WHATSAPP_NUMBER || "";
      if (!/^\+?[1-9]\d{6,14}$/.test(number))
        throw new ApiError(503, "WHATSAPP_NOT_CONFIGURED");
      const whatsappUrl = `https://wa.me/${number.replace(/^\+/, "")}?text=${encodeURIComponent(travelContext(inquiry, requestId))}`;
      const data = { mode: "development" as const, requestId, whatsappUrl };
      // Retain only a keyed digest and a contact-free receipt. No lead body, email, phone or name.
      responses.set(key, { fingerprint, expires: time + 86400000, data });
      return json(data);
    } catch (error) {
      return failure(error, requestId);
    }
  };
}

export const postInquiry = createInquiryHandler();
