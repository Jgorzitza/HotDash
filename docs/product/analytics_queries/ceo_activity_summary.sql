-- CEO Activity Summary
-- Purpose: Monitor CEO dashboard usage in real-time
-- Usage: psql $DATABASE_URL -f ceo_activity_summary.sql

SELECT 
  COUNT(DISTINCT session_id) as total_sessions,
  MIN(login_at) as first_login_time,
  MAX(CASE WHEN logout_at IS NOT NULL THEN logout_at END) as last_logout_time,
  AVG(session_duration_seconds) as avg_session_seconds,
  SUM(session_duration_seconds) as total_time_seconds,
  ROUND(SUM(session_duration_seconds) / 60.0, 1) as total_time_minutes,
  STRING_AGG(DISTINCT device_type, ', ' ORDER BY device_type) as devices_used,
  COUNT(*) FILTER (WHERE device_type = 'mobile') as mobile_sessions,
  COUNT(*) FILTER (WHERE device_type = 'desktop') as desktop_sessions,
  COUNT(*) FILTER (WHERE device_type = 'tablet') as tablet_sessions,
  COUNT(*) FILTER (WHERE logout_at IS NOT NULL) as completed_sessions,
  COUNT(*) FILTER (WHERE logout_at IS NULL) as active_sessions
FROM dashboard_sessions
WHERE customer_id = 'hot-rodan'
  AND DATE(login_at) = CURRENT_DATE;
