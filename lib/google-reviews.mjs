import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { matchReviewAdvisors } from "./advisors.mjs";

try {
  process.loadEnvFile?.();
} catch {
  // Local development convenience only. Production uses real environment variables.
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const configPath = join(rootDir, "config", "google-reviews-branches.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));
const destinationsPath = join(rootDir, "data", "destinations.json");
const destinations = JSON.parse(readFileSync(destinationsPath, "utf8")).destinations || [];

const SEARCHAPI_URL = "https://www.searchapi.io/api/v1/search";
const refreshIntervalMs = Number(config.refreshIntervalDays || 7) * 24 * 60 * 60 * 1000;
const defaultCachePath = join(rootDir, "storage", "google-reviews-cache.json");
const cachePath = process.env.GOOGLE_REVIEWS_CACHE_PATH || defaultCachePath;
const googleReviewsPageSize = 20;
const defaultMaxReviewPages = 15;
const defaultMaxReviewsPerBranch = 300;

let backgroundRefresh = null;

export const reviewBranches = config.branches;
export const reviewRefreshIntervalDays = Number(config.refreshIntervalDays || 7);

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export function googleReviewsImportLimits(options = {}) {
  return {
    maxPages: positiveInteger(options.maxPages ?? process.env.GOOGLE_REVIEWS_MAX_PAGES, defaultMaxReviewPages),
    maxReviewsPerBranch: positiveInteger(
      options.maxReviewsPerBranch ?? process.env.GOOGLE_REVIEWS_MAX_REVIEWS_PER_BRANCH,
      defaultMaxReviewsPerBranch
    ),
  };
}

function branchEntries() {
  return Object.entries(reviewBranches);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function pickString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function pickNumber(...values) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value.replace(/,/g, ".").replace(/[^\d.]/g, ""));
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function pickCoordinate(...values) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const match = value.replace(/,/g, ".").match(/-?\d+(?:\.\d+)?/);
      if (!match) continue;

      const parsed = Number(match[0]);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function pickInteger(...values) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.max(0, Math.round(value));
    }

    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^\d]/g, ""));
      if (Number.isFinite(parsed)) {
        return Math.max(0, Math.round(parsed));
      }
    }
  }

  return 0;
}

function extractGoogleMapsDataId(...values) {
  for (const value of values) {
    const link = pickString(value);
    if (!link) continue;

    try {
      const url = new URL(link);
      const ftid = url.searchParams.get("ftid");
      if (ftid) return ftid;
    } catch {
      // Fall through to the regex below for partial Google Maps URLs.
    }

    const match = link.match(/0x[0-9a-f]+:0x[0-9a-f]+/i);
    if (match) return match[0];
  }

  return "";
}

function listFrom(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value;
    }
  }
  return [];
}

function objectFrom(...values) {
  return values.find((value) => value && typeof value === "object" && !Array.isArray(value)) || {};
}

function uniqueStrings(values) {
  const seen = new Set();
  return values.filter((value) => {
    const string = pickString(value);
    if (!string || seen.has(string)) return false;
    seen.add(string);
    return true;
  });
}

function imageUrlFrom(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return /^https?:\/\//i.test(value.trim()) ? value.trim() : "";
  }

  if (Array.isArray(value)) {
    return value.map(imageUrlFrom).find(Boolean) || "";
  }

  if (typeof value === "object") {
    return pickString(
      imageUrlFrom(value.image),
      imageUrlFrom(value.url),
      imageUrlFrom(value.link),
      imageUrlFrom(value.thumbnail),
      imageUrlFrom(value.src)
    );
  }

  return "";
}

function imageUrlsFrom(...values) {
  return uniqueStrings(
    values.flatMap((value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value.map(imageUrlFrom).filter(Boolean);
      const image = imageUrlFrom(value);
      return image ? [image] : [];
    })
  );
}

function destinationAliases(destination) {
  const aliases = [destination.name];
  if (destination.name?.includes(" + ")) {
    aliases.push(...destination.name.split(" + ").map((part) => part.trim()));
  }
  return uniqueStrings(aliases)
    .map(normalizeText)
    .filter((alias) => alias.length >= 4);
}

function detectReviewDestination(text) {
  const normalizedText = normalizeText(text);
  if (!normalizedText) return null;

  return destinations
    .map((destination) => ({
      destination,
      alias: destinationAliases(destination)
        .sort((a, b) => b.length - a.length)
        .find((alias) => normalizedText.includes(alias)),
    }))
    .filter((match) => match.alias)
    .sort((a, b) => b.alias.length - a.alias.length)[0]?.destination || null;
}

