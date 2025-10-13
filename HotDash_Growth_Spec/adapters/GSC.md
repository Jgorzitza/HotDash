# Search Console Adapter

## Bulk Export
- Enable daily export to BigQuery and ingest as `gsc.raw_searchdata_*`.
- Materialize features: CTR deltas; rank buckets; device/country splits.

## Search Analytics API
- Nearline pulls for recent trends and to power day-to-day Action evidence.
- Surface 'data incomplete' marks for the most recent days.

## Coverage
- Keep raw rows indefinitely; use rollups for UI.
