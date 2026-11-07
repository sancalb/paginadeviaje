import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const base = "http://localhost:4191";
mkdirSync("storage/qa", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.QA_CHROMIUM_PATH ||
    "C:/Users/aschz/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe",
});
const report = { routes: [], viewports: [], form: null, errors: [] };
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  page.on("pageerror", (e) => report.errors.push(e.message));
  for (const locale of ["en", "es"]) {
    const dest = locale === "en" ? "destinations" : "destinos",
      tours = locale === "en" ? "mexico-tours" : "circuitos";
    const slugs = [
      "mexico-city",
      "guadalajara",
      "tequila",
      "puerto-vallarta",
      "cancun",
      "riviera-maya",
      "oaxaca",
      "los-cabos",
    ];
    const home = await page.goto(`${base}/${locale}`);
    if (home.status() !== 200) throw Error("home");
    const journeyPaths = await page
      .locator(`a[href^="/${locale}/${tours}/"]`)
      .evaluateAll((links) => [
        ...new Set(links.map((a) => new URL(a.href).pathname)),
      ]);
    for (const route of [
      `/${locale}`,
      `/${locale}/${dest}`,
      `/${locale}/${tours}`,
      ...slugs.map((s) => `/${locale}/${dest}/${s}`),
      ...journeyPaths,
      ...(locale === "en"
        ? [
            "tailor-made-trips",
            "about-us",
            "contact",
            "privacy",
            "terms",
            "travel-information",
          ]
        : [
            "viajes-personalizados",
            "nosotros",
            "contacto",
            "privacidad",
            "terminos",
            "informacion-para-viajar",
          ]
      ).map((s) => `/${locale}/${s}`),
    ]) {
      const response = await page.goto(base + route);
      const h1 = await page.locator("h1").textContent();
      if (response.status() !== 200 || !h1)
        throw Error(`route failed ${route}`);
      report.routes.push({ route, status: response.status() });
    }
  }
  console.log("40 bilingual routes passed");
  for (const width of [375, 430, 768, 1440]) {
    console.log(`Checking viewport ${width}`);
    await page.setViewportSize({ width, height: width > 800 ? 1000 : 900 });
    for (const route of [
      "/en",
      "/es",
      "/en/destinations/oaxaca",
      "/es/circuitos/cancun-riviera-maya",
      "/en/tailor-made-trips",
    ]) {
      await page.goto(base + route);
      await page.locator("h1").waitFor();
      await page
        .locator('img[src^="/"]')
        .evaluateAll((images) =>
          images.forEach((img) => (img.loading = "eager")),
        );
      await page.evaluate(() =>
        Promise.race([
          Promise.all(
            [...document.images]
              .filter((img) => img.src.startsWith(location.origin))
              .map((img) => img.decode().catch(() => {})),
          ),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]),
      );
      await page.evaluate(() =>
        Promise.race([
          Promise.all(
            [...document.images]
              .filter((img) => img.loading !== "lazy")
              .map((img) =>
                img.complete
                  ? Promise.resolve()
                  : new Promise((resolve) => {
                      img.onload = resolve;
                      img.onerror = resolve;
                    }),
              ),
          ),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]),
      );
      const info = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        broken: [...document.images]
          .filter(
            (i) =>
              i.complete &&
              !i.naturalWidth &&
              i.getBoundingClientRect().height > 1 &&
              getComputedStyle(i).display !== "none",
          )
          .map((i) => i.src),
      }));
      if (info.scroll > width + 1 || info.broken.length)
        throw Error(JSON.stringify({ route, width, ...info }));
      report.viewports.push({ route, ...info });
      if (route === "/en")
        await page.screenshot({
          path: `storage/qa/home-${width}.png`,
          fullPage: true,
        });
    }
  }
  console.log("Responsive checks passed; testing planner");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/en/tailor-made-trips?destination=oaxaca&origin=JFK");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  for (let i = 0; i < 5; i++)
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Full name", { exact: true }).fill("QA Local Test");
  await page.getByLabel("Country", { exact: true }).fill("United States");
  await page
    .getByLabel("Email", { exact: true })
    .fill("local-test@example.invalid");
  await page.getByLabel("WhatsApp with country code").fill("+12125550123");
  await page.getByLabel(/I agree/).check();
  await page.waitForTimeout(1600);
  const responsePromise = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/inquiries") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send my trip request" }).click();
  const result = await responsePromise;
  const payload = await result.json();
  if (result.status() !== 200 || payload.mode !== "development")
    throw Error(JSON.stringify(payload));
  report.form = {
    status: result.status(),
    mode: payload.mode,
    whatsappConfigured: !!payload.whatsappUrl,
  };
  await page.screenshot({ path: "storage/qa/form-confirmation.png" });
  const bad = await page.request.post(base + "/api/inquiries", {
    data: {},
    headers: { "Idempotency-Key": crypto.randomUUID() },
  });
  if (bad.status() !== 422) throw Error(`invalid accepted ${bad.status()}`);
  console.log("Planner passed; testing filters and navigation");
  await page.goto(base + "/en/destinations?interest=beach");
  await page
    .getByRole("button", { name: "Beaches & Relaxation", exact: true })
    .waitFor();
  await page.waitForFunction(
    () =>
      document.querySelector('button[aria-pressed="true"]')?.textContent ===
      "Beaches & Relaxation",
  );
  if ((await page.locator(".destination-grid .destination-tile").count()) !== 4)
    throw Error("beach filter");
  await page.goto(base + "/en/mexico-tours");
  await page.getByLabel(/^Duration/).selectOption("week");
  if ((await page.locator(".journey-grid article").count()) !== 2)
    throw Error("duration filter");
  await page.goto(base + "/en");
  await page.locator(".review-card.is-active .review-more").click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  if ((await page.getByRole("dialog").count()) !== 0)
    throw Error("modal escape");
  await page.setViewportSize({ width: 375, height: 900 });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Destinations", exact: true })
    .click();
  await page.waitForURL("**/en/destinations");
  const sitemap = await page.request.get(base + "/sitemap.xml");
  if (sitemap.status() !== 200) throw Error("sitemap");
  if (!(await sitemap.text()).includes('hreflang="es"'))
    throw Error("hreflang");
  const missing = await page.goto(base + "/en/destinations/not-a-destination");
  if (missing.status() !== 404) throw Error("missing route not 404");
  writeFileSync("storage/qa/report.json", JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        routes: report.routes.length,
        viewports: report.viewports.length,
        form: report.form,
        errors: report.errors,
      },
      null,
      2,
    ),
  );
  if (report.errors.length) throw Error("Browser errors");
} finally {
  await browser.close();
}
