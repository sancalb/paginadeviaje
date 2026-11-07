# Discover Mexico launch packages

## Scope

Only the existing Featured Mexico Experiences home section, six new package landings, necessary package quote context, language routing and metadata were changed. No Mexican-site files, header/footer components, existing destinations/experiences/journeys, API routes, review source/cache, Kommo, payments, DNS or Render settings were changed. Nothing was published or pushed.

Source: the full bilingual launch catalog supplied in the user's clarification. All three packages remain proposed, quotation-only products. Unverified target amounts are absent from the public catalog, UI, query strings, metadata and JSON-LD. No hotel names, hotel star ratings or contracted suppliers were invented.

## URLs

| Product | English | Spanish |
| --- | --- | --- |
| MEX-CUN-7D6N | http://localhost:4191/en/tours/cancun-all-inclusive | http://localhost:4191/es/tours/cancun-todo-incluido |
| MEX-GDL-7D6N | http://localhost:4191/en/tours/guadalajara-tequila | http://localhost:4191/es/tours/guadalajara-tequila |
| MEX-MEX-7D6N | http://localhost:4191/en/tours/mexico-city | http://localhost:4191/es/tours/ciudad-de-mexico |

Both language versions preserve the same product on language switch. Existing `/en/mexico-tours`, `/es/circuitos`, destination and editorial experience URLs remain separate and unchanged.

## Content coverage

| Complete content, each language | Cancun | Guadalajara | Mexico City |
| --- | ---: | ---: | ---: |
| Days / nights | 7 / 6 | 7 / 6 | 7 / 6 |
| Itinerary activity statements | 31 | 46 | 41 |
| Full highlights on landing | 5 | 6 | 6 |
| Inclusions | 6 | 10 | 9 |
| Exclusions | 6 | 7 | 6 |
| Upgrades | 8 | 7 | 7 |
| FAQ | 8 | 8 | 9 |

English activity text and conditions are retained. Spanish contains the source descriptions plus complete activity translations, rather than omitting the detail present in English. Optional Cancun outings, conditional breakfasts, legal-age/provider-dependent tequila tasting, excluded train, unconfirmed museum admissions, additional costs and cancellation conditions remain explicit.

Home cards provide four highlights each, full duration/destination/commercial description, product link, Explore This Journey and Request a Quote. Landings retain all highlights and full lists. Each landing has a hero, overview, destination gallery, seven expandable days, inclusion/exclusion columns, three hotel categories, optional upgrades, agency reviews, FAQ, quote/contact section and expandable important information.

Photography reuses existing licensed destination assets. Hotel-category illustrations are explicitly labeled as destination inspiration, not a specific contracted property. Day images are only assigned when an existing photograph actually matches the destination/activity. Reviews retain original authors, text, images and Google links; translated reviews are identified and original text remains accessible. Clear destination mentions within the existing selected sample are prioritized, without claiming that a review endorses the new package.

## Created Files

- `data/tour-packages.ts`: full central bilingual content, source conditions, itineraries, hotels, upgrades, FAQ, gallery references, empty confirmed price and quotation-only publication state.
- `data/tour-identities.ts`: central lightweight IDs, names, localized slugs and destination identities. Shared by catalog, client routing and planner without shipping full itineraries in the header bundle.
- `lib/tour-routes.ts`: package links and validated-context quote link construction using the existing planner route.
- `components/tour-package.tsx`: one reusable page template and home card module.
- `app/tour-packages.css`: scoped package styles; no global tokens or shared style overrides.
- `app/[locale]/tours/[slug]/page.tsx`: six static package paths, exact source SEO titles/descriptions, canonicals, reciprocal hreflang, Open Graph, escaped TouristTrip/Breadcrumb JSON-LD without offers or fabricated ratings.
- `lib/server/tests/tour-catalog.test.mjs` and `lib/server/tests/tour-routes.test.mjs`: content completeness, source conditions, assets, identities, SEO, language, metadata safety and backward compatibility.
- `tools/tour-qa.mjs`: real-browser package, content, quote, privacy, failure and responsive checks/captures.
- `tools/tour-scope-qa.mjs`: before/after home section comparison outside the allowed package section.
- `docs/LAUNCH-PACKAGES.md`: this report.

