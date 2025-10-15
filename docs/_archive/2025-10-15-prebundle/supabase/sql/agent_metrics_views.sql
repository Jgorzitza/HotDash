-- Agent Metrics Dashboard Views
-- Purpose: Monitoring views for Agent SDK performance and quality metrics
-- Owner: data
-- Date: 2025-10-11
-- Ref: docs/directions/data.md Task A (Agent Metrics Dashboard Design)

-- =============================================================================
-- View 1: Approval Queue Depth Over Time
-- =============================================================================
-- Purpose: Track approval queue size and processing time for capacity planning
-- Usage: Dashboard tile showing queue depth trends and SLA compliance

CREATE OR REPLACE VIEW v_approval_queue_depth AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE status = 'expired') as expired_count,
  COUNT(*) as total_count,
  -- Average time to resolution (for non-pending)
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) FILTER (WHERE status != 'pending') as avg_resolution_minutes,
  -- Oldest pending approval age
  MAX(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) FILTER (WHERE status = 'pending') as oldest_pending_minutes,
  -- SLA compliance (target: 5 minutes)
  COUNT(*) FILTER (WHERE status != 'pending' AND EXTRACT(EPOCH FROM (updated_at - created_at)) <= 300) as within_sla_count,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status != 'pending' AND EXTRACT(EPOCH FROM (updated_at - created_at)) <= 300) / 
    NULLIF(COUNT(*) FILTER (WHERE status != 'pending'), 0),
    2
  ) as sla_compliance_pct
FROM agent_approvals
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

COMMENT ON VIEW v_approval_queue_depth IS 'Hourly approval queue metrics: depth, resolution time, SLA compliance. Target SLA: 5 minutes.';

-- =============================================================================
-- View 2: Agent Response Accuracy Metrics
-- =============================================================================
-- Purpose: Track response quality and safety by agent type
-- Usage: Dashboard tile showing accuracy trends per agent

CREATE OR REPLACE VIEW v_agent_response_accuracy AS
SELECT 
  agent,
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as total_queries,
  -- Approval metrics
  COUNT(*) FILTER (WHERE approved = true) as approved_count,
  COUNT(*) FILTER (WHERE approved = false) as rejected_count,
  COUNT(*) FILTER (WHERE approved IS NULL) as pending_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE approved = true) / NULLIF(COUNT(*), 0), 2) as approval_rate_pct,
  -- Human intervention metrics
  COUNT(*) FILTER (WHERE human_edited = true) as human_edited_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE human_edited = true) / NULLIF(COUNT(*), 0), 2) as human_edit_rate_pct,
  -- Performance metrics
  AVG(latency_ms) as avg_latency_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) as p50_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency_ms,
  MAX(latency_ms) as max_latency_ms,
  COUNT(*) FILTER (WHERE latency_ms > 100) as slow_queries_count,
  -- Quality score (composite: approval rate + low edit rate + good latency)
  ROUND(
    (
      COALESCE(100.0 * COUNT(*) FILTER (WHERE approved = true) / NULLIF(COUNT(*), 0), 0) * 0.5 +
      (100 - COALESCE(100.0 * COUNT(*) FILTER (WHERE human_edited = true) / NULLIF(COUNT(*), 0), 0)) * 0.3 +
      LEAST(100, 100 - COALESCE(AVG(latency_ms) / 10, 0)) * 0.2
    ),
    2
  ) as quality_score
FROM agent_queries
GROUP BY agent, DATE_TRUNC('day', created_at)
ORDER BY day DESC, agent;

COMMENT ON VIEW v_agent_response_accuracy IS 'Daily agent accuracy metrics: approval rates, human intervention, latency, quality score (0-100).';

-- =============================================================================
-- View 3: Training Data Quality Scores
-- =============================================================================
-- Purpose: Track quality annotations and safety judgments for training data
-- Usage: Dashboard tile showing training data health and annotation progress

CREATE OR REPLACE VIEW v_training_data_quality AS
SELECT 
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as total_feedback,
  -- Safety distribution
  COUNT(*) FILTER (WHERE safe_to_send = true) as safe_count,
  COUNT(*) FILTER (WHERE safe_to_send = false) as unsafe_count,
  COUNT(*) FILTER (WHERE safe_to_send IS NULL) as not_reviewed_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE safe_to_send = true) / NULLIF(COUNT(*), 0), 2) as safe_pct,
  ROUND(100.0 * COUNT(*) FILTER (WHERE safe_to_send = false) / NULLIF(COUNT(*), 0), 2) as unsafe_pct,
  -- Label distribution
  COUNT(*) FILTER (WHERE 'helpful' = ANY(labels)) as helpful_count,
  COUNT(*) FILTER (WHERE 'accurate' = ANY(labels)) as accurate_count,
  COUNT(*) FILTER (WHERE 'risky' = ANY(labels)) as risky_count,
  COUNT(*) FILTER (WHERE 'needs_improvement' = ANY(labels)) as needs_improvement_count,
  -- Annotator productivity
  COUNT(DISTINCT annotator) as active_annotators,
  ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT annotator), 0), 2) as avg_annotations_per_annotator,
  -- Rubric scores (average clarity, accuracy, tone from JSON)
  ROUND(AVG((rubric->>'clarity')::numeric), 2) as avg_clarity_score,
  ROUND(AVG((rubric->>'accuracy')::numeric), 2) as avg_accuracy_score,
  ROUND(AVG((rubric->>'tone')::numeric), 2) as avg_tone_score,
  ROUND(
    AVG(
      (
        COALESCE((rubric->>'clarity')::numeric, 0) +
        COALESCE((rubric->>'accuracy')::numeric, 0) +
        COALESCE((rubric->>'tone')::numeric, 0)
      ) / 3.0
    ),
    2
  ) as avg_overall_score
