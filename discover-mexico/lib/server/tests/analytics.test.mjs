import test from "node:test";
import assert from "node:assert/strict";
import { createContext, runInContext } from "node:vm";
import { destinations, journeys } from "../../../data/content.ts";
import { tourIdentities } from "../../../data/tour-identities.ts";
import { href } from "../../routes.ts";
import { tourHref, tourQuoteHref } from "../../tour-routes.ts";
import {
  GTM_CONTAINER_ID,
  buildGtmBootstrap,
  contextForUrl,
  createAnalyticsClient,
  safeReferrer,
} from "../../analytics.ts";

const origin = "https://discover.deviaje.mx";
const locales = ["en", "es"];
const canaries = [
  "PRIVATE_ANALYTICS_NAME", "private-analytics@example.test", "5215550007788",
  "PRIVATE_ANALYTICS_MESSAGE", "PRIVATE_ANALYTICS_TOKEN", "PRIVATE_ANALYTICS_HOTEL",
];
const privateQuery = new URLSearchParams({
  name: canaries[0], email: canaries[1], phone: canaries[2], text: canaries[3],
  token: canaries[4], hotelCategory: canaries[5],
}).toString();
const requestId = (index = 1) => `12345678-abcd-4abc-8def-${String(index).padStart(12, "0")}`;
const response = (mode, status, index = 1) => ({
  mode, status, requestId: requestId(index),
  name: canaries[0], email: canaries[1], phone: canaries[2], message: canaries[3],
  redirectUrl: `https://private.example.test/${canaries[4]}`,
});
const contextKeys = [
  "language", "page_path", "page_type", "page_title", "package_id", "package_name",
  "destination", "destinations", "journey_id",
];
const eventKeys = [...contextKeys,
  "event", "measurement_source", "source_page", "page_location", "page_referrer",
  "target_page", "interaction_location", "office", "request_state", "delivery_status",
].sort();

function assertPrivate(value, extra = []) {
  const serialized = JSON.stringify(value);
  for (const canary of [...canaries, ...extra]) {
    assert.ok(!serialized.includes(canary), `Private value leaked: ${canary}`);
    assert.ok(!serialized.includes(encodeURIComponent(canary)), `Encoded private value leaked: ${canary}`);
  }
}

