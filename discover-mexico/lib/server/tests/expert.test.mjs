// Run from discover-mexico:
// node --experimental-strip-types --import ./lib/server/tests/register.mjs --test ./lib/server/tests/expert.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import { transpileModule, ModuleKind, JsxEmit } from "typescript";
import { renderToStaticMarkup } from "react-dom/server";
import { approvedExpertProfiles, publicExperts } from "../experts.ts";
import { GET } from "../../../app/api/experts/route.ts";

const id = "misael-rodriguez";
const entry = (updates = {}) => ({
  id,
  displayName: "Misael",
  active: true,
  publicationApproved: true,
  confirmedLanguages: ["en", "es"],
  ...updates,
});
const envFor = (...entries) => ({ EXPERTS_ALLOWLIST_JSON: JSON.stringify(entries) });
const mention = (updates = {}) => ({
  advisorId: id, matchType: "FULL_NAME", matchConfidence: 1, ...updates,
});
const review = (updates = {}) => ({
  reviewId: "fixture-1", author: "Fixture reviewer", rating: 4,
  text: "Original fixture review, not a production testimonial.",
  url: "https://www.google.com/maps/reviews/fixture-1",
  advisorMentions: [mention()], ...updates,
});
const snapshot = (reviews = []) => ({
  updatedAt: "2026-11-07T00:00:00Z",
  meta: { stale: true },
  branches: { monterrey: { rating: 5, reviewCount: 9999, reviews } },
});
const profiles = (reviews, updates = {}) => approvedExpertProfiles({
  env: envFor(entry(updates)), getReviews: async () => snapshot(reviews),
});

test("copied catalog contains only real IDs and public names, never approvals", async () => {
  const root = JSON.parse(await readFile(new URL("../../../../data/advisors.json", import.meta.url), "utf8"));
  const copy = JSON.parse(await readFile(new URL("../../../data/experts.json", import.meta.url), "utf8"));
  assert.deepEqual(copy, root.advisors.map(({ id, displayName }) => ({ id, displayName })));
});

test("publicExperts remains synchronous and preserves the exact legacy shape", () => {
  assert.deepEqual(publicExperts(JSON.stringify([
    { id: "legacy", displayName: "Legacy", active: true, bilingual: true },
  ])), [{ id: "legacy", displayName: "Legacy", languages: ["en", "es"] }]);
});

test("modern approvals publish only explicitly confirmed languages", () => {
  for (const languages of [["en"], ["es"], ["en", "es"], ["es", "en"]]) {
    assert.deepEqual(publicExperts(envFor(entry({ confirmedLanguages: languages })).EXPERTS_ALLOWLIST_JSON),
      [{ id, displayName: "Misael", languages }]);
  }
  assert.deepEqual(publicExperts(envFor(entry({ bilingual: true, confirmedLanguages: ["es"] })).EXPERTS_ALLOWLIST_JSON)[0].languages, ["es"]);
});

test("missing, malformed, unconfirmed or revoked permissions fail closed", () => {
  for (const raw of ["", "{", "null", "{}", '[{"active":true}]']) {
    assert.deepEqual(publicExperts(raw), []);
  }
  for (const updates of [
    { active: false }, { active: "true" }, { publicationApproved: false },
    { publicationApproved: undefined }, { confirmedLanguages: undefined },
    { confirmedLanguages: [] }, { confirmedLanguages: ["fr"] },
    { publicationApproved: "true" },
    { bilingual: true, publicationApproved: false },
    { confirmedLanguages: ["en"], unexpectedPrivateField: "private" },
  ]) {
    assert.deepEqual(publicExperts(envFor(entry(updates)).EXPERTS_ALLOWLIST_JSON), []);
  }
  assert.deepEqual(publicExperts(JSON.stringify(Array.from({ length: 101 }, (_, i) => entry({ id: `expert-${i}` })))), []);
});

test("conflicting duplicate identities cannot override a revocation", () => {
  assert.deepEqual(publicExperts(envFor(entry(), entry({ active: false })).EXPERTS_ALLOWLIST_JSON), []);
});

test("no approvals means no profiles and no reviews request", async () => {
  let calls = 0;
  assert.deepEqual(await approvedExpertProfiles({
    env: {}, getReviews: async () => { calls++; return snapshot(); },
  }), []);
  assert.deepEqual(await approvedExpertProfiles({
    env: envFor(entry({ id: "invented-advisor" })),
    getReviews: async () => { assert.fail("unknown identity must never request reviews"); },
  }), []);
  assert.equal(calls, 0);
});

test("an explicit empty environment cannot inherit process-level approvals", async (t) => {
  const previous = process.env.EXPERTS_ALLOWLIST_JSON;
  t.after(() => {
    if (previous === undefined) delete process.env.EXPERTS_ALLOWLIST_JSON;
    else process.env.EXPERTS_ALLOWLIST_JSON = previous;
  });
  process.env.EXPERTS_ALLOWLIST_JSON = envFor(entry()).EXPERTS_ALLOWLIST_JSON;
  assert.deepEqual(await approvedExpertProfiles({ env: {} }), []);
});

