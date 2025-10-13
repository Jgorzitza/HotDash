-- =====================================================
-- Dashboard Tile Query Performance Tests
-- Purpose: Verify all 5 dashboard tiles meet < 200ms target
-- =====================================================

\timing on

-- =====================================================
-- TILE 1: Sales Pulse (Target: < 100ms)
-- =====================================================
\echo '=== TILE 1: Sales Pulse ==='
EXPLAIN ANALYZE
SELECT 
  date,
  total_revenue,
  total_orders,
  avg_order_value,
  revenue_vs_last_week_pct,
  fulfillment_rate_pct
FROM v_sales_pulse_30d
LIMIT 7;

-- =====================================================
-- TILE 2: Inventory Alerts (Target: < 150ms)
-- =====================================================
\echo ''
\echo '=== TILE 2: Inventory Alerts ==='
EXPLAIN ANALYZE
SELECT 
  sku,
  quantity_available,
  stock_status,
  velocity_tier
FROM v_inventory_alerts
LIMIT 10;

-- =====================================================
-- TILE 3: Customer Segments (Target: < 100ms)
-- =====================================================
\echo ''
\echo '=== TILE 3: Customer Segments ==='
EXPLAIN ANALYZE
SELECT 
  primary_segment,
  lifecycle_stage,
  customer_count,
  segment_orders,
  segment_revenue
FROM v_customer_segment_summary
ORDER BY segment_revenue DESC;

-- =====================================================
-- TILE 4: Agent Queue Status (Target: < 50ms)
-- =====================================================
\echo ''
\echo '=== TILE 4: Agent Queue Status ==='
EXPLAIN ANALYZE
SELECT 
  pending_count,
  urgent_count,
  avg_confidence,
  approved_today
FROM mv_agent_queue_realtime;

-- =====================================================
-- TILE 5: Agent Performance (Target: < 100ms)
-- =====================================================
\echo ''
\echo '=== TILE 5: Agent Performance ==='
EXPLAIN ANALYZE
SELECT 
  agent,
  query_count_1h,
  avg_latency_ms,
  p95_latency_ms
FROM mv_query_performance_live
ORDER BY avg_latency_ms ASC;

-- =====================================================
-- Summary Report
-- =====================================================
\echo ''
\echo '=== PERFORMANCE SUMMARY ==='
SELECT 
  'Dashboard Tile Performance Test' as test_name,
  'Target: All tiles < 200ms' as target,
  'Materialized views should be < 50ms' as note,
  NOW() as tested_at;

-- Verify all views exist
SELECT 
  viewname,
  CASE 
    WHEN viewname LIKE 'mv_%' THEN 'Materialized'
    ELSE 'Standard'
  END as view_type,
  'Ready' as status
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN (
  'v_sales_pulse_30d',
  'v_inventory_alerts',
  'v_customer_segment_summary',
  'mv_agent_queue_realtime',
  'mv_query_performance_live'
)
ORDER BY view_type, viewname;

