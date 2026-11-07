# Discover Mexico by deviaje.mx

Visual update: Discover now uses the original deviaje.mx logo, stylesheet, hero,
character system, carousel, offices, buttons and footer. See
`docs/VISUAL-INTEGRATION.md` for source mappings and side-by-side verification.
The previous independent wordmark and green editorial design are retired.

Independent Next.js 16 / React / TypeScript application. The original web and the
scraper source are unchanged. This checkout is for local review; nothing has been
published or connected to DNS, Render production, Hotelbeds bookings or Kommo.

## Start locally

From PowerShell:

```powershell
cd 'C:\Dev\pagina web\discover-mexico'
npm.cmd ci
Copy-Item .env.example .env.local
# Set WHATSAPP_NUMBER to the approved business number and APP_ORIGIN to localhost:4191.
npm.cmd run dev
```

English: http://localhost:4191/en — Spanish: http://localhost:4191/es

The ignored local `.env.local` prepared during implementation selects the existing
Monterrey business number supplied by the owner. It contains no provider secrets.
Do not overwrite an existing local configuration merely to run the app again.

Production preview: `npm.cmd run build`, then `npm.cmd run start -- -p 4191`.
`next start` also honors Render's `PORT`. Node 24 is required. No parent `.env` is
loaded. `tools/start-preview.mjs` starts a hidden local preview and records its PID
under ignored `storage/preview-pid.json`; stop that PID before changing the port or
rebuilding the running preview.

## Brand navigation

Both applications live in the `sancalb/paginadeviaje` repository, with separate
build roots and deployments. The Mexican site remains at the repository root;
Discover uses `discover-mexico`. Neither application changes `agentes.deviaje.mx`.

The Mexican navigation links to Discover in English, with Spanish and English
entry points after Inspiration and a Spanish footer link. Discover's logo stays
inside its own locale home; About explains the agency relationship and its footer
links back to the Spanish main site. Mexico Packages links to the existing
`#experiences` section; Mexico Journeys retains its existing multi-city routes.
All three package pages and their localized slugs are preserved.

`node tools/navigation-qa.mjs` checks local cross-site links, metadata, internal
routes and desktop/tablet/mobile navigation. It expects the main app on port 4180
and Discover on 4191; override `QA_MAIN_URL` / `QA_DISCOVER_URL` for other local
ports. Build and run Discover with the public `SITE_URL` to validate production
canonical URLs; this does not require editing local environment files.

## Content and routes

`data/content.ts` is the bilingual editorial source for eight destinations, three
reference itineraries and six experience categories. Shared components render the
catalogs and detail pages; adding entries does not require another page component.
English and Spanish use the requested localized section paths. Destination slugs
stay stable across languages. Root redirects to `/en`; invalid slugs return 404.
Canonical, hreflang, sitemap, robots and Open Graph metadata are included.

Photography is real and place-verified, resized to WebP. Credits and licenses are
in `data/image-credits.json`, available through the footer and `/en/photo-credits`.
Each destination currently has one verified image; more authorized photographs are
needed for rich destination galleries. Original brand, characters and office assets
are reused as copies; originals remain untouched.

## Working now

- EN/ES navigation, eight destination pages and three day-by-day journey pages.
- Destination interest filters, journey duration/destination/interest filters.
- Budget is a planning preference, not an invented package-price filter.
- Seven-step planner, dates/adults/child ages, preferences, contact and consent.
- Server validation, request ID, origin checks, honeypot, rate limit, development
  idempotency and contextual WhatsApp handoff. No personal contact fields in the URL.
- Existing Google review cache read through `/api/google-reviews`. No new SearchAPI
  requests or refreshes from visitors. Stale metadata is preserved. Real photos are
  shown only when they load; inaccessible photographs leave the text review visible.
- Real office photographs, supplied addresses/phones and Google Maps links.

Development confirmation means **outline prepared**, not a persisted lead or CRM
delivery. Contact data are not stored in this mode. Without a configured WhatsApp
number the server rejects the handoff; the office contact page remains accessible.

## Services and production blockers

Read `docs/ARCHITECTURE.md` for the audited source contracts, exact files and
boundaries. No scraper jobs or tests were run and no scraping is used by Discover.

