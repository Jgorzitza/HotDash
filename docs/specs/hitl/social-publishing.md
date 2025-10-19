Status: Planned only — do NOT seed or ship yet

# Social Publishing (Runtime Product)

Goal: Plan the Day‑1 Social Publishing system to announce new products and run simple campaigns with CEO‑only approvals and a learning loop. This is product HITL, not dev governance. No code/migrations until all features are aligned.

## Scope (Day‑1)

- Triggers: New product approved (Feature B acceptance) and manual campaigns.
- Platforms (via Publer): Facebook, Instagram, Pinterest, TikTok, Google Business Profile, YouTube (full), YouTube Shorts.
- Variants: Create tailored post variants per platform (copy length, hashtags, mentions, aspect ratios, link style).
- Approvals: CEO‑only — Approve, Approve with Edit (inline), Schedule, Request Changes, Reject.
- Compliance: PII, profanity, claims/policy checks; warnings block if “hard block”.
- Scheduling: Local timezone (America/Edmonton). Prefer business‑hours windows; allow overrides.
- Analytics: Basic post metrics ingestion and UTM click tracking.

## Flow

1. Draft: Content agent generates per‑platform variants with assets, hashtags, mentions, and product links with UTM.
2. Validate: Preflight warnings/errors for claims/compliance, link safety, missing assets, bad aspect ratios.
3. Submit: Move to `pending_review`; appears under Approvals → Social Publishing.
4. Review: CEO can approve (now/later), approve with edits, schedule, request changes, or reject. Reason codes required on edit.
5. Publish: At scheduled time or immediately, post via platform connectors; capture platform post IDs.
6. Audit: Persist content, assets, platform response, timestamps, and link; set `ai-customer.human_review = true`.
7. Learn: Aggregate performance and generate coach notes for future drafts.

## Data Model (planned, do not migrate yet)

- `social_posts` (header): id, status (draft,pending_review,approved,scheduled,published,failed,rejected,changes_requested), trigger (product_launch|manual), product_id?, collection_id?, scheduled_at, timezone, created_by, approver_id, created_at, updated_at.
- `social_post_variants`: id, post_id, platform, content_text, hashtags[], mentions[], link_url, utm_json, assets_json, aspect_ratio, scheduled_at?, platform_post_id?, platform_response_json?, error_json?, created_at.
- `social_assets`: id, post_id, kind (image|video), src, alt_text?, width?, height?, duration_s?, checksum?, created_at.
- `social_results`: id, post_id, platform, impressions, clicks, ctr, likes, comments, shares, saves, revenue_attributed?, collected_at.
- Reuse `audit_events` for lifecycle events.

## Approvals & Reason Codes (planned)

- Actions: Approve, Approve with Edit (inline), Schedule, Request Changes, Reject.
- Reason codes (seed proposal; hold for CEO final): Tone/Brand, Compliance/Claims, Asset/Media, Link/UTM, Timing/Schedule, Clarity/Conciseness, Targeting.
- Learning: store diffs and reason codes; generate coach notes; require agent acknowledgment.

## Scheduling

- Timezone: America/Edmonton (shared).
- Windows: prefer business hours; allow outside when explicitly scheduled.
- Conflict handling: de‑duplicate overlapping variants per platform; back‑off and retry on rate limits.

## UTM & Links

- Builder: `utm_source={platform}&utm_medium=social&utm_campaign={campaign_slug}&utm_content={variant_id}`.
- Domain: https://hotrodan.com with canonical product URL; optional shortener.
- Validation: 200 OK check on final URL; block malformed links.

## Integrations (planned)

- Connector: Publer API (single aggregator) for scheduling/publishing across enabled platforms. MCP‑first for API references; store Publer credentials securely.
- Secrets: Publer token/keys encrypted at rest; rotate.
- Publish driver: send our per‑platform variants to Publer; capture Publer job/post IDs and per‑platform post IDs; idempotent by (post_id, platform).

### Publer + Google Drive — Detailed Plan

Prereqs

- Publer is linked to the shared Google Drive. Team keeps campaign assets in that Drive.
- Our app stores lightweight pointers only (Drive file IDs and/or Publer asset IDs), never raw tokens.

Folder convention (recommended)

- `campaign/YYYY-MM-DD/{platform}/product-slug/` with image/video assets and a `notes.md` (optional).
- Filenames include short slug + size hint (e.g., `bundle-launch-1080x1350.jpg`, `kit-reel-1080x1920.mp4`).

