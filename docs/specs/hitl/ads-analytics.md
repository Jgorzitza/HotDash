Status: Planned only — do NOT seed or ship yet

# Ads + Analytics (Paid + Organic)

Day‑1 scope and data model for paid ads (Meta, Google Ads/Search & Shopping, TikTok, Pinterest) and organic SEO/content analytics (GSC + Bing), with attribution, dashboards, and learning loops feeding Social and Product Suggestions. No code/migrations yet.

## 1) Scope & KPIs (locked)

- Channels (paid): Meta Ads, Google Ads (Search/Shopping), TikTok Ads, Pinterest Ads.
- Organic: SEO + On‑site Content (landing pages, product pages, collections, blogs).
- KPIs (core): Revenue (attributed GA4), Spend, ROAS, CAC/CPA, CTR, CVR, AOV.
- KPIs (secondary): Impressions, Clicks, Sessions (UTM), New vs Returning, Refund rate.
- Attribution default: GA4 last non‑direct click, 7‑day window. Dashboard window: 7d (quick 28d toggle). Platform‑reported conversions shown as reference.

## 2) Organic SEO Analytics (locked)

- Data sources:
  - GA4 Data API: sessions, conversions, revenue for medium=organic; breakdown by page/source.
  - Google Search Console API: queries, impressions, clicks, CTR, position by page/query.
  - Bing Webmaster Tools API: parallel to GSC for queries and page performance (merge for coverage).
  - Shopify (optional join): orders, AOV for organic-attributed orders if needed.
- Outputs:
  - Content Upgrade pipeline: high‑impact tasks (title/meta, FAQs, internal links, schema, media, vitals follow‑ups).
  - Product Suggestions feed: high‑intent queries with weak/no product coverage; site‑search nulls.
  - CEO SEO tile: Organic Revenue, Sessions, CVR, GSC CTR/Impressions, Non‑brand share, Top LPs, Decay alerts.

## 3) Brand Filters (classification)

Why: Brand queries inflate CTR/CVR; separating non‑brand shows net‑new demand.

- Brand lexicon (configurable):
  - Primary: "hotrodan", "hot rod an", "hotrodan.com"
  - Short/variants: "hot rod an fittings" and common misspellings; vendor‑brand combos as approved.
- Shopify vendor mapping:
  - Use Product.vendor to classify page‑level brand. First‑party vendors list includes "Hot Rod AN"; others carry their own brand name.
  - Join logic: GA4 landing page → Shopify resource (product/collection/blog) via handle/slug → vendor.
  - Reporting dims: query_brand (Y/N), page_vendor (string), first_party (Y if vendor in first‑party list).
- Rules:
  - Query brand if matches any brand pattern (case‑insensitive; whole word or anchored variants).
  - Page brand if title or path contains brand patterns prominently (home/brand hub exceptions handled).
  - Everything else → non‑brand.
- Maintenance:
  - Seed from this list; append from GSC top queries + site search terms marked as brand.
  - Store in `docs/specs/hitl/brand-filters.json` (see config) with synonyms; HITL approvals required for changes.
- Reporting:
  - Split KPIs by brand vs non‑brand queries AND by page vendor/first‑party vs other.
  - Surface wins in non‑brand and first‑party; do not hide brand lifts.

## 3b) Shopify Marketing Linkage (mandatory)

- Every paid campaign and major content launch is linked to a Shopify Marketing Activity.
- Create/Upsert external activities via Admin GraphQL (marketingActivityUpsertExternal) with:
  - sourceAndMedium (e.g., "google:shopping", "meta:ads", "content:seo"),
  - utm parameters used,
  - remoteId (platform campaign/adgroup/ad id or content job id),
  - budget/spend if available.
- Read activities for dashboards via marketingActivity connections. Scopes: write_marketing_events, read_marketing_events.

## 4) Site Search (on‑site) — capture & use

- Capture GA4 event (view_search_results) with params: `search_term`, `results_count`, `no_results` (bool), `page_path`.
- If not already implemented, add event mapping in app; optional DB table for top terms and null results.
- Use:
  - Content Upgrades: identify pages needing clearer linking/education.
  - Product Suggestions: high‑frequency terms with weak/no catalog mapping.
  - SEO: match high CTR, low CVR keywords to site‑search intent for copy fixes.

