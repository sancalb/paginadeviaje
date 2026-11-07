import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const base = 'http://localhost:4191';
const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_CHROMIUM_PATH || 'C:/Users/aschz/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe' });
const report = { languages: [], widths: [], translated: 0, originalPreserved: false, errors: [] };
try {
  const page = await browser.newPage({ reducedMotion: 'reduce', viewport: {width:1440,height:1000} });
  page.on('pageerror', e => report.errors.push(e.message));
  const api = await (await page.request.get(base + '/api/google-reviews')).json();
  const source = JSON.parse(readFileSync('../storage/google-reviews-cache.json','utf8'));
  for (const [id, branch] of Object.entries(api.branches)) {
    for (const review of branch.reviews) {
      const original = source.branches[id].reviews.find(r => r.reviewId === review.reviewId);
      assert.ok(original);
      for (const field of ['text','author','rating','url','image']) assert.equal(review[field], original[field] ?? '');
      assert.deepEqual(review.images, (original.images || []).slice(0,20));
      if (review.translation) report.translated++;
    }
  }
  report.originalPreserved = true;
  for (const locale of ['en','es']) {
    await page.goto(`${base}/${locale}`);
    await page.locator('.review-card.is-active').waitFor();
    assert.equal(await page.locator('.review-card').count(),10);
    assert.equal(await page.locator('.why-benefit').count(),6);
    assert.equal(await page.locator('.quick-search').count(),0);
    assert.equal(await page.locator('.branch-feature').count(),2);
    assert.equal(await page.locator('.experience-card').count(),3);
    const markers = await page.locator('main').evaluate(el => [...el.querySelectorAll('section')].filter(s => s.matches('.hero,#resenas,#ayuda,.destinations-section,.featured-experiences,#grupales,.mexico-stories,#expertos,.journey-works,.crew-section,.final-cta')).map(s=>s.id || [...s.classList].filter(c=>!['section','wrap'].includes(c)).join(' ')));
    const author = await page.locator('.review-card.is-active .review-meta strong').textContent();
    const review = Object.values(api.branches).flatMap(b=>b.reviews).find(r=>r.author===author && r.translation);
    assert.ok(review?.translation);
    assert.equal(await page.locator('.review-translation').count(), locale==='en'?10:0);
    await page.locator('.review-card.is-active .review-more').click();
    await page.getByRole('dialog').waitFor();
    const modalText = page.locator('.review-modal-text');
    if(locale==='en') {
      assert.equal(await modalText.textContent(),review.translation.text);
      await page.getByRole('button',{name:'Read original in Spanish'}).click();
      assert.equal(await modalText.textContent(),review.text);
      await page.getByRole('button',{name:'Read in English'}).click();
      assert.equal(await modalText.textContent(),review.translation.text);
    } else assert.equal(await modalText.textContent(),review.text);
    await page.keyboard.press('Escape');
    report.languages.push({locale,order:markers,modal:true});
  }
  for(const width of [375,430,768,1024,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.goto(base+'/en');
    await page.locator('.review-card.is-active').waitFor();
    await page.waitForTimeout(250);
    const geometry = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.review-card.is-prev,.review-card.is-active,.review-card.is-next')].map(e=>e.getBoundingClientRect()).sort((a,b)=>a.left-b.left);
      return {overflow:document.documentElement.scrollWidth>innerWidth,overlap:innerWidth>900 && cards.some((r,i)=>i>0&&r.left<cards[i-1].right-1)};
    });
    assert.equal(geometry.overflow,false);
    assert.equal(geometry.overlap,false);
    report.widths.push({width,...geometry});
  }
  for(const locale of ['en','es']) {
    const route=locale==='en'?'tailor-made-trips':'viajes-personalizados';
    await page.goto(`${base}/${locale}/${route}?destination=oaxaca`);
    await page.getByRole('button',{name:locale==='en'?'Continue':'Continuar',exact:true}).click();
    const error = await page.locator('.form-error[role="alert"]').textContent();
    assert.ok(error.includes(locale==='en'?'please complete this field':'completa este campo'));
  }
  assert.equal(report.errors.length,0);
  writeFileSync('storage/qa/final/functional-report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
