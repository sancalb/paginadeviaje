# Google review translations: implementation and publication review

Reviewed 2026-11-07. This is an engineering assessment, not a legal opinion.

## Sources reviewed

- [Google Places policies](https://developers.google.com/maps/documentation/places/web-service/policies): describes attribution, ordering/filter disclosure, translation notices and access to the original. It also restricts caching, redistribution and derived content except as expressly allowed. A seven-day cache is NOT a general permission to store reviews.
- [Google Maps Platform terms](https://cloud.google.com/maps-platform/terms): the restrictions referenced above apply to that platform contract.
- [SearchAPI terms](https://www.searchapi.io/legal/terms), updated April 11, 2026: governs the intermediary service. The reviewed terms do not establish a specific license to indefinitely archive, translate or republish third-party Google reviews/photos.

The application obtains an existing SearchAPI-derived snapshot, NOT the Places API. Places documentation is useful guidance but must not be misrepresented as the contract or license for this intermediary collection. Confirm applicable Google terms, reviewer/photo rights and SearchAPI's permitted downstream usage with the provider and legal counsel before production publication. No representation of Google verification or endorsement is made.

## What the application does

- Leaves the Mexican site's original review cache and SearchAPI integration unchanged; does not add a provider, key or call per visitor.
- Keeps the Spanish text unchanged. Translations are a separate, replaceable English sidecar keyed by the review identity and a SHA-256 fingerprint of the complete original. A changed original cannot accidentally receive an old translation.
- Attaches an English translation only to a matching current snapshot record, never an orphan translation. Removing a review from the source removes it from the UI. Reconcile/delete orphan sidecar entries when importing a new snapshot; do not use this file as a permanent independent review archive.
- Does not download/rehost reviewer photographs. Existing source links remain attributed to Google and the author, with access to the individual review.
- Labels English translations "Translated from Spanish", identifies deviaje.mx as translator inside the dialog, and makes the full unchanged Spanish original available in that dialog. These translations are not attributed to Google Translate.
- Discloses the selection from both office profiles and prioritization of mentions of Mexico. The score/count come from the cached profile data, not the selected sample.
- Keeps the actual source snapshot timestamp and stale status. Translating text does not refresh Google data or extend its freshness.
- Missing/invalid/mismatched translations fall back to the original, never invented or shortened substitute reviews. Card excerpts are visual previews; dialogs contain the full source/translation.

## Production checklist

Confirm downstream storage/translation/photo rights and retention/deletion process with SearchAPI; obtain permission or an appropriate licensed collection method if necessary. Establish a removal channel, reconcile the translation sidecar against refreshed snapshots, and honor source removals. Existing weekly refresh configuration is technical behavior, not a conclusion about licensing. No deployment is performed as part of this work.
