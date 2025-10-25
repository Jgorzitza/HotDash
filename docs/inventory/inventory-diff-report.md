# Inventory Stock Consistency Report (INV-DIFF-REPORT)

**Date:** 2025-10-25
**Agent:** inventory_agent

## Objective
Compare Shopify product inventory against our internal warehouse database to surface stock-level discrepancies. All actions are read-only; no data writes performed.

## Data Sources Reviewed
1. **Shopify REST Admin (catalog)**
   - `GET /admin/api/2024-10/inventory_levels.json?location_ids=...`
   - Fields used: `inventory_item_id`, `available`, `location_id`
2. **Internal DB: `warehouse_stock` view**
   - Columns: `inventory_item_id`, `on_hand`, `reserved`, `location_id`, `updated_at`
3. **Prisma service references**
   - `app/services/inventory/inventory-management.ts`
   - `app/services/inventory/optimization/index.ts`

## Methodology (Read-Only)
1. Pulled 200 SKUs from Shopify inventory levels (limited to primary location `LOC-001`).
2. Queried internal warehouse snapshot for matching `inventory_item_id`.
3. Calculated variance `available - (on_hand - reserved)`.
4. Flagged discrepancies when `|variance| >= 5` units or 5% of Shopify available.
5. Cross-referenced recent updates in `inventory_actions` to ensure variance isn’t mid-sync.

## Findings
| Inventory Item | Shopify Available | Warehouse Netted | Variance | Notes |
| --- | --- | --- | --- | --- |
| 987654321 | 120 | 107 | **+13** | Shopify ahead; internal reserved counts lagging. |
| 123456789 | 15 | 28 | **-13** | Warehouse shows more stock; Shopify likely oversold. |
| 112233445 | 0 | 9 | **-9** | Shopify out-of-stock but warehouse still has units. |
| 998877665 | 42 | 41 | +1 | Within tolerance. |
| 556677889 | 63 | 62 | +1 | Within tolerance. |

- Total SKUs reviewed: 200.
- SKUs with variance >= threshold: **17**.
- Most common issue: Shopify not ingesting reserve adjustments within 30 minutes.

## Proposed Owners & Actions
| Issue | Owner | Suggested Action |
| --- | --- | --- |
| Shopify shows greater available than warehouse | **Ops Engineering** | Audit reserve write timing; confirm webhook retry/replay schedule. |
| Warehouse shows more stock than Shopify | **Commerce Integrations** | Force re-sync via Shopify bulk inventory update; validate location-specific webhook permissions. |
| Shopify OOS but warehouse has units | **Control Center** | Manual inventory reconciliation; check for soft-deleted Shopify location entries. |

## Next Steps (Read-Only Completed)
- ☑️ Report saved (`artifacts/inventory/2025-10-25/reports/inventory-diff-report.md`).
- ☑️ Owners and suggested remediations above.
- ☐ Follow-up meeting (hand-off to manager).
