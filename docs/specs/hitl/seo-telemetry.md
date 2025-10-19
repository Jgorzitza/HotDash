Title: Closed‑loop SEO Telemetry (GSC Bulk Export → BigQuery)

Current Issue: #79 (Analytics)

## Goal

Full-fidelity search telemetry with joins to GA4 revenue so operators can prioritize high-impact CWV fixes and keyword actions daily.

## Pipeline Overview

1. **Nightly Export:** Pull GSC Bulk Export to BigQuery staging dataset (`gsc_bulk_export.searchdata_url_impression`) using existing adapter.
2. **Normalization:** Apply URL normalization (lowercase, trim trailing slash, strip UTM) and map to page template + intent classification table.
3. **Join Phase:** Merge with GA4 sessions/revenue (BigQuery export) and content metadata (Supabase / Prisma) keyed on `normalized_path`, `device_category`, `date`.
4. **CWV Ingestion:** CrUX API exports stored in BigQuery table `external_crux.metrics` by URL + device; compute bucket deltas vs previous period.
5. **Scoring:** Compute expected revenue lift per CWV metric bucket (below) and rank top opportunities.
6. **Delivery:** Publish Action Dock feed + dashboard tile (flagged off) and store evidence bundle in `artifacts/analytics/YYYY-MM-DD/`.

## CWV→$$ Mapping

- **Formula:** `expected_revenue_lift = sessions_delta × conversion_rate × average_order_value`
- **Sessions Delta:**
  - Pull CrUX distribution for current vs target bucket; use multiplier table (`seo-telemetry.multipliers.json`) mapping bucket improvements → expected CTR / position change.
  - Estimate incremental sessions as `baseline_sessions × multiplier` capped by SERP ceiling (rank ≤ 2).
  - Clamp when baseline sessions < 30 (flag low-signal).
- **Conversion Rate:** GA4 BigQuery export (`events_intraday_*` + `events_*`) aggregated by `page_path` + device (trailing 28 days). Fallback: 90-day median at template+intent level.
- **Average Order Value:** Derived from GA4 revenue/orders for same cohort; fallback to site-wide 30-day median.
- **Normalization:** Lowercase paths, remove query params except `?variant=` when relevant, collapse trailing slash except `/` root.
- **Output Contract:**
  ```json
  {
    "normalized_path": "/kits/ram-1500-2022",
    "metric_driver": "LCP",
    "sessions_delta": 420,
    "conversion_rate": 0.021,
    "average_order_value": 186.45,
    "expected_revenue_lift": 1643.94,
    "confidence": 0.72,
    "ease_score": 0.55,
    "rank_band": "4-6",
    "brand_excluded": false
  }
  ```
- **Routing:** Results feed Action Dock + CWV dashboard tile while `feature.seoTelemetry` remains OFF until QA sign-off.

### Join Keys & Filters (2025-10-19)

- Join keys: `normalized_path`, `device_category`, `date` (daily granularity) plus template/intent for aggregated views.
- Priority filter: rank 4–10, impressions ≥ cohort P50, CTR ≤ cohort P40, CWV bucket not “Good”.
- Exclusions: brand queries via `brand_filters` table, margin < threshold (Supabase `page_margin_overrides`), sample size < 30 sessions.
- Evidence artifacts: SQL (`telemetry-top10.sql`), Top10 CSV, chart (`telemetry-top10.png`) stored under `artifacts/seo/YYYY-MM-DD/`.

### Parametric SQL Sketch (brand filter join)

```sql
-- Params: @start_date, @end_date
WITH base AS (
  SELECT
    LOWER(REGEXP_REPLACE(page_path, r'[?#].*$', '')) AS normalized_path,
    device_category,
    DATE(event_date) AS date,
    SUM(CASE WHEN event_name = 'session_start' THEN 1 ELSE 0 END) AS sessions,
    SAFE_DIVIDE(SUM(CASE WHEN event_name = 'purchase' THEN 1 ELSE 0 END),
                SUM(CASE WHEN event_name = 'session_start' THEN 1 ELSE 0 END)) AS conv_rate,
    SAFE_DIVIDE(SUM(purchase_revenue), NULLIF(SUM(CASE WHEN event_name='purchase' THEN 1 END),0)) AS aov
  FROM `project.ga4.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', @start_date) AND FORMAT_DATE('%Y%m%d', @end_date)
  GROUP BY 1,2,3
), gsc AS (
  SELECT normalized_path, device AS device_category, date, impressions, ctr, avg_position
  FROM `project.gsc.searchdata_url_impression`
  WHERE date BETWEEN @start_date AND @end_date
), joined AS (
  SELECT b.*, g.impressions, g.ctr, g.avg_position
  FROM base b
  JOIN gsc g USING (normalized_path, device_category, date)
), non_brand AS (
  SELECT j.*
  FROM joined j
  LEFT JOIN `project.config.brand_filters` bf
    ON j.normalized_path LIKE bf.path_like OR REGEXP_CONTAINS(j.normalized_path, bf.path_regex)
  WHERE bf.path_like IS NULL AND bf.path_regex IS NULL
)
SELECT * FROM non_brand
WHERE impressions >= @impressions_min AND avg_position BETWEEN 4 AND 10;
```

## Validation plan

1. **Backtest:** sample 50 URLs (top/middle tail mix); compare predicted lift vs observed GA4 revenue delta over 14 days. Record MAE and flag >25% outliers.
2. **Sanity checks:** clamp lifts when sessions < 30 or projected improvement < 1%; drop pages with margin overrides or brand queries.
3. **Tile parity:** run `npm run ops:check-analytics-parity` (artifacts/analytics/YYYY-MM-DD/parity.log) and attach Supabase vs Prisma counts.
4. **Evidence bundle:** save SQL (`artifacts/seo/YYYY-MM-DD/telemetry-backtest.sql`), top10 CSV, and summary chart (`telemetry-top10.png`).
5. **Sign-off:** QA verifies Action Dock feed ordering matches expected revenue ranking before enabling flag.

Acceptance

- ≥5 high‑value SEO actions/day
- Top‑10 list ordered by expected revenue

## Notes

- Respect brand filters; MCP-first for GSC/GA4 SDK docs.
- Document backfill playbook in `artifacts/analytics/YYYY-MM-DD/`.
- Add playback snippet for any manual overrides (feature flag toggles).

---

CWV → $$ Mapping (Detailed Draft)

- Metrics: LCP, INP, CLS (field preferred; lab as fallback with guardrails)
- Grouping: URL template × SERP intent × device; compute lift at group level to reduce variance
- Traffic lift: use observed CTR deltas for rank bands (4–10) × expected position changes from CWV bucket improvements (CrUX distribution shifts)
- Revenue lift: SessionsLift × CR × AOV with clamps to exclude outliers and low-signal pages
- Validation steps:
  1. Run `npm run ops:check-analytics-parity` to compare tile revenue vs GA4 export snapshots
  2. Sample Top‑20 URLs by expected revenue lift; compute observed deltas over 14 days
  3. Record mismatches with owner/ETA in feedback and attach logs to `artifacts/analytics/2025-10-18/`
