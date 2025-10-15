# ETL Pipelines

## Nightly Jobs
1) **GSC Bulk Export → BigQuery**
   - Ingest new daily files; validate schema; dedupe by `(page, query, date)`.
   - Materialize rollups for CTR deltas and rank buckets.
2) **GA4 Data API Pull**
   - Organic-only slices (sessions, item revenue, add-to-carts). Store to `ga4.daily_org_agg`.
3) **Performance Snapshot**
   - Pull Core Web Vitals metrics per key URLs (home, hub, PDPs, top landing pages).
4) **Shopify Inventory Snapshot**
   - Capture `inventory_levels` across locations; join to products/variants.
5) **Chatwoot Sync (optional)**
   - Backfill unresolved conversations and tags.

## Realtime
- **Shopify Webhooks**: `orders/create`, `inventory_levels/update` → queue → normalized events table.
- **Chatwoot Webhooks**: `message.created` → label intent → candidate reply Action.
- All webhook handlers are **HMAC verified** and **idempotent** (store `event_id`).

## Backfills
- Provided as separate jobs with `date_start/date_end`. Must be throttled and resumable.
