import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { transpileModule, ModuleKind, JsxEmit } from "typescript";
import { renderToStaticMarkup } from "react-dom/server";
import { getEscapes } from "../escapes.ts";
import { getPromotions, publishedPromotions, promotionSchema } from "../promotions.ts";
import { destinations, t as localized } from "../../../data/content.ts";

// Compile the server component in memory without a build or generated files.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/link" || specifier === "next/image") {
      const { url } = nextResolve(`${specifier}.js`, context);
      const source = `import component from ${JSON.stringify(url)}; export default component.default ?? component;`;
      return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.endsWith("/components/escapes.tsx")) return nextLoad(url, context);
    return {
      format: "module",
      source: transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ModuleKind.ESNext, jsx: JsxEmit.ReactJSX },
      }).outputText,
      shortCircuit: true,
    };
  },
});
const { Escapes } = await import("../../../components/escapes.tsx");

const now = Date.parse("2026-11-07T18:00:00Z");
const iso = (offset) => new Date(now + offset * 1000).toISOString();
const occupancy = { adults: 2, childrenAges: [8], rooms: 1 };
const promotion = (slug = "oaxaca", id = "synthetic-escape") => ({
  id,
  title: "Synthetic fixture, not a public offer",
  destinations: [slug],
  state: "published",
  approvedBy: "private-approver",
  approvedAt: iso(-300),
  publishedAt: iso(-240),
  verifiedAt: iso(-60),
  expiresAt: iso(3600),
  inclusions: { en: ["Fixture hotel", "Fixture domestic flight"], es: ["Hotel de prueba", "Vuelo nacional de prueba"] },
  conditions: { en: "Synthetic conditions only.", es: "Condiciones de prueba solamente." },
  pricing: {
    occupancy,
    components: [
      { kind: "flight", flightScope: "domestic", currency: "USD", amountMinor: 10000 },
      { kind: "hotel", currency: "MXN", amountMinor: 200000 },
    ].map((item) => ({
      ...item,
      basis: "group-total",
      includesSupplierTaxes: true,
      occupancy,
      validUntil: iso(1800),
      revalidatedAt: iso(-60),
    })),
    fx: { base: "USD", source: "Synthetic test FX", asOf: iso(-300), expiresAt: iso(1800), usdPerUnit: { MXN: 0.05 } },
    marginRate: 0.2,
    taxRate: 0.16,
    mandatoryFeesUsdMinor: 1000,
    validUntil: iso(1800),
    maxRevalidationAgeSeconds: 900,
  },
});

function env(t, name, value) {
  const previous = process.env[name];
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
  t.after(() => {
    if (previous === undefined) delete process.env[name];
    else process.env[name] = previous;
  });
}

async function fixture(t, records = []) {
  t.mock.method(Date, "now", () => now);
  env(t, "ALLOW_INTERNATIONAL_FLIGHTS", undefined);
  const directory = await mkdtemp(join(tmpdir(), "discover-escapes-test-"));
  const path = join(directory, "fixture.json");
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(path, JSON.stringify(records));
  return path;
}

function assertIdeas(cards) {
  assert.deepEqual(cards.map((card) => card.destination.slug), ["cancun", "oaxaca", "puerto-vallarta"]);
  for (const card of cards) {
    assert.equal(card.kind, "idea");
    assert.deepEqual(Object.keys(card).sort(), ["destination", "kind"]);
  }
}

test("missing configuration returns exactly three catalog ideas without prices or expiry", async (t) => {
  env(t, "PROMOTIONS_PATH", undefined);
  assertIdeas(await getEscapes());
});

test("empty, missing, malformed and invalid feeds fall back to editorial ideas", async (t) => {
  const path = await fixture(t);
  assertIdeas(await getEscapes(path));
  assertIdeas(await getEscapes(`${path}.missing`));
  for (const body of ["{broken", "{}", JSON.stringify([{ invalid: true }])]) {
    await writeFile(path, body);
    assertIdeas(await getEscapes(path));
  }
});

