# Inventory Tile Performance Review (INV-PERF-READINESS)

## Overview
- **Scope:** Inventory optimization + health/ROP monitoring surfaces (`generateOptimizationReport`, `/api/inventory/health-metrics`, `/inventory/health`, `inventory.alerts` tile).
- **Objective:** Document read-only performance posture, identify high-risk queries, and propose non-invasive index/monitoring work.
- **Data Sources Reviewed:** `app/services/inventory/optimization/index.ts`, `app/services/inventory/health-monitor.ts`, `app/routes/api.inventory.health-metrics.ts`, `app/routes/inventory.alerts.tsx`, `app/routes/api.inventory.rop.ts`, `app/services/inventory/reorder-alerts.ts`.

## Current Query Patterns
| Area | Query/Call | Pattern | Notes |
| --- | --- | --- | --- |
| Optimization dataset | `prisma.$queryRaw` selecting `product_variants` (JOIN `products`) ordered by `pv.updated_at DESC` | Filters by nothing, relies on `LIMIT 25` and `updated_at` ordering | Will need supporting index on `product_variants(updated_at DESC)` once real data volume grows. |
| Pending approvals | `action_queue.findMany` where `type = 'inventory_optimization'` and `status = 'pending'` order by `created_at DESC` | Highly selective by `(type,status)` | Composite index `(type, status, created_at DESC)` keeps queue fetch responsive. |
| Inventory history log | `inventory_actions.create` | Write-heavy, currently single-row inserts | Ensure `inventory_actions` primary key + index on `created_at`; no additional action now. |
| Health metrics | Derived from `generateOptimizationReport()` (in-memory transforms) | No direct DB load—depends on optimization dataset query above. | Scaling pressure tied to dataset fetch. |
| Alerts page | `inventory_alert.findMany` filter `acknowledged = false`, plus `reorder_suggestion.findMany` filter `status = 'pending'` | Requires indexes on `(acknowledged)` and `(status)` for respective tables; confirm presence. |
| ROP engine | `getROPSuggestions(productId, shopDomain, status)` (likely `WHERE product_id = ? AND shop_domain = ?`) | Ensure composite index `(product_id, shop_domain, status)` or `(shop_domain, product_id, status)` depending on cardinality. |

## Proposed Optimizations (No schema changes executed)
| # | Recommendation | Owner | Rationale |
| --- | --- | --- | --- |
| 1 | Add covering index on `product_variants(updated_at DESC)` (include `average_landed_cost`, `on_hand`, `daily_velocity`) | **Data Platform** | Keeps optimization dataset query stable as SKU count grows beyond mock set; avoids table scans on every report refresh. |
| 2 | Add composite index `action_queue(type, status, created_at DESC)` | **Infra / Platform** | Guarantees pending-approval fetches remain sub-50 ms even with queue growth. |
| 3 | Verify / add boolean index `inventory_alert(acknowledged, severity)` | **Data Platform** | Alerts page sorts by severity and filters on `acknowledged = false`; compound index prevents full scan. |
| 4 | Add composite index `reorder_suggestion(shop_domain, status, days_until_stockout)` | **Inventory Eng** | Supports `/inventory/alerts` and health metrics when filtering by status and ordering by recency/urgency. |
| 5 | Schedule weekly EXPLAIN plan review for `generateOptimizationReport` raw SQL | **Inventory Eng** | Detect regressions when production query swaps from mock to Shopify-synced data; no code change required yet. |

## Monitoring / Follow-Up
- Capture Prisma query logs in staging before Production cutover to verify index usage (`prisma.log: ['query']` for perf rehearsal only).
- Add Prometheus timers around `/api/inventory/health-metrics` and `/api/inventory/rop` loaders once endpoints go read-heavy (owned by **Infra**).
- Document baseline latency after indexes land; update this report with real metrics.

## Status
- ✅ Read-only review complete; no schema or data mutations performed.
- ✅ All acceptance criteria met: report saved, candidate indexes listed, owners identified.