function placeObjectsFrom(payload) {
  return [
    payload.place_result,
    payload.place_results,
    payload.place,
    payload.result,
  ].filter((value) => value && typeof value === "object" && !Array.isArray(value));
}

const reviewArrayKeys = new Set([
  "review_results",
  "reviews",
  "reviews_results",
  "review_snippets",
  "place_reviews",
  "user_reviews",
]);

function collectReviewArrays(value, arrays = [], seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) {
    return arrays;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item) => collectReviewArrays(item, arrays, seen));
    return arrays;
  }

  Object.entries(value).forEach(([key, child]) => {
    if (reviewArrayKeys.has(key) && Array.isArray(child)) {
      arrays.push(child);
      return;
    }

    collectReviewArrays(child, arrays, seen);
  });

  return arrays;
}

function emptyBranch(branch) {
  return {
    name: branch.expectedName || "",
    rating: null,
    reviewCount: 0,
    address: branch.address || "",
    phone: branch.phone || "",
    mapsUrl: branch.mapsUrl || "",
    latitude: pickCoordinate(branch.latitude, branch.lat),
    longitude: pickCoordinate(branch.longitude, branch.lng, branch.lon),
    reviews: [],
  };
}

export function emptyReviewsData() {
  return {
    updatedAt: "",
    branches: Object.fromEntries(branchEntries().map(([key, branch]) => [key, emptyBranch(branch)])),
  };
}

function normalizeReview(review) {
  if (!review || typeof review !== "object") {
    return null;
  }

  const text = pickString(
    review.text,
    review.snippet,
    review.comment,
    review.review,
    review.description,
    review.body
  );

  if (!text) {
    return null;
  }

  const rating = pickNumber(review.rating, review.stars, review.score);

  if (rating === null) {
    return null;
  }

  const images = imageUrlsFrom(
    review.images,
    review.photos,
    review.image,
    review.photo,
    review.picture,
    review.thumbnail
  );
  const destination = detectReviewDestination(text);
  const advisorMatches = matchReviewAdvisors(text);

  return {
    reviewId: pickString(review.review_id, review.reviewId, review.id),
    author: pickString(
      review.author,
      review.author_name,
      review.user,
      review.user_name,
      review.user?.name,
      review.reviewer,
      review.reviewer_name,
      review.reviewer?.name,
      review.name,
      review.profile?.name
    ),
    rating,
    text,
    url: pickString(review.link, review.review_link, review.url, review.share_link, review.review_url),
    ...(images.length ? { image: images[0], images } : {}),
    ...(imageUrlFrom(review.user?.thumbnail || review.user?.image || review.user?.photo || review.profile?.image || review.profile?.photo)
      ? { reviewerImage: imageUrlFrom(review.user?.thumbnail || review.user?.image || review.user?.photo || review.profile?.image || review.profile?.photo) }
      : {}),
    ...(destination
      ? {
          destination: [destination.name, destination.country].filter(Boolean).join(" · "),
          destinationImage: destination.heroImage || "",
        }
      : {}),
    ...(advisorMatches.advisorMentions.length
      ? { advisorMentions: advisorMatches.advisorMentions }
      : {}),
    ...(advisorMatches.unresolvedAdvisorMentions.length
      ? { unresolvedAdvisorMentions: advisorMatches.unresolvedAdvisorMentions }
      : {}),
  };
}

function coordinatesFrom(branch, payload, primaryPlace) {
  const placeCoordinates = objectFrom(
    primaryPlace.gps_coordinates,
    primaryPlace.coordinates,
    primaryPlace.location,
    primaryPlace.gps
  );
  const payloadCoordinates = objectFrom(
    payload.gps_coordinates,
    payload.coordinates,
    payload.location,
    payload.gps
  );

  return {
    latitude: pickCoordinate(
      primaryPlace.latitude,
      primaryPlace.lat,
      placeCoordinates.latitude,
      placeCoordinates.lat,
      payload.latitude,
      payload.lat,
      payloadCoordinates.latitude,
      payloadCoordinates.lat,
      branch.latitude,
      branch.lat
    ),
    longitude: pickCoordinate(
      primaryPlace.longitude,
      primaryPlace.lng,
      primaryPlace.lon,
      placeCoordinates.longitude,
      placeCoordinates.lng,
      placeCoordinates.lon,
      payload.longitude,
      payload.lng,
      payload.lon,
      payloadCoordinates.longitude,
      payloadCoordinates.lng,
      payloadCoordinates.lon,
      branch.longitude,
      branch.lng,
      branch.lon
    ),
  };
}

