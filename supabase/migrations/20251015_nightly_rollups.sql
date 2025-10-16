-- Nightly Rollups and Cron Jobs
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: Backlog 16 - Nightly rollups + cron

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- Rollup Function: CX Metrics Daily
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rollup_cx_metrics_daily(p_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO cx_metrics_daily (
    metric_date,
    conversations_total,
    conversations_new,
    conversations_resolved,
    conversations_pending,
    avg_first_response_minutes,
    median_first_response_minutes,
    sla_met_count,
    sla_breached_count,
    sla_compliance_pct
  )
  SELECT 
    p_date,
    COUNT(*),
    COUNT(*) FILTER (WHERE DATE(created_at) = p_date),
    COUNT(*) FILTER (WHERE DATE(resolved_at) = p_date),
    COUNT(*) FILTER (WHERE status = 'pending'),
    AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))/60),
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (first_response_at - created_at))/60),
    COUNT(*) FILTER (WHERE resolved_at - created_at <= INTERVAL '2 hours'),
    COUNT(*) FILTER (WHERE resolved_at - created_at > INTERVAL '2 hours'),
    (COUNT(*) FILTER (WHERE resolved_at - created_at <= INTERVAL '2 hours')::NUMERIC / NULLIF(COUNT(*), 0)) * 100
  FROM cx_conversations
  WHERE DATE(created_at) = p_date
  ON CONFLICT (metric_date, shop_domain) DO UPDATE SET
    conversations_total = EXCLUDED.conversations_total,
    conversations_resolved = EXCLUDED.conversations_resolved,
    avg_first_response_minutes = EXCLUDED.avg_first_response_minutes,
    updated_at = NOW();
END;
$$;

COMMENT ON FUNCTION public.rollup_cx_metrics_daily IS 'Rollup CX metrics for a specific date (default: yesterday)';

-- ============================================================================
-- Rollup Function: Growth Metrics Daily
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rollup_growth_metrics_daily(p_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO growth_metrics_daily (
    metric_date,
    organic_sessions,
    organic_pageviews,
    traffic_anomalies_count,
    ad_spend,
    ad_impressions,
    ad_clicks,
    ad_conversions
  )
  SELECT 
    p_date,
    SUM((value->>'sessions')::INTEGER) FILTER (WHERE topic = 'analytics.traffic'),
    SUM((value->>'pageviews')::INTEGER) FILTER (WHERE topic = 'analytics.traffic'),
    COUNT(*) FILTER (WHERE topic = 'analytics.traffic' AND (value->>'traffic_change_pct')::NUMERIC < -20),
    SUM((value->>'spend')::NUMERIC) FILTER (WHERE topic = 'ads.performance'),
    SUM((value->>'impressions')::INTEGER) FILTER (WHERE topic = 'ads.performance'),
    SUM((value->>'clicks')::INTEGER) FILTER (WHERE topic = 'ads.performance'),
    SUM((value->>'conversions')::INTEGER) FILTER (WHERE topic = 'ads.performance')
  FROM facts
  WHERE DATE(created_at) = p_date
  ON CONFLICT (metric_date, shop_domain) DO UPDATE SET
    organic_sessions = EXCLUDED.organic_sessions,
    organic_pageviews = EXCLUDED.organic_pageviews,
    traffic_anomalies_count = EXCLUDED.traffic_anomalies_count,
    updated_at = NOW();
END;
$$;

COMMENT ON FUNCTION public.rollup_growth_metrics_daily IS 'Rollup growth metrics for a specific date (default: yesterday)';

-- ============================================================================
-- Master Rollup Function: Run All Nightly Rollups
-- ============================================================================

CREATE OR REPLACE FUNCTION public.run_nightly_rollups()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  v_start_time := NOW();
  
  -- Run CX metrics rollup
  PERFORM rollup_cx_metrics_daily();
  
  -- Run growth metrics rollup
  PERFORM rollup_growth_metrics_daily();
  
  -- Refresh materialized views
  PERFORM refresh_all_materialized_views();
  
  v_end_time := NOW();
  
  v_result := jsonb_build_object(
    'status', 'success',
    'start_time', v_start_time,
    'end_time', v_end_time,
    'duration_seconds', EXTRACT(EPOCH FROM (v_end_time - v_start_time)),
    'rollups_completed', jsonb_build_array('cx_metrics', 'growth_metrics', 'materialized_views')
  );
  
  -- Log to audit_logs
  INSERT INTO audit_logs (actor, action, entity_type, payload, result, result_details)
  VALUES ('system', 'nightly_rollups.completed', 'rollup', v_result, 'success', v_result);
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.run_nightly_rollups TO service_role;
COMMENT ON FUNCTION public.run_nightly_rollups IS 'Master function to run all nightly rollups and refresh views';

-- ============================================================================
-- Schedule Nightly Rollups (2 AM daily)
-- ============================================================================

SELECT cron.schedule(
  'nightly-rollups',
  '0 2 * * *',
  $$SELECT public.run_nightly_rollups()$$
);

COMMENT ON EXTENSION pg_cron IS 'Cron-based job scheduler for PostgreSQL';

