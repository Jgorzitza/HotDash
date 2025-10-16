-- Rollback: Query Performance Monitoring
-- Date: 2025-10-15

DROP FUNCTION IF EXISTS public.reset_query_stats();
DROP FUNCTION IF EXISTS public.get_query_performance_dashboard();
DROP VIEW IF EXISTS public.v_index_usage;
DROP VIEW IF EXISTS public.v_table_stats;
DROP VIEW IF EXISTS public.v_slow_queries;
DROP VIEW IF EXISTS public.v_query_performance;