FROM agent_feedback
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;

COMMENT ON VIEW v_training_data_quality IS 'Daily training data quality: safety distribution, label counts, rubric scores (1-5 scale), annotator productivity.';

-- =============================================================================
-- View 4: Real-Time Agent Performance Dashboard
-- =============================================================================
-- Purpose: Current snapshot of agent performance for live monitoring
-- Usage: Dashboard homepage showing current state across all agents

CREATE OR REPLACE VIEW v_agent_performance_snapshot AS
SELECT 
  agent,
  -- Current status (last 1 hour)
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as queries_last_hour,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as queries_last_24h,
  -- Approval metrics (last 24h)
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE approved = true AND created_at > NOW() - INTERVAL '24 hours') / 
    NULLIF(COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'), 0),
    2
  ) as approval_rate_24h_pct,
  -- Performance metrics (last 24h)
  ROUND(AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'), 2) as avg_latency_24h_ms,
  -- Human intervention (last 24h)
  COUNT(*) FILTER (WHERE human_edited = true AND created_at > NOW() - INTERVAL '24 hours') as human_edits_24h,
  -- Health indicators
  CASE 
    WHEN AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') > 200 THEN 'degraded'
    WHEN AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') > 100 THEN 'warning'
    ELSE 'healthy'
  END as health_status,
  -- Last query timestamp
  MAX(created_at) as last_query_at,
  EXTRACT(EPOCH FROM (NOW() - MAX(created_at))) / 60 as minutes_since_last_query
FROM agent_queries
GROUP BY agent
ORDER BY queries_last_hour DESC;

COMMENT ON VIEW v_agent_performance_snapshot IS 'Real-time agent performance snapshot: query volume, approval rate, latency, health status.';

-- =============================================================================
-- View 5: Approval Queue Real-Time Status
-- =============================================================================
-- Purpose: Current approval queue status for operations monitoring
-- Usage: Operations dashboard showing queue health and bottlenecks

CREATE OR REPLACE VIEW v_approval_queue_status AS
SELECT 
  status,
  COUNT(*) as count,
  -- Age distribution
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) as avg_age_minutes,
  MIN(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) as min_age_minutes,
  MAX(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) as max_age_minutes,
  -- SLA breach detection (>5 minutes for pending)
  COUNT(*) FILTER (WHERE status = 'pending' AND created_at < NOW() - INTERVAL '5 minutes') as sla_breaches,
  -- Oldest pending conversation
  (
    SELECT conversation_id 
    FROM agent_approvals 
    WHERE status = 'pending' 
    ORDER BY created_at ASC 
    LIMIT 1
  ) as oldest_pending_conversation_id,
  -- Recent activity
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as created_last_hour,
  COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '1 hour') as updated_last_hour
FROM agent_approvals
GROUP BY status
ORDER BY 
  CASE status 
    WHEN 'pending' THEN 1 
    WHEN 'approved' THEN 2 
    WHEN 'rejected' THEN 3 
    WHEN 'expired' THEN 4 
  END;

COMMENT ON VIEW v_approval_queue_status IS 'Real-time approval queue status: count by status, age distribution, SLA breaches, recent activity.';

-- =============================================================================
-- View 6: Training Data Annotation Progress
-- =============================================================================
-- Purpose: Track annotation progress for training data pipeline
-- Usage: QA dashboard showing annotation backlog and quality

CREATE OR REPLACE VIEW v_annotation_progress AS
SELECT 
  annotator,
  COUNT(*) as total_annotations,
  COUNT(*) FILTER (WHERE safe_to_send = true) as safe_annotations,
  COUNT(*) FILTER (WHERE safe_to_send = false) as unsafe_annotations,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as annotations_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as annotations_7d,
  -- Quality metrics
  ROUND(AVG((rubric->>'clarity')::numeric), 2) as avg_clarity,
  ROUND(AVG((rubric->>'accuracy')::numeric), 2) as avg_accuracy,
  ROUND(AVG((rubric->>'tone')::numeric), 2) as avg_tone,
  -- Consistency (standard deviation of overall scores)
  ROUND(
    STDDEV(
      (
        COALESCE((rubric->>'clarity')::numeric, 0) +
        COALESCE((rubric->>'accuracy')::numeric, 0) +
        COALESCE((rubric->>'tone')::numeric, 0)
      ) / 3.0
    ),
    2
  ) as score_consistency,
  -- Last annotation
  MAX(created_at) as last_annotation_at
