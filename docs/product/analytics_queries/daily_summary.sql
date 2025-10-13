-- Daily Summary Report
-- Purpose: Complete end-of-day analytics summary
-- Usage: psql $DATABASE_URL -f daily_summary.sql

\echo '=== CEO ACTIVITY SUMMARY ==='
SELECT 
  'Sessions' as metric,
  COUNT(DISTINCT session_id)::text as value
FROM dashboard_sessions
WHERE customer_id = 'hot-rodan' AND DATE(login_at) = CURRENT_DATE
UNION ALL
SELECT 
  'Total Time (minutes)',
  ROUND(SUM(session_duration_seconds) / 60.0, 1)::text
FROM dashboard_sessions
WHERE customer_id = 'hot-rodan' AND DATE(login_at) = CURRENT_DATE
UNION ALL
SELECT 
  'Avg Session (minutes)',
  ROUND(AVG(session_duration_seconds) / 60.0, 1)::text
FROM dashboard_sessions
WHERE customer_id = 'hot-rodan' AND DATE(login_at) = CURRENT_DATE AND logout_at IS NOT NULL
UNION ALL
SELECT 
  'Devices Used',
  STRING_AGG(DISTINCT device_type, ', ' ORDER BY device_type)
FROM dashboard_sessions
WHERE customer_id = 'hot-rodan' AND DATE(login_at) = CURRENT_DATE;

\echo ''
\echo '=== TILE ENGAGEMENT ==='
SELECT 
  tile_name,
  COUNT(*) as interactions,
  COUNT(*) FILTER (WHERE interaction_type = 'view') as views,
  COUNT(*) FILTER (WHERE interaction_type = 'click') as clicks,
  COUNT(*) FILTER (WHERE interaction_type = 'refresh') as refreshes
FROM tile_interactions
WHERE customer_id = 'hot-rodan' AND DATE(interaction_at) = CURRENT_DATE
GROUP BY tile_name
ORDER BY interactions DESC;

\echo ''
\echo '=== APPROVAL QUEUE ==='
SELECT 
  approval_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE action = 'approve') as approved,
  COUNT(*) FILTER (WHERE action = 'reject') as rejected,
  ROUND(AVG(time_to_decision_seconds), 1) as avg_seconds
FROM approval_actions
WHERE customer_id = 'hot-rodan' AND DATE(approved_at) = CURRENT_DATE
GROUP BY approval_type
ORDER BY total DESC;
