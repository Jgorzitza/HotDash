-- =============================================================================
-- Dashboard Tile Queries - Real-time Analytics
-- Created: 2025-10-12
-- Purpose: Fast queries for dashboard tiles using materialized views
-- =============================================================================

-- =============================================================================
-- TILE 1: Current Queue Status (Real-time, < 100ms)
-- =============================================================================
-- Shows: Pending approvals, urgent items, average confidence, oldest pending age
SELECT 
  pending_count,
  urgent_count,
  avg_confidence,
  CASE 
    WHEN oldest_pending IS NULL THEN 0
    ELSE EXTRACT(EPOCH FROM (NOW() - oldest_pending))/60
  END as oldest_age_minutes,
  approved_today,
  rejected_today,
  refreshed_at
FROM mv_agent_queue_realtime;

-- Expected response time: 50-100ms
-- Freshness: < 1 second (trigger-updated)

-- =============================================================================
-- TILE 2: Hourly Approval Rate Chart (< 200ms)
-- =============================================================================
-- Shows: 24-hour approval rate trend with total drafts
SELECT 
  window_start,
  approval_rate_pct,
  total_drafts,
  approved_count,
  avg_confidence
FROM mv_agent_accuracy_rolling
WHERE window_start > NOW() - INTERVAL '24 hours'
ORDER BY window_start;

-- Expected response time: 100-200ms
-- Freshness: < 15 minutes (scheduled refresh)

-- =============================================================================
-- TILE 3: Agent Performance Leaderboard (< 150ms)
-- =============================================================================
-- Shows: Agent performance ranked by latency
SELECT 
  agent,
  query_count_1h,
  avg_latency_ms,
  p95_latency_ms,
  slow_query_count,
  CASE 
    WHEN avg_latency_ms < 200 THEN 'excellent'
    WHEN avg_latency_ms < 500 THEN 'good'
    WHEN avg_latency_ms < 1000 THEN 'fair'
    ELSE 'needs_attention'
  END as performance_rating,
  refreshed_at
FROM mv_query_performance_live
ORDER BY avg_latency_ms ASC;

-- Expected response time: 50-150ms
-- Freshness: < 1 minute (scheduled refresh)

-- =============================================================================
-- TILE 4: Training Data Quality Score (< 100ms)
-- =============================================================================
-- Shows: Recent training data quality metrics
SELECT 
  COUNT(*) as total_annotations,
  ROUND(AVG((rubric->>'clarity')::int), 2) as avg_clarity,
  ROUND(AVG((rubric->>'accuracy')::int), 2) as avg_accuracy,
  ROUND(AVG((rubric->>'helpfulness')::int), 2) as avg_helpfulness,
  ROUND(AVG((rubric->>'tone')::int), 2) as avg_tone,
  COUNT(*) FILTER (WHERE "safeToSend" = false) as flagged_unsafe,
  COUNT(DISTINCT annotator) as active_annotators
FROM "AgentFeedback"
WHERE "createdAt" > NOW() - INTERVAL '7 days'
AND rubric IS NOT NULL;

-- Expected response time: 50-100ms
-- Freshness: Real-time (direct table query, low volume)

-- =============================================================================
-- TILE 5: Approval Queue Trend (Last 7 Days) (< 300ms)
-- =============================================================================
-- Shows: Daily approval volume and rates
SELECT 
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as total_drafts,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE status = 'pending') as still_pending,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'approved') / NULLIF(COUNT(*), 0), 2) as approval_rate_pct
FROM agent_approvals
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day;

-- Expected response time: 200-300ms
-- Freshness: Real-time (acceptable latency for historical view)

-- =============================================================================
-- TILE 6: High Confidence Pending Approvals (< 200ms)
-- =============================================================================
-- Shows: Pending items with confidence >= 90% (likely safe to auto-approve)
SELECT 
  id,
  conversation_id,
  customer_name,
  confidence_score,
  priority,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as pending_minutes,
  ARRAY_LENGTH(suggested_tags, 1) as tag_count
FROM agent_approvals
WHERE status = 'pending'
AND confidence_score >= 90
ORDER BY created_at ASC
LIMIT 10;

-- Expected response time: 100-200ms
-- Freshness: Real-time
-- Use case: Quick review queue for operators

-- =============================================================================
-- TILE 7: Recent Escalations (< 150ms)
-- =============================================================================
-- Shows: Low confidence items that need human review
SELECT 
  id,
  conversation_id,
  customer_name,
  confidence_score,
  priority,
  recommended_action,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as age_minutes
FROM agent_approvals
WHERE status = 'pending'
AND (confidence_score < 70 OR recommended_action = 'escalate')
ORDER BY 
  CASE priority 
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    ELSE 4
  END,
  created_at ASC
LIMIT 10;

-- Expected response time: 100-150ms
-- Freshness: Real-time
-- Use case: Urgent review queue

-- =============================================================================
-- TILE 8: Agent Improvement Over Time (< 250ms)
-- =============================================================================
-- Shows: How agent quality is improving via learning data
SELECT 
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as approvals_count,
  AVG(confidence_score) as avg_confidence,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'approved') / NULLIF(COUNT(*), 0), 2) as approval_rate_pct
FROM agent_approvals
WHERE created_at > NOW() - INTERVAL '8 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week;

-- Expected response time: 150-250ms
-- Freshness: Daily (historical trend)
-- Use case: Show agent is getting smarter over time

-- =============================================================================
-- REFRESH SCHEDULE (pg_cron)
-- =============================================================================
-- To be implemented:
/*
-- Every minute: Query performance view
SELECT cron.schedule('refresh-query-perf', '* * * * *', 
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_query_performance_live$$);

-- Every 15 minutes: Accuracy rolling view  
SELECT cron.schedule('refresh-accuracy', '*/15 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_agent_accuracy_rolling$$);

-- Queue view: Refreshed by trigger (real-time)
*/

-- =============================================================================
-- MONITORING QUERIES
-- =============================================================================

-- Check materialized view freshness
SELECT 
  'mv_agent_queue_realtime' as view_name,
  refreshed_at,
  EXTRACT(EPOCH FROM (NOW() - refreshed_at)) as seconds_old
FROM mv_agent_queue_realtime
UNION ALL
SELECT 
  'mv_query_performance_live' as view_name,
  refreshed_at,
  EXTRACT(EPOCH FROM (NOW() - refreshed_at)) as seconds_old
FROM mv_query_performance_live
LIMIT 1;

-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM mv_agent_queue_realtime;