## Modified Files

- `components/featured-experiences.tsx`: existing home export now uses package cards; original editorial experience listing keeps its original cards and routes through an internal separate renderer.
- `components/planner.tsx`: opt-in known-package prefill only. Existing default form behavior is retained; package identity/destination/locale shown read-only, country suggestions, distinct Comfort/Premium/Luxury selection, contextual comments and WhatsApp handoff.
- `components/reviews.tsx`: optional package-only heading/disclosure and safe destination ordering; default home output stays unchanged.
- `lib/routes.ts`: localized package switching only; existing journeys and experience paths preserved.
- `app/sitemap.ts`: six package entries and language alternates added without removing existing URLs.

## Reused Components And Behavior

Existing `Photo` rendering/styles, `PhotoGallery`, planner, Google-review carousel/modal, original brand tokens and button styles, page layout/header/footer, configured WhatsApp number, privacy link, form validation and existing inquiry endpoint. No new integration, provider, database or dependency.

Package context is carried through the existing comments field, so no API schema or CRM custom-field changes were necessary. Luxury remains the visible/preserved hotel category; the legacy backend's broader style enum uses its existing premium classification while the exact Luxury category is retained in the context. User comments remain within the existing 2,000-character limit.

The existing local environment is in development mode: it returns a contact-free handoff, does not send contact details to Kommo and does not represent a confirmed submission/booking. The UI explicitly says this and offers the configured WhatsApp continuation. A simulated 503 leaves the user on the form with an error, never a success state. Contact details and arbitrary user comments are not inserted into WhatsApp URLs.

## Validation

- Production build and TypeScript successful.
- 84 automated tests pass, with no failures/skips.
- No lint script/configuration exists in this checkout. `npm run lint --if-present` skipped it; this is not claimed as a successful lint run. TypeScript, tests, build and browser checks were executed instead, without adding dependencies/configuration outside scope.
- Six package URLs: 200, one H1, exact title/meta description, canonical/hreflang, valid structured data, all itinerary activities, complete inclusion/exclusion/FAQ text and original language links verified.
- Nine page/viewport combinations: all three packages at 375/768/1440px; local photos render, no document overflow. Full-page and first-viewport captures retained.
- All three hotel categories prefill correctly in English/Spanish. Actual local development submissions in both languages preserve package code/category, require privacy consent and keep contact details out of WhatsApp links. No CRM delivery was performed.
- Simulated inquiry failure shows an error and does not fabricate success.
- Before/after comparison of 12 non-package home sections at desktop/mobile: exact normalized text, links, image URLs, dimensions, typography, colors and padding preserved. Position below the enlarged package section naturally shifts, but each section's own content/appearance is unchanged.
- Original browser QA still passes: 40 bilingual routes, 20 responsive combinations, existing default form, filters, modal, navigation, sitemap and 404; zero browser exceptions.

Run from `discover-mexico`:

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run build
node --experimental-strip-types --import ./lib/server/tests/register.mjs tools/tour-qa.mjs
node tools/tour-scope-qa.mjs
```

The scope tool compares against the retained `--before` snapshot. Browser tests expect the existing local production preview on port 4191 and development inquiry mode; do not run real-submission checks against a live CRM environment.

Captures and reports: ignored `storage/qa/tours/`. Each package has desktop/tablet/mobile full-page and top captures. Source cache and all existing photographs remain intact.

## Commercial Information Still Pending

Actual hotels/rooms/meal plans and seasonal quotes; airport/shared/private transfer suppliers/capacity; excursion operators, guide languages, operating days, admission lists and exact culinary experiences; confirmed prices/margins/validity; deposits, change/cancellation/refund conditions; age/accessibility/provider-specific restrictions; final commercial approval and existing review/photo usage approvals where required. Existing photography licenses are documented, but no assertion that all remaining commercial checks are complete is made. No target rate is presented as a real offer.
