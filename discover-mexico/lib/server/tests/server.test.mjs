import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInquiryHandler } from "../inquiries.ts";
import { inquirySchema, travelContext } from "../inquiry-schema.ts";
import { kommoCommand, kommoRules } from "../kommo.ts";
import { getReviews, reviewSchema, REVIEW_REVALIDATE_SECONDS } from "../reviews.ts";
import { safeMarket } from "../travel.ts";
import { publicExperts } from "../experts.ts";
import { priceUsd } from "../pricing.ts";
import { getPromotions, publishedPromotions, transitionPromotion } from "../promotions.ts";
import { searchPackages } from "../packages.ts";
import { readJson, serviceUrl } from "../http.ts";

const now = Date.parse("2026-11-06T18:00:00Z");
test('many review images do not discard the actual review; inherited country keys are ignored', () => {
  const review=reviewSchema.parse({text:'Keep the review text unchanged.',rating:5,images:Array.from({length:30},(_,i)=>`https://example.test/${i}.jpg`)});
  assert.equal(review.text,'Keep the review text unchanged.');
  assert.equal(review.images.length,20);
  assert.equal(safeMarket('__proto__'),null);
  assert.equal(safeMarket('constructor'),null);
  assert.equal(safeMarket('United States'),'US');
});
const origin = "http://localhost:4191";
const env = {
  INQUIRIES_MODE: "development",
  WHATSAPP_NUMBER: "528135294738",
  APP_ORIGIN: origin,
};
const body = (updates = {}) => ({
  locale: "en",
  destinations: ["mexico-city", "oaxaca"],
  origin: "JFK",
  dates: { mode: "flexible", start: "", end: "" },
  adults: 2,
  childrenAges: [8],
  style: "comfort",
  interests: ["culture"],
  budget: "1000-2000",
  name: "Synthetic Person",
  country: "United States",
  email: "synthetic@example.test",
  phone: "+1 212 555 0100",
  preferredLanguage: "en",
  comments: "Synthetic private note",
  consent: true,
  website: "",
  startedAt: now - 5000,
  ...updates,
});
const req = (value = body(), key = randomUUID(), headers = {}) =>
  new Request(`${origin}/api/inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": key,
      Origin: origin,
      ...headers,
    },
    body: JSON.stringify(value),
  });
const handler = (options = {}) =>
  createInquiryHandler({ env, now: () => now, ...options });

test("planner body accepts every actual style/budget and empty flexible dates/origin", () => {
  for (const style of ["essential", "comfort", "premium"]) {
    for (const budget of [
      "discuss",
      "under-1000",
      "1000-2000",
      "2000-4000",
      "4000+",
    ]) {
      assert.equal(
        inquirySchema.safeParse(body({ style, budget, origin: "" })).success,
        true,
      );
    }
  }
});

test("development returns only truthful handoff and no provider call", async () => {
  const post = handler({
    transport: () => {
      throw new Error("unexpected network");
    },
  });
  const response = await post(req());
  const value = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(value).sort(), [
    "mode",
    "requestId",
    "whatsappUrl",
  ]);
  assert.equal(value.mode, "development");
  const url = new URL(value.whatsappUrl);
  assert.equal(url.host, "wa.me");
  assert.equal(url.pathname, "/528135294738");
  const message = url.searchParams.get("text");
  for (const safe of [
    "mexico-city",
    "oaxaca",
    "JFK",
    value.requestId,
    "language: English",
    "adults: 2",
    "children: 1",
  ])
    assert.ok(message.includes(safe));
  for (const privateValue of [
    body().name,
    body().email,
    body().phone,
    body().comments,
    body().country,
  ])
    assert.ok(!message.includes(privateValue));
});

test("Spanish handoff localizes every summary label without introducing contact data", () => {
  const message = travelContext(body({locale: "es", preferredLanguage: "es"}), randomUUID());
  for (const label of ["solicitud:", "idioma: español", "destinos:", "fechas: flexibles", "adultos:", "menores:"])
    assert.ok(message.includes(label));
  assert.ok(!message.includes("language:") && !message.includes("dates:"));
  assert.ok(!message.includes(body().email));
});

test("WhatsApp rejects arbitrary destinations and never includes free-text origin/contact", () => {
  const message = travelContext(
    body({
      origin: "contact@example.test",
      destinations: ["oaxaca", "private@example.test", "oaxaca"],
    }),
    randomUUID(),
  );
  assert.ok(message.includes("destinations: oaxaca"));
  assert.ok(!message.includes("@"));
  assert.ok(!message.includes("origin:"));
  assert.ok(!message.includes("Synthetic"));
});

test("exact dates enter handoff, flexible arbitrary strings do not", () => {
  const inquiry = body({
    dates: { mode: "exact", start: "2027-01-01", end: "2027-01-05" },
  });
  assert.equal(inquirySchema.safeParse(inquiry).success, true);
  assert.ok(
    travelContext(inquiry, randomUUID()).includes("2027-01-01 / 2027-01-05"),
  );
  assert.equal(
    inquirySchema.safeParse(
      body({
        dates: { mode: "exact", start: "2027-02-30", end: "2027-03-05" },
      }),
    ).success,
    false,
  );
});

test("same key/body is stable across concurrent requests; changed body conflicts", async () => {
  const post = handler();
  const key = randomUUID();
  const results = await Promise.all([
    post(req(body(), key)),
    post(req(body(), key)),
  ]);
  assert.deepEqual(await results[0].json(), await results[1].json());
  assert.equal((await post(req(body({ adults: 3 }), key))).status, 409);
});

test("invalid fields, consent, honeypot, ages, timing, extra fields fail without echo", async () => {
  for (const invalid of [
    { consent: false },
    { website: "bot" },
    { childrenAges: [18] },
    { childrenAges: [-1] },
    { adults: 1.5 },
    { email: "invalid" },
    { style: "COMFORT" },
    { budget: "whatever" },
    { destinations: ["private@example.test"] },
    { startedAt: now },
    { startedAt: now - 86400001 },
    { extra: "secret" },
  ]) {
    const response = await handler()(req(body(invalid)));
    assert.equal(response.status, 422);
    const value = await response.text();
    assert.ok(!value.includes(body().email));
    assert.ok(!value.includes(body().name));
  }
});

test("UUID, origin, JSON content type, gzip and past dates are enforced", async () => {
  assert.equal((await handler()(req(body(), "not-a-uuid"))).status, 400);
  assert.equal(
    (
      await handler()(
        req(body(), randomUUID(), { Origin: "https://attacker.test" }),
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await handler()(
        req(body(), randomUUID(), { "Content-Type": "text/plain" }),
      )
    ).status,
    415,
  );
  assert.equal(
    (await handler()(req(body(), randomUUID(), { "Content-Encoding": "gzip" })))
      .status,
    415,
  );
  assert.equal(
    (
      await handler()(
        req(
          body({
            dates: { mode: "exact", start: "2020-01-01", end: "2020-01-05" },
          }),
        ),
      )
    ).status,
    422,
  );
});

test("16 KiB limit applies without or with Content-Length and malformed JSON is 400", async () => {
  const large = req(body({ comments: "x".repeat(16384) }));
  assert.equal((await handler()(large)).status, 413);
  assert.equal(
    (await handler()(req(body(), randomUUID(), { "Content-Length": "16385" })))
      .status,
    413,
  );
  const broken = new Request(`${origin}/api/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  await assert.rejects(readJson(broken), (error) => error.status === 400);
});

