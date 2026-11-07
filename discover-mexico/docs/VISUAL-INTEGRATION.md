# Discover Mexico: original deviaje.mx visual foundation

The original site remains unmodified. Discover is the international adaptation of
that identity; its earlier separate wordmark, green palette, Arial type and thin
editorial header were removed.

## Audit and actual reuse

| Original source | Discover adaptation |
| --- | --- |
| `styles.css :root`, body | Verbatim `app/brand.css`, same Inter/system stack, orange #ff5c34, navy #061b2f, cream/paper, lines, shadows and original breakpoints. |
| `index.html` header, `script.js updateHeader` | `components/shell.tsx`: same `site-header`, logo-on-dark/light, 20px scroll threshold, fixed transparent-to-paper transition, mobile toggle and CTA. A native details menu groups extra international links. |
| `public/assets/brand/logo-{black,white,yellow}.png` | Actual logo copies in `public/media`; Discover Mexico is a subordinate label, not a replacement logo. |
| `index.html #inicio`, hero CSS, two-layer crossfade | `components/hero.tsx`: same composition, overlay, decorative routes, compass, Diego, decoded layers, 5600ms cycle, 900ms fade, parallax and reduced-motion handling. Mexico-only photos and supplied international copy. |
| `.reveal` and scroll observer | `RevealObserver` uses the original classes and transitions; hooks own lifecycle and cleanup. |
| Original six character assets, `.mini-crew`, Frida teaser | `components/characters.tsx`: actual six unaltered cutouts, original order, roles, hover scale, surrounding dimming and 240ms delayed close; four Mexican teaser destinations, mobile click to catalog. |
| Original final carousel implementation in `script.js` and final CSS overrides | `components/reviews.tsx`: same is-carousel-reviews/active/prev/next cards, centered emphasis, 6400ms autoplay, arrows, dots, mobile snap/swipe and modal. Real quotes remain in their original language. Mexico mentions are prioritized conservatively. Missing images produce compact text cards. |
| Original branch HTML, office assets, coordinates and Maps links | `components/branches.tsx`: same branch-layout/feature/body/actions and circular maps. Read-only centered OSM tiles reuse the same coordinates and pin; attribution stays visible. Map failures retain a pin/link. |
| Original destinations showcase and card markup | `DestinationShowcase` uses original left copy + horizontal carousel, featured first card, next-card hint, arrows, inspiration chips and `.destination-content` / `.destination-arrow`. The full catalog still has working filters. |
| Original help/photo/Minerva and CTA patterns | Home uses the real help-layout/panel/grid styles and Minerva asset. `FinalCTA` uses the original photo background, overlay, copy and Diego/Chente composition. |
| Original footer | Same site-footer/footer-main four-column structure, actual white logo, social icon masks, Google profile links and orange final CTA. Translated destination/journey/expert/contact/legal links. |
| Original WhatsApp behavior | Existing real office numbers/links and translated messages; floating contact uses the configured business number passed safely from the server. The planning form remains a separate progressive quotation flow. |
| Original advisor data and review matching | Kept behind the existing review/cache service. Source has a matching catalog, not an approved bilingual staff publication list; no active profiles or language skills inferred from mentions. |
| Original promotions | Visual story pattern remains in the brand base. No fictional commercial promotion is added. The prepared published-promotions gate keeps approval/expiry/pricing checks and excludes unscoped or international flights by default. |

## Sharing decision

Original pages are plain HTML/imperative JavaScript; Discover is React/Next.js. The
HTML class structure, CSS, assets and behavioral constants were carried over, with
event handling expressed in React. Loading the entire original global script into
Next would create duplicate DOM mutations, listeners and data requests, so it is
not loaded.

`app/brand.css` is byte-identical to the original stylesheet at this iteration.
Icons are local copies so CSS masks compile independently in Render. The original
is the authoritative source. `node tools/sync-brand.mjs` explicitly refreshes the
snapshot/assets only inside Discover, followed by build and visual review. It is
not run automatically and does not change or add dependencies to the main site.

This initial copy is deliberately one-way. A shared React package would not remove
duplication in a plain HTML site and would require changing that site. Extracting a
common package can wait until both applications have a compatible component system.
Backend reviews remain shared data, not a second SearchAPI collector.

## Exclusive Discover functionality retained

Bilingual routes, eight Mexico destinations, three reference itineraries, trip
route diagrams, travel information, localized SEO, progressive planning form,
validation/idempotency, server adapters and USD pricing boundary remain independent.
No provider readiness has changed through a visual redesign. No international
flight is included in a published package unless explicitly authorized later.

## Visual and functional verification

`tools/visual-compare.mjs` opens original localhost:4180 and Discover localhost:4191,
compares desktop/mobile sections and records computed font/colors/button radius/
fixed-header behavior. Both visual comparisons receive the same real local review
snapshot through an intercepted read, preventing a billable original refresh.

`storage/qa/comparison-hero-{375,430,768,1440}.png` shows original on the left,
Discover on the right. Individual screenshots cover reviews, branches, characters
and footer at the same widths. `tools/brand-qa.mjs` additionally exercises Frida,
pointer transfer, Escape, mobile catalog navigation, carousel autoplay/pause,
decoded hero image changes and the two office map links.

No DNS, deployment, production service, provider request, booking or CRM send was
made. Run instructions and remaining production blockers are in README.md.
