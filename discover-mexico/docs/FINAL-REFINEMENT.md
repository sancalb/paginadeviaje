# Discover Mexico: final refinement

## Scope and reuse

Only `discover-mexico` changed. The parent Mexican site's tracked files, shared review cache, SearchAPI integration, DNS and Render configuration were not edited. Existing brand.css, tokens, photographs, character assets, WhatsApp numbers, branches, destinations, journeys and the promotion pricing/approval service are reused. No dependencies or providers were added.

Home order: Hero, Reviews, Why Travel With Us, principal search + Explore Mexico, Featured Mexico Escapes, Mexico Journeys, Your Kind of Mexico, Our Travel Experts + Offices, Travel Companions, final CTA, Footer. Removed the duplicate office-photo collage and separate early office section; no new large forms.

## Components and services

- `components/pages.tsx`: order and composition; other page exports retained.
- `components/why-travel.tsx`: six bilingual commercial benefits with existing help photo/Minerva and shared classes; no unconfirmed 24/7, guaranteed language or booking promises.
- `components/reviews.tsx`, `lib/server/reviews.ts`: optional validated English sidecar, full-original dialog toggle, translation/translator disclosure, review selection disclosure; prevent desktop card overlap. Preserve original author, text, rating, image URLs and review link. Only confidently detected destinations become photo labels, never a branch name misrepresented as a travel destination.
- `lib/server/review-translations.ts`, `data/review-translations.json`: bounded, fail-closed file keyed by review identity and exact original-text SHA-256. No network/translation request at visitor time. Ten current displayed reviews translated; 297 other cached reviews retain original fallback. This is NOT a claim that the whole historical cache is translated.
- `components/escapes.tsx`, `lib/server/escapes.ts`, `lib/server/promotions.ts`: three Mexico cards using the existing approved promotion reader and USD validation. Inclusions, bilingual conditions, real verification/expiration and occupancy required for featured prices. With no configured verified promotions, clearly labeled editorial ideas for Cancun, Oaxaca and Puerto Vallarta, without prices, fake savings or expiry. Contextual links preserve destination selection.
- `components/experts.tsx`, `lib/server/experts.ts`, `data/experts.json`, `app/api/experts/route.ts`: real identity catalog with explicit publication/language/photo authorization. Only confirmed full-name/unique-alias review associations contribute to personal metrics; no branch-score attribution. Reuse both real Offices cards once. No approved personal profiles are currently configured, so no fabricated portraits/language claims are published.
- `components/planner.tsx`, `components/explore.tsx`, `lib/server/inquiry-schema.ts`: locale-specific validation and WhatsApp summary labels. Privacy safeguards and development-only CRM behavior retained.
- `app/globals.css`: narrowly scoped additions using shared tokens; original brand.css unchanged.
- `.env.example`, `package.json`, tests and QA tools: optional sidecar configuration, all test files included, reproducible verification and comparison capture.

## Verification

- `npm.cmd run build`: successful production build, TypeScript included.
- `npm.cmd test`: 69 tests passed, no failed or skipped tests.
- `node tools/qa.mjs`: 40 bilingual routes, 20 responsive page/viewport combinations, real local development form submission, modal, filters, navigation, sitemap and 404; zero browser errors.
- `node tools/final-qa.mjs`: English and Spanish home order; six benefits; exactly one principal search; three escapes; two offices; ten selected reviews; translation/original dialog round trip; localized form validation; original source fields preserved. Widths 375, 430, 768, 1024, 1440 without page overflow or desktop card overlap.
- `node tools/brand-qa.mjs`: Frida hover/pointer transfer/Escape/mobile navigation, review autoplay/hover pause, hero crossfade and both map links retained.
- API snapshot at verification: Monterrey 255 cached text reviews / 264 profile count; Guadalajara 52 / 53. 307 cached reviews, 317 total profile opinions. Do not confuse the displayed sample of ten with the full profile count.
- Translation audit: 10/10 displayed reviews translated, 10/307 cache coverage, zero orphan entries, source cache unchanged.

Audit command, from `discover-mexico`:

```powershell
node --experimental-strip-types --import ./lib/server/tests/register.mjs tools/check-review-translations.mjs --audit
```

Screenshots and machine-readable reports: `storage/qa/final/` (ignored). `comparison-desktop.png` and `comparison-mobile.png` show before on the left, after on the right. Full before/after home and reviews/why/experts viewport captures are also available.

Local preview remains available at http://localhost:4191/en and http://localhost:4191/es. Nothing deployed.

## Publication inputs still required

Confirm advisor publication consent, authorized portraits and actual supported languages in `EXPERTS_ALLOWLIST_JSON`; no identity is authorized simply because it appears in the supplied staff catalog. Supply approved promotions with verified USD pricing, inclusions, bilingual conditions and validity via the existing `PROMOTIONS_PATH` service. Read [REVIEW-CONTENT-POLICY.md](REVIEW-CONTENT-POLICY.md) for the source terms assessment: a seven-day cache is not itself legal permission to store/reuse Google reviews; applicable intermediary/Google rights require confirmation before production. Reconcile sidecar translations after future source refreshes and translate newly selected reviews offline; missing translations always fall back honestly to the original.
