import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { tourPackages } from "../data/tour-packages.ts";
import { tourHref, tourQuoteHref } from "../lib/tour-routes.ts";
const base = process.env.QA_DISCOVER_URL || "http://localhost:4191",
  dir = "storage/qa/tours";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Local QA only");
mkdirSync(dir, { recursive: true });
const report = { routes: [], viewports: [], quotes: [], errors: [] };
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.QA_CHROMIUM_PATH ||
    "C:/Users/aschz/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe",
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(10000);
  page.on("pageerror", (e) => report.errors.push(e.message));
  for (const tour of tourPackages)
    for (const locale of ["en", "es"]) {
      const path = tourHref(locale, tour),
        other = locale === "en" ? "es" : "en";
      const response = await page.goto(base + path);
      assert.equal(response.status(), 200, path);
      assert.equal(await page.title(), tour.seo.title[locale]);
      assert.equal(
        await page.locator('meta[name="description"]').getAttribute("content"),
        tour.seo.description[locale],
      );
      assert.ok(
        (
          await page.locator('link[rel="canonical"]').getAttribute("href")
        ).endsWith(path),
      );
      assert.ok(
        (
          await page.locator(`link[hreflang="${other}"]`).getAttribute("href")
        ).endsWith(tourHref(other, tour)),
      );
      assert.equal(await page.locator("main h1").count(), 1);
      assert.equal(await page.locator(".tour-itinerary > details").count(), 7);
      for (const [index, day] of tour.itinerary.entries()) {
        assert.deepEqual(
          (
            await page
              .locator(".tour-itinerary > details")
              .nth(index)
              .locator(".tour-day-content li")
              .allTextContents()
          ).map((t) => t.trim()),
          day.activities[locale],
        );
      }
      for (const [index, field] of ["inclusions", "exclusions"].entries())
        assert.deepEqual(
          (
            await page
              .locator(".tour-inclusions > div")
              .nth(index)
              .locator("li")
              .allTextContents()
          ).map((t) => t.trim()),
          tour[field][locale],
        );
      assert.equal(
        await page.locator(".tour-faq details").count(),
        tour.faq.length,
      );
      assert.deepEqual(
        (await page.locator(".tour-faq details > p").allTextContents()).map(
          (t) => t.trim(),
        ),
        tour.faq.map((f) => f.a[locale]),
      );
      assert.equal(await page.locator(".tour-hotel-card").count(), 3);
      const schema = JSON.parse(
        await page.locator('script[type="application/ld+json"]').textContent(),
      );
      assert.ok(
        !/"(?:offers|price|lowPrice|aggregateRating)"/.test(
          JSON.stringify(schema),
        ),
      );
      assert.ok(
        !/(?:\$|USD\s*|US\$\s*)(?:999|899|949)/.test(
          await page.locator("main").textContent(),
        ),
      );
      const chat = new URL(
        await page.locator(".tour-quote-intro a.button").getAttribute("href"),
        base,
      );
      assert.equal(chat.hostname, "wa.me");
      assert.equal(chat.searchParams.get("text"), tour.whatsappMessage[locale]);
      assert.equal(
        await page
          .getByRole("textbox", {
            name: locale === "en" ? "Package code" : "Código del paquete",
            exact: true,
          })
          .inputValue(),
        tour.id,
      );
      const language = page.locator(".site-header a.language");
      assert.equal(await language.getAttribute("href"), tourHref(other, tour));
      await language.click();
      await page.waitForURL("**" + tourHref(other, tour));
      report.routes.push({
        path,
        status: 200,
        days: 7,
        faq: tour.faq.length,
        metadata: true,
        language: true,
      });
    }
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const tour of tourPackages) {
      await page.goto(base + tourHref("en", tour));
      await page.evaluate(async () => {
        document.querySelectorAll("img").forEach((i) => {
          i.loading = "eager";
        });
        await Promise.all(
          [...document.images]
            .filter((i) => i.src.startsWith(location.origin))
            .map((i) => i.decode().catch(() => {})),
        );
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      const broken = await page.evaluate(() =>
        [...document.images]
          .filter(
            (i) =>
              i.src.startsWith(location.origin) &&
              i.complete &&
              !i.naturalWidth,
          )
          .map((i) => i.src),
      );
      assert.equal(broken.length, 0);
      await page.screenshot({
        path: `${dir}/${tour.id}-${width}.png`,
        fullPage: true,
      });
      await page.screenshot({ path: `${dir}/${tour.id}-${width}-top.png` });
      report.viewports.push({ width, id: tour.id, overflow: false });
    }
  }
  for (const locale of ["en", "es"])
    for (const category of ["comfort", "premium", "luxury"]) {
      const tour = tourPackages[0];
      await page.goto(base + tourQuoteHref(locale, tour, category));
      assert.equal(
        await page
          .getByRole("textbox", {
            name: locale === "en" ? "Package" : "Paquete",
            exact: true,
          })
          .inputValue(),
        tour.name[locale],
      );
      const next = () =>
        page
          .getByRole("button", {
            name: locale === "en" ? "Continue" : "Continuar",
            exact: true,
          })
          .click();
      await next();
      await next();
      await next();
      assert.equal(
        await page
          .getByRole("button", { name: new RegExp(`^${category}`, "i") })
          .getAttribute("aria-pressed"),
        "true",
      );
      report.quotes.push({ locale, category, prefilled: true });
    }
  const realFormChecks = [];
  for (const locale of ["en", "es"]) {
    const tour = tourPackages[1];
    await page.goto(base + tourQuoteHref(locale, tour, "luxury"));
    const next = () =>
      page
        .getByRole("button", {
          name: locale === "en" ? "Continue" : "Continuar",
          exact: true,
        })
        .click();
    for (let i = 0; i < 6; i++) await next();
    await page
      .getByLabel(locale === "en" ? "Full name" : "Nombre completo", {
        exact: true,
      })
      .fill("QA Tour Local");
    await page
      .getByLabel(locale === "en" ? "Country" : "País", { exact: true })
      .fill("United States");
    await page
      .getByLabel(locale === "en" ? "Email" : "Correo electrónico", {
        exact: true,
      })
      .fill("qa-tours@example.invalid");
    await page
      .getByLabel(
        locale === "en"
          ? "WhatsApp with country code"
          : "WhatsApp con código de país",
      )
      .fill("+12125550123");
    await page.locator("textarea[name=comments]").fill("QA_PACKAGE_NOTE");
    await page.locator("button[type=submit]").click();
    assert.ok((await page.locator(".form-error").textContent()).trim());
    await page.locator("input[name=consent]").check();
    await page.waitForTimeout(1600);
    const requestPromise = page.waitForRequest(
      (r) => r.url().endsWith("/api/inquiries") && r.method() === "POST",
    );
    const responsePromise = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/inquiries") && r.request().method() === "POST",
    );
    await page.locator("button[type=submit]").click();
    const submitted = await requestPromise;
    const response = await responsePromise;
    const payload = await response.json();
    assert.equal(response.status(), 200);
    assert.equal(payload.mode, "development");
    const body = submitted.postDataJSON();
    assert.ok(
      body.comments.includes(tour.id) &&
        body.comments.includes("luxury") &&
        body.comments.includes("QA_PACKAGE_NOTE"),
    );
    assert.equal(body.style, "premium");
    const link = page.locator(".planner-result a.button");
    await link.waitFor();
    const wa = new URL(await link.getAttribute("href"));
    assert.equal(wa.hostname, "wa.me");
    assert.equal(wa.pathname, new URL(payload.whatsappUrl).pathname);
    const message = wa.searchParams.get("text");
    assert.ok(message.includes(tour.id) && message.includes("luxury"));
    for (const pii of [
      "QA Tour Local",
      "qa-tours@example.invalid",
      "+12125550123",
      "QA_PACKAGE_NOTE",
    ])
      assert.ok(!message.includes(pii));
    realFormChecks.push({
      locale,
      mode: payload.mode,
      contextPreserved: true,
      privacyConsent: true,
      contactNotSentToCrm: true,
      whatsappNoPii: true,
    });
  }
  report.formChecks = realFormChecks;
  await page.goto(base + tourQuoteHref("en", tourPackages[0]));
  for (let i = 0; i < 6; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Full name", { exact: true }).fill("QA Tour Failure");
  await page.getByLabel("Country", { exact: true }).fill("United States");
  await page
    .getByLabel("Email", { exact: true })
    .fill("qa-failure@example.invalid");
  await page.getByLabel("WhatsApp with country code").fill("+12125550123");
  await page.locator("input[name=consent]").check();
  await page.route("**/api/inquiries", (route) =>
    route.fulfill({ status: 503, json: { error: "SERVICE_UNAVAILABLE" } }),
  );
  await page.locator("button[type=submit]").click();
  await page.waitForFunction(() =>
    document.querySelector(".form-error")?.textContent?.includes("couldn’t"),
  );
  assert.equal(await page.locator(".planner-result").count(), 0);
  await page.unroute("**/api/inquiries");
  report.failureDoesNotSimulateSuccess = true;
  const missing = await page.goto(base + "/en/tours/not-a-tour");
  assert.equal(missing.status(), 404);
  assert.equal(report.errors.length, 0);
  writeFileSync(`${dir}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
