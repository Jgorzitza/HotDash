-- ================================================================
-- Data Quality Monitoring Framework
-- P0 Task 3: Comprehensive quality checks for Hot Rod AN
-- Created: 2025-10-12
-- ================================================================

-- 1. Enhanced Data Quality Checks View
-- ================================================================

-- Expand existing v_data_quality_checks with more comprehensive validations
CREATE OR REPLACE VIEW v_data_quality_comprehensive AS
WITH quality_checks AS (
  -- Check 1: Missing revenue data
  SELECT 
    'Missing Daily Revenue' as check_category,
    'CRITICAL' as severity,
    COUNT(*) as issue_count,
    'sales_metrics_daily' as affected_table,
    ARRAY_AGG(date ORDER BY date DESC) FILTER (WHERE total_revenue IS NULL OR total_revenue = 0) as affected_dates
  FROM sales_metrics_daily
  WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    AND (total_revenue IS NULL OR total_revenue = 0)
  
  UNION ALL
  
  -- Check 2: Negative inventory
  SELECT 
    'Negative Inventory' as check_category,
    'HIGH' as severity,
    COUNT(*) as issue_count,
    'inventory_snapshots' as affected_table,
    ARRAY_AGG(DISTINCT sku ORDER BY sku) as affected_skus
  FROM inventory_snapshots
  WHERE snapshot_date >= CURRENT_DATE - INTERVAL '7 days'
    AND quantity_available < 0
  
  UNION ALL
  
  -- Check 3: Missing customer segments
  SELECT 
    'Missing Customer Segment' as check_category,
    'MEDIUM' as severity,
    COUNT(*) as issue_count,
    'customer_segments' as affected_table,
    ARRAY_AGG(shopify_customer_id::TEXT) as affected_ids
  FROM customer_segments
  WHERE primary_segment IS NULL
  
  UNION ALL
  
  -- Check 4: Future dates (data integrity issue)
  SELECT 
    'Future Date Detected' as check_category,
    'CRITICAL' as severity,
    COUNT(*) as issue_count,
    'sales_metrics_daily' as affected_table,
    ARRAY_AGG(date::TEXT ORDER BY date DESC) as affected_dates
  FROM sales_metrics_daily
  WHERE date > CURRENT_DATE
  
  UNION ALL
  
  -- Check 5: Orphaned SKU performance records
  SELECT 
    'Orphaned SKU Records' as check_category,
    'LOW' as severity,
    COUNT(*) as issue_count,
    'sku_performance' as affected_table,
    ARRAY_AGG(DISTINCT sku) as affected_skus
  FROM sku_performance sp
  WHERE NOT EXISTS (
    SELECT 1 FROM inventory_snapshots invs
    WHERE invs.sku = sp.sku
  )
  
  UNION ALL
  
  -- Check 6: SLA breach data completeness
  SELECT 
    'Missing SLA Timestamps' as check_category,
    'HIGH' as severity,
    COUNT(*) as issue_count,
    'cx_conversations' as affected_table,
    ARRAY_AGG(chatwoot_conversation_id::TEXT) as affected_ids
  FROM cx_conversations
  WHERE is_sla_breach = true 
    AND (first_response_at IS NULL OR first_response_time_minutes IS NULL)
  
  UNION ALL
  
  -- Check 7: Fulfillment data consistency
  SELECT 
    'Fulfillment Status Mismatch' as check_category,
    'MEDIUM' as severity,
    COUNT(*) as issue_count,
    'fulfillment_tracking' as affected_table,
    ARRAY_AGG(order_number) as affected_orders
  FROM fulfillment_tracking
  WHERE fulfillment_status = 'fulfilled' 
    AND fulfilled_at IS NULL
  
  UNION ALL
  
  -- Check 8: Audit trail completeness
  SELECT 
    'Incomplete Audit Data' as check_category,
    'HIGH' as severity,
    COUNT(*) as issue_count,
    'DecisionLog' as affected_table,
    ARRAY_AGG(id::TEXT) as affected_ids
  FROM "DecisionLog"
  WHERE rationale IS NULL OR rationale = ''
    OR actor IS NULL OR actor = ''
  
  UNION ALL
  
  -- Check 9: Stale inventory data
  SELECT 
    'Stale Inventory Snapshot' as check_category,
    'CRITICAL' as severity,
    CASE WHEN MAX(snapshot_date) < CURRENT_DATE - INTERVAL '2 days' THEN 1 ELSE 0 END as issue_count,
    'inventory_snapshots' as affected_table,
    ARRAY[MAX(snapshot_date)::TEXT] as last_snapshot_date
  FROM inventory_snapshots
  
  UNION ALL
  
  -- Check 10: Missing time savings data
  SELECT 
    'Missing Time Savings Entry' as check_category,
    'LOW' as severity,
    COUNT(*) as issue_count,
    'ceo_time_savings' as affected_table,
    ARRAY_AGG(missing_date::TEXT) as affected_dates
  FROM (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '30 days',
      CURRENT_DATE - INTERVAL '1 day',
      INTERVAL '1 day'
    )::DATE as missing_date
  ) dates
  WHERE NOT EXISTS (
    SELECT 1 FROM ceo_time_savings cts
    WHERE cts.date = dates.missing_date
  )
)
SELECT 
  check_category,
  severity,
  issue_count,
  affected_table,
  affected_dates as affected_items,
  CURRENT_TIMESTAMP as checked_at
