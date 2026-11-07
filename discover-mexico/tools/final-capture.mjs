import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
const stage = process.argv[2] === 'before' ? 'before' : 'after';
const dir = 'storage/qa/final';
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_CHROMIUM_PATH || 'C:/Users/aschz/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe' });
const results = [];
try {
  for (const width of [375, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://localhost:4191/en', { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      document.querySelectorAll('img').forEach(i => { i.loading = 'eager'; });
      await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    });
    await page.screenshot({ path: `${dir}/${stage}-${width}-home.png`, fullPage: true });
    for (const [name, selector] of [['reviews','#resenas'], ['why','#ayuda'], ['experts','#expertos']]) {
      await page.locator(selector).evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 100));
      await page.waitForTimeout(180);
      await page.screenshot({ path: `${dir}/${stage}-${width}-${name}.png` });
    }
    results.push({ width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors });
    await page.close();
  }
} finally { await browser.close(); }
writeFileSync(`${dir}/${stage}-report.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
if(stage === 'after') {
  for (const [name,width] of [['desktop',1440],['mobile',375]]) {
    const panelWidth = name === 'desktop' ? 720 : 375;
    const panelHeight = Math.round(1000 * panelWidth / width);
    const panels = [];
    for(const [i,label] of ['before','after'].entries()) {
      panels.push({input:await sharp(`${dir}/${label}-${width}-reviews.png`).resize(panelWidth,panelHeight).toBuffer(),left:i*panelWidth,top:44});
    }
    const header = Buffer.from(`<svg width="${2*panelWidth}" height="44"><rect width="100%" height="100%" fill="#ffffff"/><text x="18" y="29" font-family="Arial" font-size="16" fill="#061b2f">Antes</text><text x="${panelWidth+18}" y="29" font-family="Arial" font-size="16" fill="#061b2f">Después</text></svg>`);
    await sharp({create:{width:panelWidth*2,height:panelHeight+44,channels:3,background:'#ffffff'}}).composite([{input:header,top:0,left:0},...panels]).png().toFile(`${dir}/comparison-${name}.png`);
  }
}