## 5) Ads Data Ingestion & Mapping (overview)

### 5) Ads Data Ingestion & Mapping (detailed)

Sources (Day‑1) and core fields

- Meta Ads (Facebook/Instagram):
  - Keys: account_id, campaign_id, adset_id, ad_id, creative_id, date
  - Names: campaign_name, adset_name, ad_name
  - Metrics: spend, impressions, clicks, cpc, ctr, cpm
  - Conversions (platform‑reported): conv_purchases, conv_value (stored as reference only)
  - UTM: ensure ad or ad‑set URL contains utm_source=facebook|instagram, utm_medium=paid_social, utm_campaign={campaign_slug}, utm_content={ad_id}
- Google Ads / Shopping:
  - Keys: customer_id, campaign_id, ad_group_id, ad_id (or listing_group for Shopping), date
  - Names: campaign_name, ad_group_name, ad_name
  - Metrics: spend, impressions, clicks, cpc, ctr
  - Conversions (platform‑reported): conv, conv_value (reference only)
  - UTM: final_url_suffix/valueTrack → utm_source=google, utm_medium=paid_search|shopping, utm_campaign={campaign_slug}, utm_content={ad_id}
- TikTok Ads:
  - Keys: advertiser_id, campaign_id, adgroup_id, ad_id, date
  - Metrics: spend, impressions, clicks, cpc, ctr
  - Conversions (platform): stored as reference only
  - UTM: utm_source=tiktok, utm_medium=paid_social
- Pinterest Ads:
  - Keys: advertiser_id, campaign_id, ad_group_id, ad_id, date
  - Metrics: spend, impressions, clicks, cpc, ctr
  - Conversions (platform): reference only
  - UTM: utm_source=pinterest, utm_medium=paid_social

Normalization (common schema)

- Grain: daily per ad (roll‑ups to adset/adgroup, campaign, platform)
- Dimensions: date, platform, account_id, campaign_id/\_name, adset_id/\_name (or ad_group), ad_id/\_name, creative_id?, country?
- Metrics: spend, impressions, clicks, ctr, cpc, cpm
- Platform reference metrics (stored separate columns, not used in ROAS/CAC): platform_conversions, platform_conv_value
- UTM mapping (normalized): utm_source, utm_medium, utm_campaign, utm_content

UTM join to GA4

- Join keys: (utm_source, utm_medium, utm_campaign) and date window
- Compute: Sessions, CVR (sessions→purchase), Revenue (GA4 ecommerce revenue), AOV
- ROAS = GA4 Revenue ÷ spend; CAC/CPA = spend ÷ GA4 purchases (or conversions proxy)
- Handling drift: if multiple campaigns share identical UTMs, include utm_content (ad_id) in join; else distribute proportionally by clicks

Timezones, currency, and windows

- Timezone: normalize to America/Edmonton for dashboards; preserve platform tz raw
- Currency: normalize spend/revenue to shop default currency (planning; use daily FX rates)
- Re‑pull window: always re‑ingest last 3 days to absorb late conversions; first run backfills 35 days

Idempotency, rate limits, and retries

- Ingestion idempotency key: `${platform}:${account_id}:${date}:${campaign_id}:${ad_id}`
- Respect platform API rate limits; backoff and resume; partial checkpointing per date
- Token storage: encrypted at rest; rotate periodically; no tokens in logs

Marketing linkage (required)

- On first sight of a campaign, upsert Shopify Marketing Activity (marketingActivityUpsertExternal) with sourceAndMedium, UTM, remoteId (platform campaign id); update budget/spend as available

Data quality & badges

- Incomplete attribution badge if GA4 join rate < threshold (e.g., 80%) for a campaign/day
- Missing UTMs badge if we detect non‑UTM final URLs on ad creatives
- Sampling badge if GA4 sampling detected in the query; allow quick “re‑query narrower date range” action (planning)

## 6) Dashboards & Tiles

