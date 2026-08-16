import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const advisorsPath = join(rootDir, "data", "advisors.json");
const advisorConfig = JSON.parse(readFileSync(advisorsPath, "utf8"));

export const advisors = advisorConfig.advisors || [];
export const ambiguousAliases = advisorConfig.ambiguousAliases || [];

const advisorsById = new Map(advisors.map((advisor) => [advisor.id, advisor]));

function normalizeAdvisorText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsNormalizedAlias(normalizedText, normalizedAlias) {
  if (!normalizedText || !normalizedAlias) return false;
  return ` ${normalizedText} `.includes(` ${normalizedAlias} `);
}

function uniqueAliases(aliases) {
  const seen = new Set();
  return aliases.filter((alias) => {
    const normalized = normalizeAdvisorText(alias);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function aliasEntries() {
  return advisors.flatMap((advisor) => {
    const normalizedFullName = normalizeAdvisorText(advisor.fullName);
    return uniqueAliases(advisor.aliases || [advisor.fullName]).map((alias) => {
      const normalizedAlias = normalizeAdvisorText(alias);
      return {
        advisor,
        alias,
        normalizedAlias,
        matchType: normalizedAlias === normalizedFullName ? "FULL_NAME" : "UNIQUE_ALIAS",
      };
    });
  });
}

function ambiguousEntries() {
  return ambiguousAliases.map((entry) => ({
    alias: entry.alias,
    normalizedAlias: normalizeAdvisorText(entry.alias),
    advisors: (entry.advisorIds || []).map((advisorId) => advisorsById.get(advisorId)).filter(Boolean),
  }));
}

const matcherAliases = aliasEntries();
const matcherAmbiguousAliases = ambiguousEntries();

function matchConfidenceFor(type, normalizedAlias) {
  if (type === "FULL_NAME") return 1;
  if (normalizedAlias.split(" ").length >= 2) return 0.94;
  return 0.86;
}

function betterMatch(next, current) {
  if (!current) return true;
  if (next.matchType === "FULL_NAME" && current.matchType !== "FULL_NAME") return true;
  if (next.matchType !== "FULL_NAME" && current.matchType === "FULL_NAME") return false;
  return next.normalizedAlias.length > current.normalizedAlias.length;
}

export function getAdvisorById(advisorId) {
  return advisorsById.get(advisorId) || null;
}

export function matchReviewAdvisors(text) {
  const normalizedText = normalizeAdvisorText(text);
  const matchesByAdvisor = new Map();

  matcherAliases.forEach((entry) => {
    if (!containsNormalizedAlias(normalizedText, entry.normalizedAlias)) return;

    const match = {
      advisorId: entry.advisor.id,
      advisorSlug: entry.advisor.slug,
      displayName: entry.advisor.displayName,
      fullName: entry.advisor.fullName,
      matchedAlias: entry.alias,
      matchConfidence: matchConfidenceFor(entry.matchType, entry.normalizedAlias),
      matchType: entry.matchType,
      normalizedAlias: entry.normalizedAlias,
    };

    if (betterMatch(match, matchesByAdvisor.get(entry.advisor.id))) {
      matchesByAdvisor.set(entry.advisor.id, match);
    }
  });

  const advisorMentions = [...matchesByAdvisor.values()]
    .sort((a, b) => b.matchConfidence - a.matchConfidence || b.normalizedAlias.length - a.normalizedAlias.length)
    .map(({ normalizedAlias, ...match }) => match);

  const resolvedAdvisorIds = new Set(advisorMentions.map((match) => match.advisorId));
  const unresolvedAdvisorMentions = matcherAmbiguousAliases
    .filter((entry) => containsNormalizedAlias(normalizedText, entry.normalizedAlias))
    .filter((entry) => !entry.advisors.some((advisor) => resolvedAdvisorIds.has(advisor.id)))
    .map((entry) => ({
      matchedAlias: entry.alias,
      matchType: "AMBIGUOUS",
      matchConfidence: 0.4,
      possibleAdvisorIds: entry.advisors.map((advisor) => advisor.id),
      possibleAdvisors: entry.advisors.map((advisor) => advisor.fullName),
    }));

  return {
    advisorMentions,
    unresolvedAdvisorMentions,
  };
}

export function attachAdvisorMatches(review) {
  const matches = matchReviewAdvisors(review?.text || "");
  return {
    ...review,
    ...(matches.advisorMentions.length ? { advisorMentions: matches.advisorMentions } : {}),
    ...(matches.unresolvedAdvisorMentions.length
      ? { unresolvedAdvisorMentions: matches.unresolvedAdvisorMentions }
      : {}),
  };
}
