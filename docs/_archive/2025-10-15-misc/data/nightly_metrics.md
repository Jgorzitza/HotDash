---
epoch: 2025.10.E1
doc: docs/data/nightly_metrics.md
owner: product
last_reviewed: 2025-10-05
doc_hash: TBD
expires: 2025-10-18
---

# Nightly Metrics Rollup — Operator Control Center

## Purpose

Automate aggregation of operator activation and Chatwoot SLA response KPIs so product, ops, and leadership teams have a single fact stream to reference during standups and release reviews.

## Job Overview

- **Entry point:** `npm run ops:nightly-metrics` (executes `scripts/ops/run-nightly-metrics.ts`).
- **Schedule:** Nightly at 02:00 UTC via cron (to be wired into deployment environment).
- **Source tables:** `dashboardFact` (`dashboard.session.opened`, `chatwoot.escalations`), `decisionLog` (scope `ops`).
- **Outputs:**
  - `metrics.activation.rolling7d` fact (shopDomain `__aggregate__`) with numerator/denominator and computed rate.
  - `metrics.sla_resolution.rolling7d` fact with median/p90 minutes over past seven days and sample size metadata.
- **Storage:** Facts persisted in Prisma `dashboardFact` table and mirrored to Supabase via existing pipeline.
- **Automation:** Scheduled via GitHub Actions workflow `.github/workflows/nightly-metrics.yml` (02:00 UTC) with manual trigger fallback.

## Data Contract

| Fact Type                          | Scope | Value Shape                                                                    | Metadata                             |
| ---------------------------------- | ----- | ------------------------------------------------------------------------------ | ------------------------------------ |
| `metrics.activation.rolling7d`     | `ops` | `{ windowStart, windowEnd, totalActiveShops, activatedShops, activationRate }` | `{ generatedAt, notes }`             |
| `metrics.sla_resolution.rolling7d` | `ops` | `{ windowStart, windowEnd, sampleSize, medianMinutes, p90Minutes }`            | `{ generatedAt, sampleSize, notes }` |

## Operational Playbook

1. Ensure `dashboard.session.opened` and `chatwoot.escalations` facts are landing daily (check `dashboardFact` table).
2. Run `npm run ops:backfill-chatwoot` once to normalize historical breach metadata.
3. Configure repository secret `DATABASE_URL` before enabling the GitHub Actions schedule (workflow fails fast if unset).
4. Allow `.github/workflows/nightly-metrics.yml` to run (cron + manual) or mirror the command in your infrastructure scheduler.
5. Monitor job logs; on failure, rerun manually and attach output to `docs/directions/product_changelog.md`.
6. Feed generated aggregate facts into dashboards or Linear evidence links for roadmap decisions.