FROM quality_checks
WHERE issue_count > 0
ORDER BY 
  CASE severity
    WHEN 'CRITICAL' THEN 1
    WHEN 'HIGH' THEN 2
    WHEN 'MEDIUM' THEN 3
    WHEN 'LOW' THEN 4
  END,
  issue_count DESC;

COMMENT ON VIEW v_data_quality_comprehensive IS 'Comprehensive data quality checks with severity levels and affected items';

-- 2. Data Freshness Monitoring (Enhanced)
-- ================================================================

CREATE OR REPLACE VIEW v_data_freshness_monitoring AS
SELECT 
  'sales_metrics_daily' as table_name,
  MAX(date) as last_update_date,
  EXTRACT(EPOCH FROM (CURRENT_DATE - MAX(date)))::INTEGER / 86400 as days_stale,
  CASE 
    WHEN MAX(date) = CURRENT_DATE THEN 'FRESH'
    WHEN MAX(date) = CURRENT_DATE - INTERVAL '1 day' THEN 'ACCEPTABLE'
    WHEN MAX(date) < CURRENT_DATE - INTERVAL '1 day' THEN 'STALE'
  END as freshness_status
FROM sales_metrics_daily
UNION ALL
SELECT 
  'inventory_snapshots' as table_name,
  MAX(snapshot_date) as last_update_date,
  EXTRACT(EPOCH FROM (CURRENT_DATE - MAX(snapshot_date)))::INTEGER / 86400 as days_stale,
  CASE 
    WHEN MAX(snapshot_date) = CURRENT_DATE THEN 'FRESH'
    WHEN MAX(snapshot_date) = CURRENT_DATE - INTERVAL '1 day' THEN 'ACCEPTABLE'
    WHEN MAX(snapshot_date) < CURRENT_DATE - INTERVAL '1 day' THEN 'STALE'
  END as freshness_status
FROM inventory_snapshots
UNION ALL
SELECT 
  'cx_conversations' as table_name,
  MAX(conversation_created_at)::DATE as last_update_date,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MAX(conversation_created_at)))::INTEGER / 86400 as days_stale,
  CASE 
    WHEN MAX(conversation_created_at) >= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 'FRESH'
    WHEN MAX(conversation_created_at) >= CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 'ACCEPTABLE'
    ELSE 'STALE'
  END as freshness_status
FROM cx_conversations
UNION ALL
SELECT 
  'fulfillment_tracking' as table_name,
  MAX(order_created_at)::DATE as last_update_date,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MAX(order_created_at)))::INTEGER / 86400 as days_stale,
  CASE 
    WHEN MAX(order_created_at) >= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 'FRESH'
    WHEN MAX(order_created_at) >= CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 'ACCEPTABLE'
    ELSE 'STALE'
  END as freshness_status