The existing package engine has two different interfaces. Source inspection found
an unexposed flexible-search stub, a backend demo-flight fallback, missing hotel
occupancy binding, mixed-currency arithmetic and incomplete freshness/revalidation
contracts. `/api/packages/search` therefore returns a controlled 503 rather than
calling an unsafe public proxy. Hotelbeds Availability/Content/Cache and SearchAPI
flight providers remain owned by the existing motor; no duplicated provider search,
rate selection or scoring was added. Cache API credentials were not probed and
are not claimed operational.

`lib/server/pricing.ts` defines a USD commercial quote boundary: explicit FX snapshot,
gross margin, fees, taxes, matching occupancy, expiry and revalidation. It is not
connected to live rates. `lib/server/promotions.ts` enforces draft → review → approved
→ published → expired; only approved, published and current prices are readable.
No promotions or prices are seeded or published.

Kommo has no existing connector in the audited source. The prepared adapter builds
language/destination/market tags, responsible user and follow-up task commands. Live
submission is gated on a durable gateway contract. **That gateway/worker is not
implemented or deployed here.** It must be supplied and tested against the actual
Kommo account before enabling live inquiries. No mock result establishes a real
integration. See the protocol and required configuration in the architecture doc.

Experts are not inferred active/bilingual from reviews. Their explicit publication
allowlist defaults empty; until approved, the home presents the real offices/team
contact rather than named staff profiles or ambiguous review associations.

Before production: approve the final privacy entity/contact/retention and commercial
terms (currently clearly marked preliminary); confirm bilingual staff and publication
permissions; supply live durable lead handling and real Kommo IDs; finalize the
shared engine auth/occupancy/FX/revalidation contract; provide the production cached
reviews source; approve final content, image licenses and commercial pricing policy.

## Variables

`.env.example` documents the server-only settings. Basic deployment uses:

- `NODE_ENV=production`, Node `24.x`, `SITE_URL=https://discover.deviaje.mx`.
- `APP_ORIGIN=https://discover.deviaje.mx`.
- `WHATSAPP_NUMBER`: approved business E.164 number, digits or leading +.
- `INQUIRIES_MODE=development` until the live gateway is verified.
- `GOOGLE_REVIEWS_SERVICE_URL`: trusted cached reviews endpoint; no SearchAPI URL.
- `GOOGLE_REVIEWS_CONFIG_PATH`: copied public branch config path in a standalone
  deployment, or default `../config/google-reviews-branches.json` in this monorepo.
- `GOOGLE_REVIEWS_CACHE_PATH`: optional read-only normalized fallback snapshot.

Optional experts, promotions and live gateway settings are described in `.env.example`.
No `NEXT_PUBLIC_` secret settings. SearchAPI and Hotelbeds credentials stay with their
existing services; they are not needed for browsing or the assisted planning flow.

## Render preparation

Create a **separate Web Service** from the repository, Root Directory
`discover-mexico`, Build Command `npm ci && npm run build`, Start Command
`npm start`, Node 24. Configure environment settings in Render, not source control.
If the service root is this child directory, copy the public branch config into it
or configure the path to an available file. Parent local cache files are ignored by
git and will not appear in a new deployment. Prefer a cached reviews service and a
read-only fallback artifact, not provider calls from the frontend.

No disk is required for browsing or development-mode WhatsApp. Live inquiries need
the independently verified durable service, not ephemeral local files.

When approved for publication, first verify the independent `*.onrender.com` URL.
Add `discover.deviaje.mx` as a custom domain in that new service. Render supplies the
exact target; the required DNS shape is `discover CNAME <new-service>.onrender.com`.
The actual service hostname is not known yet and must not be guessed. Determine the
authoritative DNS zone before adding it. Render manages HTTPS after validation.
This does not require changing apex `deviaje.mx` or `agentes.deviaje.mx`.

## Verification

`npm run build` and `npm run check` verify production compilation and TypeScript.
Server contract/security tests use synthetic fixtures and injected transports.
`node tools/qa.mjs` tests real local pages at 375/430/768/1440, routes, images,
overflow, planner handoff and failure/404 states. Set `QA_CHROMIUM_PATH` to an
installed Chromium executable if the documented local QA default is unavailable.
QA never sends WhatsApp messages or a real Kommo lead. Screenshots and test reports
are written under ignored `storage/qa`. Current results are in `docs/TEST-REPORT.md`.