test("profiles use catalog names and forward the same allowlist to getReviews", async () => {
  const env = envFor(entry({ displayName: "Untrusted override" }));
  const result = await approvedExpertProfiles({
    env, getReviews: async (options) => {
      assert.equal(options.env, env);
      return snapshot();
    },
  });
  assert.equal(result[0].displayName, "Misael");
  assert.equal(result[0].photoUrl, null);
  assert.equal(result[0].averageRating, null);
  assert.equal(result[0].quote, null);
});

test("only confirmed full names and unique aliases contribute; no branch totals or duplicate inflation", async () => {
  const first = review();
  const second = review({ reviewId: "fixture-2", rating: 2,
    advisorMentions: [mention({ matchType: "UNIQUE_ALIAS", matchConfidence: 0.86 })] });
  const data = snapshot([first, second, first]);
  data.branches.guadalajara = { reviews: [first, second] };
  const [profile] = await approvedExpertProfiles({ env: envFor(entry()), getReviews: async () => data });
  assert.equal(profile.reviewCount, 2);
  assert.equal(profile.averageRating, 3);
  assert.equal(profile.quote.text, first.text);
  assert.equal(profile.reviewsUpdatedAt, data.updatedAt);
  assert.equal(profile.reviewsStale, true);
  assert.deepEqual(Object.keys(profile.reviews[0]).sort(), ["author", "rating", "reviewId", "text", "url"]);
});

test("ambiguous, low-confidence, stripped and foreign matches never become testimonials", async () => {
  const unsafe = [
    { advisorId: id }, mention({ matchType: "AMBIGUOUS" }),
    mention({ matchType: "FULL_NAME", matchConfidence: 0.99 }),
    mention({ matchType: "UNIQUE_ALIAS", matchConfidence: 0.85 }),
    mention({ matchType: "UNIQUE_ALIAS", matchConfidence: "0.94" }),
    mention({ advisorId: "alberto-sanchez" }),
    mention({ matchConfidence: undefined }),
  ];
  const [profile] = await profiles(unsafe.map((value, index) => review({
    reviewId: `unsafe-${index}`, advisorMentions: [value],
    unresolvedAdvisorMentions: [mention()], text: "Misael speaks English and Spanish.",
  })), { confirmedLanguages: ["es"] });
  assert.equal(profile.reviewCount, 0);
  assert.equal(profile.quote, null);
  assert.deepEqual(profile.languages, ["es"]);
});

test("only attributed valid reviews count, preserving negatives and original quote", async () => {
  const [profile] = await profiles([
    review({ text: "Original critical fixture.", rating: 1 }),
    review({ reviewId: "valid", rating: 5, advisorMentions: [{ bad: true }, mention()] }),
    review({ reviewId: "invalid", rating: 6 }),
    review({ reviewId: "unattributed", advisorMentions: [] }),
  ]);
  assert.equal(profile.reviewCount, 2);
  assert.equal(profile.averageRating, 3);
  assert.equal(profile.quote.text, "Original critical fixture.");
});

test("unsafe URLs cannot become quote links and private match fields are stripped", async () => {
  for (const url of ["javascript:alert(1)", "http://example.test", "https://user:password@example.test", "//example.test"]) {
    const [profile] = await profiles([review({ url, privateField: "private", advisorMentions: [mention({ matchedAlias: "private" })] })]);
    assert.equal(profile.quote, null);
    assert.equal(profile.reviews[0].url, "");
    assert.ok(!JSON.stringify(profile).includes("private"));
  }
});

test("provided English translations preserve the Spanish original; malformed translations are ignored", async () => {
  const translation = { text: "Fixture translation, not a production testimonial.", sourceLanguage: "es", targetLanguage: "en", translator: "Fixture operator" };
  const [profile] = await profiles([review({ translation })]);
  assert.deepEqual(profile.quote.translation, translation);
  assert.equal(profile.quote.text, review().text);
  for (const invalid of ["invented", { ...translation, text: "" }, { ...translation, targetLanguage: "fr" }, { ...translation, translator: undefined }]) {
    const [profile] = await profiles([review({ translation: invalid })]);
    assert.equal(profile.quote.text, review().text);
    assert.equal(profile.quote.translation, undefined);
  }
});

test("review outages and invalid payloads preserve approved identity, never a fabricated rating", async () => {
  for (const getReviews of [
    async () => { throw new Error("offline"); },
    async () => ({ branches: { monterrey: null } }),
  ]) {
    const [profile] = await approvedExpertProfiles({ env: envFor(entry()), getReviews });
    assert.equal(profile.displayName, "Misael");
    assert.equal(profile.reviewCount, 0);
    assert.equal(profile.averageRating, null);
    assert.equal(profile.quote, null);
    assert.equal(profile.reviewsStale, true);
  }
});

