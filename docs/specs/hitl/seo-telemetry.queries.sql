-- Spec path: docs/specs/hitl/seo-telemetry.md (CWV→$$ mapping)
-- Draft BigQuery SQL stubs (parameterized) — 2025-10-18
-- No secrets; replace @dataset, @property_id via execution context.

-- Normalize page path helper
WITH pages AS (
  SELECT
    REGEXP_REPLACE(page_path, r"[?#].*$", "") AS path,
    SAFE.ORDINAL(1) AS ord
  FROM `@dataset.content_pages`
),

gsc AS (
  SELECT
    REGEXP_REPLACE(page, r"https?://[^/]+", "") AS path,
    date,
    SUM(clicks) AS clicks,
    SUM(impressions) AS impressions,
    SAFE_DIVIDE(SUM(clicks), NULLIF(SUM(impressions),0)) AS ctr,
    AVG(position) AS avg_position
  FROM `@dataset.gsc_export`
  GROUP BY 1,2
),

ga4 AS (
  SELECT
    REGEXP_REPLACE(page_path, r"[?#].*$", "") AS path,
    DATE(event_date) AS date,
    SUM(sessions) AS sessions,
    SUM(purchases) AS purchases,
    SAFE_DIVIDE(SUM(purchases), NULLIF(SUM(sessions),0)) AS conv_rate,
    SUM(revenue) AS revenue,
    SAFE_DIVIDE(SUM(revenue), NULLIF(SUM(purchases),0)) AS aov
  FROM `@dataset.ga4_join`
  GROUP BY 1,2
),

cwv_candidate AS (
  SELECT p.path,
         ANY_VALUE(g.avg_position) AS avg_position,
         ANY_VALUE(g.impressions) AS impressions,
         ANY_VALUE(g.ctr) AS ctr,
         ANY_VALUE(a.sessions) AS sessions,
         ANY_VALUE(a.conv_rate) AS conv_rate,
         ANY_VALUE(a.aov) AS aov,
         -- Draft uplift rules (to be calibrated)
         CASE WHEN avg_position BETWEEN 4 AND 10 THEN 1 ELSE 0 END AS rank_window,
         CASE WHEN ctr < 0.04 THEN 1 ELSE 0 END AS ctr_low
  FROM pages p
  LEFT JOIN gsc g USING(path)
  LEFT JOIN ga4 a USING(path)
)

SELECT
  path,
  impressions,
  avg_position,
  ctr,
  sessions,
  conv_rate,
  aov,
  -- CWV→$$ placeholder: expected sessions uplift and revenue potential
  ROUND(sessions * 0.05, 0) AS sessions_uplift_est,
  ROUND((sessions * 0.05) * conv_rate * aov, 2) AS revenue_lift_est
FROM cwv_candidate
LEFT JOIN `@dataset.brand_filters` bf
  ON cwv_candidate.path LIKE CONCAT('%', bf.pattern, '%')
  AND bf.type = 'brand'
WHERE rank_window = 1 AND ctr_low = 1
  AND bf.pattern IS NULL -- exclude brand traffic
ORDER BY revenue_lift_est DESC
LIMIT 100;
