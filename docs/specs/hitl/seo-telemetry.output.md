Title: SEO Telemetry — Output Contracts (dev)

CSV headers (Top‑10 output)

- normalized_path
- device_category
- date
- impressions
- avg_position
- ctr
- sessions
- conv_rate
- aov
- sessions_uplift_est
- revenue_lift_est
- confidence
- ease_score
- brand_excluded

Notes

- Excludes brand patterns via `brand_filters` table (type=brand)
- Normalize paths (strip query/hash); ensure trailing slash policy consistent
- Evidence files: `artifacts/seo/YYYY-MM-DD/telemetry-*.log` and `artifacts/seo/YYYY-MM-DD/telemetry-top10.csv`

Parametric Export Stub

```sql
-- Params: @start_date, @end_date, @impressions_min
SELECT normalized_path, device_category, date,
       impressions, avg_position, ctr,
       sessions, conv_rate, aov,
       sessions_uplift_est, revenue_lift_est,
       confidence, ease_score,
       FALSE AS brand_excluded
FROM telemetry_top10_view
WHERE date BETWEEN @start_date AND @end_date
ORDER BY revenue_lift_est DESC
LIMIT 10;
```
