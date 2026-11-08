import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const base = process.env.QA_DISCOVER_URL || "http://localhost:4191";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Local QA only");
const realContainer = process.argv.includes("--real-container");
const dir = "storage/qa/analytics";
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.QA_CHROMIUM_PATH || "C:/Users/aschz/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe",
});
const report = { realContainer, routes: [], receipts: [], whatsapp: [], errors: [], googleRequests: 0 };
const canary = "PRIVATE_ANALYTICS_CANARY";
const loaderRequests = [];
const googleRequests = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
const googleHost = /(^|\.)(google\.[a-z.]+|google-analytics\.com|googletagmanager\.com|googleadservices\.com|doubleclick\.net|googlesyndication\.com)$/;
await context.route("**/*", async (route) => {
  const request = route.request(), url = new URL(request.url());
  if (url.hostname === "wa.me") return route.fulfill({ status: 200, contentType: "text/html", body: "Local QA: no message sent" });
  if (!googleHost.test(url.hostname)) return route.continue();
  if (url.hostname === "www.googletagmanager.com" && url.pathname === "/gtm.js") loaderRequests.push(request.url());
  if (request.resourceType() === "script" && url.hostname === "www.googletagmanager.com" && /^\/(gtm\.js|gtag\/)/.test(url.pathname)) {
    if (realContainer) {
      const response = await fetch(request.url());
      return route.fulfill({ status: response.status, contentType: "application/javascript", body: await response.text() });
    }
    return route.fulfill({ contentType: "application/javascript", body: "window.__qaGtmLoads=(window.__qaGtmLoads||0)+1;" });
  }
  // Inspect but never deliver measurement hits, including tests with the real public container.
  googleRequests.push(request.url() + " " + (request.postData() || ""));
  return route.fulfill({ status: 204 });
});
const page = await context.newPage();
page.setDefaultTimeout(12000);
page.on("pageerror", (error) => report.errors.push(error.message));
page.on("popup", async (popup) => { await popup.close(); });
const events = () => page.evaluate(() => (window.dataLayer || []).filter((e) => e?.measurement_source === "discover_app" && e?.event));
const count = async (name) => (await events()).filter((e) => e.event === name).length;
async function ready() {
  await page.waitForFunction(() => window.dataLayer?.some((e) => e?.event === "page_view"));
  await page.waitForTimeout(100);
}
async function privacy() {
  const text = JSON.stringify(await events());
  for (const forbidden of [canary, "private-qa@example.invalid", "12125550123", "\"requestId\"", "wa.me", "Idempotency-Key"]) {
    assert.ok(!text.includes(forbidden), "Personal/private data in application events");
  }
}
async function fillPlanner(locale) {
  for (let i = 0; i < 6; i++) await page.getByRole("button", { name: locale === "en" ? "Continue" : "Continuar", exact: true }).click();
  await page.getByLabel(locale === "en" ? "Full name" : "Nombre completo", { exact: true }).fill(canary);
  await page.getByLabel(locale === "en" ? "Country" : "País", { exact: true }).fill("Canada");
  await page.getByLabel(locale === "en" ? "Email" : "Correo electrónico", { exact: true }).fill("private-qa@example.invalid");
  await page.getByLabel(locale === "en" ? "WhatsApp with country code" : "WhatsApp con código de país").fill("+12125550123");
  await page.locator("textarea[name=comments]").fill(canary);
}
try {
  if (realContainer) {
    await page.goto(base + `/en/tailor-made-trips?package=MEX-CUN-7D6N&origin=${canary}&email=private-qa%40example.invalid#${canary}`);
    await ready();
    await page.evaluate((token) => {
      history.pushState({}, "", `/en/tailor-made-trips?package=MEX-CUN-7D6N&destination=cancun&origin=${token}&email=private-qa%40example.invalid`);
    }, canary);
    await fillPlanner("en");
    await page.locator("input[name=consent]").check();
    await page.route("**/api/inquiries", (route) => route.fulfill({ status: 200, json: {
      mode: "development", requestId: "aaaabbbb-cccc-4ddd-8eee-ffffffffffff",
      whatsappUrl: `https://wa.me/528135294738?text=${canary}`,
    } }));
    await page.locator("button[type=submit]").click();
    await page.locator(".planner-result").waitFor();
    await page.locator(".planner-result a.button").click();
    await page.waitForTimeout(2500);
    await privacy();
    for (const hit of googleRequests) {
      let decoded = hit;
      for (let i = 0; i < 3; i++) { try { decoded = decodeURIComponent(decoded); } catch { break; } }
      const privateValues = [canary, canary.toLowerCase(), "private-qa@example.invalid", "12125550123", "+12125550123"];
      const privateHashes = privateValues.map((value) => createHash("sha256").update(value).digest("hex"));
      for (const forbidden of [...privateValues, ...privateHashes]) {
        assert.ok(!decoded.includes(forbidden), "Google's current container attempted to transmit private data");
      }
    }
    report.googleRequests = googleRequests.length;
  } else {
    await page.goto(base + "/en");
    await ready();
    assert.equal(await count("page_view"), 1);
    assert.equal(await page.locator("#discover-gtm-loader").count(), 1);
    const loads = loaderRequests.length;
    await page.locator(".tour-card-main").first().click();
    await page.waitForURL("**/en/tours/cancun-all-inclusive");
    await page.waitForFunction(() => window.dataLayer?.some((e) => e?.event === "view_package"));
    assert.equal(await count("select_package"), 1);
    assert.equal(await count("page_view"), 2);
    assert.equal(loaderRequests.length, loads, "No container reload on SPA navigation");
    await page.locator("a.language").click();
    await page.waitForURL("**/es/tours/cancun-todo-incluido");
    await page.waitForFunction(() => window.dataLayer?.some((e) => e?.event === "view_package" && e.language === "es"));
    assert.equal(await count("select_package"), 1, "Language switch is not package selection");
    assert.equal(await count("page_view"), 3);
    await page.goBack();
    await page.waitForURL("**/en/tours/cancun-all-inclusive");
    await page.waitForTimeout(200);
    assert.equal(await count("page_view"), 4, "Back counts one visit");
    const packages = {
      en: ["cancun-all-inclusive", "guadalajara-tequila", "mexico-city"],
      es: ["cancun-todo-incluido", "guadalajara-tequila", "ciudad-de-mexico"],
    };
    for (const locale of ["en", "es"]) {
      for (const slug of packages[locale]) {
        const path = `/${locale}/tours/${slug}`;
        await page.goto(base + path);
        await ready();
        assert.equal(await count("page_view"), 1);
        assert.equal(await count("view_package"), 1);
        assert.equal((await events()).find((e) => e.event === "view_package").language, locale);
        report.routes.push(path);
      }
      const plannerPath = locale === "en" ? "/en/tailor-made-trips" : "/es/viajes-personalizados";
      for (const [mode, status, http, expected] of [
        ["development", undefined, 200, 0], ["live", "queued", 202, 0], ["live", "delivered", 200, 1],
        ["live", undefined, 200, 0], ["live", "delivered", 503, 0],
      ]) {
        await page.goto(base + `${plannerPath}?package=MEX-CUN-7D6N&origin=${canary}&email=private-qa%40example.invalid`);
        await ready();
        let submitted = 0;
        await page.route("**/api/inquiries", (route) => {
          submitted++;
          return route.fulfill({ status: http, json: {
            mode, status, requestId: "aaaabbbb-cccc-4ddd-8eee-ffffffffffff",
            ...(mode === "development" ? { whatsappUrl: `https://wa.me/528135294738?text=${canary}` } : {}),
          } });
        });
        await fillPlanner(locale);
        const before = await count("page_view");
        await page.locator("button[type=submit]").click();
        assert.equal(submitted, 0, "Invalid form cannot submit or convert");
        assert.equal(await count("generate_lead"), 0);
        await page.locator("input[name=consent]").check();
        await page.locator("button[type=submit]").click();
        if (http === 503) await page.locator(".form-error").filter({ hasText: /\S/ }).waitFor();
        else await page.locator(".planner-result").waitFor();
        assert.equal(await count("generate_lead"), expected, `${locale} ${mode} ${status} ${http}`);
        assert.equal(await count("page_view"), before, "Form steps and receipt do not create virtual pages");
        if (mode === "development") {
          assert.equal(await count("quote_request_validated"), 1);
          assert.equal(await count("whatsapp_click"), 0, "Preparing a link is not a click");
          await page.locator(".planner-result a.button").click();
          assert.equal(await count("whatsapp_click"), 1);
          assert.equal((await events()).find((e) => e.event === "whatsapp_click").interaction_location, "planner_result");
        }
        await privacy();
        report.receipts.push({ locale, mode, status, http, leads: expected });
        await page.unroute("**/api/inquiries");
      }
    }
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const locale of ["en", "es"]) {
        await page.goto(base + "/" + locale);
        await ready();
        const office = page.locator('.branch-feature a[href^="https://wa.me/"]');
        for (let i = 0; i < 2; i++) {
          const before = await count("whatsapp_click");
          await office.nth(i).click();
          assert.equal(await count("whatsapp_click"), before + 1);
          assert.equal((await events()).filter((e) => e.event === "whatsapp_click").at(-1).office, i === 0 ? "monterrey" : "guadalajara");
        }
        const floating = page.locator('a.whatsapp-float[href^="https://wa.me/"]');
        await floating.click();
        assert.equal((await events()).filter((e) => e.event === "whatsapp_click").at(-1).interaction_location, "floating");
        assert.equal(await count("generate_lead"), 0);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        report.whatsapp.push({ locale, width, officeAndFloating: true });
        if (width === 375 || width === 1440) await page.screenshot({ path: `${dir}/${locale}-${width}.png` });
      }
    }
    await context.route("**/gtm.js?*", (route) => route.abort());
    await page.goto(base + "/en/tours/cancun-all-inclusive");
    await ready();
    assert.equal(await page.locator(".tour-itinerary > details").count(), 7);
    assert.equal(await page.locator(".planner form").count(), 1);
    assert.equal(report.errors.length, 0);
  }
  writeFileSync(`${dir}/${realContainer ? "container-privacy" : "report"}.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
