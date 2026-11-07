import { realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { z } from "zod";
import catalog from "../../data/experts.json" with { type: "json" };

const identities = new Map(catalog.map((expert) => [expert.id, expert]));

const expertSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{1,80}$/),
    displayName: z.string().trim().min(1).max(120),
    active: z.boolean(),
    bilingual: z.boolean().optional(),
    publicationApproved: z.boolean().optional(),
    photosAuthorized: z.boolean().optional(),
    confirmedLanguages: z.array(z.enum(["en", "es"])).min(1).max(2).optional(),
    photoUrl: z.string().max(2048).optional(),
  })
  .strict();

function approvedEntries(raw = process.env.EXPERTS_ALLOWLIST_JSON) {
  try {
    return z
      .array(expertSchema)
      .max(100)
      .parse(JSON.parse(raw || "[]"))
      .filter((expert, _index, entries) =>
        entries.filter((entry) => entry.id === expert.id).length === 1,
      )
      .filter((expert) =>
        expert.active === true &&
        // The legacy bilingual flag is an explicit operator approval, not a guess.
        (expert.publicationApproved ?? expert.bilingual) === true &&
        (expert.confirmedLanguages !== undefined || expert.bilingual === true),
      );
  } catch {
    return [];
  }
}

export function publicExperts(raw = process.env.EXPERTS_ALLOWLIST_JSON) {
  return approvedEntries(raw).map(({ id, displayName, confirmedLanguages }) => ({
    id,
    displayName,
    languages: [...new Set(confirmedLanguages ?? ["en", "es"])],
  }));
}

function authorizedPhoto(expert: z.infer<typeof expertSchema>) {
  if (expert.photosAuthorized !== true || !expert.photoUrl) return null;
  const src = expert.photoUrl;
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:avif|webp|png|jpe?g)$/.test(src))
    return null;
  try {
    const root = realpathSync(resolve(process.cwd(), "public"));
    const file = realpathSync(resolve(root, src.slice(1)));
    const path = relative(root, file);
    if (isAbsolute(path) || path.startsWith("..") || !statSync(file).isFile())
      return null;
    return src;
  } catch {
    return null;
  }
}

const httpsUrl = z.string().max(2048).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}).catch("");

const mentionSchema = z.object({
  advisorId: z.string(),
  matchType: z.enum(["FULL_NAME", "UNIQUE_ALIAS"]),
  matchConfidence: z.number().min(0).max(1),
});
const matchedReviewSchema = z.object({
  reviewId: z.string().max(300).default(""),
  author: z.string().max(200).default(""),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(10000).default(""),
  url: httpsUrl,
  translation: z.object({
    text: z.string().trim().min(1).max(10000),
    sourceLanguage: z.literal("es"),
    targetLanguage: z.literal("en"),
    translator: z.string().trim().min(1).max(200),
  }).optional().catch(undefined),
  advisorMentions: z.array(z.unknown()).max(20).default([]),
});
const snapshotSchema = z.object({
  updatedAt: z.string().default(""),
  meta: z.object({ stale: z.boolean() }).optional(),
  branches: z.record(z.string(), z.object({
    reviews: z.array(z.unknown()).max(2000).default([]),
  })),
});

export type ExpertReview = Pick<z.infer<typeof matchedReviewSchema>,
  "reviewId" | "author" | "rating" | "text" | "url" | "translation">;

export type ApprovedExpertProfile = {
  id: string;
  displayName: string;
  languages: string[];
  photoUrl: string | null;
  reviewCount: number;
  averageRating: number | null;
  reviews: ExpertReview[];
  quote: ExpertReview | null;
  reviewsUpdatedAt: string;
  reviewsStale: boolean;
};

export async function approvedExpertProfiles(options: {
  env?: NodeJS.ProcessEnv;
  getReviews?: (options: { env: NodeJS.ProcessEnv }) => Promise<unknown>;
} = {}): Promise<ApprovedExpertProfile[]> {
  const env = options.env ?? process.env;
  const approved = approvedEntries(env.EXPERTS_ALLOWLIST_JSON ?? "")
    .filter((expert) => identities.has(expert.id));
  if (!approved.length) return [];

  let snapshot: z.infer<typeof snapshotSchema> | undefined;
  try {
    // reviews imports publicExperts; load it lazily to avoid a static cycle.
    const getReviews = options.getReviews ?? (await import("./reviews")).getReviews;
    snapshot = snapshotSchema.parse(await getReviews({ env }));
  } catch {
    // A review outage must not invent testimonials or hide approved contacts.
  }

  return approved.map((expert) => {
    const reviews: ExpertReview[] = [];
    const seen = new Set<string>();
    for (const branch of Object.values(snapshot?.branches ?? {})) {
      for (const value of branch.reviews) {
        const parsed = matchedReviewSchema.safeParse(value);
        if (!parsed.success) continue;
        const { advisorMentions, ...review } = parsed.data;
        const confirmed = advisorMentions.some((value) => {
          const mention = mentionSchema.safeParse(value);
          return mention.success && mention.data.advisorId === expert.id &&
            mention.data.matchConfidence >=
              (mention.data.matchType === "FULL_NAME" ? 1 : 0.86);
        });
        if (!confirmed) continue;
        const key = review.reviewId || review.url ||
          JSON.stringify([review.author, review.text, review.rating]);
        if (seen.has(key)) continue;
        seen.add(key);
        reviews.push(review);
      }
    }
    return {
      id: expert.id,
      displayName: identities.get(expert.id)!.displayName,
      languages: [...new Set(expert.confirmedLanguages ?? ["en", "es"])],
      photoUrl: authorizedPhoto(expert),
      reviewCount: reviews.length,
      averageRating: reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : null,
      reviews,
      quote: reviews.find((review) => review.text.trim() && review.url) ?? null,
      reviewsUpdatedAt: snapshot?.updatedAt ?? "",
      reviewsStale: snapshot?.meta?.stale ?? true,
    };
  });
}
