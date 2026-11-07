import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const dir = "storage/qa/boutique";
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.QA_CHROMIUM_PATH ||
    "C:/Users/aschz/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe",
});
const report = [];
const before = process.argv.includes("--before");
try {
  for (const width of [375, 768, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const routes = before
      ? [["home", "/en"]]
      : [
          ["home", "/en"],
          ["oaxaca", "/en/destinations/oaxaca"],
          ["cancun", "/en/destinations/cancun"],
          ["experience", "/en/experiences/guadalajara-and-tequila"],
          ["journey", "/en/mexico-tours/jalisco-city-agave-coast"],
        ];
    for (const [name, route] of routes) {
      const response = await page.goto("http://localhost:4191" + route);
      if (response.status() !== 200)
        throw Error(`Route ${route}: ${response.status()}`);
      await page.waitForTimeout(300);
      await page.evaluate(async () => {
        [...document.images]
          .filter((i) => i.src.startsWith(location.origin))
          .forEach((i) => {
            i.loading = "eager";
          });
        await Promise.all(
          [...document.images]
            .filter((i) => i.src.startsWith(location.origin))
            .map((i) => i.decode().catch(() => {})),
        );
      });
      await page.screenshot({
        path: `${dir}/${before ? "before-" : ""}${name}-${width}.png`,
        fullPage: true,
      });
      await page.screenshot({
        path: `${dir}/${before ? "before-" : ""}${name}-${width}-top.png`,
      });
      if (name === "home" && !before) {
        for (const [part, selector] of [
          ["reviews", "#resenas"],
          ["why", "#ayuda"],
          ["experiences", "#experiences"],
          ["stories", ".mexico-stories"],
          ["team", "#expertos"],
        ]) {
          await page
            .locator(selector)
            .evaluate((el) =>
              scrollTo(0, el.getBoundingClientRect().top + scrollY - 100),
            );
          await page.waitForTimeout(180);
          await page.screenshot({ path: `${dir}/home-${width}-${part}.png` });
        }
      }
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        height: document.documentElement.scrollHeight,
        broken: [...document.images]
          .filter(
            (i) =>
              i.src.startsWith(location.origin) &&
              i.complete &&
              !i.naturalWidth,
          )
          .map((i) => i.getAttribute("src")),
      }));
      report.push({ width, route, ...geometry });
      if (geometry.overflow || geometry.broken.length)
        throw Error(JSON.stringify(report.at(-1)));
    }
    if (errors.length) throw Error(errors.join("\n"));
    await page.close();
  }
} finally {
  await browser.close();
}
writeFileSync(
  `${dir}/${before ? "before-" : ""}visual-report.json`,
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
