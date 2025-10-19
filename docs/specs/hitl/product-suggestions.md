Status: Planned only — do NOT seed or ship yet

# Feature B: New Product Suggestions + Content/SEO Improvements

This captures the Day‑1 plan for the Top‑5 suggestions queue (4 niche + 1 wildcard) and the content/SEO improvement loop. Planning only; no code or external polling until all features are reviewed together.

## Allowlist (Competitor Signals)

- Generic: Summit Racing, Jegs Performance, Speedway Motors
- Niche (AN products): Vibrant Performance, Quantum Fuel Systems, Redhorse Performance, Evil Energy, Tanks Inc, Earl’s Performance Plumbing, Fragola Performance Systems, RaceFlux (Improved Racing), XRP
- Diesel with AN products: Fleece Performance Engineering, BD Diesel Performance

Note: Domains to be filled during implementation. Monitoring restricted to this allowlist.

## Inputs

- Customer requests (Chatwoot tags/intents)
- GA4 trends (queries, landing pages, site search, conversions)
- Competitor signals (availability/pricing/features on allowlist)
- Catalog gaps (bundles/components implying missing SKUs)

## Scoring (initial outline)

- Demand × Margin potential × Competition gap × SEO opportunity
- Always maintain 4 niche + 1 wildcard

## Review (HITL)

- CEO queue: evidence, demand math, margin estimate
- Actions: Approve, Refine, Reject (with reason)

## On Approve

- Generate product brief (title, variants/options, target price, keywords, collection)
- Content agent creates/updates Shopify product and metadata
- Social agent drafts launch posts

## Feedback Loop

- Track acceptance rate, time‑to‑first‑sale, 30/60/90‑day performance
- Event‑driven refill: Approve/Reject → learn (update weights/notes) → refill exactly one slot to maintain 4 niche + 1 wildcard. No periodic polling Day‑1.

## Cadence (Event‑Driven)

- Trigger: CEO decision (Approve or Reject) on any suggestion.
- Sequence: (1) Persist decision + reasons → (2) Agent learning update → (3) Fetch signals on‑demand and generate one new suggestion to restore Top‑5 composition.
- Composition (Strict 4 + 1): Always maintain exactly 4 niche and 1 wildcard.
  - If a niche candidate isn’t immediately available, perform a “niche backfill sweep” (on‑demand signal fetch + relaxed thresholds) to source the best available niche candidate now rather than adding a second wildcard.
  - Only if signals are completely unavailable, show a temporary “pending niche slot” badge and keep 4 items visible; the system immediately re‑tries backfill as new signals arrive or on manual refresh.

## Admission Rules

- Best available candidate: no minimum signal count; accept the highest scoring candidate at refill time.
- Tie‑breakers: score → freshness (newer signals win) → niche preference over wildcard when available.

## Backfill & Thresholds

- Niche Backfill Sweep: when a niche slot needs refilling, temporarily relax thresholds to admit lower‑confidence niche candidates (still best‑available) so the queue remains 4+1.
- Guardrails: limit to signals ≤ 30 days old; still run basic sanity checks (duplicate/near‑duplicate suppression, availability present, non‑zero price).

## Learning Rules

- Feedback‑driven: Approve increases weights for similar candidates; Reject decreases; Refine redistributes weights per edited fields (e.g., price band, feature set).
- Evidence memory: store decision reasons to guide future scoring; show short “why this was suggested” notes.
- Event sequence: decision → update weights → refill exactly one slot.

## Duplicate Detection & Catalog Match

- Goal: Avoid recommending products we already sell under different names/descriptions; feed insights back to improve SEO/content.
- Signals (combined score):
  - Exact SKU match (Shopify variant SKU)
  - Vendor SKU match (from vendor‑product map)
  - UPC/EAN/MPN match (when present)
  - Title fuzzy similarity + key attribute alignment (size/color/material/thread)
  - Competitor mapping hints (same manufacturer P/N across domains)
- Card UX: Show “Possible match” badge with the best existing product and a confidence score; link to compare.
- HITL action: “Mark as Duplicate of…” opens searchable existing catalog picker; record reasons.
- Outcome:
  - Prevent re‑suggesting that item (tombstone the candidate and store a synonym mapping)
  - Trigger content tasks to canonicalize titles, tags, and keywords and improve internal linking
  - Optionally merge or align variants if appropriate (planning only)

## SEO/Content Feedback from Duplicates

- Create/refresh a synonyms/aliases dictionary from duplicate decisions (brand names, part numbers, common misspellings).
- Canonicalization tasks:
  - Normalize titles (brand + part + key attributes), unify tags, and update meta/structured data.
  - Add internal links from near‑duplicates to the canonical page, or propose redirects if warranted.
- Learning impact: penalize future suggestions matching known synonyms; boost canonical items in cross‑sell/collections.

## Implementation Constraints

- MCP‑first for Shopify and GA4
- Respect allowlist; no scraping beyond
- In‑app evidence and approvals; artifacts redacted for PII