test("local rate limit is bounded and missing WhatsApp never fakes success", async () => {
  const post = handler();
  for (let i = 0; i < 20; i++) assert.equal((await post(req())).status, 200);
  assert.equal((await post(req())).status, 429);
  assert.equal(
    (await handler({ env: { ...env, WHATSAPP_NUMBER: "" } })(req())).status,
    503,
  );
});

const rule = {
  tags: ["inbound"],
  responsibleUserId: 123,
  pipelineId: 456,
  statusId: 789,
  task: { typeId: 1, dueInMinutes: 60 },
};
const rules = { en: rule, es: { ...rule, responsibleUserId: 124 } };
const liveEnv = {
  ...env,
  INQUIRIES_MODE: "live",
  INQUIRIES_STORAGE_URL: "https://gateway.example.test/v1",
  INQUIRIES_STORAGE_TOKEN: "synthetic-token",
  RATE_LIMIT_HMAC_KEY: "x".repeat(32),
  KOMMO_RULES_JSON: JSON.stringify(rules),
};
const capabilities = {
  protocol: "discover-mexico.inquiries.v1",
  durable: true,
  atomicIdempotency: true,
  distributedRateLimit: true,
  transactionalOutbox: true,
  kommo: "ready",
};

test("live without durable configuration or ready gateway returns 503", async () => {
  assert.equal(
    (await handler({ env: { ...env, INQUIRIES_MODE: "live" } })(req())).status,
    503,
  );
  const transport = async () =>
    Response.json({ ...capabilities, durable: false });
  assert.equal((await handler({ env: liveEnv, transport })(req())).status, 503);
  assert.equal(
    (
      await handler({ env: { ...liveEnv, KOMMO_RULES_JSON: "" }, transport })(
        req(),
      )
    ).status,
    503,
  );
});