Agent workflow

1. Composer selects campaign and product. The app lists Drive folders via a curated index (or manual paste of Drive file links/IDs).
2. Pick assets per platform variant; add alt text; validate aspect ratio and size.
3. Compose copy + hashtags + mentions; auto‑generate UTM link from product URL.
4. Submit for CEO approval.

On Approve/Schedule → Publish via Publer

- For each platform variant:
  - Build Publer payload with content text, link (with UTM), schedule time, and attachments.
  - Attachments source hierarchy:
    1. Publer Drive connector ID (preferred if available)
    2. Drive file ID (let Publer resolve via connector)
    3. Fallback signed URL (generated by our service account) for Publer to ingest
  - Store returned Publer job/post IDs and platform post IDs in `social_post_variants`.

Validation and constraints

- Image: min 1080 width; ≤ 8 MB; correct aspect ratio per platform.
- Video: 1080×1920 (TikTok/Shorts), ≤ 60s for Shorts/TT Day‑1; check codec/container per platform.
- Alt text required for static images (soft‑warn for video).
- Link validator fetches final URL (200 OK) and blocks malformed links.

Idempotency and retries

- Idempotency key: `${post_id}:${platform}`; if Publer reports duplicate, mark variant as published.
- Retry policy: up to 3 with exponential backoff (start 500ms) for transient errors; never re‑create on 4xx validation errors.

Errors and fallbacks

- Drive permission/404: suggest alternate asset or switch to fallback signed URL path.
- Platform rejections (length, media type): surface exact error; allow inline fix; re‑submit.
- Publer rate limits: back off and reschedule within the same day; alert if repeated failures.

Analytics handoff

- Store Publer IDs and per‑platform post IDs to poll metrics later; map to Shopify Marketing Activity `remoteId`.
- Record UTM used per variant to attribute GA4 traffic; discount code (if any) stored on variant.

### Shopify Marketing + Discounts (MCP‑verified, required)

- Marketing tracking (required):
  - Create or upsert an external Marketing Activity on publish using Admin GraphQL (scopes: write_marketing_events): `marketingActivityCreateExternal` / `marketingActivityUpsertExternal`.
  - Include `sourceAndMedium` (e.g., "publer:instagram"), `utm` params, and `remoteId` (Publer job/post id).
  - Read activities via `marketingActivity`/`MarketingActivityConnection` (scope: read_marketing_events).
- Discount codes (optional per post or campaign):
  - Generate codes via `discountCodeBasicCreate` (amount off) or `discountCodeBxgyCreate` (buy X get Y) (scope: write_discounts).
  - Insert code string in post copy and UTM content; store DiscountCodeNode id on the variant.
  - Manage lifecycle with activate/deactivate/update mutations.

#### Default Discount Policy

- Agents propose creative offers within guardrails:
  - Max 15% by default; up to 20% only when explicitly directed.
  - Default duration: 7 days unless otherwise directed.
  - Code format suggestion: `{SLUG}{YYYYMMDD}`; may be edited for branding.
- Combination rules: respect store discount combination settings; avoid stacking with conflicting autos.

## Compliance & Preflight

- Checks: PII, profanity, legal claims (e.g., performance guarantees), restricted terms.
- Media: aspect ratio per platform; resolution minimums; alt text presence.
- Blocking: hard‑block on policy violations; soft‑warn for stylistic issues.

## Learning & Metrics

- Capture: impressions, clicks, CTR, engagement (likes/comments/shares/saves), GA4 UTM traffic, discount redemption rate, and attributed revenue (if available), by platform.
- Coach notes: summarize what worked (hook, assets, hashtags, time); feed future drafts.
- Calendar: maintain at least N scheduled items (configurable) to keep pipeline full.
- Idea pipeline: top‑performing topics/times/creatives feed new content suggestions; discounted posts’ performance calibrates future offer sizing and timing.
- HITL loop: CEO approvals remain required; edits with reasons train agents; next drafts must acknowledge prior notes.

## CEO Dashboard Tile — Social (7d)

What to show (at a glance)

- Revenue (social‑attributed): $X,XXX (+Y% WoW)
- Traffic (UTM social): N sessions • CTR Z%
- Engagement: E interactions • Engagement rate R%
- Active Offers: D codes • Avg discount Q% • Redemptions M
- Pipeline: S scheduled (next 7d) • 0 gaps
- Top Performer: platform + thumbnail + key stat (e.g., 12.4% CTR)

