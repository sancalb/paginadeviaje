import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  attachReviewTranslation,
  loadReviewTranslations,
  MAX_REVIEW_TRANSLATIONS,
  MAX_REVIEW_TRANSLATIONS_BYTES,
  reviewSourceTextHash,
  reviewTranslationId,
} from "../review-translations.ts";
import { auditReviewTranslations, createHomeReviewSelector } from "../../../tools/check-review-translations.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const dataPath = join(root, "data/review-translations.json");
const synthetic = { reviewId: "synthetic-id", text: "Un viaje excelente.", url: "https://example.test/review/1" };
const entry = (review = synthetic) => ({
  reviewId: reviewTranslationId(review),
  sourceTextHash: reviewSourceTextHash(review.text),
  sourceLanguage: "es",
  targetLanguage: "en",
  translatedText: "An excellent trip.",
  translator: "deviaje.mx",
  createdAt: "2026-11-07T19:27:20Z",
  languageDecision: { method: "manual", note: "Synthetic Spanish sentence, manually read in full." },
});
const dictionary = (review = synthetic) => ({ [reviewTranslationId(review)]: entry(review) });

async function directory(t) {
  const path = await mkdtemp(join(tmpdir(), "discover-review-translations-"));
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}

test("attachment exposes exactly the UI contract and preserves original fields without mutation", () => {
  const images = ["https://example.test/photo.jpg"];
  const review = Object.freeze({ ...synthetic, rating: 5, author: "Synthetic Author", images, other: { retained: true } });
  const translations = dictionary(review);
  const attached = attachReviewTranslation(review, translations);
  const { translation, ...original } = attached;
  assert.deepEqual(original, review);
  assert.notEqual(attached, review);
  assert.equal(attached.images, images);
  assert.equal(attached.other, review.other);
  assert.equal(Object.hasOwn(review, "translation"), false);
  assert.deepEqual(translation, {
    text: "An excellent trip.",
    sourceLanguage: "es",
    targetLanguage: "en",
    translator: "deviaje.mx",
  });
  translation.text = "Changed only in this returned object";
  assert.equal(translations[synthetic.reviewId].translatedText, "An excellent trip.");
});

test("hash is exact UTF-8 SHA-256, never trimmed or normalized", () => {
  const source = "\u00e1\nA\r\n ";
  assert.equal(reviewSourceTextHash(source), createHash("sha256").update(Buffer.from(source, "utf8")).digest("hex"));
  for (const changed of [source.trim(), source.normalize("NFD"), source.replace(/\r/g, "")])
    assert.notEqual(reviewSourceTextHash(source), reviewSourceTextHash(changed));
});

test("identity prefers the exact real ID; URL fallback is canonical and stable", () => {
  assert.equal(reviewTranslationId(synthetic), synthetic.reviewId);
  const noId = { text: synthetic.text, url: "https://EXAMPLE.test:443/review/1" };
  const key = `url-sha256:${reviewSourceTextHash("https://example.test/review/1")}`;
  assert.equal(reviewTranslationId(noId), key);
  assert.equal(reviewTranslationId({ ...noId, author: "Different synthetic author", text: "Changed original" }), key);
  assert.ok(attachReviewTranslation(noId, dictionary(noId)).translation);
  assert.equal(attachReviewTranslation({ ...noId, text: "Changed original" }, dictionary(noId)).translation, undefined);
  assert.equal(attachReviewTranslation({ ...noId, reviewId: "new-real-id" }, dictionary(noId)).translation, undefined);
  for (const url of [undefined, "", "http://example.test/1", "javascript:alert(1)", "https://user:password@example.test/1"])
    assert.equal(reviewTranslationId({ text: synthetic.text, url }), undefined);
  assert.equal(reviewTranslationId({ ...synthetic, reviewId: "x".repeat(301) }), undefined);
});

test("unknown IDs, source changes, wrong metadata and stale attachments fail closed", () => {
  const prior = { ...synthetic, translation: { text: "Untrusted stale attachment" } };
  const invalidEntries = [
    { ...entry(), reviewId: "other-id" },
    { ...entry(), sourceTextHash: "0".repeat(64) },
    { ...entry(), sourceTextHash: "not-a-hash" },
    { ...entry(), sourceLanguage: "en" },
    { ...entry(), targetLanguage: "es" },
    { ...entry(), translator: "Unverified provider" },
    { ...entry(), createdAt: "not-a-date" },
    { ...entry(), translatedText: " " },
    { ...entry(), languageDecision: { method: "automatic", note: "Assumed from locale" } },
    null,
  ];
  for (const invalid of invalidEntries) {
    const attached = attachReviewTranslation(prior, { [synthetic.reviewId]: invalid });
    assert.equal(Object.hasOwn(attached, "translation"), false);
    assert.equal(attached.text, synthetic.text);
  }
  for (const text of [synthetic.text + " ", synthetic.text + "\n", "Changed", " "]) {
    const attached = attachReviewTranslation({ ...prior, text }, dictionary());
    assert.equal(attached.translation, undefined);
    assert.equal(attached.text, text);
  }
  assert.equal(attachReviewTranslation({ ...prior, reviewId: "unknown" }, dictionary()).translation, undefined);
  assert.equal(attachReviewTranslation(prior, {}).translation, undefined);
  assert.equal(attachReviewTranslation(prior, Object.create(dictionary())).translation, undefined);
  assert.equal(prior.translation.text, "Untrusted stale attachment");
});

