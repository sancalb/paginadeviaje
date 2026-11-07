import { open } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { ApiError, serviceUrl } from "./http";
import { publicExperts } from "./experts";
import { attachReviewTranslation, loadReviewTranslations, type ReviewTranslations } from "./review-translations";

export const REVIEW_REVALIDATE_SECONDS = 7 * 24 * 60 * 60;
const httpsUrl = z
  .string()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  })
  .catch("");
export const reviewSchema = z.object({
  reviewId: z.string().max(300).default(""),
  author: z.string().max(200).default(""),
  rating: z.number().min(0).max(5),
  text: z.string().max(10000),
  url: httpsUrl,
  image: httpsUrl,
  images: z.preprocess(
    value => Array.isArray(value) ? value.slice(0, 20) : [],
    z.array(httpsUrl).default([]),
  ),
  reviewerImage: httpsUrl,
  date: z.string().max(100).optional(),
  advisorMentions: z
    .array(z.object({
      advisorId: z.string(),
      matchedAlias: z.string().max(200).optional(),
      matchConfidence: z.number().min(0).max(1).optional(),
      matchType: z.enum(["FULL_NAME", "UNIQUE_ALIAS", "AMBIGUOUS"]).optional(),
    }))
    .max(20)
    .default([]),
});
const branchSchema = z.object({
  name: z.string().max(200).default(""),
  rating: z.number().min(0).max(5).nullable().default(null),
  reviewCount: z.number().int().min(0).default(0),
  address: z.string().max(500).default(""),
  phone: z.string().max(80).default(""),
  mapsUrl: httpsUrl,
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  reviews: z.array(z.unknown()).max(2000).default([]),
});
const cacheSchema = z.object({
  updatedAt: z.string().max(40),
  branches: z.record(z.string(), z.unknown()),
  meta: z.object({ stale: z.boolean().optional() }).optional(),
});
const configSchema = z.object({
  branches: z.record(
    z.string(),
    z.object({
      label: z.string().max(200).optional(),
      expectedName: z.string().max(200).optional(),
      address: z.string().max(500).optional(),
      phone: z.string().max(80).optional(),
      mapsUrl: httpsUrl,
    }),
  ),
});

async function readJsonFile(path: string, limit: number) {
  const file = await open(path, "r");
  try {
    if ((await file.stat()).size > limit) throw new Error("limit");
    const buffer = Buffer.alloc(limit + 1);
    const { bytesRead } = await file.read(buffer, 0, limit + 1, 0);
    if (bytesRead > limit) throw new Error("limit");
    return JSON.parse(buffer.subarray(0, bytesRead).toString("utf8"));
  } finally {
    await file.close();
  }
}

async function readService(response: Response) {
  if (!response.ok || !response.body)
    throw new ApiError(503, "REVIEWS_UNAVAILABLE");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4 * 1024 * 1024) {
        await reader.cancel();
        throw new Error("limit");
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally {
    reader.releaseLock();
  }
}

export async function getReviews(
  options: {
    env?: NodeJS.ProcessEnv;
    now?: number;
    transport?: typeof fetch;
    readFile?: typeof readJsonFile;
    translations?: ReviewTranslations;
  } = {},
) {
  const env = options.env || process.env;
  const now = options.now ?? Date.now();
  const read = options.readFile || readJsonFile;
  let config: z.infer<typeof configSchema>;
  try {
    config = configSchema.parse(
      await read(
        resolve(
          /* turbopackIgnore: true */ env.GOOGLE_REVIEWS_CONFIG_PATH ||
            "../config/google-reviews-branches.json",
        ),
        128 * 1024,
      ),
    );
  } catch {
    throw new ApiError(503, "REVIEWS_CONFIG_UNAVAILABLE");
  }
  let source = "shared-cache";
  let payload: unknown;
  if (env.GOOGLE_REVIEWS_SERVICE_URL) {
    const url = serviceUrl(
      env.GOOGLE_REVIEWS_SERVICE_URL,
      env.NODE_ENV === "production",
    );
    try {
      const response = await (options.transport || fetch)(url, {
        next: { revalidate: REVIEW_REVALIDATE_SECONDS },
        redirect: "error",
        signal: AbortSignal.timeout(5000),
      } as RequestInit);
      payload = cacheSchema.parse(await readService(response));
      source = "reviews-service";
    } catch {
      source = "shared-cache-fallback";
    }
  }
  if (!payload) {
    try {
      payload = await read(
        resolve(
          /* turbopackIgnore: true */ env.GOOGLE_REVIEWS_CACHE_PATH ||
            "../storage/google-reviews-cache.json",
        ),
        4 * 1024 * 1024,
      );
    } catch {
      throw new ApiError(503, "REVIEWS_CACHE_UNAVAILABLE");
    }
  }
  const parsed = cacheSchema.safeParse(payload);
  if (!parsed.success) throw new ApiError(503, "REVIEWS_CACHE_INVALID");
  const experts = new Map(
    publicExperts(env.EXPERTS_ALLOWLIST_JSON).map((expert) => [
      expert.id,
      expert,
    ]),
  );
  const branches: Record<string, unknown> = {};
  const translations = options.translations ?? await loadReviewTranslations(env.GOOGLE_REVIEW_TRANSLATIONS_PATH);
  let available = false;
  for (const [id, definition] of Object.entries(config.branches)) {
    const result = branchSchema.safeParse(parsed.data.branches[id]);
    if (!result.success) continue;
    const branch = result.data;
    const reviews = branch.reviews.flatMap((value) => {
      const result = reviewSchema.safeParse(value);
      if (!result.success) return [];
      const { advisorMentions, ...review } = result.data;
      const eligible = advisorMentions.flatMap((mention) => {
        const expert = experts.get(mention.advisorId);
        return expert && ["FULL_NAME", "UNIQUE_ALIAS"].includes(mention.matchType || "")
          ? [{ ...mention, advisorId: expert.id, displayName: expert.displayName }]
          : [];
      });
      return [
        attachReviewTranslation({
          ...review,
          ...(eligible.length ? { advisorMentions: eligible } : {}),
        }, translations),
      ];
    });
    branches[id] = {
      ...branch,
      name: branch.name || definition.expectedName || definition.label || id,
      address: branch.address || definition.address || "",
      phone: branch.phone || definition.phone || "",
      mapsUrl: branch.mapsUrl || definition.mapsUrl,
      reviews,
    };
    available ||= branch.reviewCount > 0 || reviews.length > 0;
  }
  const timestamp = Date.parse(parsed.data.updatedAt);
  const stale =
    parsed.data.meta?.stale === true ||
    !Number.isFinite(timestamp) ||
    timestamp > now ||
    now - timestamp >= REVIEW_REVALIDATE_SECONDS * 1000;
  return {
    updatedAt:
      Number.isFinite(timestamp) && timestamp <= now
        ? parsed.data.updatedAt
        : "",
    branches,
    meta: {
      source,
      stale,
      available,
      refreshIntervalDays: 7,
      revalidateSeconds: REVIEW_REVALIDATE_SECONDS,
      nextRevalidationAt: new Date(
        now + REVIEW_REVALIDATE_SECONDS * 1000,
      ).toISOString(),
      manualRefreshAllowed: false,
    },
  };
}
