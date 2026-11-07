# Verification — 2026-11-06

## deviaje.mx visual adaptation

The subsequent iteration passed production build, TypeScript, 26 server tests,
40 bilingual routes and 20 page/viewport combinations. Extra browser checks passed
for Frida hover, pointer transfer, Escape, mobile catalog navigation, 6400ms review
autoplay, pause on hover, decoded hero crossfade and both office map links. No
JavaScript errors or horizontal document overflow at 375, 430, 768 or 1440 px.

`app/brand.css` matches original `styles.css` byte-for-byte, SHA-256
8820e3197c97a9c95f94a447c70e9e55e82dbde3ecf0a4c60f220b8b7195a3ca.
Original tracked files have no diff. New tests confirm unscoped or international
flights do not enter published promotions by default. Comparison evidence is under
`storage/qa/comparison-*.png`: original left, Discover right. During comparison the
original reviews API is intercepted with its real local cache to avoid refreshing
providers. Integration limitations below remain unchanged; the earlier baseline is
retained for context.

Tested locally in a production Next.js build on Node 24.18.0. This report does not
claim any deployment, provider authorization, booking or Kommo delivery.

## Passed

- `npm run build`: production compilation and TypeScript, no tracing warnings.
- `npm run check`: strict TypeScript.
- `npm test`: 22 server tests, all passed. Synthetic inputs/injected transports;
  these tests verify contracts, not external integration readiness.
- `npm audit --omit=dev`: zero reported dependency vulnerabilities.
- `node tools/qa.mjs`: 40 EN/ES routes returned 200; unknown destination 404.
- Twenty representative page/viewport combinations at 375, 430, 768 and 1440 px:
  home EN/ES, destination, itinerary, planner. No horizontal document overflow,
  no visible broken photographs, no JavaScript exceptions.
- Eight destination pages and all three itineraries in both languages. Eight
  independently verified destination photographs; public credit/license page.
- Destination interest filter, journey duration filter, mobile menu navigation,
  complete-review modal and Escape close; sitemap with Spanish hreflang.
- Browser completed all seven planner steps with synthetic contact data to the
  local development endpoint. HTTP 200, mode=development, real configured business
  WhatsApp destination; no WhatsApp link was clicked or message sent.
- Invalid inquiry HTTP 422. Unit tests cover timing/honeypot, body limits,
  consent, ages, dates, origin, idempotency conflict, rate limits, missing WhatsApp,
  absent live gateway, safe tags, FX/occupancy/revalidation and promotion approval.
- Actual `/api/google-reviews`: HTTP 200, cached Monterrey 241 reviews/249 reported
  total, Guadalajara 28 reviews/28 reported total. Original 269 cached review texts
  preserved. Cache is stale; stale metadata is preserved, no SearchAPI refresh made.
- Excess image arrays are truncated without discarding the associated text review.
- Google image URLs in the old cache sometimes fail remotely. The client removes
  unavailable image areas and retains stars, author, text and original review link.
- Original project `npm run build` passed; tracked original files have no diff.
- `.env.local`, node_modules, runtime output, screenshots and .next are ignored.

## Visual evidence

Ignored local screenshots in `storage/qa/home-{375,430,768,1440}.png` and
`storage/qa/form-confirmation.png`. `storage/qa/report.json` records routes and
viewport widths. Destination images were inspected against their identified places.

## Not exercised or not complete for production

- No production Render service, domain, DNS, HTTPS validation or public deployment.
- No real Hotelbeds/SearchAPI request, paid quota, availability check or CheckRate.
- No live package/flight/hotel search. Package adapter deliberately responds 503
  pending a safe shared engine contract; no demo prices reach visitors.
- No durable lead storage, live Kommo gateway/worker, CRM credentials, advisor IDs
  or actual follow-up delivery. Live mode fails closed when these are absent.
- No active/bilingual staff publication approval. Named profiles stay unpublished.
- Privacy/legal content is a clearly labeled preliminary draft, not final legal
  approval. Legal entity, privacy contact and retention rules require completion.
- Each destination has one verified photograph; richer galleries need additional
  correctly licensed or authorized assets.
- Production reviews require an available cached service/config or a deployed
  normalized snapshot. The parent's ignored local cache is not a deployment artifact.
- Commercial FX source, margin/tax policy and promotion approvals need owner review.

## References consulted

- Next.js installation: https://nextjs.org/docs/app/getting-started/installation
- Render Next.js Web Service: https://render.com/docs/deploy-nextjs-app
- Mexico tourism overview: https://visitmexico.com/es/pagina/preguntas-frecuentes
- SECTUR Tequila: https://www.gob.mx/sectur/es/articulos/tequila-jalisco
- Los Cabos destination guidance: https://www.visitloscabos.travel/things-to-do/beaches/
- Exact image sources, authors and licenses: `data/image-credits.json`.

Itineraries, durations and neighborhood groupings are editorial suggestions, not
confirmed supplier products or guarantees. Current entry rules, schedules, prices
and seasonal services were deliberately not invented.