function normalizeBranch(branch, payload, { maxReviews = 6 } = {}) {
  const placeCandidates = placeObjectsFrom(payload);
  const primaryPlace = objectFrom(...placeCandidates);
  const coordinates = coordinatesFrom(branch, payload, primaryPlace);
  const rawReviews = collectReviewArrays(payload).flat();
  const seenReviews = new Set();
  const reviews = rawReviews
    .map(normalizeReview)
    .filter(Boolean)
    .filter((review) => {
      const key = reviewUniqueKey(review);
      if (seenReviews.has(key)) return false;
      seenReviews.add(key);
      return true;
    })
    .slice(0, maxReviews);

  return {
    name: pickString(primaryPlace.title, primaryPlace.name, payload.title, payload.name, branch.expectedName),
    rating: pickNumber(primaryPlace.rating, payload.rating),
    reviewCount: pickInteger(
      primaryPlace.reviews,
      primaryPlace.review_count,
      primaryPlace.reviews_count,
      primaryPlace.user_ratings_total,
      payload.reviews,
      payload.review_count
    ),
    address: pickString(
      primaryPlace.address,
      primaryPlace.full_address,
      primaryPlace.formatted_address,
      payload.address,
      branch.address
    ),
    phone: pickString(primaryPlace.phone, primaryPlace.phone_number, payload.phone, branch.phone),
    mapsUrl: pickString(
      primaryPlace.address_link,
      primaryPlace.maps_link,
      primaryPlace.google_maps_url,
      primaryPlace.link,
      payload.google_url,
      payload.link,
      branch.mapsUrl
    ),
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    reviews,
  };
}

function placeIdentifiersFrom(branch, payload) {
  const place = objectFrom(...placeObjectsFrom(payload));

  return {
    dataId: pickString(
      branch.dataId,
      branch.data_id,
      place.data_id,
      place.dataId,
      payload.data_id,
      payload.dataId,
      extractGoogleMapsDataId(
        place.address_link,
        place.maps_link,
        place.google_maps_url,
        place.link,
        payload.google_url,
        payload.link
      )
    ),
    placeId: pickString(
      branch.placeId,
      branch.place_id,
      place.place_id,
      place.placeId,
      payload.place_id,
      payload.placeId
    ),
  };
}

function reviewUniqueKey(review) {
  return pickString(review.reviewId, review.url, `${review.text}|${review.rating}`);
}

function nextPageTokenFrom(payload) {
  return pickString(
    payload?.pagination?.next_page_token,
    payload?.pagination?.nextPageToken,
    payload?.next_page_token,
    payload?.nextPageToken
  );
}

function branchLooksValid(branch, normalized) {
  const expectedPhone = normalizeDigits(branch.phone).slice(-10);
  const receivedPhone = normalizeDigits(normalized.phone).slice(-10);
  const phoneOk = !expectedPhone || !receivedPhone || expectedPhone === receivedPhone;

  const expectedAddress = normalizeText(branch.address);
  const receivedAddress = normalizeText(normalized.address);
  const addressTokens = expectedAddress
    .split(/[,\s]+/)
    .filter((token) => token.length >= 4 && !["local", "sector"].includes(token))
    .slice(0, 8);
  const addressMatches = addressTokens.filter((token) => receivedAddress.includes(token)).length;
  const addressOk = !receivedAddress || addressMatches >= Math.min(3, addressTokens.length);

  return phoneOk && addressOk;
}

function mergeBranchReviews(base, details) {
  const reviews = details.reviews.length ? details.reviews : base.reviews;

  return {
    ...base,
    rating: Number(details.rating) > 0 ? details.rating : base.rating,
    reviewCount: Number(details.reviewCount) > 0 ? details.reviewCount : base.reviewCount,
    mapsUrl: details.mapsUrl || base.mapsUrl,
    latitude: details.latitude ?? base.latitude,
    longitude: details.longitude ?? base.longitude,
    reviews,
  };
}

function mergeImportedBranchReviews(base, importedReviews) {
  return {
    ...base,
    reviews: importedReviews.length ? importedReviews : base.reviews,
  };
}

