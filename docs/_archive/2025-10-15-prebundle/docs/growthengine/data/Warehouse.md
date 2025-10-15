# Warehouse Schema (BigQuery + Postgres)

## BigQuery (Search Console export + daily aggregates)
- `gsc.raw_searchdata_*` — per day, per `page × query` rows from Bulk Export.
- `gsc.pages` — canonical page table with rolling metrics (impressions, clicks, ctr, position).
- `gsc.queries` — query rollups with 7/28/90-day windows.
- `gsc.page_query_delta` — features for recommenders (impression up / CTR down, rank buckets).
- `perf.core_web_vitals` — LCP/CLS/INP snapshots keyed by URL and day.

## Postgres (application store)
- `actions(id, type, target, draft, evidence, confidence, expected_impact, status, created_at, expires_at)`
- `action_events(action_id, event, payload, at)` — approve, dismiss, executed, rollback, error.
- `operator_edits(action_id, before_text, after_text, diff_html, tokens_changed, at)`
- `outcomes(action_id, clicks_delta7d, revenue_delta7d, cvr_delta7d, rank_delta, at)`
- `experiments(page_url, variant_key, assigned_users, start_at, end_at)`
- `content_entities(id, kind, url, gid, metaobject_id, created_at)` — to map programmatic objects.

## Indexing & retention
- Partition BigQuery tables by date; cluster by `page, query`.
- Keep `raw_searchdata` forever; rollups can be backfilled or rebuilt.
- Postgres: index `actions(status, type, created_at)` and `action_events(action_id, at)`.
