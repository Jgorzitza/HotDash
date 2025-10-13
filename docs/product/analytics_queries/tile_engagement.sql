-- Tile Engagement Summary
-- Purpose: Track which tiles CEO is using
-- Usage: psql $DATABASE_URL -f tile_engagement.sql

SELECT 
  tile_name,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT session_id) as sessions_with_tile,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE interaction_type = 'view') as views,
  COUNT(*) FILTER (WHERE interaction_type = 'click') as clicks,
  COUNT(*) FILTER (WHERE interaction_type = 'expand') as expands,
  COUNT(*) FILTER (WHERE interaction_type = 'refresh') as refreshes,
  COUNT(*) FILTER (WHERE interaction_type = 'export') as exports,
  MIN(interaction_at) as first_interaction,
  MAX(interaction_at) as last_interaction,
  EXTRACT(EPOCH FROM (MAX(interaction_at) - MIN(interaction_at))) / 60.0 as engagement_span_minutes
FROM tile_interactions
WHERE customer_id = 'hot-rodan'
  AND DATE(interaction_at) = CURRENT_DATE
GROUP BY tile_name
ORDER BY total_interactions DESC;