Visual treatment

- Header: “Social (7d)”
- Metric grid (2×3): Revenue, Sessions, CTR, Engagement, Redemptions, Scheduled
- Sparkline: revenue or sessions trend (7d)
- Badge strip:
  - Green: “4+1 ideas ready” (from Product Suggestions)
  - Yellow: “1 gap in next 7 days”
  - Red: “2 failed publishes” or “Approvals waiting: 3”
- Mini‑card: Top post (platform icon, thumbnail, title, primary metric, deep link)

Status thresholds

- Green: scheduled ≥ 5 AND approvals queue ≤ 1 AND failures = 0
- Yellow: scheduled 2–4 OR approvals queue 2–3 OR failures = 1
- Red: scheduled < 2 OR approvals queue ≥ 4 OR failures ≥ 2

Quick actions

- Approve Queue → Approvals → Social
- Fill Pipeline → Calendar (prefill open gaps next 7d)
- Launch Offer → Create discount (defaults ≤ 15% for 7 days)
- View Insights → “What worked” (hook, asset, hashtags, time)

Data sources

- Revenue/traffic: GA4 (UTM social) and/or Shopify orders if used for attribution
- Engagement & scheduled: Publer per‑platform metrics and calendar
- Discounts: Shopify discounts (active codes, redemptions)
- Approvals/failures: internal status + Publer API responses

Rationale

- Outcomes first (revenue, traffic), then levers (offers, pipeline)
- Highlights risk (gaps, failures, approvals) with explicit thresholds
- One‑click paths to action and learning

## UI (planned)

- Approvals → Social Publishing: list + detail with per‑platform tabs, inline edit, reason picker, schedule controls, previews.
- Calendar: monthly/weekly planner with drag‑to‑reschedule.
- Post Composer: per‑platform character counters, hashtag helpers, asset picker, link builder with UTM preview.

## Constraints & Idempotency

- Idempotency key per variant/platform: `${post_id}:${platform}`.
- Prevent double publishes; store platform_post_id and status.
- Honor rate limits; exponential backoff and alert on repeated failures.

## Security & Audit

- Redact access tokens from logs.
- Persist referenceDocumentUri (gid or URL) to trace publishes.
- Immutable audit trail for approvals and publishes.

## Assets (Google Drive + Publer)

- Canonical source: Google Drive (shared folder the team maintains).
- Two paths:
  1. Publer Google Drive connector (recommended): Publer fetches assets from Drive directly; we store Drive file IDs or Publer asset IDs.
  2. Direct link fallback: Our app stores Drive file IDs and generates time‑limited download URLs via service account for Publer to ingest.
- Track per asset: `drive_file_id`, checksum, width/height/duration, alt text.
- Folder conventions: `campaign/YYYY-MM-DD/{platform}/product-slug/`.

## Assets (Google Drive + Publer)

- Canonical source: Google Drive (shared folder the team maintains).
- Two paths:
  1. Publer Google Drive connector (recommended): Publer fetches assets from Drive directly; we store Drive file IDs or Publer asset IDs.
  2. Direct link fallback: Our app stores Drive file IDs and generates time‑limited download URLs via service account for Publer to ingest.
- Track per asset: `drive_file_id`, checksum, width/height/duration, alt text.
- Folder conventions: `campaign/YYYY-MM-DD/{platform}/product-slug/`.

## Open Items & Decisions

1. Media specs: approve default asset guidance per platform (see below) or provide your own.
2. Publer API rate limits and retries: set safe defaults (we’ll propose).
3. Asset storage: confirm where we keep source images/videos (e.g., Supabase Storage, S3) and CDN.

## Default Asset Specs (proposed)

- Instagram: 1080×1080 (square) or 1080×1350 (portrait), < 8MB image; short caption + hashtags.
- Facebook: 1200×630 (link) or 1080×1080 (image), < 8MB; link preview.
- Pinterest: 1000×1500 (2:3), high‑res vertical.
- TikTok: 1080×1920 vertical video; 9–15s target; hook in first 2s.
- Google Business: 720×540+ image; concise copy; include link.
- YouTube: 1920×1080 video (full), Shorts 1080×1920 vertical; title/description tuned.
