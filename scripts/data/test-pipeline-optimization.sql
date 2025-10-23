-- Data Pipeline Optimization Testing Script
-- Description: Comprehensive testing of Growth Engine data pipeline optimization system
-- Date: 2025-10-22
-- Agent: data
-- Task: QA-REVIEW-DATA-001

-- =============================================================================
-- 1. Test Table Existence and Structure
-- =============================================================================
SELECT 'Testing table existence and structure...' AS test_phase;

-- Check if all pipeline tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'data_pipeline_jobs',
      'real_time_data_streams', 
      'analytics_aggregations',
      'performance_metrics'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'data_pipeline_jobs',
    'real_time_data_streams',
    'analytics_aggregations', 
    'performance_metrics'
  );

-- =============================================================================
-- 2. Test Function Existence
-- =============================================================================
SELECT 'Testing function existence...' AS test_phase;

SELECT 
  proname AS function_name,
  CASE 
    WHEN proname IN (
      'optimize_pipeline_performance',
      'process_realtime_stream',
      'compute_analytics_aggregation',
      'get_pipeline_performance_metrics'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END AS status
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname IN (
    'optimize_pipeline_performance',
    'process_realtime_stream', 
    'compute_analytics_aggregation',
    'get_pipeline_performance_metrics'
  );

-- =============================================================================
-- 3. Test RLS Policies
-- =============================================================================
SELECT 'Testing RLS policies...' AS test_phase;

SELECT 
  tablename,
  policyname,
  CASE 
    WHEN policyname LIKE '%authenticated%' OR policyname LIKE '%operators%' OR policyname LIKE '%system%'
    THEN '✅ SECURE'
    ELSE '❌ INSECURE'
  END AS security_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'data_pipeline_jobs',
    'real_time_data_streams',
    'analytics_aggregations',
    'performance_metrics'
  );

-- =============================================================================
-- 4. Test Indexes for Performance
-- =============================================================================
SELECT 'Testing performance indexes...' AS test_phase;

SELECT 
  indexname,
  tablename,
  CASE 
    WHEN indexname LIKE '%idx_%' OR indexname LIKE '%_idx'
    THEN '✅ OPTIMIZED'
    ELSE '❌ NEEDS INDEX'
  END AS performance_status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'data_pipeline_jobs',
    'real_time_data_streams',
    'analytics_aggregations',
    'performance_metrics'
  );

-- =============================================================================
-- 5. Test Data Pipeline Job Creation
-- =============================================================================
SELECT 'Testing data pipeline job creation...' AS test_phase;

-- Test creating a sample pipeline job
INSERT INTO data_pipeline_jobs (
  job_name,
  job_type,
  pipeline_stage,
  job_config,
  data_sources,
  output_targets,
  processing_rules,
  batch_size,
  max_parallel_workers,
  timeout_seconds,
  retry_attempts,
  priority,
  status
) VALUES (
  'test_analytics_job',
  'analytics',
  'aggregation',
  '{"window_size": 3600, "aggregation_type": "sum"}',
  '[{"type": "database", "table": "sales_data"}]',
  '[{"type": "dashboard", "target": "analytics_dashboard"}]',
  '{"filter": "status = active", "group_by": ["category", "region"]}',
  1000,
  4,
  3600,
  3,
  5,
  'pending'
) RETURNING id, job_name, status;

-- =============================================================================
-- 6. Test Real-time Stream Creation
-- =============================================================================
SELECT 'Testing real-time stream creation...' AS test_phase;

-- Test creating a sample real-time stream
INSERT INTO real_time_data_streams (
  stream_name,
  stream_type,
  data_schema,
  processing_mode,
  window_size_seconds,
  watermark_delay_seconds,
  output_format,
  compression_enabled,
  max_throughput_per_second,
  buffer_size_mb,
  flush_interval_ms,
  is_active
) VALUES (
  'test_user_events',
  'events',
  '{"type": "object", "properties": {"user_id": {"type": "string"}, "event_type": {"type": "string"}, "timestamp": {"type": "string"}}}',
  'streaming',
  60,
  10,
  'json',
  true,
  10000,
  100,
  1000,
  true
) RETURNING id, stream_name, stream_type, is_active;