FROM fulfillment_tracking
UNION ALL
SELECT 
  'DecisionLog' as table_name,
  MAX("createdAt")::DATE as last_update_date,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MAX("createdAt")))::INTEGER / 86400 as days_stale,
  CASE 
    WHEN MAX("createdAt") >= CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN 'FRESH'
    WHEN MAX("createdAt") >= CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 'ACCEPTABLE'
    ELSE 'STALE'
  END as freshness_status
FROM "DecisionLog";

COMMENT ON VIEW v_data_freshness_monitoring IS 'Real-time data freshness monitoring with alert thresholds';

-- 3. Data Completeness Metrics
-- ================================================================

CREATE OR REPLACE VIEW v_data_completeness_metrics AS
SELECT 
  'product_categories' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN category_l1 IS NOT NULL THEN 1 END) as complete_records,
  ROUND(COUNT(CASE WHEN category_l1 IS NOT NULL THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as completeness_pct,
  ARRAY['category_l1'] as critical_fields
FROM product_categories
UNION ALL
SELECT 
  'customer_segments' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN primary_segment IS NOT NULL THEN 1 END) as complete_records,
  ROUND(COUNT(CASE WHEN primary_segment IS NOT NULL THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as completeness_pct,
  ARRAY['primary_segment'] as critical_fields
FROM customer_segments
UNION ALL
SELECT 
  'sales_metrics_daily' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN total_revenue IS NOT NULL AND total_orders IS NOT NULL THEN 1 END) as complete_records,
  ROUND(COUNT(CASE WHEN total_revenue IS NOT NULL AND total_orders IS NOT NULL THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as completeness_pct,
  ARRAY['total_revenue', 'total_orders'] as critical_fields
FROM sales_metrics_daily
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  'inventory_snapshots' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN quantity_available IS NOT NULL AND stock_status IS NOT NULL THEN 1 END) as complete_records,
  ROUND(COUNT(CASE WHEN quantity_available IS NOT NULL AND stock_status IS NOT NULL THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as completeness_pct,
  ARRAY['quantity_available', 'stock_status'] as critical_fields
FROM inventory_snapshots
WHERE snapshot_date >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
  'cx_conversations' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN first_response_time_minutes IS NOT NULL OR status = 'open' THEN 1 END) as complete_records,
  ROUND(COUNT(CASE WHEN first_response_time_minutes IS NOT NULL OR status = 'open' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as completeness_pct,
  ARRAY['first_response_time_minutes', 'status'] as critical_fields
FROM cx_conversations;

COMMENT ON VIEW v_data_completeness_metrics IS 'Completeness metrics for critical data fields';

-- 4. Data Quality Alerts (Critical Issues Only)
-- ================================================================

CREATE OR REPLACE VIEW v_data_quality_alerts AS
SELECT 
  check_category as alert_name,
  severity,
  issue_count,
  affected_table,
  affected_items,
  checked_at,
  CASE 
    WHEN severity = 'CRITICAL' AND issue_count > 0 THEN 'IMMEDIATE_ACTION_REQUIRED'
    WHEN severity = 'HIGH' AND issue_count > 10 THEN 'URGENT'
    WHEN severity = 'HIGH' AND issue_count > 0 THEN 'ATTENTION_NEEDED'
    ELSE 'MONITOR'
  END as alert_priority
FROM v_data_quality_comprehensive
WHERE severity IN ('CRITICAL', 'HIGH')
  AND issue_count > 0
ORDER BY 
  CASE severity
    WHEN 'CRITICAL' THEN 1
    WHEN 'HIGH' THEN 2
  END,
  issue_count DESC;

COMMENT ON VIEW v_data_quality_alerts IS 'Active data quality alerts requiring attention';

-- 5. Data Quality Dashboard Summary
-- ================================================================

CREATE OR REPLACE VIEW v_data_quality_dashboard AS
SELECT 
  (SELECT COUNT(*) FROM v_data_quality_comprehensive WHERE severity = 'CRITICAL') as critical_issues,
  (SELECT COUNT(*) FROM v_data_quality_comprehensive WHERE severity = 'HIGH') as high_issues,
  (SELECT COUNT(*) FROM v_data_quality_comprehensive WHERE severity = 'MEDIUM') as medium_issues,
  (SELECT COUNT(*) FROM v_data_quality_comprehensive WHERE severity = 'LOW') as low_issues,
  (SELECT COUNT(*) FROM v_data_freshness_monitoring WHERE freshness_status = 'STALE') as stale_tables,
  (SELECT ROUND(AVG(completeness_pct), 2) FROM v_data_completeness_metrics) as avg_completeness_pct,
  (SELECT COUNT(*) FROM v_data_quality_alerts WHERE alert_priority = 'IMMEDIATE_ACTION_REQUIRED') as immediate_alerts,
  CURRENT_TIMESTAMP as dashboard_updated_at;

COMMENT ON VIEW v_data_quality_dashboard IS 'Executive summary of data quality health';

-- 6. Automated Quality Check Function
-- ================================================================

CREATE OR REPLACE FUNCTION run_data_quality_checks()
RETURNS TABLE (
  check_status TEXT,
  critical_count INTEGER,
  high_count INTEGER,
  total_issues INTEGER,
  alert_summary TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN critical_issues > 0 THEN 'FAILING'
      WHEN high_issues > 5 THEN 'WARNING'
      ELSE 'PASSING'
    END as check_status,
    critical_issues as critical_count,
    high_issues as high_count,
    (critical_issues + high_issues + medium_issues + low_issues) as total_issues,
    FORMAT(
      'Critical: %s | High: %s | Stale Tables: %s | Avg Completeness: %s%%',
      critical_issues,
      high_issues,
      stale_tables,
      avg_completeness_pct
    ) as alert_summary
  FROM v_data_quality_dashboard;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION run_data_quality_checks IS 'Quick data quality status check for monitoring systems';

-- 7. Anomaly Detection (Outliers)
-- ================================================================

CREATE OR REPLACE VIEW v_data_anomalies AS
WITH revenue_stats AS (
  SELECT 
    AVG(total_revenue) as avg_revenue,
    STDDEV(total_revenue) as stddev_revenue
  FROM sales_metrics_daily
  WHERE date >= CURRENT_DATE - INTERVAL '90 days'
)
SELECT 
  'Revenue Anomaly' as anomaly_type,
  'sales_metrics_daily' as table_name,
  date as anomaly_date,
  total_revenue as value,
  (SELECT avg_revenue FROM revenue_stats) as expected_avg,
  ABS(total_revenue - (SELECT avg_revenue FROM revenue_stats)) / NULLIF((SELECT stddev_revenue FROM revenue_stats), 0) as z_score,
  CASE 
    WHEN ABS(total_revenue - (SELECT avg_revenue FROM revenue_stats)) / NULLIF((SELECT stddev_revenue FROM revenue_stats), 0) > 3 THEN 'HIGH'
    WHEN ABS(total_revenue - (SELECT avg_revenue FROM revenue_stats)) / NULLIF((SELECT stddev_revenue FROM revenue_stats), 0) > 2 THEN 'MEDIUM'
    ELSE 'LOW'
  END as anomaly_severity
FROM sales_metrics_daily
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  AND ABS(total_revenue - (SELECT avg_revenue FROM revenue_stats)) / NULLIF((SELECT stddev_revenue FROM revenue_stats), 0) > 2
ORDER BY z_score DESC;

COMMENT ON VIEW v_data_anomalies IS 'Statistical anomaly detection for revenue and key metrics';

-- ================================================================
-- Migration Complete
-- ================================================================

-- Verify all quality monitoring views created
SELECT 
  schemaname,
  viewname,
  viewowner
FROM pg_views
WHERE viewname LIKE 'v_data_quality%' 
   OR viewname LIKE 'v_data_freshness%'
   OR viewname LIKE 'v_data_completeness%'
   OR viewname LIKE 'v_data_anomalies'
ORDER BY viewname;