test("photos need separate literal authorization and an existing local file", async () => {
  // An existing office asset is only a file-existence fixture, not an advisor portrait.
  for (const photosAuthorized of [undefined, false]) {
    const [profile] = await profiles([], { photoUrl: "/media/mty.avif", photosAuthorized, bilingual: true });
    assert.equal(profile.photoUrl, null);
  }
  const [authorized] = await profiles([], { photoUrl: "/media/mty.avif", photosAuthorized: true });
  assert.equal(authorized.photoUrl, "/media/mty.avif");
  for (const photoUrl of ["/media/missing-advisor.webp", "https://example.test/photo.jpg", "//example.test/photo.jpg", "/../data/advisors.jpg", "/media/../mty.avif", "/media/mty.avif?x=1", "/media/photo.svg"]) {
    const [profile] = await profiles([], { photoUrl, photosAuthorized: true });
    assert.equal(profile.photoUrl, null);
  }
});

test("real route fails closed and is never publicly cached", async (t) => {
  const previous = process.env.EXPERTS_ALLOWLIST_JSON;
  t.after(() => {
    if (previous === undefined) delete process.env.EXPERTS_ALLOWLIST_JSON;
    else process.env.EXPERTS_ALLOWLIST_JSON = previous;
  });
  delete process.env.EXPERTS_ALLOWLIST_JSON;
  const response = await GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { experts: [] });
});

test("async component exports Experts and renders contact/offices without fake profiles", async (t) => {
  // The existing manual loader handles TS; compile TSX in memory for render checks.
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier === "next/link") {
        const { url } = nextResolve("next/link.js", context);
        const source = `import component from ${JSON.stringify(url)}; export default component.default ?? component;`;
        return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
      }
      try {
        return nextResolve(specifier, context);
      } catch (error) {
        if (error.code === "ERR_MODULE_NOT_FOUND" && /^\.{1,2}\//.test(specifier) && !/\.[a-z]+$/i.test(specifier)) {
          return nextResolve(`${specifier}.tsx`, context);
        }
        throw error;
      }
    },
    load(url, context, nextLoad) {
      if (url.endsWith(".tsx")) {
        return { format: "module", shortCircuit: true, source: transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: { module: ModuleKind.ESNext, jsx: JsxEmit.ReactJSX },
          fileName: fileURLToPath(url),
        }).outputText };
      }
      return nextLoad(url, context);
    },
  });
  t.after(() => hooks.deregister());
  const oldEnv = { ...process.env };
  t.after(() => {
    for (const key of ["EXPERTS_ALLOWLIST_JSON", "GOOGLE_REVIEWS_CONFIG_PATH", "GOOGLE_REVIEWS_CACHE_PATH", "GOOGLE_REVIEWS_SERVICE_URL"]) {
      if (oldEnv[key] === undefined) delete process.env[key];
      else process.env[key] = oldEnv[key];
    }
  });
  delete process.env.EXPERTS_ALLOWLIST_JSON;
  const { Experts } = await import("../../../components/experts.tsx");
  for (const locale of ["en", "es"]) {
    const html = renderToStaticMarkup(await Experts({ locale }));
    assert.match(html, /<section class="wrap section expert-section local-team" id="expertos">/);
    assert.match(html, /Monterrey/);
    assert.match(html, /Guadalajara/);
    assert.match(html, /class="branch-layout"/);
    assert.match(html, locale === "en" ? /Talk to your advisor/ : /Habla con tu asesor/);
    assert.ok(!html.includes("Misael"));
    assert.ok(!html.includes("office-collage"));
  }

  const directory = await mkdtemp(join(tmpdir(), "expert-render-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const configPath = join(directory, "config.json");
  const cachePath = join(directory, "cache.json");
  await writeFile(configPath, JSON.stringify({ branches: { monterrey: { mapsUrl: "https://www.google.com/maps" } } }));
  await writeFile(cachePath, JSON.stringify(snapshot([review({ text: "Original <unsafe> fixture quote." })])));
  process.env.EXPERTS_ALLOWLIST_JSON = envFor(entry({ confirmedLanguages: ["es"] })).EXPERTS_ALLOWLIST_JSON;
  process.env.GOOGLE_REVIEWS_CONFIG_PATH = configPath;
  process.env.GOOGLE_REVIEWS_CACHE_PATH = cachePath;
  delete process.env.GOOGLE_REVIEWS_SERVICE_URL;
  const html = renderToStaticMarkup(await Experts({ locale: "en" }));
  assert.match(html, /<h3>Misael<\/h3>/);
  assert.match(html, /<p>Spanish<\/p>/);
  assert.match(html, /Original &lt;unsafe&gt; fixture quote\./);
  assert.match(html, /4\/5/);
  assert.match(html, /Read on Google/);
  assert.match(html, /<blockquote lang="es">/);
  assert.match(html, /Original Spanish/);
  assert.ok(!html.includes("Original <unsafe>"));
});