test("unlisted English remains original; language is not inferred from geography or locale", () => {
  const english = { reviewId: "synthetic-english", text: "A wonderful trip to Cancun. Highly recommended!" };
  assert.deepEqual(attachReviewTranslation(english, dictionary()), english);
  const explicitlyEnglish = { ...entry(english), sourceLanguage: "en" };
  assert.equal(attachReviewTranslation(english, { [english.reviewId]: explicitlyEnglish }).translation, undefined);
});

test("loader reads local JSON, skips bad entries and never fetches or logs", async (t) => {
  const temp = await directory(t);
  const path = join(temp, "translations.json");
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("No network allowed"); });
  const log = t.mock.method(console, "log", () => {});
  const warn = t.mock.method(console, "warn", () => {});
  const error = t.mock.method(console, "error", () => {});
  await writeFile(path, JSON.stringify({
    ...dictionary(),
    mismatch: entry(),
    malformed: { translatedText: "Synthetic secret" },
    constructor: { ...entry(), reviewId: "constructor" },
    ["__proto__"]: { ...entry(), reviewId: "__proto__" },
  }));
  const loaded = await loadReviewTranslations(path);
  assert.deepEqual(Object.keys(loaded), [synthetic.reviewId]);
  assert.ok(attachReviewTranslation(synthetic, loaded).translation);
  assert.deepEqual(await loadReviewTranslations(join(temp, "missing.json")), {});
  assert.deepEqual(await loadReviewTranslations(temp), {});
  for (const mock of [fetch, log, warn, error]) assert.equal(mock.mock.callCount(), 0);
});

test("loader rejects malformed JSON, bad root shapes, byte limits and entry limits", async (t) => {
  const temp = await directory(t);
  const path = join(temp, "translations.json");
  for (const data of ["{", "null", "[]", "42", '"text"', " ".repeat(MAX_REVIEW_TRANSLATIONS_BYTES + 1)]) {
    await writeFile(path, data);
    assert.deepEqual(await loadReviewTranslations(path), {});
  }
  const many = Object.fromEntries(Array.from({ length: MAX_REVIEW_TRANSLATIONS + 1 }, (_, index) => [`synthetic-${index}`, {}]));
  await writeFile(path, JSON.stringify(many));
  assert.deepEqual(await loadReviewTranslations(path), {});
  // A valid file exactly at the byte boundary is accepted.
  const json = JSON.stringify(dictionary());
  await writeFile(path, json + " ".repeat(MAX_REVIEW_TRANSLATIONS_BYTES - Buffer.byteLength(json)));
  assert.equal(Object.keys(await loadReviewTranslations(path)).length, 1);
});

test("default fixed path and environment override are usable; explicit path wins", async (t) => {
  const temp = await directory(t);
  const path = join(temp, "translations.json");
  await writeFile(path, JSON.stringify(dictionary()));
  const previous = process.env.GOOGLE_REVIEW_TRANSLATIONS_PATH;
  t.after(() => {
    if (previous === undefined) delete process.env.GOOGLE_REVIEW_TRANSLATIONS_PATH;
    else process.env.GOOGLE_REVIEW_TRANSLATIONS_PATH = previous;
  });
  delete process.env.GOOGLE_REVIEW_TRANSLATIONS_PATH;
  assert.equal(Object.keys(await loadReviewTranslations()).length, 10);
  process.env.GOOGLE_REVIEW_TRANSLATIONS_PATH = path;
  assert.deepEqual(Object.keys(await loadReviewTranslations()), [synthetic.reviewId]);
  assert.equal(Object.keys(await loadReviewTranslations(dataPath)).length, 10);
  process.env.GOOGLE_REVIEW_TRANSLATIONS_PATH = join(temp, "missing.json");
  assert.deepEqual(await loadReviewTranslations(), {});
});

const review = (id, text, extra = {}) => ({ reviewId: id, text, author: "Synthetic Author", rating: 5, ...extra });
const branch = (reviews) => ({ reviews, mapsUrl: "https://example.test/maps", rating: 5, reviewCount: reviews.length });