-- =============================================================================
-- 7. Test Analytics Aggregation
-- =============================================================================
SELECT 'Testing analytics aggregation...' AS test_phase;

-- Test creating a sample analytics aggregation
INSERT INTO analytics_aggregations (
  aggregation_name,
  aggregation_type,
  metric_name,
  dimension_keys,
  time_window_type,
  window_size_minutes,
  window_offset_minutes,
  source_tables,
  filter_conditions,
  aggregation_key,
  aggregation_value,
  window_start,
  window_end
) VALUES (
  'test_revenue_aggregation',
  'sum',
  'total_revenue',
  '["category", "region"]',
  'rolling',
  60,
  0,
  '[{"table": "sales_data", "join_key": "order_id"}]',
  '{"status": "completed"}',
  'category_electronics_region_us',
  125000.50,
  NOW() - INTERVAL '1 hour',
  NOW()
) RETURNING id, aggregation_name, aggregation_type, aggregation_value;

-- =============================================================================
-- 8. Test Performance Metrics
-- =============================================================================
SELECT 'Testing performance metrics...' AS test_phase;

-- Test creating sample performance metrics
INSERT INTO performance_metrics (
  metric_name,
  metric_category,
  component_name,
  metric_value,
  metric_unit,
  context_data,
  tags
) VALUES 
  ('throughput', 'throughput', 'data_pipeline', 1000.5, 'records/sec', '{"job_name": "test_job"}', '["production", "analytics"]'),
  ('latency', 'latency', 'data_pipeline', 250.0, 'ms', '{"job_name": "test_job"}', '["production", "analytics"]'),
  ('memory_usage', 'memory', 'data_pipeline', 512.0, 'MB', '{"job_name": "test_job"}', '["production", "analytics"]'),
  ('error_rate', 'error_rate', 'data_pipeline', 0.5, 'percent', '{"job_name": "test_job"}', '["production", "analytics"]')
RETURNING metric_name, metric_category, metric_value, metric_unit;

-- =============================================================================
-- 9. Test Function Calls
-- =============================================================================
SELECT 'Testing function calls...' AS test_phase;

-- Test optimize_pipeline_performance function (with a dummy job ID)
SELECT optimize_pipeline_performance('00000000-0000-0000-0000-000000000000'::UUID) AS optimization_result;

-- Test process_realtime_stream function (with a dummy stream ID)
SELECT process_realtime_stream('00000000-0000-0000-0000-000000000000'::UUID, '{"test": "data"}'::JSONB) AS stream_result;

-- Test compute_analytics_aggregation function
SELECT compute_analytics_aggregation(
  'test_revenue_aggregation',
  NOW() - INTERVAL '1 hour',
  NOW()
) AS aggregation_result;

-- Test get_pipeline_performance_metrics function (with a dummy job ID)
SELECT get_pipeline_performance_metrics('00000000-0000-0000-0000-000000000000'::UUID, 24) AS metrics_result;

-- =============================================================================
-- 10. Cleanup Test Data
-- =============================================================================
SELECT 'Cleaning up test data...' AS test_phase;

-- Clean up test data
DELETE FROM performance_metrics WHERE component_name = 'data_pipeline' AND context_data->>'job_name' = 'test_job';
DELETE FROM analytics_aggregations WHERE aggregation_name = 'test_revenue_aggregation';
DELETE FROM real_time_data_streams WHERE stream_name = 'test_user_events';
DELETE FROM data_pipeline_jobs WHERE job_name = 'test_analytics_job';

SELECT 'Data pipeline optimization testing completed successfully!' AS final_status;