FROM agent_feedback
WHERE annotator IS NOT NULL
GROUP BY annotator
ORDER BY total_annotations DESC;

COMMENT ON VIEW v_annotation_progress IS 'Annotator productivity and quality: annotation counts, rubric scores, consistency metrics.';

-- =============================================================================
-- Materialized View: Daily Agent Metrics Rollup
-- =============================================================================
-- Purpose: Pre-computed daily metrics for historical analysis
-- Refresh: Nightly at 01:00 UTC

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_agent_metrics AS
WITH daily_queries AS (
  SELECT 
    DATE_TRUNC('day', created_at) as day,
    agent,
    COUNT(*) as total_queries,
    COUNT(*) FILTER (WHERE approved = true) as approved_queries,
    COUNT(*) FILTER (WHERE human_edited = true) as edited_queries,
    AVG(latency_ms) as avg_latency_ms
  FROM agent_queries
  GROUP BY DATE_TRUNC('day', created_at), agent
),
daily_approvals AS (
  SELECT 
    DATE_TRUNC('day', created_at) as day,
    COUNT(*) as approval_requests,
    COUNT(*) FILTER (WHERE status = 'approved') as approvals_granted
  FROM agent_approvals
  GROUP BY DATE_TRUNC('day', created_at)
),
daily_feedback AS (
  SELECT 
    DATE_TRUNC('day', created_at) as day,
    COUNT(*) as feedback_collected,
    COUNT(*) FILTER (WHERE safe_to_send = false) as unsafe_responses
  FROM agent_feedback
  GROUP BY DATE_TRUNC('day', created_at)
)
SELECT 
  q.day,
  q.agent,
  q.total_queries,
  q.approved_queries,
  q.edited_queries,
  q.avg_latency_ms,
  COALESCE(a.approval_requests, 0) as approval_requests,
  COALESCE(a.approvals_granted, 0) as approvals_granted,
  COALESCE(f.feedback_collected, 0) as feedback_collected,
  COALESCE(f.unsafe_responses, 0) as unsafe_responses
FROM daily_queries q
LEFT JOIN daily_approvals a ON q.day = a.day
LEFT JOIN daily_feedback f ON q.day = f.day
ORDER BY q.day DESC, q.agent;

CREATE UNIQUE INDEX IF NOT EXISTS mv_daily_agent_metrics_day_agent_idx 
  ON mv_daily_agent_metrics (day, agent);

COMMENT ON MATERIALIZED VIEW mv_daily_agent_metrics IS 'Pre-computed daily agent metrics. Refresh nightly via pg_cron.';

-- =============================================================================
-- Refresh Function for Materialized View
-- =============================================================================

CREATE OR REPLACE FUNCTION refresh_daily_agent_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_agent_metrics;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_daily_agent_metrics IS 'Refresh daily agent metrics materialized view. Call from pg_cron nightly.';

-- =============================================================================
-- Grant Permissions
-- =============================================================================

GRANT SELECT ON v_approval_queue_depth TO authenticated;
GRANT SELECT ON v_agent_response_accuracy TO authenticated;
GRANT SELECT ON v_training_data_quality TO authenticated;
GRANT SELECT ON v_agent_performance_snapshot TO authenticated;
GRANT SELECT ON v_approval_queue_status TO authenticated;
GRANT SELECT ON v_annotation_progress TO authenticated;
GRANT SELECT ON mv_daily_agent_metrics TO authenticated;

-- =============================================================================
-- Sample Queries for Dashboard Tiles
-- =============================================================================

-- Dashboard Tile 1: Approval Queue Depth (Last 24 Hours)
-- SELECT * FROM v_approval_queue_depth 
-- WHERE hour > NOW() - INTERVAL '24 hours'
-- ORDER BY hour DESC;

-- Dashboard Tile 2: Agent Accuracy Comparison (Last 7 Days)
-- SELECT agent, AVG(approval_rate_pct) as avg_approval_rate, AVG(quality_score) as avg_quality
-- FROM v_agent_response_accuracy
-- WHERE day > NOW() - INTERVAL '7 days'
-- GROUP BY agent
-- ORDER BY avg_quality DESC;

-- Dashboard Tile 3: Training Data Health (Today)
-- SELECT * FROM v_training_data_quality
-- WHERE day = CURRENT_DATE;

-- Dashboard Tile 4: Real-Time Performance
-- SELECT * FROM v_agent_performance_snapshot;

-- Dashboard Tile 5: Queue Alerts (SLA Breaches)
-- SELECT * FROM v_approval_queue_status WHERE sla_breaches > 0;

-- Dashboard Tile 6: Annotation Productivity
-- SELECT * FROM v_annotation_progress WHERE annotations_24h > 0;

