-- Materialized Views for Dashboard Tiles
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: Backlog 11 - Views for tiles (materialized where needed)

-- ============================================================================
-- Materialized View: Revenue Trends (30 days)
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_revenue_trends_30d AS
SELECT 
  DATE(created_at) as metric_date,
  SUM((value->>'total_revenue')::NUMERIC) as daily_revenue,
  COUNT(*) as order_count,
  AVG((value->>'total_revenue')::NUMERIC) as avg_order_value
FROM facts
WHERE topic = 'shopify.sales'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY metric_date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS mv_revenue_trends_30d_date_idx ON public.mv_revenue_trends_30d (metric_date);

COMMENT ON MATERIALIZED VIEW public.mv_revenue_trends_30d IS 'Daily revenue trends for last 30 days (refreshed nightly)';

-- ============================================================================
-- Materialized View: Inventory Alerts
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_inventory_alerts AS
SELECT 
  (value->>'product_id')::TEXT as product_id,
  (value->>'variant_id')::TEXT as variant_id,
  (value->>'sku')::TEXT as sku,
  (value->>'title')::TEXT as title,
  (value->>'current_stock')::INTEGER as current_stock,
  (value->>'wos')::NUMERIC as weeks_of_stock,
  (value->>'reorder_point')::INTEGER as reorder_point,
  CASE 
    WHEN (value->>'wos')::NUMERIC < 2 THEN 'critical'
    WHEN (value->>'wos')::NUMERIC < 4 THEN 'warning'
    ELSE 'ok'
  END as alert_level,
  created_at as last_updated
FROM facts
WHERE topic = 'shopify.inventory'
  AND (value->>'wos')::NUMERIC < 4
ORDER BY (value->>'wos')::NUMERIC ASC;

CREATE INDEX IF NOT EXISTS mv_inventory_alerts_level_idx ON public.mv_inventory_alerts (alert_level);
CREATE INDEX IF NOT EXISTS mv_inventory_alerts_wos_idx ON public.mv_inventory_alerts (weeks_of_stock);

COMMENT ON MATERIALIZED VIEW public.mv_inventory_alerts IS 'Products with low stock (WOS < 4 weeks)';

-- ============================================================================
-- Materialized View: CX Performance Summary
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_cx_performance_summary AS
SELECT
  DATE(created_at) as metric_date,
  COUNT(*) as total_conversations,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/60) as avg_resolution_minutes,
  COUNT(*) FILTER (WHERE resolved_at - created_at <= INTERVAL '2 hours') as sla_met_count,
  COUNT(*) FILTER (WHERE resolved_at - created_at > INTERVAL '2 hours') as sla_breached_count
FROM cx_conversations
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND resolved_at IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY metric_date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS mv_cx_performance_summary_date_idx ON public.mv_cx_performance_summary (metric_date);

COMMENT ON MATERIALIZED VIEW public.mv_cx_performance_summary IS 'Daily CX performance metrics';

-- ============================================================================
-- Materialized View: SEO Anomalies Summary
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_seo_anomalies_summary AS
SELECT 
  (value->>'page_url')::TEXT as page_url,
  (value->>'traffic_change_pct')::NUMERIC as traffic_change_pct,
  (value->>'current_sessions')::INTEGER as current_sessions,
  (value->>'previous_sessions')::INTEGER as previous_sessions,
  created_at as detected_at
FROM facts
WHERE topic = 'analytics.traffic'
  AND (value->>'traffic_change_pct')::NUMERIC < -20
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY (value->>'traffic_change_pct')::NUMERIC ASC;

CREATE INDEX IF NOT EXISTS mv_seo_anomalies_summary_change_idx ON public.mv_seo_anomalies_summary (traffic_change_pct);

COMMENT ON MATERIALIZED VIEW public.mv_seo_anomalies_summary IS 'Pages with significant traffic drops (> 20%)';

-- ============================================================================
-- Refresh Function for All Materialized Views
-- ============================================================================

CREATE OR REPLACE FUNCTION public.refresh_all_materialized_views()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_revenue_trends_30d;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_inventory_alerts;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_cx_performance_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_seo_anomalies_summary;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_all_materialized_views TO service_role;
COMMENT ON FUNCTION public.refresh_all_materialized_views IS 'Refresh all materialized views (call from cron)';

-- ============================================================================
-- RLS Policies for Materialized Views
-- ============================================================================

ALTER MATERIALIZED VIEW public.mv_revenue_trends_30d OWNER TO postgres;
ALTER MATERIALIZED VIEW public.mv_inventory_alerts OWNER TO postgres;
ALTER MATERIALIZED VIEW public.mv_cx_performance_summary OWNER TO postgres;
ALTER MATERIALIZED VIEW public.mv_seo_anomalies_summary OWNER TO postgres;

GRANT SELECT ON public.mv_revenue_trends_30d TO authenticated, service_role;
GRANT SELECT ON public.mv_inventory_alerts TO authenticated, service_role;
GRANT SELECT ON public.mv_cx_performance_summary TO authenticated, service_role;
GRANT SELECT ON public.mv_seo_anomalies_summary TO authenticated, service_role;