test("live simulated durable queue preserves identity after handler restart, no false delivered", async () => {
  const receipts = new Map();
  let writes = 0;
  const transport = async (url, init) => {
    assert.equal(init.redirect, "error");
    if (String(url).endsWith("/capabilities"))
      return Response.json(capabilities);
    const submission = JSON.parse(init.body);
    assert.equal(submission.integration.provider, "kommo");
    assert.equal(submission.integration.responsibleUserId, 123);
    assert.equal(submission.integration.task.dueInMinutes, 60);
    assert.ok(submission.integration.tags.includes("destination:oaxaca"));
    assert.ok(submission.integration.tags.includes("market:US"));
    let receipt = receipts.get(submission.idempotencyKey);
    if (!receipt) {
      writes++;
      receipt = {
        protocol: capabilities.protocol,
        requestId: submission.requestId,
        idempotencyKey: submission.idempotencyKey,
        fingerprint: submission.fingerprint,
        durable: true,
        status: "queued",
      };
      receipts.set(submission.idempotencyKey, receipt);
    }
    return Response.json(receipt, { status: 202 });
  };
  const key = randomUUID();
  const first = await handler({ env: liveEnv, transport })(req(body(), key));
  const second = await handler({ env: liveEnv, transport })(req(body(), key));
  assert.equal(first.status, 202);
  assert.equal(second.status, 202);
  const one = await first.json();
  assert.equal(one.status, "queued");
  assert.deepEqual(one, await second.json());
  assert.equal(writes, 1);
});

test("live unknown/malformed outcomes never fake success; gateway conflicts and rates propagate", async () => {
  for (const [status, expected] of [
    [409, 409],
    [429, 429],
    [500, 503],
  ]) {
    const transport = async (url) =>
      String(url).endsWith("/capabilities")
        ? Response.json(capabilities)
        : Response.json({}, { status });
    assert.equal(
      (await handler({ env: liveEnv, transport })(req())).status,
      expected,
    );
  }
  const transport = async (url) =>
    String(url).endsWith("/capabilities")
      ? Response.json(capabilities)
      : Response.json({ status: "sent" });
  assert.equal((await handler({ env: liveEnv, transport })(req())).status, 503);
});

test("Kommo tags contain only safe destinations and country lookup; language chooses owner", () => {
  const command = kommoCommand(
    body({
      country: "private@example.test",
      preferredLanguage: "es",
      destinations: ["cancun", "private@example.test"],
    }),
    kommoRules(JSON.stringify(rules)),
    randomUUID(),
  );
  assert.equal(command.responsibleUserId, 124);
  assert.ok(command.tags.includes("destination:cancun"));
  assert.ok(
    !command.tags.some(
      (value) => value.includes("@") || value.startsWith("market:"),
    ),
  );
});

test("experts fail closed unless explicitly active AND bilingual", () => {
  assert.deepEqual(publicExperts(""), []);
  assert.deepEqual(
    publicExperts('[{"id":"test","displayName":"Test","active":true}]'),
    [],
  );
  const values = [
    { id: "eligible", displayName: "Eligible", active: true, bilingual: true },
    { id: "inactive", displayName: "Inactive", active: false, bilingual: true },
    {
      id: "not-bilingual",
      displayName: "Not bilingual",
      active: true,
      bilingual: false,
    },
  ];
  assert.deepEqual(
    publicExperts(JSON.stringify(values)).map((value) => value.id),
    ["eligible"],
  );
});

