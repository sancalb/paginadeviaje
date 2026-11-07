import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.QA_CHROMIUM_PATH ||
    "C:/Users/aschz/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe",
});
const base = "http://localhost:4191";
const checks = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(10000);
  await page.goto(base + "/en");
  await page.locator(".frida-trigger").scrollIntoViewIfNeeded();
  await page.locator(".frida-trigger").hover();
  await page.waitForFunction(
    () =>
      document
        .querySelector(".frida-trigger")
        ?.getAttribute("aria-expanded") === "true",
  );
  await page.waitForTimeout(300);
  await page.locator(".frida-menu-panel").hover();
  await page.waitForTimeout(350);
  if (
    (await page.locator(".frida-trigger").getAttribute("aria-expanded")) !==
    "true"
  )
    throw Error("Frida panel closed during pointer transfer");
  if ((await page.locator(".frida-teaser-link").count()) !== 4)
    throw Error("Frida teaser size");
  checks.push("Frida hover and pointer transfer");
  await page.screenshot({ path: "storage/qa/frida-desktop.png" });
  await page.keyboard.press("Escape");
  if (
    (await page.locator(".frida-trigger").getAttribute("aria-expanded")) !==
    "false"
  )
    throw Error("Frida Escape");
  checks.push("Frida Escape");
  await page.locator(".reviews-section").scrollIntoViewIfNeeded();
  await page.mouse.move(1, 1);
  const first = await page
    .locator(".review-card.is-active")
    .getAttribute("data-review-index");
  await page.waitForTimeout(6700);
  const next = await page
    .locator(".review-card.is-active")
    .getAttribute("data-review-index");
  if (next === first) throw Error("Review autoplay");
  checks.push("Original 6400ms review autoplay");
  await page.locator(".reviews-section").hover();
  const paused = await page
    .locator(".review-card.is-active")
    .getAttribute("data-review-index");
  await page.waitForTimeout(6700);
  if (
    (await page
      .locator(".review-card.is-active")
      .getAttribute("data-review-index")) !== paused
  )
    throw Error("Review hover did not pause");
  checks.push("Review hover pauses autoplay");
  await page.setViewportSize({ width: 375, height: 900 });
  await page.locator(".frida-trigger").scrollIntoViewIfNeeded();
  await page.locator(".frida-trigger").click();
  await page.waitForURL("**/en/destinations");
  checks.push("Frida tap opens Mexico catalog");
  await page.goto(base + "/en");
  const before = await page
    .locator(".hero-media img.is-active")
    .getAttribute("src");
  await page.waitForTimeout(7400);
  if (
    (await page.locator(".hero-media img.is-active").getAttribute("src")) ===
    before
  )
    throw Error("Hero did not advance");
  await page.waitForTimeout(1000);
  if ((await page.locator(".hero-media img.is-active").count()) !== 1)
    throw Error("Hero duplicate active layer");
  checks.push("Hero decoded crossfade across Mexico images");
  await page.goto(base + "/en/contact");
  for (const link of await page.locator(".branch-map-thumb").all()) {
    if (!(await link.getAttribute("href"))?.startsWith("https://share.google/"))
      throw Error("Map destination");
  }
  if ((await page.locator(".branch-feature").count()) !== 2)
    throw Error("Branches count");
  checks.push("Two original offices with correct map links");
  writeFileSync(
    "storage/qa/brand-report.json",
    JSON.stringify({ checks }, null, 2),
  );
  console.log(JSON.stringify({ checks }, null, 2));
} finally {
  await browser.close();
}
