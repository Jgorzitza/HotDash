-- Migration: 20251013_analytics_aggregation_views.sql
-- Description: Analytics aggregation views for real-time operator dashboard

-- ============================================================================
-- ANALYTICS AGGREGATION VIEWS
-- ============================================================================

-- Real-time sales summary (last 24 hours)
CREATE OR REPLACE VIEW v_sales_summary_24h AS
SELECT
  COUNT(DISTINCT df.id) FILTER (WHERE df."factType" = 'shopify.sales.summary') as fact_count,
  COALESCE(
    (SELECT (value->>'orderCount')::INTEGER 
     FROM "DashboardFact" 
     WHERE "factType" = 'shopify.sales.summary' 
     ORDER BY "createdAt" DESC 
     LIMIT 1), 
    0
  ) as total_orders,
  COALESCE(
    (SELECT (value->>'totalRevenue')::NUMERIC 
     FROM "DashboardFact" 
     WHERE "factType" = 'shopify.sales.summary' 
     ORDER BY "createdAt" DESC 
     LIMIT 1), 
    0
  ) as total_revenue,
  MAX(df."createdAt") as last_updated
FROM "DashboardFact" df
WHERE df."createdAt" >= NOW() - INTERVAL '24 hours';

COMMENT ON VIEW v_sales_summary_24h IS
'Real-time sales summary for the last 24 hours from DashboardFact';

-- Hourly fact aggregation
CREATE OR REPLACE VIEW v_facts_hourly AS
SELECT
  date_trunc('hour', "createdAt") as hour_start,
  "factType",
  "scope",
  COUNT(*) as fact_count,
  jsonb_agg(value ORDER BY "createdAt" DESC) as values,
  MAX("createdAt") as last_fact_at
FROM "DashboardFact"
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY date_trunc('hour', "createdAt"), "factType", "scope"
ORDER BY hour_start DESC, fact_count DESC;

COMMENT ON VIEW v_facts_hourly IS
'Hourly aggregation of all dashboard facts for trend analysis';

-- Daily fact summary
CREATE OR REPLACE VIEW v_facts_daily AS
SELECT
  DATE("createdAt") as date,
  "factType",
  COUNT(*) as fact_count,
  jsonb_agg(
    jsonb_build_object(
      'value', value,
      'createdAt', "createdAt",
      'scope', "scope"
    ) ORDER BY "createdAt" DESC
  ) as facts,
  MAX("createdAt") as last_fact_at
FROM "DashboardFact"
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE("createdAt"), "factType"
ORDER BY date DESC, fact_count DESC;

COMMENT ON VIEW v_facts_daily IS
'Daily summary of dashboard facts for historical analysis';

