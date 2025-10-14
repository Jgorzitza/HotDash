-- KPI Dashboards Analytics Queries
-- Created: 2025-10-14
-- Owner: Reliability
-- Purpose: Real-time visibility into growth metrics (Growth Spec I1-I8)

-- ============================================================================
-- Dashboard 1: Action Throughput
-- ============================================================================

-- View: Hourly action throughput metrics
CREATE OR REPLACE VIEW v_action_throughput_hourly AS
SELECT
  date_trunc('hour', created_at) as hour,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE status = 'pending') as actions_pending,
  COUNT(*) FILTER (WHERE status = 'approved') as actions_approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as actions_rejected,
  COUNT(*) FILTER (WHERE status IN ('pending')) as current_backlog,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FILTER (WHERE status != 'pending') as avg_processing_time_seconds
FROM agent_approvals
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY 1
ORDER BY hour DESC;

-- View: Current backlog summary
CREATE OR REPLACE VIEW v_action_backlog_current AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  MAX(created_at) FILTER (WHERE status = 'pending') as oldest_pending,
  EXTRACT(EPOCH FROM (NOW() - MAX(created_at) FILTER (WHERE status = 'pending'))) / 60 as oldest_age_minutes
FROM agent_approvals;

-- ============================================================================
-- Dashboard 2: Recommender Performance  
-- ============================================================================

-- View: Actions by conversation (recommender instance)
CREATE OR REPLACE VIEW v_recommender_performance AS
SELECT
  conversation_id,
  COUNT(*) as total_actions,
  serialized->>'action_type' as action_type,
  (serialized->>'confidence_score')::numeric as avg_confidence,
  COUNT(*) FILTER (WHERE status = 'approved') * 100.0 / NULLIF(COUNT(*), 0) as approval_rate,
  COUNT(*) FILTER (WHERE status = 'rejected') * 100.0 / NULLIF(COUNT(*), 0) as rejection_rate,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FILTER (WHERE status != 'pending') as avg_processing_time_seconds
FROM agent_approvals
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY conversation_id, serialized->>'action_type', (serialized->>'confidence_score')::numeric
ORDER BY total_actions DESC;

-- View: Daily approval metrics
CREATE OR REPLACE VIEW v_daily_approval_metrics AS
SELECT
  date_trunc('day', created_at) as day,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE status = 'approved') * 100.0 / NULLIF(COUNT(*), 0) as approval_rate_pct
FROM agent_approvals
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY day DESC;

-- ============================================================================
-- Dashboard 3: SEO Impact (Placeholder - requires GA/GSC integration)
-- ============================================================================

-- Note: SEO metrics will be populated from Google Analytics/Search Console
-- Integration: Requires data pipeline from Growth Spec A1-A7

CREATE OR REPLACE VIEW v_seo_metrics_placeholder AS
SELECT
  'seo_impact' as metric_type,
  'Requires GA/GSC integration' as status,
  'See Growth Spec A1-A7' as implementation_ref;

-- ============================================================================
-- Dashboard 4: System Health
-- ============================================================================

-- View: API performance metrics (using observability_logs)
CREATE OR REPLACE VIEW v_api_health_metrics AS
SELECT
  date_trunc('hour', created_at) as hour,
  COUNT(*) as total_logs,
  COUNT(*) FILTER (WHERE level = 'ERROR') as error_count,
  COUNT(*) FILTER (WHERE level = 'ERROR') * 100.0 / NULLIF(COUNT(*), 0) as error_rate_pct,
  AVG((metadata->>'duration_ms')::numeric) FILTER (WHERE metadata->>'duration_ms' IS NOT NULL) as avg_response_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (metadata->>'duration_ms')::numeric) FILTER (WHERE metadata->>'duration_ms' IS NOT NULL) as p95_response_ms
FROM observability_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY 1
ORDER BY hour DESC;

-- View: Current system health snapshot  
CREATE OR REPLACE VIEW v_system_health_current AS
SELECT
  (SELECT COUNT(*) FROM agent_approvals WHERE status = 'pending') as queue_depth,
  (SELECT COUNT(*) FROM observability_logs WHERE level = 'ERROR' AND created_at > NOW() - INTERVAL '1 hour') as errors_last_hour,
  (SELECT AVG((metadata->>'duration_ms')::numeric) FROM observability_logs WHERE created_at > NOW() - INTERVAL '1 hour' AND metadata->>'duration_ms' IS NOT NULL) as avg_response_ms_last_hour,
  (SELECT COUNT(*) FROM agent_approvals WHERE created_at > NOW() - INTERVAL '1 hour') as actions_last_hour;

-- View: Agent performance metrics
CREATE OR REPLACE VIEW v_agent_performance_summary AS
SELECT
  agent_name,
  date_trunc('day', started_at) as day,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE resolution = 'resolved') as resolved_count,
  COUNT(*) FILTER (WHERE resolution = 'escalated') as escalated_count,
  COUNT(*) FILTER (WHERE resolution = 'failed') as failed_count,
  AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration_seconds,
  AVG(cost_usd) as avg_cost_usd,
  AVG(CASE WHEN self_corrected THEN 1 ELSE 0 END) * 100 as self_correction_rate_pct
FROM agent_run
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY agent_name, 2
ORDER BY day DESC, total_runs DESC;

-- ============================================================================
-- Dashboard Metrics Summary Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  dashboard TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_recorded ON dashboard_metrics (dashboard, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_name ON dashboard_metrics (metric_name, recorded_at DESC);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE dashboard_metrics IS 'Time-series storage for dashboard KPIs with real-time aggregation';
COMMENT ON VIEW v_action_throughput_hourly IS 'Hourly action pipeline throughput (created, approved, rejected, backlog)';
COMMENT ON VIEW v_recommender_performance IS 'Recommender accuracy and performance by conversation';
COMMENT ON VIEW v_api_health_metrics IS 'API performance metrics (response times, error rates)';
COMMENT ON VIEW v_system_health_current IS 'Real-time system health snapshot with queue depth and errors';
COMMENT ON VIEW v_agent_performance_summary IS 'Agent execution metrics (resolution rate, duration, cost)';
