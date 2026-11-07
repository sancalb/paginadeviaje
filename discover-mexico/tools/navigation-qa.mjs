import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const main = process.env.QA_MAIN_URL || "http://localhost:4180";
const discover = process.env.QA_DISCOVER_URL || "http://localhost:4191";
for (const base of [main, discover]) {
  assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Local QA only");
}
const dir = "storage/qa/navigation";
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.QA_CHROMIUM_PATH ||
    "C:/Users/aschz/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe",
  headless: true,
});
const report = { routes: [], responsive: [], screenshots: [], errors: [] };
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.on("pageerror", (error) => report.errors.push(error.message));
  page.setDefaultTimeout(10000);
  const sitemap = await page.request.get(discover + "/sitemap.xml");
  assert.equal(sitemap.status(), 200);
  const xml = await sitemap.text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  assert.equal(paths.length, new Set(paths).size, "No duplicate sitemap URLs");
  paths.push("/en/photo-credits", "/es/photo-credits", "/en/privacy", "/es/privacidad", "/en/terms", "/es/terminos");
  const internalPaths = new Set();
  await page.goto(discover + "/en");
  for (const path of paths) {
    const response = await page.request.get(discover + path);
    assert.equal(response.status(), 200, path);
    const data = await page.evaluate((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return {
        title: doc.title,
        description: doc.querySelector('meta[name="description"]')?.content,
        canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        en: doc.querySelector('link[hreflang="en"]')?.getAttribute("href"),
        es: doc.querySelector('link[hreflang="es"]')?.getAttribute("href"),
        links: [...doc.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
      };
    }, await response.text());
    assert.ok(data.title && data.description, path + " metadata");
    assert.equal(data.canonical, "https://discover.deviaje.mx" + path, path + " canonical");
    const locale = path.split("/")[1];
    assert.equal(data[locale], data.canonical, path + " self hreflang");
    const alternate = locale === "en" ? "es" : "en";
    assert.ok(new URL(data[alternate]).pathname.startsWith("/" + alternate + "/") ||
      new URL(data[alternate]).pathname === "/" + alternate);
    for (const link of data.links) {
      if (link.startsWith("/en") || link.startsWith("/es")) {
        const url = new URL(link, discover);
        internalPaths.add(url.pathname);
        if (!link.startsWith("/" + locale)) assert.equal(url.pathname, new URL(data[alternate]).pathname, path + " language link");
      }
    }
    report.routes.push({ path, metadata: true, status: response.status() });
  }
  for (const path of internalPaths) assert.equal((await page.request.get(discover + path)).status(), 200, path);
  const robots = await page.request.get(discover + "/robots.txt");
  assert.match(await robots.text(), /Sitemap: https:\/\/discover\.deviaje\.mx\/sitemap\.xml/);
  assert.match(await robots.text(), /Disallow: \/api\//);
  for (const [base, site] of [[main, "main"], [discover, "discover"]]) {
    for (const width of [375, 430, 768, 1024, 1160, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const locale of site === "main" ? ["es"] : ["en", "es"]) {
        await page.goto(base + (site === "main" ? "/" : "/" + locale));
        const toggle = page.locator(".menu-toggle");
        const collapsed = await toggle.isVisible();
        if (collapsed) {
          await toggle.click();
          await page.waitForTimeout(250);
          assert.equal(await toggle.getAttribute("aria-expanded"), "true");
        }
        const geometry = await page.evaluate(() => {
          const logo = document.querySelector(".site-header > a:first-child").getBoundingClientRect();
          const nav = document.querySelector(".main-nav").getBoundingClientRect();
          const links = [...document.querySelectorAll(".main-nav > a")].map((a) => a.getBoundingClientRect());
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            overlap: nav.left < logo.right && nav.top < logo.bottom && nav.bottom > logo.top,
            outside: links.some((r) => r.left < 0 || r.right > innerWidth + 1 || r.width > innerWidth),
          };
        });
        assert.equal(geometry.overflow, false, `${site}/${locale} ${width} overflow`);
        assert.equal(geometry.overlap, false, `${site}/${locale} ${width} header overlap`);
        assert.equal(geometry.outside, false, `${site}/${locale} ${width} navigation fit`);
        if (site === "main") {
          const navLink = page.locator('.main-nav a[href="https://discover.deviaje.mx/en"]');
          await navLink.waitFor({ state: "visible" });
          assert.equal(await navLink.innerText(), "Discover Mexico");
          assert.ok(await page.locator('#destinos + .discover-connection').count());
          assert.equal(await page.locator('.discover-connection a.button').getAttribute("href"), "https://discover.deviaje.mx/es");
          assert.equal(await page.locator('.discover-connection a[lang="en"]').getAttribute("href"), "https://discover.deviaje.mx/en");
          assert.equal(await page.locator('.footer-links a[href="https://discover.deviaje.mx/es"]').count(), 1);
        } else {
          const packages = page.locator('.main-nav a[href="/' + locale + '#experiences"]');
          await packages.click();
          await page.waitForTimeout(350);
          assert.equal(await page.locator('#experiences .tour-card').count(), 3);
          assert.equal(await page.locator('.site-header > a:first-child').getAttribute("href"), "/" + locale);
          assert.equal(await page.locator('footer a.parent-site-link').getAttribute("href"), "https://deviaje.mx");
          if (collapsed) assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        }
        if (width === 375 || width === 1440) {
          if (collapsed && await toggle.getAttribute("aria-expanded") === "true") await toggle.click();
          const section = site === "main" ? page.locator(".discover-connection") : page.locator(".site-footer");
          await section.scrollIntoViewIfNeeded();
          await page.waitForTimeout(350);
          const path = `${dir}/${site}-${locale}-${width}.png`;
          await page.screenshot({ path });
          report.screenshots.push(path);
        }
        report.responsive.push({ site, locale, width, collapsed, ...geometry });
      }
    }
  }
  for (const locale of ["en", "es"]) {
    await page.goto(discover + "/" + locale + (locale === "en" ? "/about-us" : "/nosotros"));
    assert.ok((await page.locator("main").innerText()).includes(locale === "en"
      ? "Discover Mexico is the Mexico travel division of deviaje.mx, a Mexican travel agency with offices in Monterrey and Guadalajara."
      : "Discover Mexico es la división especializada en viajes por México de deviaje.mx, una agencia de viajes mexicana con oficinas en Monterrey y Guadalajara."));
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(main);
  await page.locator(".main-nav .whatsapp-link").click();
  assert.equal(await page.locator("[data-whatsapp-choice]").isVisible(), true);
  assert.equal(await page.locator('[data-whatsapp-choice] a[href^="https://wa.me/"]').count(), 2);
  assert.equal(report.errors.length, 0, "Browser errors");
  writeFileSync(`${dir}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ routes: report.routes.length, linkedRoutes: internalPaths.size, responsive: report.responsive.length, errors: report.errors }));
} finally {
  await browser.close();
}