test("legacy records remain publishable but are not featured as verified prices", async (t) => {
  const legacy = promotion();
  delete legacy.inclusions;
  delete legacy.conditions;
  delete legacy.verifiedAt;
  assert.equal(promotionSchema.safeParse(legacy).success, true);
  const path = await fixture(t, [legacy]);
  assert.equal((await getPromotions(path)).length, 1);
  assertIdeas(await getEscapes(path));
});

test("optional metadata is public without approval identities, FX or private costs", () => {
  const source = promotion();
  const [value] = publishedPromotions([source], now);
  assert.deepEqual(value.inclusions, source.inclusions);
  assert.deepEqual(value.conditions, source.conditions);
  assert.equal(value.verifiedAt, source.verifiedAt);
  assert.equal(value.expiresAt, source.expiresAt);
  assert.equal(value.price.totalUsdMinor, 30450);
  for (const key of ["approvedBy", "approvedAt", "pricing", "fx", "costUsdMinor"])
    assert.equal(value[key], undefined);
  assert.equal(value.price.fx, undefined);
  assert.equal(value.price.costUsdMinor, undefined);
});

test("a verified promotion uses the original USD quote and fills remaining cards with ideas", async (t) => {
  const path = await fixture(t, [promotion()]);
  const cards = await getEscapes(path);
  assert.deepEqual(cards.map((card) => card.destination.slug), ["oaxaca", "cancun", "puerto-vallarta"]);
  assert.equal(cards[0].kind, "promotion");
  assert.deepEqual(cards[0].promotion, (await getPromotions(path))[0]);
  assert.equal(cards[0].promotion.price.totalUsdMinor, 30450);
  assert.equal(cards[0].promotion.price.validUntil, iso(840));
  assert.deepEqual(cards.slice(1).map((card) => card.kind), ["idea", "idea"]);
});

test("metadata must be complete, bilingual, nonblank and verified no later than now", async (t) => {
  const path = await fixture(t);
  const changes = [
    (p) => { delete p.verifiedAt; },
    (p) => { p.verifiedAt = iso(1); },
    (p) => { p.verifiedAt = "not-a-date"; },
    (p) => { delete p.inclusions; },
    (p) => { p.inclusions.en = []; },
    (p) => { p.inclusions.es = ["   "]; },
    (p) => { delete p.inclusions.es; },
    (p) => { delete p.conditions; },
    (p) => { p.conditions.en = "   "; },
    (p) => { delete p.conditions.es; },
  ];
  for (const change of changes) {
    const value = promotion();
    change(value);
    await writeFile(path, JSON.stringify([value]));
    assertIdeas(await getEscapes(path));
  }
  const value = promotion();
  value.verifiedAt = iso(0);
  await writeFile(path, JSON.stringify([value]));
  assert.equal((await getEscapes(path))[0].kind, "promotion");
});

test("approval, publication, expiry, FX, occupancy and flight gates remain enforced", async (t) => {
  const path = await fixture(t);
  const changes = [
    (p) => { p.state = "approved"; },
    (p) => { delete p.approvedBy; },
    (p) => { delete p.approvedAt; },
    (p) => { delete p.publishedAt; },
    (p) => { p.publishedAt = iso(1); },
    (p) => { p.approvedAt = iso(-1); },
    (p) => { p.expiresAt = iso(0); },
    (p) => { p.pricing.validUntil = iso(0); },
    (p) => { p.pricing.fx.expiresAt = iso(0); },
    (p) => { p.pricing.fx.usdPerUnit = {}; },
    (p) => { p.pricing.components[0].revalidatedAt = iso(-901); },
    (p) => { p.pricing.components[1].occupancy = { ...occupancy, adults: 3 }; },
    (p) => { delete p.pricing.components[0].flightScope; },
    (p) => { p.pricing.components[0].flightScope = "international"; },
    (p) => { p.id = "unsafe&promotion=other"; },
  ];
  for (const change of changes) {
    const value = promotion();
    change(value);
    await writeFile(path, JSON.stringify([value]));
    assertIdeas(await getEscapes(path));
  }
});

