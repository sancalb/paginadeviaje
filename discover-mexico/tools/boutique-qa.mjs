import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.QA_CHROMIUM_PATH ||
    "C:/Users/aschz/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe",
});
const base = "http://localhost:4191";
const report = {
  routes: [],
  viewports: [],
  checks: [],
  errors: [],
  sectionHeights: [],
};
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
const experiences = [
  "cancun-coast-and-city",
  "guadalajara-and-tequila",
  "mexico-city-neighborhoods",
];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(10000);
  page.on("pageerror", (error) => report.errors.push(error.message));
  for (const locale of ["en", "es"]) {
    const dest = locale === "en" ? "destinations" : "destinos";
    const exp = locale === "en" ? "experiences" : "experiencias";
    await page.goto(base + "/" + locale);
    const actualExperiencePaths = await page
      .locator(".featured-experiences a")
      .evaluateAll((links) => links.map((a) => new URL(a.href).pathname));
    assert.equal(actualExperiencePaths.length, 3);
    const routes = [
      ...slugs.map((s) => `/${locale}/${dest}/${s}`),
      `/${locale}/${exp}`,
      ...actualExperiencePaths,
    ];
    for (const route of routes) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200, route);
      assert.equal(await page.locator("main h1").count(), 1);
      if (route.includes("/" + dest + "/")) {
        assert.ok((await page.locator(".gallery-open").count()) >= 2);
        await page.locator(".gallery-open").first().click();
        await page.locator(".gallery-dialog[open]").waitFor();
        const src = await page
          .locator(".gallery-full-image")
          .getAttribute("src");
        await page
          .getByRole("button", {
            name: locale === "en" ? "Next photo" : "Foto siguiente",
            exact: true,
          })
          .click();
        assert.notEqual(
          await page.locator(".gallery-full-image").getAttribute("src"),
          src,
        );
        assert.ok(
          await page
            .locator('.gallery-caption a[href^="https://creativecommons.org"]')
            .count(),
        );
        await page.keyboard.press("Escape");
        assert.equal(await page.locator(".gallery-dialog[open]").count(), 0);
        assert.ok(
          await page
            .locator(".gallery-open")
            .first()
            .evaluate((el) => el === document.activeElement),
        );
      }
      report.routes.push(route);
    }
    await page.goto(base + "/" + locale);
    await page.locator(".review-card.is-active").waitFor();
    assert.equal(await page.locator(".review-card").count(), 10);
    assert.equal(
      await page.locator(".review-translation").count(),
      locale === "en" ? 10 : 0,
    );
    assert.equal(await page.locator(".journey-process li").count(), 4);
    assert.equal(await page.locator(".story-link").count(), 3);
    assert.equal(await page.locator(".branch-feature").count(), 2);
    assert.equal(await page.locator(".hero-character").count(), 0);
  }
  for (const width of [375, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/en",
      "/es",
      "/en/destinations/oaxaca",
      "/es/experiencias/guadalajara-and-tequila",
    ]) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `overflow ${width} ${route}`,
      );
      report.viewports.push({ width, route });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const locale of ["en", "es"]) {
    await page.setViewportSize({ width: 375, height: 812 });
    const section = locale === "en" ? "destinations" : "destinos";
    for (const slug of slugs) {
      const route = `/${locale}/${section}/${slug}`;
      await page.goto(base + route);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        route,
      );
      report.viewports.push({ width: 375, height: 812, route });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/en");
  report.sectionHeights = await page
    .locator("main>section")
    .evaluateAll((elements) =>
      elements.map((e) => ({
        section: e.id || e.className,
        height: Math.round(e.getBoundingClientRect().height),
      })),
    );
  await page
    .getByRole("button", { name: "Next destination photo", exact: true })
    .click();
  await page.waitForTimeout(1100);
  assert.equal(
    await page.locator(".hero-scene-caption strong").textContent(),
    "Cancún",
  );
  assert.ok(
    (
      await page.locator(".hero-media img.is-active").getAttribute("src")
    ).includes("/cancun.webp"),
  );
  await page
    .getByRole("button", { name: "Previous destination photo", exact: true })
    .click();
  await page.waitForTimeout(1100);
  assert.equal(
    await page.locator(".hero-scene-caption strong").textContent(),
    "Mexico City",
  );
  report.checks.push("Hero manual next/previous and decoded photo identity");
  await page.getByRole("button", { name: "Show Oaxaca", exact: true }).click();
  await page.waitForTimeout(1100);
  assert.equal(
    await page.locator(".hero-scene-caption strong").textContent(),
    "Oaxaca",
  );
  const heroBoxes = await page.evaluate(() => {
    const r = (s) => {
      const b = document.querySelector(s).getBoundingClientRect();
      return { top: b.top, bottom: b.bottom };
    };
    return {
      hero: r(".hero"),
      copy: r(".hero-copy"),
      footer: r(".hero-cinema-footer"),
    };
  });
  assert.ok(heroBoxes.copy.bottom < heroBoxes.footer.top);
  assert.ok(heroBoxes.hero.bottom < 1000);
  report.checks.push("Hero composition leaves next section visible");
  for (const [width, height] of [
    [375, 667],
    [390, 844],
    [768, 700],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(base + "/en");
    const boxes = await page.evaluate(() => {
      const copy = document.querySelector(".hero-copy").getBoundingClientRect();
      const footer = document
        .querySelector(".hero-cinema-footer")
        .getBoundingClientRect();
      return {
        copyBottom: copy.bottom,
        footerTop: footer.top,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    assert.equal(boxes.overflow, false);
    assert.ok(
      boxes.copyBottom < boxes.footerTop,
      `hero copy collision ${width}x${height}`,
    );
    report.viewports.push({ width, height, route: "/en", heroClear: true });
  }
  const sitemap = await (await page.request.get(base + "/sitemap.xml")).text();
  assert.ok(
    sitemap.includes("/en/experiences/") &&
      sitemap.includes("/es/experiencias/"),
  );
  const missing = await page.goto(
    base + "/en/experiences/not-a-real-experience",
  );
  assert.equal(missing.status(), 404);
  assert.equal(report.errors.length, 0);
  mkdirSync("storage/qa/boutique", { recursive: true });
  writeFileSync(
    "storage/qa/boutique/functional-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
