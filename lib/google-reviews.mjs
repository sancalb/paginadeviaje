import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const configPath = join(rootDir, "config", "google-reviews-branches.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));

const SEARCHAPI_URL = "https://www.searchapi.io/api/v1/search";
const refreshIntervalMs = Number(config.refreshIntervalDays || 7) * 24 * 60 * 60 * 1000;
const defaultCachePath = join(rootDir, "storage", "google-reviews-cache.json");
const cachePath = process.env.GOOGLE_REVIEWS_CACHE_PATH || defaultCachePath;

let backgroundRefresh = null;

export const reviewBranches = config.branches;
export const reviewRefreshIntervalDays = Number(config.refreshIntervalDays || 7);

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

function listFrom(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value;
    }
  }
  return [];
}

function emptyBranch(branch) {
  return {
    name: branch.expectedName || "",
    rating: null,
    reviewCount: 0,
    address: branch.address || "",
    phone: branch.phone || "",
    mapsUrl: branch.mapsUrl || "",
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

  return {
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
    rating: pickNumber(review.rating, review.stars, review.score),
    text,
    link: pickString(review.link, review.review_link, review.url, review.share_link, review.review_url),
  };
}

function normalizeBranch(branch, payload) {
  const place = payload.place_results || payload.place_result || payload.place || payload.result || {};
  const reviews = listFrom(
    payload.review_results,
    payload.reviews_results,
    payload.reviews,
    payload.place_reviews,
    payload.user_reviews,
    place.review_results,
    place.reviews_results,
    place.review_snippets,
    place.place_reviews,
    place.user_reviews,
    place.reviews
  )
    .map(normalizeReview)
    .filter(Boolean)
    .slice(0, 6);

  return {
    name: pickString(place.title, place.name, payload.title, payload.name, branch.expectedName),
    rating: pickNumber(place.rating, payload.rating),
    reviewCount: pickInteger(
      place.reviews,
      place.review_count,
      place.reviews_count,
      place.user_ratings_total,
      payload.reviews,
      payload.review_count
    ),
    address: pickString(place.address, place.full_address, place.formatted_address, payload.address, branch.address),
    phone: pickString(place.phone, place.phone_number, payload.phone, branch.phone),
    mapsUrl: pickString(
      place.address_link,
      place.maps_link,
      place.google_maps_url,
      place.link,
      payload.google_url,
      payload.link,
      branch.mapsUrl
    ),
    reviews,
  };
}

function placeIdentifiersFrom(branch, payload) {
  const place = payload.place_results || payload.place_result || payload.place || payload.result || {};

  return {
    dataId: pickString(branch.dataId, branch.data_id, place.data_id, place.dataId, payload.data_id, payload.dataId),
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
    reviews,
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
    return normalized;
  }

  try {
    const reviewPayload = await callSearchApi(
      {
        engine: "google_maps_reviews",
        ...(identifiers.dataId ? { data_id: identifiers.dataId } : { place_id: identifiers.placeId }),
        sort_by: "most_relevant",
        num: "6",
        hl: "es",
        gl: "mx",
      },
      options
    );
    const reviewDetails = normalizeBranch(branch, reviewPayload);
    return mergeBranchReviews(normalized, reviewDetails);
  } catch {
    return normalized;
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

function isFresh(cache) {
  if (!cache?.updatedAt) return false;
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
  let successCount = 0;
  const errors = {};

  for (const [key, branch] of branchEntries()) {
    try {
      branches[key] = await fetchBranch(branch, options);
      successCount += 1;
    } catch (error) {
      errors[key] = error.message;
      branches[key] = previousCache?.branches?.[key] || emptyBranch(branch);
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
  return data;
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
