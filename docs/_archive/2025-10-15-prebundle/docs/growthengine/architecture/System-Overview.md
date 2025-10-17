# System Overview

## Components

- **Signals Ingestor** — pulls/receives:
  - Google Search Console (GSC) → query/page daily export
  - GA4 Data API → organic revenue + behavior
  - Shopify → orders, inventory (webhooks + Admin API)
  - Chatwoot → conversations (webhooks)
  - Performance → Core Web Vitals snapshots
- **Feature Builder** — SQL transforms & joins for: CTR deltas, rank buckets, cluster revenue, attach-rate graphs, inventory risk, performance regression.
- **Recommenders** — produce **Action** candidates with **drafts**:
  - SEO CTR Fixer
  - Programmatic Page Factory (Shopify metaobjects)
  - Merchandising Playbooks (stock-out; slow-mover; back-in-stock)
  - Guided Selling (chat reply + ready-to-approve cart)
  - Performance Repair (LCP/CLS/INP task list)
- **Scoring & Gating** — estimate $$ lift, compute risk, apply publish rules.
- **Action Service (API)** — persists actions, serves Top 10, executes on approval, tracks outcomes.
- **Adapters** — per target system (Shopify, GA4, GSC, Chatwoot) with idempotent, audited operations.
- **Front-End (HotDash)** — action cards, diffs, evidence, previews, one-click controls.
- **Learning Loop** — consumes operator edits & outcomes to improve future drafts and gates.

## Data Flow (text diagram)

```
[Sources]
  GSC ─┐
  GA4 ─┼─> Signals Ingestor ──> Warehouse (BQ + Postgres) ──> Feature Builder
Shopify ┘                                              ┌────> Recommenders (+LLM/RAG)
Chatwoot ──────────────────────────────────────────────┤
Core Web Vitals ───────────────────────────────────────┘

Recommenders ──> Scoring & Gating ──> Action Service (API) ──> HotDash UI
                                                            └─> Adapters (exec on Approve)

HotDash UI (Approve/Edit) ──> Action Service ──> Adapters ──> Systems (publish)
                                                    └─> Learning Loop (edits, outcomes)
```

## Tech Notes

- **Warehouse:** BigQuery (GSC export) + Postgres (actions, edits, experiments).
- **Jobs:** Containerized schedulers (cron/Cloud Run Jobs). Webhooks handled via a small queue (Redis/Cloud Tasks).
- **LLM Use:** Small, bounded prompts; Retrieval from your own content (metaobjects + AN Hose 101). No external browsing at runtime.
- **Rollbacks:** All adapters must support dry-run previews and atomic rollbacks (e.g., revert a title/meta change or unpublish a metaobject entry).