async function callSearchApi(params, { simulateError = false } = {}) {
  if (simulateError || process.env.SEARCHAPI_FORCE_ERROR === "1") {
    throw new Error("SearchAPI error simulated");
  }

  const apiKey = process.env.SEARCHAPI_API_KEY;
  if (!apiKey) {
    throw new Error("SEARCHAPI_API_KEY is not configured");
  }

  const url = new URL(SEARCHAPI_URL);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set("api_key", apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    const body = await response.text();
    let payload = null;

    try {
      payload = JSON.parse(body);
    } catch {
      payload = { error: body };
    }

    if (!response.ok) {
      const message = payload?.error || payload?.message || `SearchAPI returned ${response.status}`;
      throw new Error(message);
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchReviewPages(branch, identifiers, options = {}) {
  const limits = googleReviewsImportLimits(options);
  const reviews = [];
  const seenReviews = new Set();
  let fetchedReviews = 0;
  let pagesFetched = 0;
  let nextPageToken = "";
  let stopReason = "NO_RESULTS";

  for (let page = 0; page < limits.maxPages; page += 1) {
    if (reviews.length >= limits.maxReviewsPerBranch) {
      stopReason = "MAX_REVIEWS_PER_BRANCH";
      break;
    }

    const payload = await callSearchApi(
      {
        engine: "google_maps_reviews",
        ...(identifiers.dataId ? { data_id: identifiers.dataId } : { place_id: identifiers.placeId }),
        ...(nextPageToken ? { next_page_token: nextPageToken } : {}),
        sort_by: "most_relevant",
        num: String(Math.min(googleReviewsPageSize, limits.maxReviewsPerBranch - reviews.length)),
        hl: "es",
        gl: "mx",
      },
      options
    );

    pagesFetched += 1;

    const pageDetails = normalizeBranch(branch, payload, { maxReviews: Number.POSITIVE_INFINITY });
    const normalizedReviews = pageDetails.reviews || [];
    fetchedReviews += normalizedReviews.length;

    normalizedReviews.forEach((review) => {
      const key = reviewUniqueKey(review);
      if (!key || seenReviews.has(key) || reviews.length >= limits.maxReviewsPerBranch) return;
      seenReviews.add(key);
      reviews.push(review);
    });

    nextPageToken = nextPageTokenFrom(payload);

    if (!nextPageToken) {
      stopReason = "EXHAUSTED";
      break;
    }

    stopReason = "MAX_PAGES";
  }

  return {
    reviews,
    report: {
      pagesFetched,
      fetchedReviews,
      uniqueReviews: reviews.length,
      duplicatesRemoved: Math.max(0, fetchedReviews - reviews.length),
      maxPages: limits.maxPages,
      maxReviewsPerBranch: limits.maxReviewsPerBranch,
      stopReason,
    },
  };
}

async function fetchBranch(branch, options = {}) {
  const payload = await callSearchApi(
    {
      engine: "google_place",
      kgmid: branch.kgmid,
      hl: "es",
      gl: "mx",
    },
    options
  );
  const normalized = normalizeBranch(branch, payload);

  if (!branchLooksValid(branch, normalized)) {
    throw new Error(`SearchAPI result did not validate for ${branch.label}`);
  }

  const identifiers = placeIdentifiersFrom(branch, payload);
  if (!identifiers.dataId && !identifiers.placeId) {
    return {
      branch: normalized,
      report: {
        googleReviewCount: normalized.reviewCount,
        fetchedReviews: normalized.reviews.length,
        uniqueReviews: normalized.reviews.length,
        pagesFetched: 0,
        duplicatesRemoved: 0,
        stopReason: "NO_PLACE_IDENTIFIER",
      },
    };
  }

  try {
    const reviewImport = await fetchReviewPages(branch, identifiers, options);
    return {
      branch: mergeImportedBranchReviews(normalized, reviewImport.reviews),
      report: {
        googleReviewCount: normalized.reviewCount,
        ...reviewImport.report,
      },
    };
  } catch {
    return {
      branch: normalized,
      report: {
        googleReviewCount: normalized.reviewCount,
        fetchedReviews: normalized.reviews.length,
        uniqueReviews: normalized.reviews.length,
        pagesFetched: 0,
        duplicatesRemoved: 0,
        stopReason: "REVIEWS_IMPORT_FAILED",
      },
    };
  }
}

async function readCache() {
  try {
    const file = await readFile(cachePath, "utf8");
    const parsed = JSON.parse(file.replace(/^\uFEFF/, ""));

    if (!parsed || typeof parsed !== "object" || !parsed.branches) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function writeCache(data) {
  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(cachePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function hasReviewCountsWithoutTexts(cache) {
  return Object.values(cache?.branches || {}).some((branch) => {
    const hasCount = Number(branch?.reviewCount) > 0;
    const hasReviewTexts = (branch?.reviews || []).some((review) => pickString(review?.text));
    return hasCount && !hasReviewTexts;
  });
}

function isFresh(cache) {
  if (!cache?.updatedAt) return false;
  if (hasReviewCountsWithoutTexts(cache)) return false;
  const updatedAt = new Date(cache.updatedAt).getTime();
  return Number.isFinite(updatedAt) && Date.now() - updatedAt < refreshIntervalMs;
}

export function hasReviewData(data) {
  return Object.values(data?.branches || {}).some((branch) => {
    return Number(branch.rating) > 0 || Number(branch.reviewCount) > 0 || (branch.reviews || []).length > 0;
  });
}

export async function refreshGoogleReviewsCache(options = {}) {
  const previousCache = await readCache();
  const branches = {};
  const importReport = {};
  let successCount = 0;
  const errors = {};

  for (const [key, branch] of branchEntries()) {
    try {
      const result = await fetchBranch(branch, options);
      branches[key] = result.branch;
      importReport[key] = {
        branchLabel: branch.label || key,
        ...result.report,
      };
      successCount += 1;
    } catch (error) {
      errors[key] = error.message;
      branches[key] = previousCache?.branches?.[key] || emptyBranch(branch);
      importReport[key] = {
        branchLabel: branch.label || key,
        googleReviewCount: Number(branches[key]?.reviewCount) || 0,
        fetchedReviews: 0,
        uniqueReviews: (branches[key]?.reviews || []).length,
        pagesFetched: 0,
        duplicatesRemoved: 0,
        stopReason: "BRANCH_IMPORT_FAILED",
        error: error.message,
      };
    }
  }

  if (successCount === 0) {
    const error = new Error("SearchAPI failed for every branch");
    error.details = errors;
    throw error;
  }

  const data = {
    updatedAt: new Date().toISOString(),
    branches,
  };

  await writeCache(data);
  return { ...data, importReport };
}

function queueBackgroundRefresh(options = {}) {
  if (backgroundRefresh) return;

  backgroundRefresh = refreshGoogleReviewsCache(options)
    .catch(() => null)
    .finally(() => {
      backgroundRefresh = null;
    });
}

export async function getGoogleReviews(options = {}) {
  const forceRefresh = Boolean(options.forceRefresh);
  const cache = await readCache();

  if (cache && isFresh(cache) && !forceRefresh) {
    return { data: cache, status: "fresh-cache", stale: false, available: hasReviewData(cache) };
  }

  if (cache && !forceRefresh) {
    queueBackgroundRefresh(options);
    return { data: cache, status: "stale-cache-refreshing", stale: true, available: hasReviewData(cache) };
  }

  try {
    const data = await refreshGoogleReviewsCache(options);
    return { data, status: "refreshed", stale: false, available: hasReviewData(data) };
  } catch (error) {
    if (cache) {
      return {
        data: cache,
        status: "stale-cache-after-error",
        stale: true,
        available: hasReviewData(cache),
        error: error.message,
      };
    }

    const data = emptyReviewsData();
    return {
      data,
      status: "unavailable",
      stale: false,
      available: false,
      error: error.message,
    };
  }
}

export async function searchInitialCandidates(engine, query, options = {}) {
  const payload = await callSearchApi(
    {
      engine,
      q: query,
      hl: "es",
      gl: "mx",
    },
    options
  );

  const candidates = listFrom(
    payload.local_results,
    payload.places_results,
    payload.map_results,
    payload.organic_results,
    payload.results
  );

  return candidates.map((candidate) => ({
    name: pickString(candidate.title, candidate.name),
    kgmid: pickString(candidate.kgmid, candidate.mid, candidate.knowledge_graph_id),
    placeId: pickString(candidate.place_id, candidate.placeId),
    address: pickString(candidate.address, candidate.full_address, candidate.snippet),
    phone: pickString(candidate.phone, candidate.phone_number),
    rating: pickNumber(candidate.rating),
    reviewCount: pickInteger(candidate.reviews, candidate.review_count, candidate.reviews_count),
    link: pickString(candidate.link, candidate.maps_link, candidate.google_maps_url),
  }));
}
