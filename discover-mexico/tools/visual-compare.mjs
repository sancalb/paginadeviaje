import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const dir = "storage/qa";
mkdirSync(dir, { recursive: true });
const cache = JSON.parse(
  readFileSync("../storage/google-reviews-cache.json", "utf8"),
);
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.QA_CHROMIUM_PATH ||
    "C:/Users/aschz/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe",
});
const report = [];
try {
  for (const width of [375, 430, 768, 1440]) {
    const pages = [];
    for (const [name, url] of [
      ["original", "http://localhost:4180/"],
      ["discover", "http://localhost:4191/en"],
    ]) {
      const p = await browser.newPage({
        viewport: { width, height: 1000 },
        reducedMotion: "reduce",
      });
      p.setDefaultTimeout(10000);
      // Compare both rendered carousels against the same real snapshot without refreshing providers.
      await p.route("**/api/google-reviews", (route) =>
        route.fulfill({ json: cache }),
      );
      await p.goto(url);
      await p.locator(".hero h1").waitFor();
      await p.waitForTimeout(300);
      await p.screenshot({ path: `${dir}/${name}-hero-${width}.png` });
      for (const selector of [
        ".reviews-section",
        ".branches-section",
        ".crew-section",
        ".destinations-section",
        ".site-footer",
      ]) {
        await p.locator(selector).scrollIntoViewIfNeeded();
        await p.waitForTimeout(300);
        await p.screenshot({
          path: `${dir}/${name}-${selector.slice(1)}-${width}.png`,
        });
      }
      const metrics = await p.evaluate(() => {
        const q = (s) => getComputedStyle(document.querySelector(s));
        return {
          font: q("body").fontFamily,
          orange: q("body").getPropertyValue("--orange").trim(),
          navy: q("body").getPropertyValue("--navy").trim(),
          buttonRadius: q(".button").borderRadius,
          headerPosition: q(".site-header").position,
          heroFont: q(".hero h1").fontSize,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      report.push({ name, width, ...metrics });
      pages.push(p);
    }
    const height = 1000;
    const left = await sharp(`${dir}/original-hero-${width}.png`)
      .png()
      .toBuffer();
    const right = await sharp(`${dir}/discover-hero-${width}.png`)
      .png()
      .toBuffer();
    await sharp({
      create: {
        width: width * 2 + 16,
        height,
        channels: 3,
        background: "#ffffff",
      },
    })
      .composite([
        { input: left, left: 0, top: 0 },
        { input: right, left: width + 16, top: 0 },
      ])
      .png()
      .toFile(`${dir}/comparison-hero-${width}.png`);
    for (const p of pages) await p.close();
    for (const section of [
      "reviews-section",
      "branches-section",
      "crew-section",
      "destinations-section",
      "site-footer",
    ]) {
      await sharp({
        create: {
          width: width * 2 + 16,
          height: 1000,
          channels: 3,
          background: "#ffffff",
        },
      })
        .composite([
          { input: `${dir}/original-${section}-${width}.png`, left: 0, top: 0 },
          {
            input: `${dir}/discover-${section}-${width}.png`,
            left: width + 16,
            top: 0,
          },
        ])
        .png()
        .toFile(`${dir}/comparison-${section}-${width}.png`);
    }
  }
  writeFileSync(
    `${dir}/visual-comparison.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  if (report.some((x) => x.overflow)) throw Error("Visual comparison overflow");
} finally {
  await browser.close();
}