-- Sales metrics trend (from facts)
CREATE OR REPLACE VIEW v_sales_trend_7d AS
WITH daily_sales AS (
  SELECT
    DATE("createdAt") as date,
    (value->>'orderCount')::INTEGER as orders,
    (value->>'totalRevenue')::NUMERIC as revenue
  FROM "DashboardFact"
  WHERE "factType" = 'shopify.sales.summary'
    AND "createdAt" >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT
  date,
  MAX(orders) as total_orders,
  MAX(revenue) as total_revenue,
  CASE 
    WHEN MAX(orders) > 0 THEN ROUND(MAX(revenue) / MAX(orders), 2)
    ELSE 0
  END as avg_order_value
FROM daily_sales
GROUP BY date
ORDER BY date DESC;

COMMENT ON VIEW v_sales_trend_7d IS
'7-day sales trend calculated from DashboardFact records';

-- Fulfillment issues summary
CREATE OR REPLACE VIEW v_fulfillment_issues_current AS
SELECT
  (value->>'issueCount')::INTEGER as issue_count,
  value->'issues' as issues,
  "createdAt" as last_updated
FROM "DashboardFact"
WHERE "factType" = 'shopify.fulfillment.issues'
ORDER BY "createdAt" DESC
LIMIT 1;

COMMENT ON VIEW v_fulfillment_issues_current IS
'Current fulfillment issues from latest DashboardFact';

-- Inventory alerts summary
CREATE OR REPLACE VIEW v_inventory_alerts_current AS
SELECT
  (value->>'alertCount')::INTEGER as alert_count,
  value->'alerts' as alerts,
  "createdAt" as last_updated
FROM "DashboardFact"
WHERE "factType" = 'shopify.inventory.alerts'
ORDER BY "createdAt" DESC
LIMIT 1;

COMMENT ON VIEW v_inventory_alerts_current IS
'Current inventory alerts from latest DashboardFact';

-- CX escalations summary
CREATE OR REPLACE VIEW v_cx_escalations_current AS
SELECT
  jsonb_array_length(value->'escalations') as escalation_count,
  value->'escalations' as escalations,
  "createdAt" as last_updated
FROM "DashboardFact"
WHERE "factType" = 'chatwoot.escalations'
ORDER BY "createdAt" DESC
LIMIT 1;

COMMENT ON VIEW v_cx_escalations_current IS
'Current CX escalations from latest DashboardFact';

-- GA sessions anomalies
CREATE OR REPLACE VIEW v_ga_anomalies_current AS
SELECT
  jsonb_array_length(value) as anomaly_count,
  value as anomalies,
  "createdAt" as last_updated
FROM "DashboardFact"
WHERE "factType" = 'ga.sessions.anomalies'
ORDER BY "createdAt" DESC
LIMIT 1;

COMMENT ON VIEW v_ga_anomalies_current IS
'Current GA session anomalies from latest DashboardFact';

-- Dashboard session metrics
CREATE OR REPLACE VIEW v_dashboard_usage_24h AS
SELECT
  COUNT(*) as total_sessions,
  COUNT(DISTINCT "shopDomain") as unique_shops,
  MIN("createdAt") as first_session,
  MAX("createdAt") as last_session,
  EXTRACT(EPOCH FROM (MAX("createdAt") - MIN("createdAt"))) / 60 as duration_minutes
FROM "DashboardFact"
WHERE "factType" = 'dashboard.session.opened'
  AND "createdAt" >= NOW() - INTERVAL '24 hours';

COMMENT ON VIEW v_dashboard_usage_24h IS
'Dashboard usage metrics for the last 24 hours';

-- Operator metrics (SLA resolution)
CREATE OR REPLACE VIEW v_operator_metrics_current AS
SELECT
  value as metrics,
  "createdAt" as last_updated
FROM "DashboardFact"
WHERE "factType" = 'metrics.sla_resolution.rolling7d'
ORDER BY "createdAt" DESC
LIMIT 1;

COMMENT ON VIEW v_operator_metrics_current IS
'Current operator SLA metrics from latest DashboardFact';

-- Activation metrics
CREATE OR REPLACE VIEW v_activation_metrics_current AS
SELECT
  value as metrics,
  "createdAt" as last_updated
FROM "DashboardFact"
WHERE "factType" = 'metrics.activation.rolling7d'
ORDER BY "createdAt" DESC
LIMIT 1;

COMMENT ON VIEW v_activation_metrics_current IS
'Current shop activation metrics from latest DashboardFact';

-- ============================================================================
-- ANALYTICS HELPER FUNCTIONS
-- ============================================================================

-- Function to get latest fact by type
CREATE OR REPLACE FUNCTION get_latest_fact(fact_type TEXT)
RETURNS TABLE (
  value JSONB,
  created_at TIMESTAMP,
  shop_domain TEXT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    value,
    "createdAt",
    "shopDomain"
  FROM "DashboardFact"
  WHERE "factType" = fact_type
  ORDER BY "createdAt" DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION get_latest_fact(TEXT) IS
'Get the most recent fact of a specific type';

-- Function to get fact history
CREATE OR REPLACE FUNCTION get_fact_history(
  fact_type TEXT,
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  value JSONB,
  created_at TIMESTAMP,
  shop_domain TEXT,
  scope TEXT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    value,
    "createdAt",
    "shopDomain",
    "scope"
  FROM "DashboardFact"
  WHERE "factType" = fact_type
    AND "createdAt" >= CURRENT_DATE - (days_back || ' days')::INTERVAL
  ORDER BY "createdAt" DESC;
$$;

COMMENT ON FUNCTION get_fact_history(TEXT, INTEGER) IS
'Get historical facts of a specific type for the last N days';

-- Function to calculate fact trend
CREATE OR REPLACE FUNCTION calculate_fact_trend(
  fact_type TEXT,
  metric_path TEXT,
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  date DATE,
  value NUMERIC,
  change_pct NUMERIC
)
LANGUAGE PLPGSQL
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH daily_values AS (
    SELECT
      DATE("createdAt") as date,
      (value #>> string_to_array(metric_path, '.'))::NUMERIC as val
    FROM "DashboardFact"
    WHERE "factType" = fact_type
      AND "createdAt" >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    ORDER BY DATE("createdAt") DESC
  ),
  with_lag AS (
    SELECT
      date,
      val,
      LAG(val) OVER (ORDER BY date) as prev_val
    FROM daily_values
  )
  SELECT
    date,
    val as value,
    CASE 
      WHEN prev_val IS NOT NULL AND prev_val > 0 
      THEN ROUND(((val - prev_val) / prev_val * 100), 2)
      ELSE NULL
    END as change_pct
  FROM with_lag
  ORDER BY date DESC;
END;
$$;

COMMENT ON FUNCTION calculate_fact_trend(TEXT, TEXT, INTEGER) IS
'Calculate trend for a specific metric within facts over time';

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Additional indexes for analytics queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_dashboard_fact_type_created 
  ON "DashboardFact"("factType", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_dashboard_fact_shop_type_created 
  ON "DashboardFact"("shopDomain", "factType", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_dashboard_fact_scope_created 
  ON "DashboardFact"("scope", "createdAt" DESC) 
  WHERE "scope" IS NOT NULL;