const review = {
  reviewId: "synthetic",
  author: "Public Synthetic Reviewer",
  rating: 5,
  text: "Synthetic public review",
  url: "https://maps.example.test/review",
  advisorMentions: [{ advisorId: "inactive", fullName: "Never expose" }],
  unresolvedAdvisorMentions: [{ possibleAdvisors: ["Never expose"] }],
  privateField: "never expose",
};
const config = {
  branches: {
    monterrey: {
      expectedName: "Synthetic branch",
      mapsUrl: "https://maps.example.test",
    },
  },
};
const snapshot = {
  updatedAt: "2026-09-01T00:00:00Z",
  branches: {
    monterrey: { rating: 5, reviewCount: 1, reviews: [review] },
    unapproved: { reviews: [review] },
  },
};
const readFixture = async (path) =>
  path.includes("config") ? config : snapshot;

test("reviews shared cache stays stale, weekly metadata, no refresh or unauthorized experts", async () => {
  const value = await getReviews({
    env: {},
    now,
    readFile: readFixture,
    transport: () => {
      throw new Error("no network");
    },
  });
  assert.deepEqual(Object.keys(value).sort(), [
    "branches",
    "meta",
    "updatedAt",
  ]);
  assert.equal(value.meta.source, "shared-cache");
  assert.equal(value.meta.stale, true);
  assert.equal(value.meta.revalidateSeconds, 604800);
  assert.equal(Date.parse(value.meta.nextRevalidationAt), now + 604800000);
  assert.deepEqual(Object.keys(value.branches), ["monterrey"]);
  const published = value.branches.monterrey.reviews[0];
  assert.equal(published.text, review.text);
  assert.ok(!JSON.stringify(published).includes("Never expose"));
  assert.equal(published.privateField, undefined);
  assert.equal(published.advisorMentions, undefined);
});

test("reviews service uses seven-day revalidation, explicit stale metadata survives", async () => {
  const transport = async (url, init) => {
    assert.equal(
      String(url),
      "https://reviews.example.test/api/google-reviews",
    );
    assert.equal(init.next.revalidate, REVIEW_REVALIDATE_SECONDS);
    return Response.json({
      ...snapshot,
      updatedAt: new Date(now).toISOString(),
      meta: { stale: true },
    });
  };
  const value = await getReviews({
    env: {
      GOOGLE_REVIEWS_SERVICE_URL:
        "https://reviews.example.test/api/google-reviews",
    },
    now,
    readFile: readFixture,
    transport,
  });
  assert.equal(value.meta.source, "reviews-service");
  assert.equal(value.meta.stale, true);
});

test("reviews service errors/malformed payload fall back weekly without changing snapshot timestamp", async () => {
  for (const transport of [
    async () => {
      throw new Error("offline");
    },
    async () => Response.json({ invalid: true }),
  ]) {
    const value = await getReviews({
      env: { GOOGLE_REVIEWS_SERVICE_URL: "https://reviews.example.test/cache" },
      now,
      readFile: readFixture,
      transport,
    });
    assert.equal(value.meta.source, "shared-cache-fallback");
    assert.equal(value.updatedAt, snapshot.updatedAt);
    assert.equal(value.meta.stale, true);
    assert.equal(value.meta.revalidateSeconds, 604800);
  }
});

test("no original cache/config yields controlled 503; provider endpoint cannot be configured as service", async () => {
  await assert.rejects(
    getReviews({
      env: {},
      readFile: async () => {
        throw new Error("missing");
      },
    }),
    (error) => error.status === 503,
  );
  assert.throws(
    () => serviceUrl("https://www.searchapi.io/api/v1/search", true),
    (error) => error.status === 503,
  );
  assert.throws(
    () => serviceUrl("http://gateway.example.test", true),
    (error) => error.status === 503,
  );
});

const occupancy = { adults: 2, childrenAges: [], rooms: 1 };
const pricing = () => ({
  occupancy,
  components: [
    {
      kind: "flight",
      flightScope: "domestic",
      amountMinor: 10000,
      currency: "USD",
      basis: "group-total",
      includesSupplierTaxes: true,
      occupancy,
      validUntil: "2026-11-06T19:00:00Z",
      revalidatedAt: "2026-11-06T17:59:00Z",
    },
    {
      kind: "hotel",
      amountMinor: 200000,
      currency: "MXN",
      basis: "group-total",
      includesSupplierTaxes: true,
      occupancy,
      validUntil: "2026-11-06T19:00:00Z",
      revalidatedAt: "2026-11-06T17:59:00Z",
    },
  ],
  fx: {
    base: "USD",
    source: "Synthetic approved FX",
    asOf: "2026-11-06T17:00:00Z",
    expiresAt: "2026-11-06T19:00:00Z",
    usdPerUnit: { MXN: 0.05 },
  },
  marginRate: 0.2,
  taxRate: 0.16,
  mandatoryFeesUsdMinor: 1000,
  validUntil: "2026-11-06T19:00:00Z",
  maxRevalidationAgeSeconds: 900,
});

