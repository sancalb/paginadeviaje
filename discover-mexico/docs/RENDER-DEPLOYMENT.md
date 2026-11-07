# Independent Render deployment

Preparation only. No Render service, environment setting, domain or DNS record
was created or changed. Do not add a custom domain during the initial preview.

## Manual service settings

| Field | Value |
| --- | --- |
| Service type | Web Service, not Static Site |
| Repository | https://github.com/sancalb/paginadeviaje |
| Branch | main |
| Root Directory | discover-mexico |
| Runtime | Node |
| Build Command | npm ci --include=dev && npm run build |
| Start Command | npm start |
| Node | 24.x; verified locally with 24.18.0 |
| Health Check Path | /en |
| Persistent disk | Not required |

The explicit `--include=dev` installs TypeScript and type packages for the build
even when NODE_ENV is production. `npm start` runs `next start -H 0.0.0.0` and
uses Render's PORT automatically. Do not hardcode 4191, 3000 or PORT in Render.
The existing `.node-version` and package engines constrain Node to major 24;
NODE_VERSION=24.18.0 additionally pins the tested version if desired.

Keep the Mexican application's service rooted at the repository root. Do not
change that service, its domains, or the independent agents service. Discover's
root directory keeps builds inside its own application. The main service may
still redeploy on repository-wide pushes if it has no existing build filters;
no filters or autodeploy settings were changed by this task.

## Environment for the initial preview

Enter these only in the new Discover service. Do not copy the parent .env or a
local .env.local file. Never put credentials in NEXT_PUBLIC variables.

| Variable | Value |
| --- | --- |
| NODE_ENV | production |
| SITE_URL | https://discover.deviaje.mx |
| APP_ORIGIN | The exact https://...onrender.com URL assigned to the new service |
| WHATSAPP_NUMBER | 528135294738 |
| INQUIRIES_MODE | development |
| GOOGLE_REVIEWS_CONFIG_PATH | ./data/google-reviews-branches.json |
| GOOGLE_REVIEWS_SERVICE_URL | https://www.deviaje.mx/api/google-reviews |

SITE_URL deliberately retains the intended canonical production hostname; relative
navigation still works on the preview host. APP_ORIGIN must match the host used
for submitting forms. After Render assigns the actual service URL, set APP_ORIGIN
to that exact origin and let the new service redeploy before testing forms.
Only when a custom domain is separately authorized and working should APP_ORIGIN
change to https://discover.deviaje.mx. Do not guess an onrender hostname.

WHATSAPP_NUMBER reuses the currently configured Monterrey business number, not a
new or unconfirmed international number. INQUIRIES_MODE=development preserves the
existing WhatsApp handoff: it does not persist a lead or deliver one to Kommo.
Do not select live mode without the separate durable gateway and real account
configuration documented in ARCHITECTURE.md. This is a functional preview, not
confirmation that booking, prices, suppliers or CRM delivery are commercially live.

Do not set GOOGLE_REVIEWS_CACHE_PATH to a parent-directory file on Render. Files
outside Root Directory are unavailable, and the local review cache is gitignored.
The packaged branch configuration contains only public business information.
The service URL above was checked to return JSON for both branches without a
redirect. The apex URL redirects to www, so use the exact www endpoint shown.
Discover revalidates the cached service response weekly; it does not refresh
SearchAPI per visitor. If the shared source is unavailable and no valid cache
exists, the current component keeps its graceful unavailable state.

No SEARCHAPI_API_KEY, Hotelbeds, Kommo or payment credentials are required for
this browsing and WhatsApp preview. English review translations are already
included in data/review-translations.json. Optional expert allowlists, promotions,
translation path overrides and live gateway settings remain optional and unchanged.

## Verification after manually creating the service

1. Confirm the Render build log uses the discover-mexico package, not deviaje-web.
2. Wait for Live, then open the assigned preview URL at /en and /es.
3. Verify /robots.txt, /sitemap.xml and /api/google-reviews; check both branches.
4. Open all three package pages in both languages and switch language on each.
5. Verify Mexico Packages reaches the three existing packages and Mexico Journeys
   still reaches the multi-city catalog. Confirm the logo stays in Discover.
6. After APP_ORIGIN matches the preview URL, test the existing planner validation
   and WhatsApp continuation. Do not treat a development receipt as a stored lead.
7. Review desktop, tablet and mobile. Domain cross-links intentionally target the
   future Discover hostname; they cannot work publicly until a separate authorized
   domain/DNS setup. Preview using direct onrender URLs meanwhile.

The current public domain discover.deviaje.mx did not resolve during preparation.
No production deployment of Discover is claimed. The existing Mexican site's SEO lacks a
canonical declaration and real robots/sitemap responses; this pre-existing issue
was identified but not expanded into a Mexican-site SEO rewrite.

## Preparation checks, 2026-11-07

- Both application builds passed; Discover TypeScript and 84 automated tests passed.
- Local browser QA passed 56 routes/linked routes and 21 viewport/locale/site cases.
- Package QA passed all six localized routes, nine package layouts, exact itinerary
  content, language switches, six category prefills, two consent/handoff submissions
  in development mode, and a simulated failure without a fake success state.
- Protected images, package content, forms and reviews matched their pre-task hashes.
- A source-only isolated copy installed with `npm ci --include=dev` (zero audit
  vulnerabilities reported) and built with production settings, without .env.local.
- The isolated reviews reader returned both branches from the public cached service,
  with neither parent config nor parent cache present. Weekly revalidation remained.
- The additional isolated `npm start` attempt was blocked by the execution tool;
  isolated HTTP startup is not claimed as tested. The normal local Next production
  preview did run and passed the browser QA above. Confirm the independent startup
  and the platform-provided PORT in the new Render service's first deployment.
- No lint script is configured. No Render service/configuration or DNS was changed.

## Sources

- https://render.com/docs/deploy-nextjs-app
- https://render.com/docs/monorepo-support
- https://render.com/docs/node-version
- https://render.com/docs/web-services
