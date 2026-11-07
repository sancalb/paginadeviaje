# Discover Mexico: server contracts and source audit

Scope: original `C:\Dev\scraper` inspected read-only on 2026-11-06. No providers,
application imports, scripts, migrations, tests or raw logs were executed there.
No `.env`, certificates, private keys, databases, customer exports or raw provider
responses were read. No applicable `AGENTS.md` was found in `C:\`, `C:\Dev`, either
project root or relevant source subdirectories, including hidden/ignored source.
Only new `discover-mexico/lib/server/*`, `app/api/*`, this document and the child
`.env.example` are owned by this change. UI, content and package files are untouched.

## Audit: verified in source

| Source in C:\Dev\scraper | Contract / consequence |
| --- | --- |
| `backend/app/main.py:98,268,363,414,444,464` | FastAPI; 24-hour HMAC-signed `deviaje_agent_session`, HttpOnly, SameSite=Lax; Secure depends on HTTPS/proxy header. Allowlisted email roles OWNER/ADMIN/AGENT. No service-to-service bearer auth for quoting. |
| `backend/app/main.py:669,699,1647` | Four-digit email code, 10-minute TTL, 5 attempts, process-local storage; optional legacy shared access code. Missing SMTP logs the email/code instead of refusing. No endpoint-wide login throttling found. |
| `backend/app/settings.py:104` | Session signing falls back to a static development secret. Production override not verified; do not expose or reuse the fallback. |
| `backend/app/main.py:2331,2414,2440` | Hotel autocomplete/search/property omit the agent guard and may call SearchAPI. CORS is wildcard without credential support. Do not make these a public proxy. |
| `backend/app/main.py:2459,2489,2513,2537,2561,2587` | Protected POST opportunities/search, flights/search, flights/returns, flights/fares, packages/build, quotes/whatsapp. The last formats text, not a WhatsApp or CRM send. |
| `backend/app/models.py:13,29,191,222` | Opportunity request uses outbound_start/end, nights, passengers. Package request uses outbound_date/return_date, passengers, optional adults/children_ages, selected_flight. Response packages/all_packages includes hotel, flight, costs, margin, score, provider traces. This is not the standalone camelCase contract. |
| `backend/app/services/package_builder.py:98`, `hbx_inventory.py:51` | `/packages/build` combines flight detail with cached HBX hotels. Hotel lookup does not receive passengers, adults, child ages or rooms and has no occupancy filter; cannot guarantee the quoted group's price. A client-selected flight is accepted without provider revalidation. |
| `backend/app/services/package_builder.py:138,164` | Empty-provider fallback generates demo flights for Dec 6-10, 2026 without a separate demo environment gate. The source is labeled demo, but must not become a sellable quote. |
| `backend/app/services/pricing.py:10`, `scoring.py:33` | Flight + hotel + extras arithmetic, no FX check. Backend score rewards budget, stars, rating, directness, cancellation and margin. Not the standalone scoring formula. |
| `services/package_search_engine.py:53,104,536` | Standalone request: origin/destination, rooms/adults/children, exact checkIn/checkOut or flexible dateFrom/dateTo/nightsMin/Max, market, hotelCodes. Exact: SearchAPI -> HBX Availability -> local content -> ECONOMY/RECOMMENDED/PREMIUM -> persisted snapshots. Flexible is a stub: always FLEXIBLE_INTERFACE_READY/BLOCKED_CREDENTIALS and no packages. Not exposed by FastAPI main. |
| `services/package_search_engine.py:449,549` | MIXED currency emits a warning but still sums/ranks amounts; per-person denominator is rate adults, not the full requested party. Dictionary parser omits explicit occupancies. Multiroom/child equivalence is not established. |
| `services/date_scanner.py:14,98,153,212,363` | Local SQLite cache scan; market, allotment, release and stay restrictions. No child-age request contract; missing cancellation terms are treated as refundable, amount penalties are not evaluated. Not live availability. |
| `services/promotion_engine.py:36,167`, `services/package_builder.py:24` | Cache promotions choose windows against median/mean with quality bonuses; flights optional/best-effort. Can build hotel-only results; mixed-currency arithmetic remains indicative, not a sale. |
| `services/package_scoring.py:12,81` | Standalone score: relative price, directness/duration, stars/board, refundability, cancellation, promotions, packaging, location. Default location reference is Las Vegas, not destination-specific Mexico. |
| `providers/hotelbeds/booking.py:36,104,270` | Api-key + SHA256(key + secret + epoch seconds), mandatory mTLS context. Config defaults to test and maps standard hosts to mTLS. POST /hotel-api/1.0/hotels, /checkrates (max 10 keys), /bookings; GET bookings/list/detail; PUT change; DELETE simulation/cancellation. No such booking route exposed in backend main. |
| `services/revalidation.py:41,77` | BOOKABLE skips CheckRate; RECHECK calls CheckRate, updates key; READY_TO_BOOK, PRICE_CHANGED, RECHECK_REQUIRED or NO_LONGER_AVAILABLE. No new Availability during recheck. Hotel recheck is not flight revalidation. |
| `providers/hotelbeds/content_cache.py:39,66,257` | Separate Content API/cache, key + signature; hotel enrichment and rate comments. Does not establish inventory freshness. |
| `providers/hotelbeds/cache/config.py:10`, `cache/client.py:40` | Dedicated Cache API interface: GET /files/full, /files/update, /files/confirm with version; Api-Key or X-Username/X-Password. BLOCKED_CREDENTIALS and historical 401 narrative are constants, not a current probe. |
| `backend/app/services/flight_calendar.py:51`, `flight_detail.py:29,156` | GET https://www.searchapi.io/api/v1/search, api_key query, engines google_flights_calendar/google_flights; flight tokens support return/fare selection. HTTP timeouts and local-data fallbacks; a response is not proof of current bookability. |

Also present: protected `/inventory/summary`, `/docs`, `/openapi.json`; public
`/health`, `/catalog`, `/catalog/date-bounds/{destination}` and pricing-calendar
views. Owner-only `/api/admin/flight-config/*`, HBX cache/matrix and run management
can mutate configuration or launch provider calls. None were invoked.

**Blocking gaps proved by code:** flexible stub; no safe backend service auth,
occupancy/FX/freshness/revalidation contract; demo fallback; no Kommo/amoCRM or
Discover Mexico integration found in backend/services/providers/scripts/tests/docs,
configuration source or relevant frontend source. Existing public price routes are
not a suitable bridge.

**Not verified:** running deployments, reverse proxy defenses, env overrides,
credential presence/validity, Cache entitlement or historical 401, mTLS chain,
provider connectivity/quota, live inventory/currency, certification, durable storage
and Kommo account/field IDs. Source constants and old documentation are not runtime
evidence. This audit does not claim those external systems are broken or ready.

## Public routes

All are Node runtime handlers with JSON errors `{error, requestId?}`. Error bodies
never echo inputs, credentials, upstream bodies, validation values or stack traces.
Mutating endpoints require JSON, reject compressed bodies, enforce Origin when
provided and refuse cross-site browser requests. No route imports the original
scraper or the original reviews module. There is no provider URL in visitor input.

| Route | Request | Response |
| --- | --- | --- |
| GET /api/google-reviews | No refresh or proxy parameters | `{updatedAt, branches, meta}`; 503 if original config/cache unavailable. |
| GET /api/experts | None | `{experts: [{id, displayName, languages}]}`. Empty without explicit permission. |
| POST /api/inquiries | Schema below + Idempotency-Key UUID | Development 200 contact-free handoff; live 202 durable queue receipt or 200 confirmed delivered receipt. |
| GET /api/promotions | None | `{promotions: [...]}`; only current published, approved, price-valid records. Empty without source. |
| POST /api/packages/search | `{origin,destination,start,end,occupancy:{adults,childrenAges,rooms},currency:'USD'}` | Valid requests deliberately return 503 PACKAGE_BACKEND_CONTRACT_UNSAFE; no upstream fetch. |

### Inquiry body (matches the planner)

```ts
{
  locale: 'en' | 'es',
  destinations: string[], // 1..12 approved slugs from lib/server/travel.ts
  origin: string,         // optional/empty allowed, max 120
  dates: { mode: 'flexible' | 'exact', start: string, end: string },
  adults: number,         // integer 1..50
  childrenAges: number[], // max 20, integer 0..17
  style: 'essential' | 'comfort' | 'premium', interests: string[],
  budget: 'discuss' | 'under-1000' | '1000-2000' | '2000-4000' | '4000+',
  name: string, country: string, email: string, phone: string,
  preferredLanguage: 'en' | 'es', comments: string,
  consent: true, website: '', startedAt: number // milliseconds since epoch
}
```

Exact dates must be real ISO dates, end > start; supplied start cannot be past
(UTC day). Flexible dates may be empty. At most 16,384 UTF-8 body bytes, even with
no Content-Length. Reject unknown fields, invalid ages, invalid email/phone,
consent != true, filled honeypot, form younger than 1.5s or older than 24h.
Validation is always server-side. `startedAt` is a bot heuristic, not identity.

Header `Idempotency-Key` is a UUID. Retry the identical body with the same key;
changed validated body gives 409. Validation/auth/transport errors use 400/403/
413/415/422/429/503. Rate limiting has a local 20/minute prefilter with capped maps
and a required live distributed 5/10 minutes admission limit in the gateway.
Only set TRUSTED_CLIENT_IP_HEADER when ingress overwrites it; otherwise all clients
share a conservative bucket. HMAC identities never retain the raw IP.

Development (default) **does not register or send a lead**, even in a production
build. It never fetches a provider or persists a lead body/contact:

```json
{"mode":"development","requestId":"UUID","whatsappUrl":"https://wa.me/BUSINESS_NUMBER?text=..."}
```

WHATSAPP_NUMBER must be a configured E.164 business number or the response is 503.
Context includes request UUID, preferred language, approved destination slugs,
dates, adults/child count and origin only when it matches three IATA-shaped ASCII
letters. All arbitrary free text, comments, name, email, phone and country are
excluded. The in-memory
24-hour idempotency map retains only a keyed digest and this contact-free response.
It does not promise idempotency across restarts or replicas. No raw logs are added.

### Live storage + Kommo adapter boundary

Live is not connected or tested against a real service in this checkout: the
required durable gateway does not exist here and must be implemented/deployed
independently before live can operate. There is no direct Kommo credential or
provider call in a public route. `inquiry-storage.ts` integrates with an external,
independently deployed durable gateway; `kommo.ts` builds its explicit Kommo command.
The gateway worker, not a request-local fire-and-forget task, owns CRM delivery.
Do not claim a direct Kommo REST API implementation or a deployed storage service.

INQUIRIES_MODE=live requires APP_ORIGIN, INQUIRIES_STORAGE_URL/TOKEN, a stable
RATE_LIMIT_HMAC_KEY of >=32 chars, and valid KOMMO_RULES_JSON with both languages.
URLs are operator-configured HTTPS (loopback HTTP permitted outside production),
without redirects, embedded auth or query strings. Provider hosts are rejected.
Gateway requests use Bearer INQUIRIES_STORAGE_TOKEN and no-store. No credentials
are returned or sent to a browser. Credentials for Kommo stay at the gateway.

Required gateway protocol, **not implemented/proven by this repository**:

1. GET `{INQUIRIES_STORAGE_URL}/capabilities`, <=8 KiB response, timeout 5s:

```json
{"protocol":"discover-mexico.inquiries.v1","durable":true,"atomicIdempotency":true,"distributedRateLimit":true,"transactionalOutbox":true,"kommo":"ready"}
```

2. POST `{INQUIRIES_STORAGE_URL}/inquiries`, timeout 10s, same Idempotency-Key.
   Envelope: protocol, requestId, idempotencyKey, HMAC fingerprint/clientKey,
   validated inquiry, integration command, rateLimit `{limit:5,windowSeconds:600}`,
   idempotencyTtlSeconds 86400. Gateway must atomically admit/rate-limit, persist
   consent plus server receipt timestamp, register the inquiry and its Kommo
   outbox job, and return an original immutable receipt on identical retries.
   Conflict ->409, distributed limit ->429, no durable commit ->5xx.
3. Valid receipt (<=8 KiB) echoes protocol, key and fingerprint, has original UUID
   requestId, durable:true, and status queued/delivered. Only this permits live
   success. A timeout is 503 with an unknown commit outcome: retry the same key.
4. Worker applies language-specific tags, responsibleUserId, pipelineId/statusId
   and follow-up task typeId/dueInMinutes from KOMMO_RULES_JSON. Static source and
   language tags are also added. Contact details never appear in task titles.
   ExternalId=requestId is the reconciliation correlation, not a claim that Kommo
   natively guarantees exactly-once creation.
5. Gateway must persist provider IDs and delivery checkpoints, retry with backoff,
   reconcile ambiguous outcomes before creating again, and dead-letter failures.
   It must not acknowledge delivered before both CRM registration and configured
   task succeed. Encrypt/restrict PII at rest, implement retention/deletion and
   redact all telemetry. Capability JSON is a required assertion, not a substitute
   for infrastructure acceptance tests.

Response `{mode:'live',requestId,status:'queued'}` is 202: registered durably, CRM
pending. `status:'delivered'` is 200 only after gateway-confirmed delivery. No local
fallback and no fake success if storage/integration is absent or returns a malformed
receipt. Real acceptance tests and Kommo field mapping remain deployment blockers.

## Reviews and experts

Read GOOGLE_REVIEWS_CACHE_PATH (default `../storage/google-reviews-cache.json`) and
GOOGLE_REVIEWS_CONFIG_PATH (default `../config/google-reviews-branches.json`) only.
Paths resolve from the child app working directory. Original config selects allowed
branch IDs and public fallback details. Do not import `../lib/google-reviews.mjs`:
it loads env and can refresh via SearchAPI. No cache writes or review refreshes here.

Optional GOOGLE_REVIEWS_SERVICE_URL is an operator-trusted cached endpoint; Next
fetch revalidates after 604800 seconds. Its service must honor a cached-only read
contract; do not point it at an endpoint that refreshes providers per request.
Service errors fall back to the local shared cache; stale snapshots are labeled
`meta.stale`, never refreshed from this app. Response cache revalidation is seven
days. Cache/config reads and service bodies are bounded. Unknown fields are stripped.
Public reviews retain public author/text/rating/images/links, not raw payloads.

EXPERTS_ALLOWLIST_JSON defaults to []. Each record must explicitly include
`{id,displayName,active,bilingual}`. Only active===true AND bilingual===true are
published. The original advisor matching config is NOT publication authorization;
unapproved expert matches and all ambiguous matches are removed from review data.
Malformed allowlists fail closed. Expert eligibility is not inferred from reviews.

## Pricing and promotions

`pricing.ts` uses USD integer cents, explicit group-total components and exact
matching adults/child ages/rooms. Only two-decimal source currencies are accepted
(USD/MXN/CAD/EUR/GBP), never implicitly added. FX snapshot requires source/asOf/
expiresAt and explicit USD per source unit. Every component must include supplier
taxes, expiry and recent revalidation (default 15 minutes, maximum one hour).

Policy: converted component costs + mandatory fees -> divide by (1-marginRate)
to apply a gross margin (not markup) -> add taxRate on the resulting subtotal.
Conservative rounding is up to cents at each step. Supplier tax inclusion and
merchant tax rate must be approved by the operator; no guessed tax/FX defaults.
Per-person display divides by all travelers, but actual occupancy is always shown.
Expiry is the minimum of quote, FX, components and revalidation lifetime. Prices
are indicative and require revalidation before a booking; no booking is implemented.

State machine: draft -> review -> approved -> published -> expired. Review may
return to draft; approved may return to review (clears approval); any active state
may expire; expired is terminal. Approval/publication require an authorized actor
in the internal function, current pricing and a future expiry. There is no public
write endpoint. An external editor must authenticate before invoking transitions
and invalidate approval on ANY pricing/content change; files are a trusted source.

GET /api/promotions reads optional PROMOTIONS_PATH, returns only published records
with approval before publication, valid prices and unexpired validity. Public DTOs
omit approver identity, FX internals and supplier costs/margin. Empty by default;
invalid individual records are excluded, invalid sources return 503. No storage or
source content is generated here, and the route is no-store/dynamic to enforce expiry.

## Verification

Run from discover-mexico, using the already installed dependencies:

```powershell
node --experimental-strip-types --import ./lib/server/tests/register.mjs --test ./lib/server/tests/server.test.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

Tests use synthetic fixtures and injected transports, never original cache/review
records or real storage/Kommo/SearchAPI/Hotelbeds. The test-only Node resolution
hook permits extensionless TS imports without editing tsconfig/package files.
Do not run original scraper tests: some are integration/provider tests or write
artifacts. Full app checks may reflect unrelated concurrently authored UI/content.
