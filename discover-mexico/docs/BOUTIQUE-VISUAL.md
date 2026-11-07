# Discover Mexico: boutique editorial refinement

## Scope

Visual, editorial and navigation work only, within `discover-mexico`. No changes to the Mexican site's source, APIs, SearchAPI/review normalizer/cache, CRM, Kommo, payment systems, WhatsApp configuration, Render, DNS or service contracts. No new dependencies. Existing forms and contact destinations are retained. No deployment or push performed.

## What changed

1. Cinematic home hero: original licensed Mexico photographs, decoded two-layer crossfade, eight destinations, manual previous/next and scene selection, pause/resume, destination caption/link, reduced-motion support. Full-bleed media replaces the large foreground character and decorative compass/routes. Original brand typography, orange, navy, buttons and logo retained.
2. Reviews: existing carousel, original photographs, scores and English/original translation workflow unchanged. More compact surrounding spacing; no testimonials rewritten or reassigned.
3. Local expertise: the six existing benefits become a lighter unframed editorial composition with restrained icons and a real Tequila photograph. Availability/language statements remain conditional, not guarantees.
4. Eight destination guides: navigable sections, galleries with full-size accessible viewer, experiences, gastronomy/culture, practical advice, FAQs, contextual trip links and related journeys. Existing factual content retained. A related single journey has a balanced layout rather than an empty three-column grid.
5. Featured Mexico Experiences: three bilingual editorial proposals for Cancun, Guadalajara/Tequila and Mexico City. Index and individual landings under `/en/experiences` and `/es/experiencias`; linked in navigation, footer, sitemap and language alternates. Real place photographs/galleries, suggested moments and route context; no invented hotel, price, inclusion or scheduled departure.
6. Mexico Journeys: existing three routes and suggested days (8/7/7) preserved, with compact route thumbnails, actual stop labels, original map, location-correct day galleries and itinerary storytelling. Photo locations follow the existing day outline, not simply the order of stops.
7. The Mexico You Didn't Know: asymmetric photographic stories about Oaxaca's food, Tequila's agave landscape and Akumal's coast, linked to destination guides.
8. How Your Journey Works: four short visual steps, from conversation through proposal review to agreeing how to contact the advisor during travel. No support-hours or availability promises introduced.
9. Team: authentic office photographs show the people in Monterrey/Guadalajara; both existing office/map/contact cards retained once. No individual identities, portraits, language skills or testimonial associations invented.
10. Characters: six companions retained at a smaller scale, Frida interaction preserved, Minerva discreet, final companions reduced. Separate from real staff.
11. Rhythm: removed duplicate category cards, the home booking-style search block, repeated general escape cards and redundant adjacent CTAs. Destination discovery, filters and the original planning form still function through existing routes. The home no longer looks like a hotel-booking engine.

## Components

Updated `hero.tsx`, `pages.tsx`, `why-travel.tsx`, `editorial.tsx`, `experts.tsx`, `characters.tsx`, and navigation links in `shell.tsx`. Added `photo-gallery.tsx`, `mexico-stories.tsx`, `featured-experiences.tsx`, `data/mexico-experiences.ts`, `data/travel-editorial.ts`, and `app/boutique.css`. Existing `brand.css` remains unchanged; only Discover loads the editorial overrides. Experience routes and metadata reuse the existing dynamic route resolver, not duplicated HTML.

## Photography and references

17 additional real photographs: two per destination plus an Oaxaca market cooking photograph. Optimized WebP, maximum width 1600px; original source copies retained in ignored local storage. `data/gallery.json` records location, bilingual alt/caption, author, source and license. All have corresponding complete entries/hashes in `data/image-credits.json`; public photo credits and gallery license/source links remain available. Existing eight photos and supplied office/character assets are retained. Travel/editorial photos are not presented as client or review photographs.

Tourism references consulted for editorial context, without copying tour inclusions or prices:

- [Oaxaca destinations and markets, Visit Mexico](https://visitmexico.com/es/destinos/15/20)
- [Mexico City official neighborhood guides](https://www.mexicocity.cdmx.gob.mx/e/guias-completas-de-rutas-de-la-ciudad-de-mexico/)
- [Tequila landscape, Visit Mexico](https://visitmexico.com/es/recomendacion/destino/37/2159/estequilaentequila)
- [Akumal, Visit Mexico](https://visitmexico.com/es/actividad/55/nado-con-tortugas-akumal-quintana-roo)

No wildlife encounter, excursion, admission, hotel, activity availability or operator affiliation is promised by showing a destination.

## Verification

- Production build and TypeScript successful.
- 73 automated tests pass, including bilingual experience data/deep links, photo file/hash/license checks and itinerary location mapping.
- Existing QA: 40 bilingual routes, 20 page/viewport combinations, filters, navigation and original form behavior; zero browser exceptions.
- Boutique QA: 24 destination/experience routes; gallery opening/navigation/Escape/focus restoration for every destination in both languages; desktop/tablet/mobile layouts and all 16 localized destination views at 375px; additional short-screen hero tests; scene navigation, sitemap/404. No document overflow or browser exceptions.
- Existing review QA: ten cards, translations/original dialog, unchanged original source fields, no desktop card overlap at 375/430/768/1024/1440.
- Brand interaction QA: Frida hover/pointer transfer/Escape/mobile, review autoplay/pause, hero crossfade and existing map links preserved.
- Before/after home measurements at viewport height 1000: desktop 9336px to 8475px; mobile 14253px to 11645px. More editorial content with less total page height, not a claim about every device.

Reproducible screenshots and reports: ignored `storage/qa/boutique/`, with full home, hero, local-expertise, experience, stories, team, destination and journey captures at 375/768/1440px. `desktop-mobile.png` contains both home viewports. Local preview: http://localhost:4191/en and http://localhost:4191/es.
