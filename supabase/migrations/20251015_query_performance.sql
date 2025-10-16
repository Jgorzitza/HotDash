-- Query Performance Monitoring
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: Backlog 20 - Query performance dashboard

-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================================================
-- Query Performance Stats View
-- ============================================================================

CREATE OR REPLACE VIEW public.v_query_performance AS
SELECT 
  queryid,
  LEFT(query, 100) as query_preview,
  calls,
  total_exec_time / 1000 as total_time_seconds,
  mean_exec_time as avg_time_ms,
  min_exec_time as min_time_ms,
  max_exec_time as max_time_ms,
  stddev_exec_time as stddev_time_ms,
  rows,
  100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) AS cache_hit_ratio
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 100;

GRANT SELECT ON public.v_query_performance TO authenticated, service_role;
COMMENT ON VIEW public.v_query_performance IS 'Top 100 queries by total execution time';

-- ============================================================================
-- Slow Queries View (> 100ms)
-- ============================================================================

CREATE OR REPLACE VIEW public.v_slow_queries AS
SELECT 
  queryid,
  LEFT(query, 200) as query_preview,
  calls,
  mean_exec_time as avg_time_ms,
  max_exec_time as max_time_ms,
  total_exec_time / 1000 as total_time_seconds,
  rows / NULLIF(calls, 0) as avg_rows_per_call
FROM pg_stat_statements
WHERE mean_exec_time > 100
  AND query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 50;

GRANT SELECT ON public.v_slow_queries TO authenticated, service_role;
COMMENT ON VIEW public.v_slow_queries IS 'Queries with average execution time > 100ms';

-- ============================================================================
-- Table Statistics View
-- ============================================================================

CREATE OR REPLACE VIEW public.v_table_stats AS
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

GRANT SELECT ON public.v_table_stats TO authenticated, service_role;
COMMENT ON VIEW public.v_table_stats IS 'Table size and activity statistics';

-- ============================================================================
-- Index Usage View
-- ============================================================================

CREATE OR REPLACE VIEW public.v_index_usage AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  CASE 
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 100 THEN 'LOW_USAGE'
    ELSE 'ACTIVE'
  END as usage_status
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

GRANT SELECT ON public.v_index_usage TO authenticated, service_role;
COMMENT ON VIEW public.v_index_usage IS 'Index usage statistics - identify unused indexes';

-- ============================================================================
-- RPC: Get Query Performance Dashboard
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_query_performance_dashboard()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_slow_queries JSONB;
  v_top_tables JSONB;
  v_unused_indexes JSONB;
BEGIN
  -- Get slow queries
  SELECT jsonb_agg(row_to_json(q))
  INTO v_slow_queries
  FROM (SELECT * FROM v_slow_queries LIMIT 10) q;
  
  -- Get top tables by size
  SELECT jsonb_agg(row_to_json(t))
  INTO v_top_tables
  FROM (SELECT * FROM v_table_stats LIMIT 10) t;
  
  -- Get unused indexes
  SELECT jsonb_agg(row_to_json(i))
  INTO v_unused_indexes
  FROM (SELECT * FROM v_index_usage WHERE usage_status = 'UNUSED' LIMIT 10) i;
  
  v_result := jsonb_build_object(
    'slow_queries', COALESCE(v_slow_queries, '[]'::jsonb),
    'top_tables', COALESCE(v_top_tables, '[]'::jsonb),
    'unused_indexes', COALESCE(v_unused_indexes, '[]'::jsonb),
    'generated_at', NOW()
  );
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_query_performance_dashboard TO authenticated, service_role;
COMMENT ON FUNCTION public.get_query_performance_dashboard IS 'Get comprehensive query performance dashboard data';

-- ============================================================================
-- RPC: Reset Query Stats
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reset_query_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM pg_stat_statements_reset();
  
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Query statistics reset',
    'reset_at', NOW()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_query_stats TO service_role;
COMMENT ON FUNCTION public.reset_query_stats IS 'Reset pg_stat_statements (service_role only)';

