import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { advisors, matchReviewAdvisors } from "../lib/advisors.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const cachePath = process.env.GOOGLE_REVIEWS_CACHE_PATH || join(rootDir, "storage", "google-reviews-cache.json");

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(Number(value || 0) * factor) / factor;
}

function excerpt(text, length = 130) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= length) return normalized;
  return `${normalized.slice(0, length).trim()}...`;
}

function flattenReviews(data) {
  return Object.entries(data?.branches || {}).flatMap(([branchKey, branch]) => {
    return (branch?.reviews || []).map((review, index) => ({
      ...review,
      branchKey,
      branchName: branch?.name || branchKey,
      reviewIndex: index,
    }));
  });
}

function ensureAdvisorBucket(map, advisor) {
  if (!map.has(advisor.id)) {
    map.set(advisor.id, {
      advisorId: advisor.id,
      displayName: advisor.displayName,
      fullName: advisor.fullName,
      reviewCount: 0,
      ratingAverage: 0,
      ratingTotal: 0,
      aliases: {},
      examples: [],
    });
  }
  return map.get(advisor.id);
}

async function main() {
  const summaryOnly = process.argv.includes("--summary");
  const file = await readFile(cachePath, "utf8");
  const data = JSON.parse(file.replace(/^\uFEFF/, ""));
  const reviews = flattenReviews(data);
  const advisorsById = new Map(advisors.map((advisor) => [advisor.id, advisor]));
  const advisorCounts = new Map();
  const aliasCounts = new Map();
  const ambiguousCounts = new Map();
  const ambiguousExamples = [];
  const matchedExamples = [];

  let reviewsWithAdvisor = 0;
  let reviewsAmbiguous = 0;
  let reviewsWithoutAdvisor = 0;
  let reviewsResolvedOnly = 0;
  let reviewsAmbiguousOnly = 0;
  let reviewsResolvedAndAmbiguous = 0;

  reviews.forEach((review) => {
    const result = matchReviewAdvisors(review.text || "");
    const hasAdvisorMentions = result.advisorMentions.length > 0;
    const hasUnresolvedMentions = result.unresolvedAdvisorMentions.length > 0;

    if (hasAdvisorMentions && hasUnresolvedMentions) {
      reviewsResolvedAndAmbiguous += 1;
    } else if (hasAdvisorMentions) {
      reviewsResolvedOnly += 1;
    } else if (hasUnresolvedMentions) {
      reviewsAmbiguousOnly += 1;
    }

    if (hasAdvisorMentions) {
      reviewsWithAdvisor += 1;
      matchedExamples.push({
        branchKey: review.branchKey,
        author: review.author || "",
        matchedAdvisors: result.advisorMentions.map((match) => ({
          advisorId: match.advisorId,
          fullName: match.fullName,
          matchedAlias: match.matchedAlias,
          matchType: match.matchType,
          matchConfidence: match.matchConfidence,
        })),
        text: excerpt(review.text),
      });
    }

    if (hasUnresolvedMentions) {
      reviewsAmbiguous += 1;
      result.unresolvedAdvisorMentions.forEach((mention) => {
        ambiguousCounts.set(mention.matchedAlias, (ambiguousCounts.get(mention.matchedAlias) || 0) + 1);
      });
      ambiguousExamples.push({
        branchKey: review.branchKey,
        author: review.author || "",
        unresolvedAdvisorMentions: result.unresolvedAdvisorMentions,
        text: excerpt(review.text),
      });
    }

    if (!hasAdvisorMentions && !hasUnresolvedMentions) {
      reviewsWithoutAdvisor += 1;
    }

    result.advisorMentions.forEach((match) => {
      const advisor = advisorsById.get(match.advisorId);
      if (!advisor) return;

      const bucket = ensureAdvisorBucket(advisorCounts, advisor);
      bucket.reviewCount += 1;
      bucket.ratingTotal += Number(review.rating) || 0;
      bucket.ratingAverage = round(bucket.ratingTotal / bucket.reviewCount, 2);
      bucket.aliases[match.matchedAlias] = (bucket.aliases[match.matchedAlias] || 0) + 1;
      aliasCounts.set(match.matchedAlias, (aliasCounts.get(match.matchedAlias) || 0) + 1);

      if (bucket.examples.length < 2) {
        bucket.examples.push({
          branchKey: review.branchKey,
          author: review.author || "",
          rating: review.rating,
          matchedAlias: match.matchedAlias,
          text: excerpt(review.text),
        });
      }
    });
  });

  const report = {
    cachePath,
    updatedAt: data.updatedAt || "",
    totalReviews: reviews.length,
    reviewsWithAdvisorIdentified: reviewsWithAdvisor,
    reviewsAmbiguous,
    reviewsWithoutAdvisor,
    exclusiveBreakdown: {
      resolvedOnly: reviewsResolvedOnly,
      ambiguousOnly: reviewsAmbiguousOnly,
      resolvedAndAmbiguous: reviewsResolvedAndAmbiguous,
      withoutAdvisor: reviewsWithoutAdvisor,
    },
    countByAdvisor: [...advisorCounts.values()]
      .sort((a, b) => b.reviewCount - a.reviewCount || a.fullName.localeCompare(b.fullName, "es"))
      .map(({ ratingTotal, ...advisor }) => advisor),
    aliasesThatProducedMatches: Object.fromEntries(
      [...aliasCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    ),
    ambiguousAliasesFound: Object.fromEntries(
      [...ambiguousCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    ),
    ambiguousExamples,
    matchedExamples,
  };

  if (summaryOnly) {
    const { ambiguousExamples, matchedExamples, ...summary } = report;
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
