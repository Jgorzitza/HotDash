---
epoch: 2025.10.E1
doc: docs/enablement/shopify_admin_testing_fact_ids.md
owner: data
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---
# Shopify Admin Testing — Fact Evidence Prep

## Purpose
Enable enablement/QA partners to gather reproducible evidence (fact IDs, screenshots, telemetry notes) during Shopify admin validation runs.

## Fact Catalog (Staging Baseline)
| Fact Type | Scope | Latest Fact ID (dev seed 2025-10-10) | Where to Capture | Notes |
| --- | --- | --- | --- | --- |
| `shopify.sales.summary` | ops | 8 | Dashboard → Sales Pulse tile | Include revenue graph + pending fulfillment badge; IDs sourced from the Supabase dev seed (`npm run seed`) executed 2025-10-10 02:54 UTC. |
| `shopify.fulfillment.issues` | ops | 12 | Dashboard → Fulfillment tile detail drawer | Capture list state showing order `#1001` backlog; log fact ID and order `gid://` reference. |
| `shopify.inventory.coverage` | ops | 11 | Inventory heatmap modal | Screenshot low-stock SKU (`SKU-003`), note `daysOfCover` and recommendation. |
| `dashboard.session.opened` | ops | — (pending staging telemetry) | Session telemetry logs | Extract via Prisma query (`SELECT id, shop_domain, created_at FROM "DashboardFact" WHERE fact_type='dashboard.session.opened' ORDER BY created_at DESC LIMIT 5`). |
| `chatwoot.escalations` | ops | 9 | CX Escalations modal | Include tags + SLA badge; note escalation conversation IDs (101, 102 seeded). |
| `ga.sessions.anomalies` | ops | 10 | SEO & Content Watch tile | Verify anomaly badge highlights `/blogs/news/october-launch`; fact metadata seeded for parity checks. |

> Credentials pending: staging Prisma connection + Supabase mirror. Update the fact ID column as soon as DB access clears.

## Screenshot Checklist
1. Use staging Shopify admin tile (feature flag `enableShopifyFacts`) to generate UI capture.
2. Save PNGs under `artifacts/enablement/shopify_admin_testing/<YYYY-MM-DD>/`.
3. Name convention: `<factType>_<shopDomain>_<timestamp>.png`.
4. Annotate any latency anomalies or missing data in `feedback/data.md` under a dedicated subsection.

## Telemetry Parity Verification
| Step | Command | Expected Output | Status |
| --- | --- | --- | --- |
| 1 | `npm run ops:check-analytics-parity` | JSON summary with diffPct ≤ 1 | ⏳ Waiting on QA validation run + Supabase credentials |
| 2 | `SELECT COUNT(*) FROM "DashboardFact" WHERE fact_type='shopify.sales.summary';` | Matches Supabase `dashboard.analytics` mirror | ⏳ |
| 3 | `SELECT COUNT(*) FROM "DecisionLog" WHERE created_at >= NOW() - INTERVAL '24 hours';` | Non-zero after QA dry run | ⏳ |

## Next Steps
1. Unblock staging database credentials to populate fact IDs in this table.
2. Coordinate with QA to schedule telemetry parity run, then log results in `feedback/data.md`.
3. Attach completed screenshot set and SQL outputs to enablement’s dry-run packet.
