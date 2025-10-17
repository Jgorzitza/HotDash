# Inventory Module — Functional Spec

## Centralized View

- Import Shopify products/variants + inventory levels (GraphQL Admin).
- Single source of truth in Supabase (`products`, `variants`, `inventory_snapshots`).

## Proactive Reorder

- Status buckets: `in_stock`, `low_stock`, `out_of_stock`, `urgent_reorder`.
- Reorder Point: `ROP = avg_daily_sales * lead_time_days + safety_stock`.
- Safety stock: `(max_daily_sales * max_lead_days) - (avg_daily_sales * avg_lead_days)`.

## Kits / Bundles

- Detect via Shopify tags `BUNDLE:TRUE`.
- `PACK:X` tags expose picker piece counts.
- Optionally model components later via metafields.

## Vendor Management

- Vendors with lead times, terms, contacts.
- Associate products→primary vendor + costs.

## Purchase Orders

- Generate internal POs; export CSV/email to vendors.
- If Stocky API available, sync read/write (fallback is internal PO only).

## Picker Payments

- Piece count from `PACK:X` and per‑order item counts.
- Brackets: 1–4: $2.00, 5–10: $4.00, 11+: $7.00.

## Roles

- CEO override quantities and fix tags; audit trails recorded.

## Sync

- Shopify → periodic import (webhooks + scheduled backfill).
- Potential writes (SKU/metafield updates) guarded by review.
