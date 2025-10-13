-- Approval Queue Metrics
-- Purpose: Track approval queue usage and decision speed
-- Usage: psql $DATABASE_URL -f approval_queue_metrics.sql

SELECT 
  approval_type,
  COUNT(*) as total_actions,
  COUNT(DISTINCT user_id) as unique_approvers,
  COUNT(DISTINCT session_id) as sessions_with_approvals,
  COUNT(*) FILTER (WHERE action = 'approve') as approved,
  COUNT(*) FILTER (WHERE action = 'reject') as rejected,
  COUNT(*) FILTER (WHERE action = 'defer') as deferred,
  COUNT(*) FILTER (WHERE action = 'edit') as edited,
  ROUND(AVG(time_to_decision_seconds), 1) as avg_decision_seconds,
  MIN(time_to_decision_seconds) as fastest_decision_seconds,
  MAX(time_to_decision_seconds) as slowest_decision_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_to_decision_seconds) as median_decision_seconds,
  MIN(approved_at) as first_approval,
  MAX(approved_at) as last_approval
FROM approval_actions
WHERE customer_id = 'hot-rodan'
  AND DATE(approved_at) = CURRENT_DATE
GROUP BY approval_type
ORDER BY total_actions DESC;
