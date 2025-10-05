---
epoch: 2025.10.E1
doc: docs/directions/product_metrics.md
owner: product
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---
# Operator Control Center — Success Metrics & Telemetry

## Metric Definitions

### Activation Rate
- **What we measure:** Percentage of onboarded shops that complete at least one operator approval within their first seven days on the dashboard.
- **Formula:** `activated_shops / new_shops_first7d`, where `activated_shops` = unique `shopDomain` values with an `ops` decision in `decision_log`, and `new_shops_first7d` = unique shops with their first `dashboard.session.opened` fact.
- **Sources today:** `decision_log` (via `logDecision`), `dashboard_facts` entries from tile services, and the dashboard session fact.
- **Telemetry status:** Loader now emits `dashboard.session.opened` facts with operator email + request id context (`app/routes/app._index.tsx:57`). Supabase mirror rides the existing facts pipeline.
- **Next actions:** Ship nightly job or materialized view to calculate rolling seven-day activation; expose metric tile once baseline telemetry live.

### SLA Resolution Time
- **What we measure:** Median minutes from Chatwoot SLA breach to first operator action logged in HotDash.
- **Formula:** `median(decision_at - sla_breach_at)` for conversations that triggered `chatwoot.escalations` facts and have a corresponding `chatwoot.reply.*` decision.
- **Sources today:** `chatwoot.escalations` fact captures conversation `createdAt`, computed `breachedAt`, `generatedAt`, and SLA minutes (`app/services/chatwoot/escalations.ts:122`); `decision_log` captures reply timestamp.
- **Telemetry status:** Fact metadata now includes breached conversation identifiers + timestamps, enabling joins without additional scraping.
- **Next actions:** Add follow-up job to backfill breach timestamps into existing Supabase facts and define Supabase view calculating resolution duration per conversation.

### Anomaly Response Rate
- **What we measure:** Share of GA landing page anomalies that receive an operator assignment or logged follow-up within 24 hours.
- **Formula:** `resolved_anomalies_24h / total_anomalies`, where resolution = `decision_log.action` starting with `seo.assignment.` referencing anomaly landing page.
- **Sources today:** `ga.sessions.anomalies` fact contains list of anomalies with WoW deltas.
- **Telemetry gaps:** No decision path yet for SEO assignments; need UX + action endpoint to create decisions that include landing page id/URL.
- **Next actions:** Partner with design/engineering to add SEO assignment workflow; once endpoint exists, ensure payload stores `landingPage` to allow response tracking.

- Shopify services emit `shopify.sales.summary` and `shopify.fulfillment.issues` facts with counts, revenue, and timestamps (see `app/services/shopify/orders.ts`).
- Inventory heatmap writes `shopify.inventory.alerts` including thresholds and generatedAt (see `app/services/shopify/inventory.ts`).
- Chatwoot escalations log `chatwoot.escalations` facts scoped to ops with SLA metadata (see `app/services/chatwoot/escalations.ts`).
- GA ingest records `ga.sessions.anomalies` with property id and date range (see `app/services/ga/ingest.ts`).
- Loader records `dashboard.session.opened` facts for every visit with operator context (`app/routes/app._index.tsx`).
- Decisions API persists operator approvals to Prisma + Supabase (see `app/services/decisions.server.ts`), enabling activation and response metrics once joins defined.
- Nightly rollup job publishes aggregate facts for activation + SLA stats (see `scripts/ops/run-nightly-metrics.ts`).
- Ops Pulse dashboard tile displays the aggregates for quick operator readout (`app/components/tiles/OpsMetricsTile.tsx`).

## Telemetry Backlog (Needs Sprint Placement)
- Schedule nightly metrics job in hosting environment (cron) and pipe outputs into ops dashboard visualization.
- Design + implement SEO assignment decision flow to enable anomaly response tracking.
- Stand up metrics ETL (db view or worker) aggregating the above into weekly dashboards; provide evidence links per sprint.