test("USD policy converts before summing, explicit margin/tax/fees, occupancy and minimum validity", () => {
  const quote = priceUsd(pricing(), now);
  assert.equal(quote.costUsdMinor, 20000);
  assert.equal(quote.subtotalUsdMinor, 26250);
  assert.equal(quote.taxUsdMinor, 4200);
  assert.equal(quote.totalUsdMinor, 30450);
  assert.equal(quote.perPersonUsdMinor, 15225);
  assert.equal(quote.validUntil, "2026-11-06T18:14:00.000Z");
  assert.equal(quote.requiresRevalidation, true);
});

test("pricing rejects missing FX, mismatched occupancy, missing tax inclusion and expired revalidation", () => {
  const noFx = pricing();
  noFx.fx.usdPerUnit = {};
  assert.throws(
    () => priceUsd(noFx, now),
    (error) => error.code === "FX_RATE_REQUIRED",
  );
  const wrongOccupancy = pricing();
  wrongOccupancy.components[1] = {
    ...wrongOccupancy.components[1],
    occupancy: { ...occupancy, adults: 3 },
  };
  assert.throws(
    () => priceUsd(wrongOccupancy, now),
    (error) => error.code === "OCCUPANCY_MISMATCH",
  );
  const taxes = pricing();
  taxes.components[1].includesSupplierTaxes = false;
  assert.throws(
    () => priceUsd(taxes, now),
    (error) => error.code === "PRICING_INVALID",
  );
  assert.throws(
    () => priceUsd(pricing(), now + 900000),
    (error) => error.code === "PRICE_EXPIRED",
  );
});

test("legacy pricing accepts unscoped flights but still requires flight and hotel", () => {
  const legacy = pricing();
  delete legacy.components[0].flightScope;
  assert.equal(priceUsd(legacy, now).totalUsdMinor, 30450);
  for (const missing of ["flight", "hotel"]) {
    const input = pricing();
    input.components.find((component) => component.kind === missing).kind = "transfer";
    assert.throws(
      () => priceUsd(input, now),
      (error) => error.code === "PACKAGE_COMPONENTS_REQUIRED",
    );
  }
});

const publishedPromotion = () => ({
  id: "synthetic",
  title: "Synthetic trip",
  destinations: ["oaxaca"],
  state: "published",
  pricing: pricing(),
  approvedBy: "synthetic-approver",
  approvedAt: "2026-11-06T17:55:00Z",
  publishedAt: "2026-11-06T17:56:00Z",
  expiresAt: "2026-11-06T19:00:00Z",
});

test("published promotions hide unknown and international flights by default", () => {
  const domestic = publishedPromotion();
  assert.equal(publishedPromotions([domestic], now)[0].price.totalUsdMinor, 30450);
  for (const scope of [undefined, "unknown", null, "Domestic", "international"]) {
    const hidden = publishedPromotion();
    if (scope === undefined) delete hidden.pricing.components[0].flightScope;
    else hidden.pricing.components[0].flightScope = scope;
    assert.deepEqual(publishedPromotions([hidden], now), []);
    assert.deepEqual(
      publishedPromotions([hidden], now, { allowInternationalFlights: false }),
      [],
    );
    // A domestic leg must not authorize a second unapproved flight.
    hidden.pricing.components.push({ ...domestic.pricing.components[0] });
    assert.deepEqual(publishedPromotions([hidden], now), []);
    if (scope !== "international") {
      assert.deepEqual(
        publishedPromotions([hidden], now, { allowInternationalFlights: true }),
        [],
      );
    }
  }
});