test("real selector preserves branch order, round robin, ID and quote dedup, then stable Mexico priority", async () => {
  const select = await createHomeReviewSelector();
  const branches = {
    first: branch([
      review("a", "First generic trip"),
      review("mexico", "Mi viaje a Canc\u00fan"),
      review("repeat-id", "Earlier ID wins"),
      review("q1", "Same quote"),
      review("blank", "  "),
    ]),
    second: branch([
      review("b", "Second generic trip"),
      review("mexico-2", "Mi viaje a CDMX"),
      review("repeat-id", "Later duplicate ID"),
      review("q2", "Same quote"),
    ]),
  };
  assert.deepEqual(Array.from(select(branches), (item) => item.reviewId), ["mexico", "mexico-2", "a", "b", "repeat-id", "q1"]);
  const urlDedup = select({ one: branch([
    review("", "URL one", { url: "https://EXAMPLE.test:443/review/1" }),
    review("", "URL two", { url: "https://example.test/review/1" }),
  ]) });
  assert.equal(urlDedup.length, 1);
  const fallbackDedup = select({ one: branch([
    review("", " Fallback quote ", { url: "http://example.test/unsafe" }),
    review("", "Fallback quote", { url: "javascript:invalid" }),
  ]) });
  assert.equal(fallbackDedup.length, 1);
  assert.equal(fallbackDedup[0].url, "https://example.test/maps");
});

test("real selector uses original text, Mexican-name context and a final ten-item limit", async () => {
  const select = await createHomeReviewSelector();
  const input = [
    review("office", "La oficina en Guadalajara me atendio muy bien."),
    review("drink", "Nos ofrecieron un tequila."),
    review("travel", "Mi viaje a Guadalajara fue excelente."),
    review("multi", "El viaje a Canc\u00fan y Los Cabos."),
    review("foreign", "El viaje a Brasil.", { translation: { text: "An invented trip to Cancun" } }),
    ...Array.from({ length: 12 }, (_, i) => review(`other-${i}`, `Generic synthetic trip ${i}`)),
  ];
  const selected = select({ one: branch(input) });
  assert.equal(selected.length, 10);
  assert.deepEqual(Array.from(selected.slice(0, 2), (item) => item.reviewId), ["travel", "multi"]);
  assert.equal(selected[0].destination.slug, "guadalajara");
  assert.equal(selected[1].destination, undefined);
  assert.equal(selected.find((item) => item.reviewId === "foreign").mexico, false);
});

test("ten authored records have explicit manual Spanish decisions and nonfuture creation times", async () => {
  const records = Object.values(await loadReviewTranslations(dataPath));
  assert.equal(records.length, 10);
  for (const record of records) {
    assert.equal(record.languageDecision.method, "manual");
    assert.ok(record.languageDecision.note.length > 30);
    assert.equal(record.sourceLanguage, "es");
    assert.equal(record.targetLanguage, "en");
    assert.ok(Date.parse(record.createdAt) <= Date.now());
  }
});

test("current publication is exactly covered; total-cache coverage is separate; cache stays unchanged", async (t) => {
  const path = join(root, "../storage/google-reviews-cache.json");
  let before;
  try { before = await readFile(path); }
  catch (error) {
    if (error.code === "ENOENT") { t.skip("Local shared cache not present"); return; }
    throw error;
  }
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("No network allowed"); });
  const result = await auditReviewTranslations({ translationsPath: dataPath });
  assert.equal(result.home.selected, 10);
  assert.equal(result.home.translated, 10);
  assert.equal(result.home.originalFallback, 0);
  assert.equal(result.home.mexicoPrioritized, 7);
  assert.equal(result.cache.total, 307);
  assert.equal(result.cache.translated, 10);
  assert.equal(result.cache.originalFallback, 297);
  assert.equal(result.records.total, 10);
  assert.equal(result.records.matchedInCache, 10);
  assert.equal(result.records.outsideHome, 0);
  assert.equal(result.records.unmatched, 0);
  const after = await readFile(path);
  assert.equal(createHash("sha256").update(before).digest("hex"), createHash("sha256").update(after).digest("hex"));
  assert.equal(fetch.mock.callCount(), 0);
});

test("audit CLI prints only aggregate numbers/hash and rejects extra modes without echoing them", () => {
  const run = (args) => spawnSync(process.execPath, [
    "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
    "--experimental-strip-types", "--import", "./lib/server/tests/register.mjs",
    "tools/check-review-translations.mjs", ...args,
  ], { cwd: root, encoding: "utf8", env: { ...process.env, GOOGLE_REVIEW_TRANSLATIONS_PATH: dataPath } });
  const valid = run(["--audit"]);
  assert.equal(valid.status, 0);
  const result = JSON.parse(valid.stdout);
  assert.deepEqual(Object.keys(result).sort(), ["cache", "home", "records"]);
  for (const [section, values] of Object.entries(result)) {
    for (const [key, value] of Object.entries(values)) {
      if (section === "cache" && key === "sha256") assert.match(value, /^[a-f0-9]{64}$/);
      else assert.equal(typeof value, "number");
    }
  }
  assert.equal(valid.stderr, "");
  const invalid = run(["--audit", "synthetic-private@example.test"]);
  assert.equal(invalid.status, 2);
  assert.equal(invalid.stdout, "");
  assert.ok(!invalid.stderr.includes("synthetic-private"));
});