function assertEvents(events, ids = []) {
  assertPrivate(events, ids);
  for (const event of events) {
    assert.deepEqual(Object.keys(event).sort(), eventKeys);
    assert.equal(event.measurement_source, "discover_app");
    for (const value of Object.values(event)) assert.ok(value === null || typeof value === "string");
    for (const key of ["page_location", "page_referrer"]) {
      if (!event[key]) continue;
      const url = new URL(event[key]);
      assert.equal(url.search, "");
      assert.equal(url.hash, "");
      assert.equal(url.username, "");
      assert.equal(url.password, "");
    }
    for (const key of ["page_path", "source_page", "target_page"]) {
      if (event[key]) assert.doesNotMatch(event[key], /[?#]/);
    }
  }
}

function clientAt(path = "/en", referrer = "") {
  let url = new URL(path, origin).href;
  const events = [];
  const settings = [];
  const client = createAnalyticsClient({
    getUrl: () => url,
    getReferrer: () => referrer,
    push: (event) => events.push(event),
    configurePage: (page) => settings.push(page),
  });
  return { client, events, settings, navigate: (path) => { url = new URL(path, origin).href; } };
}

test("contextForUrl identifies all six localized package URLs using catalog-only context", () => {
  assert.equal(tourIdentities.length * locales.length, 6);
  const paths = new Set();
  for (const tour of tourIdentities) {
    for (const locale of locales) {
      const path = tourHref(locale, tour);
      paths.add(path);
      const expected = {
        language: locale, page_path: path, page_type: "package", page_title: tour.name[locale],
        package_id: tour.id, package_name: tour.name[locale],
        destination: tour.destinationSlug, destinations: tour.destinationSlug, journey_id: null,
      };
      for (const input of [path, `${origin}${path}/?${privateQuery}#${canaries[3]}`]) {
        assert.deepEqual(contextForUrl(input), expected);
        assertPrivate(contextForUrl(input));
      }
    }
  }
  assert.equal(paths.size, 6);
});

test("planner query accepts known packages, journeys and destinations, never arbitrary values", () => {
  for (const locale of locales) {
    const path = href(locale, "plan");
    const empty = contextForUrl(path);
    assert.equal(empty.page_type, "plan");
    for (const tour of tourIdentities) {
      const context = contextForUrl(`${tourQuoteHref(locale, tour)}&${privateQuery}&language=fr`);
      assert.deepEqual(context, {
        ...empty, package_id: tour.id, package_name: tour.name[locale],
        destination: tour.destinationSlug, destinations: tour.destinationSlug,
      });
      assertPrivate(context);
    }
    for (const journey of journeys) {
      const context = contextForUrl(`${path}?journey=${journey.slug}&${privateQuery}`);
      const ids = [...new Set(journey.destinations.filter((slug) => destinations.some((d) => d.slug === slug)))];
      assert.deepEqual(context, {
        ...empty, journey_id: journey.slug,
        destination: ids.length === 1 ? ids[0] : null, destinations: ids.length ? ids.join("|") : null,
      });
    }
    for (const destination of destinations) {
      assert.deepEqual(contextForUrl(`${path}?destination=${destination.slug}&${privateQuery}`), {
        ...empty, destination: destination.slug, destinations: destination.slug,
      });
    }
    const unknown = new URLSearchParams({ package: canaries[0], journey: canaries[1], destination: canaries[3] });
    assert.deepEqual(contextForUrl(`${path}?${unknown}&${privateQuery}`), empty);
    for (const key of ["package", "journey", "destination"]) {
      assert.deepEqual(contextForUrl(`${path}?${key}=${encodeURIComponent(canaries[1])}`), empty);
    }
    const tour = tourIdentities[0];
    assert.equal(contextForUrl(`${path}?package=${tour.id}&destination=${canaries[0]}`).destination, tour.destinationSlug);
  }
});

test("unknown/PII routes and malformed URLs produce only sanitized not-found context", () => {
  for (const [input, language, path] of [
    [`/en/${canaries[0]}?${privateQuery}`, "en", "/en/404"],
    [`/es/${encodeURIComponent(canaries[1])}/${canaries[2]}?${privateQuery}`, "es", "/es/404"],
    [`/fr/${canaries[3]}?${privateQuery}`, null, "/404"],
    [`/english/${canaries[4]}`, null, "/404"],
    ["http://[", null, "/404"],
  ]) {
    assert.deepEqual(contextForUrl(input), {
      language, page_path: path, page_type: "not_found", page_title: "Discover Mexico \u00b7 Not found",
      package_id: null, package_name: null, destination: null, destinations: null, journey_id: null,
    });
    assertPrivate(contextForUrl(input));
  }
  const original = contextForUrl("/en");
  original.page_title = canaries[0];
  assertPrivate(contextForUrl("/en"));
});

test("referrers retain only external origins or sanitized same-origin routes", () => {
  for (const [input, expected] of [
    ["", ""], ["not a URL", ""], [`javascript:${canaries[3]}`, ""],
    [`mailto:${canaries[1]}`, ""], [`data:text/plain,${canaries[3]}`, ""],
    [`https://search.example.test/${canaries[0]}?${privateQuery}#secret`, "https://search.example.test"],
    [`https://user:${canaries[4]}@search.example.test/private?${privateQuery}`, "https://search.example.test"],
    [`${origin}/en?${privateQuery}`, `${origin}/en`],
    [`${origin}/es/${canaries[0]}?${privateQuery}`, `${origin}/es/404`],
  ]) {
    assert.equal(safeReferrer(input, `${origin}/en`), expected);
    const { client, events, settings } = clientAt("/en", input);
    client.pageView();
    assert.equal(events[0].page_referrer, expected);
    assert.equal(settings[0].page_referrer, expected);
    assertPrivate([events, settings]);
  }
});

test("SPA views dedupe identical context but track back/forward and reset package/journey context", () => {
  const tour = tourIdentities[0];
  const packagePath = tourHref("en", tour);
  const plan = href("en", "plan");
  const referrer = `https://search.example.test/${canaries[0]}?${privateQuery}`;
  const { client, events, settings, navigate } = clientAt(`/en?${privateQuery}`, referrer);
  const visit = (path, count) => {
    navigate(path);
    client.pageView();
    client.pageView();
    assert.equal(settings.length, count);
  };
  visit(`/en?${privateQuery}`, 1);
  visit(`/en?email=changed#${canaries[3]}`, 1);
  visit(packagePath, 2);
  visit(`${packagePath}/?${privateQuery}#quote`, 2);
  visit(`${plan}?package=${tour.id}&${privateQuery}`, 3);
  visit(`${plan}?package=${tour.id}&email=changed`, 3);
  visit(`${plan}?journey=${journeys[0].slug}`, 4);
  visit(plan, 5);
  visit(packagePath, 6);
  visit(plan, 7);
  const views = events.filter((event) => event.event === "page_view");
  assert.deepEqual(views.map((event) => event.page_path), ["/en", packagePath, plan, plan, plan, packagePath, plan]);
  assert.deepEqual(views.map((event) => event.package_id), [null, tour.id, tour.id, null, null, tour.id, null]);
  assert.equal(views[3].journey_id, journeys[0].slug);
  for (const index of [0, 4, 6]) {
    for (const key of ["package_id", "package_name", "destination", "destinations", "journey_id"]) {
      assert.equal(views[index][key], null);
    }
  }
  assert.equal(events.filter((event) => event.event === "view_package").length, 2);
  assert.equal(views[0].page_referrer, "https://search.example.test");
  for (let index = 0; index < views.length; index++) {
    assert.deepEqual(settings[index], {
      page_location: origin + views[index].page_path,
      page_referrer: index ? origin + views[index - 1].page_path : "https://search.example.test",
      page_title: views[index].page_title,
    });
    assert.equal(views[index].page_referrer, settings[index].page_referrer);
    assert.equal(views[index].source_page, views[index].page_path);
  }
  assertEvents(events);
  assertPrivate(settings);
});

test("planner package changes on the same path are distinct page contexts", () => {
  const { client, events, navigate } = clientAt(tourQuoteHref("es", tourIdentities[0]));
  client.pageView();
  navigate(tourQuoteHref("es", tourIdentities[1]));
  client.pageView();
  client.pageView();
  navigate(tourQuoteHref("es", tourIdentities[0]));
  client.pageView();
  assert.deepEqual(events.map((event) => event.package_id), [tourIdentities[0].id, tourIdentities[1].id, tourIdentities[0].id]);
  assert.ok(events.every((event) => event.event === "page_view" && event.language === "es"));
  assertEvents(events);
});

test("WhatsApp activation emits only office and placement, not phone, text or target URL", () => {
  const { client, events } = clientAt(`/es?${privateQuery}`);
  const cases = [
    ["528135294738", "floating", "monterrey"],
    ["523334855963", "office", "guadalajara"],
    [canaries[2], "planner_result", null],
  ];
  for (const [number, placement, office] of cases) {
    client.linkActivated(`https://wa.me/${number}?text=${canaries[3]}&${privateQuery}`, placement);
    assert.equal(events.at(-1).event, "whatsapp_click");
    assert.equal(events.at(-1).interaction_location, placement);
    assert.equal(events.at(-1).office, office);
    assert.equal(events.at(-1).target_page, null);
  }
  for (const link of [
    href("es", "contact"), `${href("es", "plan")}#whatsapp`, "#whatsapp",
    `http://wa.me/${canaries[2]}`, `https://wa.me.evil.test/${canaries[2]}`,
    `https://wa.me@evil.test/${canaries[2]}`, `https://user:secret@wa.me/${canaries[2]}`,
    "https://wa.me/123", "https://wa.me/1234567890123456", "https://wa.me/not-a-phone",
    `tel:${canaries[2]}`, "http://[",
  ]) client.linkActivated(link, "other");
  assert.equal(events.length, cases.length);
  assertEvents(events, cases.map(([number]) => number));
  assert.doesNotMatch(JSON.stringify(events), /wa\.me/);
});

test("package and planner links select known packages, excluding locale switches and unrelated links", () => {
  for (const locale of locales) {
    const { client, events } = clientAt(`/${locale}?${privateQuery}`);
    for (const tour of tourIdentities) {
      for (const [link, placement, target] of [
        [`${tourHref(locale, tour)}?${privateQuery}`, "package", tourHref(locale, tour)],
        [`${tourQuoteHref(locale, tour)}&${privateQuery}`, "planner_result", href(locale, "plan")],
      ]) {
        client.linkActivated(link, placement);
        assert.deepEqual(events.at(-1), {
          event: "select_package", measurement_source: "discover_app", ...contextForUrl(`/${locale}`),
          package_id: tour.id, package_name: tour.name[locale],
          destination: tour.destinationSlug, destinations: tour.destinationSlug,
          source_page: `/${locale}`, page_location: `${origin}/${locale}`, page_referrer: "",
          target_page: target, interaction_location: placement, office: null, request_state: null, delivery_status: null,
        });
      }
    }
    const count = events.length;
    client.linkActivated(tourHref(locale === "en" ? "es" : "en", tourIdentities[0]), "other", true);
    for (const link of [
      `https://outside.example.test${tourHref(locale, tourIdentities[0])}`,
      href(locale, "contact"), `${href(locale, "plan")}?package=${canaries[0]}`,
      `${href(locale, "plan")}?destination=${destinations[0].slug}`, "javascript:void(0)",
    ]) client.linkActivated(link, "other");
    assert.equal(events.length, count);
    assertEvents(events);
  }
  const path = tourHref("en", tourIdentities[0]);
  const { client, events } = clientAt(path);
  client.linkActivated(path, "package");
  client.linkActivated(`${path}#details`, "package");
  assert.equal(events.length, 0);
  client.linkActivated(`${path}#quote`, "package");
  assert.equal(events.length, 1);
  assert.equal(events[0].event, "select_package");
  assertEvents(events);
});

test("development inquiry is validated only, queued 202 is received, and delivered 200 generates once", () => {
  for (const [payload, status, expected, state, delivery] of [
    [response("development", undefined, 1), 200, ["quote_request_validated"], "validated_not_received", "not_sent"],
    [response("live", "queued", 2), 202, ["quote_request_validated", "quote_request_received"], "received", "queued"],
    [response("live", "delivered", 3), 200, ["quote_request_validated", "quote_request_received", "generate_lead"], "received", "delivered"],
  ]) {
    const tour = tourIdentities[1];
    const { client, events } = clientAt(`${href("es", "plan")}?${privateQuery}`);
    const selection = { packageId: tour.id, destinations: [canaries[0]], email: canaries[1], text: canaries[3] };
    client.inquiryResponse(payload, status, selection);
    client.inquiryResponse({ ...payload }, status, selection);
    assert.deepEqual(events.map((event) => event.event), expected);
    for (const event of events) {
      assert.equal(event.package_id, tour.id);
      assert.equal(event.package_name, tour.name.es);
      assert.equal(event.destination, tour.destinationSlug);
      assert.equal(event.destinations, tour.destinationSlug);
      assert.equal(event.request_state, state);
      assert.equal(event.delivery_status, delivery);
    }
    assertEvents(events, [payload.requestId]);
  }
});

test("receipt dedupe supports queued-to-delivered progression and independent requests", () => {
  const { client, events } = clientAt(href("en", "plan"));
  client.inquiryResponse(response("live", "queued"), 202);
  client.inquiryResponse(response("live", "queued"), 202);
  client.inquiryResponse(response("live", "delivered"), 200);
  client.inquiryResponse(response("live", "delivered"), 200);
  assert.deepEqual(events.map((event) => event.event), ["quote_request_validated", "quote_request_received", "generate_lead"]);
  client.inquiryResponse(response("live", "delivered", 2), 200);
  assert.equal(events.length, 6);
  assert.equal(events.filter((event) => event.event === "generate_lead").length, 2);
  assertEvents(events, [requestId(), requestId(2)]);
});

test("failed, mismatched and malformed inquiry responses emit nothing and do not consume receipts", () => {
  const { client, events } = clientAt(href("en", "plan"));
  const invalid = [null, undefined, false, "delivered", [], {},
    { mode: "live", status: "delivered" },
    ...[null, 123, "", canaries[4], "12345678-abcd-4abc-8def-000000000001-extra"].map((id) => ({
      mode: "live", status: "delivered", requestId: id,
    })),
    response("unknown", "delivered"), response("live", "failed"), response("live", undefined),
  ];
  for (const payload of invalid) client.inquiryResponse(payload, 200);
  for (const status of [0, 201, 204, 400, 401, 403, 409, 422, 429, 500, 502, "200", NaN, undefined]) {
    for (const payload of [response("development"), response("live", "queued"), response("live", "delivered")]) {
      client.inquiryResponse(payload, status);
    }
  }
  client.inquiryResponse(response("live", "delivered"), 202);
  client.inquiryResponse(response("live", "queued"), 200);
  client.inquiryResponse(response("development"), 202);
  assert.deepEqual(events, []);
  client.inquiryResponse(response("live", "delivered"), 200);
  assert.equal(events.length, 3);
  assertEvents(events, [requestId()]);
});

test("multiple inquiry destinations are allowlisted, deduplicated and reset between responses", () => {
  const { client, events } = clientAt(tourQuoteHref("en", tourIdentities[0]));
  const selected = ["oaxaca", "mexico-city"];
  client.inquiryResponse(response("live", "delivered"), 200, {
    packageId: canaries[0], destinations: [selected[0], canaries[1], selected[1], selected[0], canaries[3], "__proto__"],
  });
  for (const event of events) {
    assert.equal(event.package_id, null);
    assert.equal(event.package_name, null);
    assert.equal(event.destination, null);
    assert.equal(event.destinations, selected.join("|"));
  }
  client.inquiryResponse(response("development", undefined, 2), 200, { destinations: [selected[0], selected[0], canaries[0]] });
  assert.equal(events.at(-1).destination, selected[0]);
  assert.equal(events.at(-1).destinations, selected[0]);
  client.inquiryResponse(response("development", undefined, 3), 200);
  for (const key of ["package_id", "package_name", "destination", "destinations"]) assert.equal(events.at(-1)[key], null);
  assertEvents(events, [requestId(), requestId(2), requestId(3)]);
});

test("throwing push/configurePage callbacks cannot escape or disable subsequent client calls", () => {
  for (const failing of ["push", "configurePage"]) {
    const attempts = [];
    let url = `${origin}/en`;
    let fail = true;
    const client = createAnalyticsClient({
      getUrl: () => url,
      getReferrer: () => "",
      push: (event) => {
        attempts.push(event);
        if (fail && failing === "push") throw new Error("Synthetic tracking failure");
      },
      configurePage: () => {
        if (fail && failing === "configurePage") throw new Error("Synthetic configuration failure");
      },
    });
    assert.doesNotThrow(() => client.pageView());
    assert.doesNotThrow(() => client.linkActivated(`https://wa.me/${canaries[2]}?text=${canaries[3]}`, "floating"));
    assert.doesNotThrow(() => client.inquiryResponse(response("live", "delivered"), 200));
    assert.equal(attempts.filter((event) => event.event.startsWith("quote_request") || event.event === "generate_lead").length, 3);
    fail = false;
    url = origin + tourHref("en", tourIdentities[0]);
    assert.doesNotThrow(() => client.pageView());
    assert.equal(attempts.at(-1).event, "view_package");
    assertEvents(attempts, [requestId()]);
  }
});

function bootstrapDom(window = {}) {
  const inserted = [];
  const created = [];
  const first = { parentNode: { insertBefore(script, reference) {
    assert.equal(reference, first);
    inserted.push({ script, queued: JSON.parse(JSON.stringify(window.dataLayer)) });
  } } };
  const document = {
    getElementsByTagName(tag) { assert.equal(tag, "script"); return [first]; },
    createElement(tag) { assert.equal(tag, "script"); const node = {}; created.push(node); return node; },
  };
  const sandbox = createContext({ window, document });
  return { window, inserted, created, run: (path) => runInContext(buildGtmBootstrap(path), sandbox, { timeout: 1000 }) };
}

test("GTM bootstrap queues denied consent before gtm.start, never grants user data, and loads correct GTM once", () => {
  assert.equal(GTM_CONTAINER_ID, "GTM-K45KXVZR");
  const existing = { event: "existing_fixture" };
  const dom = bootstrapDom({ dataLayer: [existing] });
  const path = `${tourHref("es", tourIdentities[0])}?${privateQuery}`;
  dom.run(path);
  dom.run(path);
  dom.run("/en");
  assert.equal(dom.created.length, 1);
  assert.equal(dom.inserted.length, 1);
  assert.equal(dom.window.__discoverGtmLoaded, true);
  assert.equal(dom.window.dataLayer[0], existing);
  assert.deepEqual(dom.created[0], {
    async: true, id: "discover-gtm-loader", src: "https://www.googletagmanager.com/gtm.js?id=GTM-K45KXVZR",
  });
  const queue = dom.inserted[0].queued;
  assert.deepEqual(JSON.parse(JSON.stringify(dom.window.dataLayer)), queue);
  assert.equal(queue.length, 5);
  const consent = queue[1];
  assert.equal(consent[0], "consent");
  assert.equal(consent[1], "default");
  assert.deepEqual(consent[2], {
    analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
  });
  assert.equal(queue[2][0], "set");
  assert.deepEqual(queue[2][1], queue[3]);
  assert.deepEqual(queue[3], {
    ...contextForUrl(path), page_location: origin + tourHref("es", tourIdentities[0]), page_referrer: "",
    send_page_view: false, ads_data_redaction: true,
    allow_google_signals: false, allow_ad_personalization_signals: false,
  });
  assert.equal(queue[4].event, "gtm.js");
  assert.equal(typeof queue[4]["gtm.start"], "number");
  assert.ok(Number.isFinite(queue[4]["gtm.start"]));
  assert.doesNotMatch(JSON.stringify(queue), /granted|"(?:user_data|user_id|user_properties)"/);
  assertPrivate(queue);
});

test("GTM duplicate guards respect both local flag and an already-loaded matching container", () => {
  for (const window of [
    { __discoverGtmLoaded: true },
    { google_tag_manager: { [GTM_CONTAINER_ID]: {} } },
  ]) {
    const dom = bootstrapDom(window);
    dom.run("/en");
    assert.equal(dom.created.length, 0);
    assert.equal(dom.inserted.length, 0);
    assert.equal(window.dataLayer, undefined);
  }
  const dom = bootstrapDom({ google_tag_manager: { "GTM-OTHER": {} } });
  dom.run("/en");
  assert.equal(dom.inserted.length, 1);
});

test("GTM bootstrap sanitizes unknown PII paths/query and emits no raw referrer or script content", () => {
  const path = `/es/${canaries[0]}?${privateQuery}&text=${encodeURIComponent("</script><script>PRIVATE_SCRIPT</script>")}`;
  const script = buildGtmBootstrap(path);
  assertPrivate(script);
  assert.doesNotMatch(script, /PRIVATE_SCRIPT|<\/script>/);
  const dom = bootstrapDom();
  dom.run(path);
  const initial = dom.inserted[0].queued.find((item) => item.page_location);
  assert.equal(initial.page_location, `${origin}/es/404`);
  assert.equal(initial.page_referrer, "");
  assert.equal(initial.page_title, "Discover Mexico \u00b7 Not found");
  assertPrivate(dom.window.dataLayer);
});