test("international publication requires literal true and never bypasses validation", () => {
  const international = publishedPromotion();
  international.pricing.components[0].flightScope = "international";
  for (const permission of [undefined, false, "true", 1]) {
    assert.deepEqual(
      publishedPromotions([international], now, { allowInternationalFlights: permission }),
      [],
    );
  }
  const options = { allowInternationalFlights: true };
  assert.equal(
    publishedPromotions([international], now, options)[0].price.totalUsdMinor,
    30450,
  );
  const invalidations = [
    (value) => { value.state = "draft"; },
    (value) => { delete value.approvedBy; },
    (value) => { delete value.approvedAt; },
    (value) => { delete value.publishedAt; },
    (value) => { value.approvedAt = "2026-11-06T17:57:00Z"; },
    (value) => { value.publishedAt = "2026-11-06T18:01:00Z"; },
    (value) => { value.expiresAt = new Date(now).toISOString(); },
    (value) => { value.pricing.fx.usdPerUnit = {}; },
    (value) => { value.pricing.components[1].occupancy = { ...occupancy, adults: 3 }; },
    (value) => { value.pricing.components[1].includesSupplierTaxes = false; },
    (value) => { value.pricing.components[0].revalidatedAt = "2026-11-06T17:00:00Z"; },
    (value) => { value.pricing.components[0].revalidatedAt = "2026-11-06T18:01:00Z"; },
    (value) => { value.pricing.components[1].kind = "transfer"; },
  ];
  for (const invalidate of invalidations) {
    const invalid = structuredClone(international);
    invalidate(invalid);
    assert.deepEqual(publishedPromotions([invalid], now, options), []);
  }
});

test("only getPromotions reads the exact true environment opt-in", async (t) => {
  t.mock.method(Date, "now", () => now);
  const previous = process.env.ALLOW_INTERNATIONAL_FLIGHTS;
  const directory = await mkdtemp(join(tmpdir(), "discover-mexico-promotions-"));
  t.after(async () => {
    if (previous === undefined) delete process.env.ALLOW_INTERNATIONAL_FLIGHTS;
    else process.env.ALLOW_INTERNATIONAL_FLIGHTS = previous;
    await rm(directory, { recursive: true, force: true });
  });
  const domestic = publishedPromotion();
  const international = publishedPromotion();
  international.id = "international";
  international.pricing.components[0].flightScope = "international";
  const unknown = publishedPromotion();
  unknown.id = "unknown";
  delete unknown.pricing.components[0].flightScope;
  const path = join(directory, "promotions.json");
  await writeFile(path, JSON.stringify([domestic, international, unknown]));
  for (const setting of [undefined, "false", "", "TRUE", "1", " true ", "true"]) {
    if (setting === undefined) delete process.env.ALLOW_INTERNATIONAL_FLIGHTS;
    else process.env.ALLOW_INTERNATIONAL_FLIGHTS = setting;
    assert.deepEqual(
      (await getPromotions(path)).map((value) => value.id),
      setting === "true" ? ["synthetic", "international"] : ["synthetic"],
    );
    assert.deepEqual(publishedPromotions([international], now), []);
  }
});

test("promotions cannot skip approval, publish stale prices, or expose unapproved/expired records", async () => {
  const draft = {
    id: "synthetic",
    title: "Synthetic trip",
    destinations: ["oaxaca"],
    state: "draft",
    pricing: pricing(),
    expiresAt: "2026-11-06T19:00:00Z",
  };
  const actor = { id: "synthetic-approver", canApprove: true };
  assert.throws(() => transitionPromotion(draft, "published", actor, now));
  const review = transitionPromotion(draft, "review", actor, now);
  assert.throws(() =>
    transitionPromotion(
      review,
      "approved",
      { ...actor, canApprove: false },
      now,
    ),
  );
  const approved = transitionPromotion(review, "approved", actor, now);
  const published = transitionPromotion(approved, "published", actor, now);
  assert.equal(
    publishedPromotions([draft, review, approved, published], now).length,
    1,
  );
  const publicValue = publishedPromotions([published], now)[0];
  assert.equal(publicValue.approvedBy, undefined);
  assert.equal(publicValue.price.costUsdMinor, undefined);
  assert.equal(publishedPromotions([published], now + 900000).length, 0);
  assert.equal(
    transitionPromotion(approved, "review", actor, now).approvedBy,
    undefined,
  );
  await assert.rejects(
    searchPackages({}),
    (error) =>
      error.status === 503 && error.code === "PACKAGE_BACKEND_CONTRACT_UNSAFE",
  );
});