test("only the existing explicit international flight opt-in is honored", async (t) => {
  const value = promotion();
  value.pricing.components[0].flightScope = "international";
  const path = await fixture(t, [value]);
  env(t, "ALLOW_INTERNATIONAL_FLIGHTS", "true");
  assert.equal((await getEscapes(path))[0].kind, "promotion");
});

test("all promotion destinations must belong to the explicit Mexico whitelist", async (t) => {
  const path = await fixture(t);
  for (const slugs of [["paris"], ["cancun", "paris"], ["../oaxaca"], ["Oaxaca"], ["puebla"]]) {
    const value = promotion();
    value.destinations = slugs;
    await writeFile(path, JSON.stringify([value]));
    assertIdeas(await getEscapes(path));
  }
  for (const destination of destinations) {
    await writeFile(path, JSON.stringify([promotion(destination.slug)]));
    assert.equal((await getEscapes(path))[0].destination.slug, destination.slug);
    assert.equal((await getEscapes(path))[0].kind, "promotion");
  }
});

test("selection is stable, unique by destination, capped at three, and honors PROMOTIONS_PATH", async (t) => {
  const records = ["oaxaca", "oaxaca", "los-cabos", "cancun", "tequila"].map(
    (slug, index) => promotion(slug, `synthetic-${index}`),
  );
  const path = await fixture(t, records);
  env(t, "PROMOTIONS_PATH", path);
  const cards = await getEscapes();
  assert.deepEqual(cards.map((card) => card.destination.slug), ["oaxaca", "los-cabos", "cancun"]);
  assert.ok(cards.every((card) => card.kind === "promotion"));
  assert.equal(cards[0].promotion.id, "synthetic-0");
});

test("SSR renders bilingual editorial cards, exact images and contextual links without offer data", async (t) => {
  env(t, "PROMOTIONS_PATH", undefined);
  for (const locale of ["en", "es"]) {
    const html = renderToStaticMarkup(await Escapes({ locale }));
    assert.equal((html.match(/<article /g) || []).length, 3);
    assert.ok(html.includes(locale === "en" ? "Featured Mexico Escapes" : "Escapadas destacadas por M\u00e9xico"));
    assert.equal((html.match(new RegExp(locale === "en" ? "Trip idea · Quote on request" : "Idea de viaje · Cotiza a tu medida", "g")) || []).length, 3);
    for (const slug of ["cancun", "oaxaca", "puerto-vallarta"]) {
      const destination = destinations.find((item) => item.slug === slug);
      assert.ok(html.includes(encodeURIComponent(`/media/${slug}.webp`)) || html.includes(`/media/${slug}.webp`));
      assert.ok(html.includes(localized(destination.name, locale)));
      assert.ok(html.includes(localized(destination.tagline, locale)));
      assert.ok(html.includes(`${locale === "en" ? "/en/tailor-made-trips" : "/es/viajes-personalizados"}?destination=${slug}`));
    }
    assert.doesNotMatch(html, /USD|<time|promotion=|escapes-price|Verified promotion|Promoci\u00f3n verificada/);
  }
});

test("SSR renders the USD total, occupancy, inclusions, conditions and real minimum validity", async (t) => {
  const path = await fixture(t, [promotion()]);
  env(t, "PROMOTIONS_PATH", path);
  for (const locale of ["en", "es"]) {
    const html = renderToStaticMarkup(await Escapes({ locale }));
    assert.equal((html.match(/<article /g) || []).length, 3);
    assert.match(html, /USD\s*304\.50/);
    assert.ok(html.includes(promotion().conditions[locale]));
    assert.ok(html.includes(promotion().inclusions[locale][0]));
    assert.ok(html.includes(`dateTime="${iso(-60)}"`));
    assert.ok(html.includes(`dateTime="${iso(840)}"`));
    assert.match(html, /\?destination=oaxaca&amp;promotion=synthetic-escape/);
    assert.match(html, locale === "en" ? /Indicative price; requires revalidation/ : /Precio indicativo; requiere revalidaci\u00f3n/);
    assert.doesNotMatch(html, /private-approver|Synthetic test FX|Synthetic fixture, not a public offer/);
  }
});
