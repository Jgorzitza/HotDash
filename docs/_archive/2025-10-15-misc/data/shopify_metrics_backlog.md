---
epoch: 2025.10.E1
doc: docs/data/shopify_metrics_backlog.md
owner: data
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Shopify Metrics Backlog — Prep Queue (2025-10-11)

## Purpose

- Maintain a prioritized queue of Shopify-facing metrics work so data, engineering, and reliability stay aligned during the Supabase sync investigation.
- Ensure every task points to reproducible artifacts (scripts, SQL, notebooks) and clearly lists dependencies.

## Task Board

| Status | Task                                                               | Dependencies                                                   | Target Artifact                                              |
| ------ | ------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------ |
| ⏳     | Hourly Shopify sync retry comparison (identify rate-limit windows) | Supabase NDJSON export, `npm run ops:analyze-supabase` summary | `docs/insights/supabase_ndjson_analyzer.md` notebook section |
| ⏳     | Activation baseline refresh (7-day rolling)                        | Nightly metrics job healthy, dashboard session facts present   | `docs/insights/activation_baseline.md` (to draft)            |
| ⏳     | SLA + anomaly co-movement slice for launch packet                  | Chatwoot escalations mirrored, anomaly facts current           | `docs/insights/weekly_packet_template.md`                    |
| ⏳     | Shopify inventory alert vs fulfillment issue correlation           | Prisma access (staging), Shopify retry metadata                | `docs/insights/shopify_correlation_study.md` draft           |
| ⏳     | Evidence bundle for Shopify sync regression postmortem             | Reliability retry plan, analyzer outputs, engineering patches  | `artifacts/data/shopify_sync/` bundle                        |

_Legend_: ⏳ = queued (waiting on inputs), ✅ = complete, 🚧 = in progress, ⛔ = blocked.

## Near-Term Focus (Next 48h)

- Confirm analyzer JSON highlights rate-limit windows so engineering can tune retries.
- Draft SQL skeleton for activation baseline refresh; coordinate with product on visualization format.
- Pre-fill weekly packet placeholders with available activation/SLA metrics to shorten turnaround once ETL lands.

## Open Questions

- Do we capture Shopify retry scope at the shop-domain level or per job run? (Check with engineering before finalizing notebook schema.)
- Should rate-limit breach thresholds be mirrored into Supabase facts to power alerting?
- Does marketing require Shopify metrics split by plan tier for launch comms?

## Next Actions

1. Drop analyzer outputs and backlog status in `feedback/data.md` after every restart cycle.
2. Align with reliability on NDJSON export cadence (target: twice daily while incident remains open).
3. Partner with product/enablement on chart specs for launch packets once baseline numbers stabilize.