- Ads Tile (7d): Spend, Revenue, ROAS, CAC/CPA, CTR, CVR, AOV; sparkline (Revenue or ROAS); Organic vs Paid compare block.
- SEO Tile (7d/28d): Organic Revenue, Sessions, CVR, GSC CTR/Impressions, Non‑brand share, Top LPs; decay and quick actions (View Upgrades, Approve Suggestions).

### 6a) CEO Ads Tile (7d default, 28d toggle)

- Metrics: Spend, Revenue (GA4 last non‑direct), ROAS, CAC/CPA, CTR, CVR, AOV.
- Slices: platform chips (Meta, Google, TikTok, Pinterest) with per‑platform ROAS badges.
- Badges:
  - Incomplete attribution if GA4 join rate < 80% (campaign‑weighted).
  - Missing UTMs detected on creatives/final URLs.
  - Overspend vs budget (when marketing activity budget present).
- Quick actions:
  - Open Campaigns (filtered to problem badge)
  - Fix UTMs (open checklist)
  - Link Activity (open Shopify Marketing activity)
  - Export CSV
- Notes: ROAS/CAC use GA4 revenue/conversions; platform conversions shown for context but not used in KPIs.

### 6b) CEO SEO Tile (7d/28d)

- Metrics: Organic Revenue (GA4), Sessions, CVR, GSC CTR & Impressions, Non‑brand share.
- Badges: Content decay (≥20% 60–90d drop), Indexability (if enabled), Core Web Vitals (if enabled).
- Quick actions: View Upgrades, Approve Suggestions, Fix Decay.

### 6c) Cross‑Channel Compare

- Blocks: Revenue by channel (Paid Social, Paid Search/Shopping, Organic), Sessions by channel, CVR by channel.
- Trendlines: Revenue and ROAS time series (overlay spend as secondary axis).

### 6d) Drilldowns

- Campaigns table:
  - Columns: Platform, Campaign, Spend, Sessions (GA4 UTM), Revenue (GA4), ROAS, CAC/CPA, CTR, CVR, Join Rate, Budget (if present), Activity link.
  - Filters: Date (7/14/28/custom), Platform, Country, Brand/Non‑brand, First‑party vendor toggle.
- Ad set / Ad group table:
  - Columns: Platform, Campaign, Ad set/group, Spend, Revenue, ROAS, CTR, CVR, Sessions, Join Rate.
- Ads / Creatives table:
  - Columns: Platform, Creative thumb, Ad name, Spend, Revenue, ROAS, CTR, CVR.
- Shopping & Query views (when available): Product group/product or query term performance.

### 6e) Filters & Toggles

- Date presets: 7d (default), 14d, 28d, custom.
- Attribution toggle: GA4 (primary) vs show platform conversions (secondary column only).
- Brand filters: Query Brand vs Non‑brand; Page Vendor First‑party vs Other (from Shopify vendor).
- Country/Region selector.

### 6f) Data SLAs & Access

- Ingestion window: daily at 04:00 America/Edmonton; re‑ingest trailing 3d; first run backfills 35d.
- Sampling guard: badge if GA4 sampling detected; allow narrow re‑query.
- Access: CEO and Manager roles see tiles & drilldowns.

## 7) Learning Loops

- Content: Upgrades approved → uplift measured (7/28d) → coach notes → future patterns (title/meta formats, FAQs, linking, media).
- Product Suggestions (Feature B): SEO + site search signals feed Top‑5; accept/reject tunes weights.
- Ads: Creative/copy/time‑of‑day learnings feed Social and Ads briefs; poor ROAS prompts offers/copy tests.

## 8) Implementation Constraints

- MCP‑first for all APIs (GA4, GSC, Bing, Ads platforms, Shopify Admin Marketing/Discounts).
- PII‑safe storage; redact tokens; evidence artifacts with hashes only at publish time.

## 9) Open Items

- Brand lexicon initial list (see config) — add/modify terms.
- GSC URL Inspection API for indexability checks (optional), Core Web Vitals (CrUX) integration for page health.
- Google Business Profile insights for local (optional).
- Backlinks (optional; third‑party provider or Search Console links report for coarse view).
