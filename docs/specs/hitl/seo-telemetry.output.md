# SEO/Analytics Telemetry — Product CSV Export

Purpose: Provide nightly CSV export for Product with brand filter join.

Columns (header):
- date (YYYY-MM-DD)
- brand
- sessions
- users
- pageviews
- conversions
- revenue

Notes:
- Source: GA4 stub + internal joins (dev only)
- This export is for staging/dev validation; production pipeline will replace sources.
- Output path: artifacts/analytics/<YYYY-MM-DD>/exports/telemetry_<timestamp>.csv

Rollback:
- Remove cron entry/script invocation.
- Delete generated CSVs under artifacts/analytics/<date>/exports/.
