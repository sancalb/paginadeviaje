import { createHash } from "node:crypto";
import { open } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";

export const MAX_REVIEW_TRANSLATIONS_BYTES = 256 * 1024;
export const MAX_REVIEW_TRANSLATIONS = 1000;

export type ReviewTranslationSource = {
  reviewId?: string;
  url?: string;
  text: string;
};

export type ENReviewTranslation = {
  text: string;
  sourceLanguage: "es";
  targetLanguage: "en";
  translator: "deviaje.mx";
};

// Spanish is a per-entry manual decision, never inferred from the cache locale.
const entrySchema = z.object({
  reviewId: z.string().min(1).max(300),
  sourceTextHash: z.string().regex(/^[a-f0-9]{64}$/),
  sourceLanguage: z.literal("es"),
  targetLanguage: z.literal("en"),
  translatedText: z.string().min(1).max(20000).refine((text) => !!text.trim()),
  translator: z.literal("deviaje.mx"),
  createdAt: z.iso.datetime(),
  languageDecision: z.object({
    method: z.literal("manual"),
    note: z.string().min(1).max(1000).refine((note) => !!note.trim()),
  }),
});

export type ReviewTranslationEntry = z.infer<typeof entrySchema>;
export type ReviewTranslations = Readonly<Record<string, ReviewTranslationEntry>>;
export type TranslatedReview<T extends ReviewTranslationSource> = Omit<T, "translation"> & {
  translation?: ENReviewTranslation;
};

/** Hash the exact UTF-8 original, including whitespace, accents and line breaks. */
export function reviewSourceTextHash(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** No author/text identity fallback: absent a real ID, require a safe review URL. */
export function reviewTranslationId(review: ReviewTranslationSource): string | undefined {
  if (typeof review.reviewId === "string" && review.reviewId.trim())
    return review.reviewId.length <= 300 ? review.reviewId : undefined;
  try {
    const url = new URL(review.url || "");
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return `url-sha256:${reviewSourceTextHash(url.href)}`;
  } catch {
    return undefined;
  }
}

/** Local file only. Bad files fail closed; individually invalid records are ignored. */
export async function loadReviewTranslations(
  path: string = process.env.GOOGLE_REVIEW_TRANSLATIONS_PATH || "data/review-translations.json",
): Promise<ReviewTranslations> {
  try {
    const file = await open(resolve(/* turbopackIgnore: true */ path), "r");
    let payload: unknown;
    try {
      const stat = await file.stat();
      if (!stat.isFile() || stat.size > MAX_REVIEW_TRANSLATIONS_BYTES) return {};
      const chunks: Buffer[] = [];
      let size = 0;
      // Read at most limit+1 even if the file grows after stat or reads are partial.
      for (;;) {
        const buffer = Buffer.alloc(Math.min(16384, MAX_REVIEW_TRANSLATIONS_BYTES + 1 - size));
        const { bytesRead } = await file.read(buffer, 0, buffer.length, null);
        if (!bytesRead) break;
        size += bytesRead;
        if (size > MAX_REVIEW_TRANSLATIONS_BYTES) return {};
        chunks.push(buffer.subarray(0, bytesRead));
      }
      payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } finally {
      await file.close();
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
    const entries = Object.entries(payload);
    if (entries.length > MAX_REVIEW_TRANSLATIONS) return {};
    const translations: Record<string, ReviewTranslationEntry> = {};
    for (const [id, value] of entries) {
      if (["__proto__", "constructor", "prototype"].includes(id)) continue;
      const parsed = entrySchema.safeParse(value);
      if (parsed.success && parsed.data.reviewId === id) translations[id] = parsed.data;
    }
    return translations;
  } catch {
    return {};
  }
}

/** Call on the original review, before a UI selector replaces missing review URLs. */
export function attachReviewTranslation<T extends ReviewTranslationSource>(
  review: T,
  translations: ReviewTranslations,
): TranslatedReview<T> {
  // Never retain an incoming/stale translation when validation fails.
  const { translation: _previous, ...original } = review as T & { translation?: unknown };
  const id = reviewTranslationId(review);
  if (!id || !review.text?.trim() || !Object.hasOwn(translations, id)) return original;
  const parsed = entrySchema.safeParse(translations[id]);
  if (
    !parsed.success ||
    parsed.data.reviewId !== id ||
    parsed.data.sourceTextHash !== reviewSourceTextHash(review.text)
  ) return original;
  return {
    ...original,
    translation: {
      text: parsed.data.translatedText,
      sourceLanguage: "es",
      targetLanguage: "en",
      translator: "deviaje.mx",
    },
  };
}
