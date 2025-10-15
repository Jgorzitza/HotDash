-- Real-time Analytics: Materialized Views for Fast Aggregation
-- Purpose: Pre-computed metrics with 30-second refresh for live dashboards
-- Owner: data
-- Date: 2025-10-11
-- Ref: docs/data/realtime_analytics_pipeline.md

-- =============================================================================
-- Materialized View 1: Real-time Agent Performance (30s refresh)
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_realtime_agent_performance AS
SELECT 
  agent,
  -- Query volume (time windows)
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') as queries_last_minute,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes') as queries_last_5min,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '15 minutes') as queries_last_15min,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as queries_last_hour,
  -- Performance metrics
  ROUND(AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute'), 2) as avg_latency_1min,
  ROUND(AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes'), 2) as avg_latency_5min,
  ROUND(AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '15 minutes'), 2) as avg_latency_15min,
  MAX(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes') as max_latency_5min,
  -- Approval metrics
  ROUND(100.0 * COUNT(*) FILTER (WHERE approved = true AND created_at > NOW() - INTERVAL '5 minutes') / 
    NULLIF(COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes'), 0), 2) as approval_rate_5min_pct,
  -- Health status (based on 1-minute average)
  CASE 
    WHEN AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') > 200 THEN 'degraded'
    WHEN AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') > 100 THEN 'warning'
    WHEN COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') = 0 THEN 'idle'
    ELSE 'healthy'
  END as health_status,
  -- Last query timestamp
  MAX(created_at) as last_query_at,
  EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) as seconds_since_last_query,
  -- Metadata
  NOW() as refreshed_at
FROM agent_queries
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY agent;

CREATE UNIQUE INDEX IF NOT EXISTS mv_realtime_agent_performance_agent_idx 
  ON mv_realtime_agent_performance (agent);

COMMENT ON MATERIALIZED VIEW mv_realtime_agent_performance IS 'Real-time agent performance metrics (1min/5min/15min/1hr windows). Refresh every 30 seconds.';

-- =============================================================================
-- Materialized View 2: Approval Queue Summary (30s refresh)
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_approval_queue_summary AS
SELECT 
  -- Queue depth by status
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved' AND updated_at > NOW() - INTERVAL '1 hour') as approved_last_hour,
  COUNT(*) FILTER (WHERE status = 'rejected' AND updated_at > NOW() - INTERVAL '1 hour') as rejected_last_hour,
  COUNT(*) FILTER (WHERE status = 'expired' AND updated_at > NOW() - INTERVAL '1 hour') as expired_last_hour,
  -- Age distribution (pending only)
  ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) FILTER (WHERE status = 'pending'), 2) as avg_pending_age_minutes,
  ROUND(MIN(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) FILTER (WHERE status = 'pending'), 2) as min_pending_age_minutes,
  ROUND(MAX(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) FILTER (WHERE status = 'pending'), 2) as max_pending_age_minutes,
  -- SLA metrics (5-minute threshold)
  COUNT(*) FILTER (WHERE status = 'pending' AND created_at < NOW() - INTERVAL '5 minutes') as sla_breaches,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'pending' AND created_at < NOW() - INTERVAL '5 minutes') / 
    NULLIF(COUNT(*) FILTER (WHERE status = 'pending'), 0), 2) as sla_breach_pct,
  -- Oldest pending (for priority)
  (SELECT conversation_id FROM agent_approvals WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1) as oldest_pending_conversation_id,
  (SELECT created_at FROM agent_approvals WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1) as oldest_pending_created_at,
  -- Throughput (approvals/hour)
  COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '1 hour' AND status != 'pending') as throughput_last_hour,
  ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) FILTER (WHERE updated_at > NOW() - INTERVAL '1 hour' AND status != 'pending'), 2) as avg_resolution_time_minutes,
  -- Metadata
  NOW() as refreshed_at
FROM agent_approvals
WHERE created_at > NOW() - INTERVAL '24 hours';

COMMENT ON MATERIALIZED VIEW mv_approval_queue_summary IS 'Real-time approval queue summary: depth, age, SLA compliance, throughput. Refresh every 30 seconds.';

-- =============================================================================
-- Materialized View 3: Training Quality Snapshot (30s refresh)
-- =============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_training_quality_snapshot AS
SELECT 
  -- Volume metrics
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as feedback_last_hour,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as feedback_last_24h,
  -- Safety distribution
  COUNT(*) FILTER (WHERE safe_to_send = true AND created_at > NOW() - INTERVAL '24 hours') as safe_24h,
  COUNT(*) FILTER (WHERE safe_to_send = false AND created_at > NOW() - INTERVAL '24 hours') as unsafe_24h,
  COUNT(*) FILTER (WHERE safe_to_send IS NULL AND created_at > NOW() - INTERVAL '24 hours') as pending_review_24h,
  ROUND(100.0 * COUNT(*) FILTER (WHERE safe_to_send = false AND created_at > NOW() - INTERVAL '24 hours') / 
    NULLIF(COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'), 0), 2) as unsafe_rate_24h_pct,
  -- Quality scores (last 24h)
  ROUND(AVG((rubric->>'clarity')::numeric) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'), 2) as avg_clarity_24h,
  ROUND(AVG((rubric->>'accuracy')::numeric) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'), 2) as avg_accuracy_24h,
  ROUND(AVG((rubric->>'tone')::numeric) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'), 2) as avg_tone_24h,
  -- Annotator activity
  COUNT(DISTINCT annotator) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as active_annotators_last_hour,
  COUNT(DISTINCT annotator) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as active_annotators_last_24h,
  -- Metadata
  NOW() as refreshed_at
FROM agent_feedback;

COMMENT ON MATERIALIZED VIEW mv_training_quality_snapshot IS 'Real-time training data quality snapshot (1hr/24hr windows). Refresh every 30 seconds.';

-- =============================================================================
-- Refresh Function: All Real-time Materialized Views
-- =============================================================================

CREATE OR REPLACE FUNCTION refresh_realtime_metrics()
RETURNS TABLE(view_name text, refresh_duration_ms numeric) AS $$
DECLARE
  start_time timestamptz;
  end_time timestamptz;
BEGIN
  -- Refresh mv_realtime_agent_performance
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_realtime_agent_performance;
  end_time := clock_timestamp();
  view_name := 'mv_realtime_agent_performance';
  refresh_duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  RETURN NEXT;
  
  -- Refresh mv_approval_queue_summary
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_approval_queue_summary;
  end_time := clock_timestamp();
  view_name := 'mv_approval_queue_summary';
  refresh_duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  RETURN NEXT;
  
  -- Refresh mv_training_quality_snapshot
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_training_quality_snapshot;
  end_time := clock_timestamp();
  view_name := 'mv_training_quality_snapshot';
  refresh_duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_realtime_metrics IS 'Refreshes all real-time materialized views and returns timing. Call from pg_cron every 30 seconds.';

-- =============================================================================
-- Grant Permissions
-- =============================================================================

GRANT SELECT ON mv_realtime_agent_performance TO authenticated;
GRANT SELECT ON mv_approval_queue_summary TO authenticated;
GRANT SELECT ON mv_training_quality_snapshot TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_realtime_metrics TO service_role;

