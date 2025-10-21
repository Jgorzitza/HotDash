# Telemetry Pipeline (GSC + GA4) and Freshness Labels

## Objectives
- Daily **GSC Bulk Export → BigQuery** with full fidelity (queries, pages, dimensions).
- **GA4 Data API** reports for landing page revenue/CTR/attach; join to GSC keys.
- **Freshness labels** on tiles: GSC is typically delayed 48–72h; GA4 can be near‑real‑time for events.

## Steps (no code)
1. Enable GSC Bulk Export to BigQuery (project + dataset). Document dataset names, tables, and partitioning.
2. Define the daily transform that joins GSC keys to GA4 metrics and writes a “Top Opportunities” table.
3. Label tiles with **data lag** so no alerts fire from incomplete days.
4. Document failure modes and retry windows.

## Acceptance
- Yesterday’s GSC tables exist in BigQuery with expected row counts.
- GA4 runReport specs documented (dimensions/metrics) and joined outputs verified.
- Tiles display freshness badges (e.g., “GSC 48–72h lag”).

## References
- GSC Bulk Export overview (BigQuery): https://developers.google.com/search/blog/2023/02/bulk-data-export
- Start & manage Bulk Export: https://support.google.com/webmasters/answer/12917675
- GA4 Data API overview & runReport: https://developers.google.com/analytics/devguides/reporting/data/v1
