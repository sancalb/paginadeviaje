import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const before = process.argv.includes("--before");
const dir = "storage/qa/tours";
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.QA_CHROMIUM_PATH ||
    "C:/Users/aschz/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe",
});
const snapshots = [];
try {
  for (const width of [375, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    await page.goto("http://localhost:4191/en");
    await page.locator(".review-card.is-active").waitFor();
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
    await page.screenshot({
      path: `${dir}/${before ? "before" : "after"}-home-${width}.png`,
      fullPage: true,
    });
    const signatures = await page.evaluate(() =>
      [
        ".site-header",
        "#inicio",
        "#resenas",
        "#ayuda",
        "#destinos",
        "#grupales",
        ".mexico-stories",
        "#expertos",
        ".journey-works",
        "#personajes",
        ".final-cta",
        ".site-footer",
      ].map((selector) => {
        const node = document.querySelector(selector),
          css = getComputedStyle(node),
          rect = node.getBoundingClientRect();
        return {
          selector,
          text: node.textContent.replace(/\s+/g, " ").trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          font: css.fontFamily,
          color: css.color,
          background: css.backgroundColor,
          padding: css.padding,
          links: [...node.querySelectorAll("a")].map((a) =>
            a.getAttribute("href"),
          ),
          images: [...node.querySelectorAll("img")].map((i) =>
            i.getAttribute("src"),
          ),
        };
      }),
    );
    snapshots.push({ width, signatures });
    await page.close();
  }
} finally {
  await browser.close();
}
writeFileSync(
  `${dir}/${before ? "before" : "after"}-scope.json`,
  JSON.stringify(snapshots, null, 2),
);
if (!before)
  assert.deepEqual(
    snapshots,
    JSON.parse(readFileSync(`${dir}/before-scope.json`, "utf8")),
    "Home outside package section must remain identical",
  );
console.log(
  before
    ? "Captured original home section signatures"
    : "All non-package home sections preserved at desktop and mobile",
);
