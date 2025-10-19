Status: Planned only — do NOT seed or ship yet

# Content Upgrades (SEO) — Pipeline and Measurement

Goal

- Systematically improve organic performance by upgrading pages with the highest expected impact using data from GA4, Google Search Console (GSC), Bing Webmaster Tools, and site search. Keep the workflow HITL with CEO approvals and measurable outcomes.

Scope (Day‑1)

- Pages: product pages, collections, landing pages, blogs.
- Changes: on‑page copy, titles/meta, FAQs/schema, media/alt, internal links, technical tune‑ups (lightweight), Core Web Vitals follow‑ups (coordination task; not shipping infra here).
- Measurement: pre/post (7d/28d) with auto‑baselines and acceptance metrics.

Data Sources (MCP‑first)

- GA4 Data API: sessions, conversions, revenue; medium=organic; landing page breakdown.
- GSC API: queries, impressions, clicks, CTR, average position by page.
- Bing Webmaster Tools: queries and clicks by page (merged with GSC for coverage).
- Site search (GA4 event view_search_results): top terms and null results.
- Shopify: product/collection slugs; vendor (for first‑party flag); organic‑attributed orders if needed.

Candidate Selection (any of the following)

1. High‑traffic, low‑CVR pages (top N landings where CVR below threshold)
2. High impressions, low CTR queries (position ≤ 12) mapped to pages
3. Content decay: ≥ 20% drop vs 60–90d baseline (sessions or clicks)
4. Missing/weak internal links to canonical product/collection targets
5. Missing schema/FAQs; images without alt; thin content
6. Site search terms with strong demand but weak page alignment

Task Taxonomy

- Title/Meta rewrite (align primary keyword, clarity, CTA)
- FAQ additions + FAQPage schema (JSON‑LD)
- Body copy upgrade (benefits, use‑cases; respect brand voice)
- Media/alt improvements (add missing images, proper alt text)
- Internal linking (to canonical product/collections, related content)
- Structured data fixes (Product/Offer/Breadcrumb)
- Core Web Vitals follow‑up task (handoff; not implemented here)

Approvals & Evidence (HITL)

- Approvals drawer: diff viewer (before/after), reasons (e.g., Clarity/Structure, SEO/Keywords, Internal links), warnings (brand/tone/link hygiene), actions (Approve/Approve w/ Edit/Request Changes/Reject)
- Evidence required: snapshot of current KPIs (7d/28d), GSC query set, proposed changes, canonical links.

Measurement & Acceptance

- Baseline: auto‑capture 7d and 28d metrics prior to change (sessions, CVR, GSC CTR/impressions; optional revenue)
- Post windows: measure 7d and 28d post‑publish
- Acceptance (any of):
  - CTR ↑ ≥ 10% (GSC) with stable position
  - CVR ↑ ≥ 10% or Revenue ↑ ≥ 10%
  - Sessions ↑ ≥ 10% for decay recoveries
- Guardrails: title churn limited to ≤ 1 per 14d per page; link hygiene (no broken links/UTM missing)

Workflow

1. Discover candidates (scheduler + manual)
2. Create upgrade card with evidence and proposed edits
3. CEO Approve/Approve w/ Edit; publish change
4. Track outcomes at 7d and 28d; mark Accept/Needs follow‑up; generate coach notes

UI

- Upgrades backlog: sortable by expected impact (priority score)
- Upgrade editor: side‑by‑side diff, FAQ blocks, schema preview, link checker
- Outcomes tab: baseline vs post metrics, sparkline, acceptance flag

Priority Scoring (heuristic)

- Score = weighted sum of (traffic potential, CTR gap, CVR gap, decay severity, site search demand, brand/non‑brand mix)
- Favor non‑brand opportunities and first‑party vendor pages

Integrations

- Ads + Analytics: brand filters and vendor first‑party dimension for splits
- Product Suggestions: accepted/rejected upgrades feed topic clustering and keyword targeting
- Main Dashboard SEO tile: quick actions “View Upgrades”, “Approve Suggestions”, “Fix Decay”

Security & Policy

- No raw PII in evidence; redact where not needed
- Canonical link names → URLs resolved via mapping (no raw URLs in editor)

Open Items

- A/B test harness (future); Day‑1 uses pre/post windows
- Automated internal link suggestions (future) using site graph

---

## Dev & Verification (Adapters Only; HITL, Autopublish OFF)

Commands (evidence to feedback and artifacts)

- GA4 (adapter):
  - `node integrations/ga4-cli.js --page-metrics --path "/collections/summer" --since 28daysAgo --until yesterday > artifacts/seo/$(date +%F)/ga4.page.metrics.json`
- GSC (adapter):
  - `node integrations/gsc-cli.js --page-queries --path "/collections/summer" --since 28daysAgo --until yesterday > artifacts/seo/$(date +%F)/gsc.page.queries.json`
- Site Search (GA4 event):
  - `node integrations/ga4-cli.js --site-search --since 28daysAgo --until yesterday > artifacts/seo/$(date +%F)/ga4.site.search.json`

Verification

- Baselines captured for 7d/28d windows and linked in Approvals card evidence.
- Post windows scheduled for 7d/28d after approve/apply (still HITL; no autopublish).
- Acceptance computed per “Measurement & Acceptance”; evidence files hash recorded in audit log.

Rollback

- Revert content edits; restore prior title/meta copy; remove added links/FAQs if needed.
- Mark upgrade card as “Reverted”; attach evidence hashes and reason.
