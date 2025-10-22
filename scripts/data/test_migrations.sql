-- Testing Script: Data Agent Migrations
-- Description: Test script to validate DATA agent migrations
-- Date: 2025-10-22
-- Agent: data
-- Task: DATA-020

-- =============================================================================
-- TESTING SCRIPT FOR DATA MIGRATIONS
-- =============================================================================

-- Test 1: Check if all tables exist
SELECT 
  'Table Existence Test' as test_name,
  CASE 
    WHEN COUNT(*) = 8 THEN 'PASS'
    ELSE 'FAIL'
  END as result,
  COUNT(*) as tables_found,
  8 as expected_tables
FROM information_schema.tables 
WHERE table_name IN (
  'user_preferences',
  'notifications', 
  'approval_queue',
  'purchase_orders',
  'purchase_order_receipts',
  'purchase_order_line_items',
  'product_cost_history',
  'cost_audit_trail'
);

-- Test 2: Check if all functions exist
SELECT 
  'Function Existence Test' as test_name,
  CASE 
    WHEN COUNT(*) >= 15 THEN 'PASS'
    ELSE 'FAIL'
  END as result,
  COUNT(*) as functions_found
FROM information_schema.routines 
WHERE routine_name IN (
  'get_user_preferences',
  'update_user_preferences',
  'get_user_notifications',
  'mark_notification_read',
  'create_notification',
  'get_approval_queue',
  'approve_request',
  'reject_request',
  'create_approval_request',
  'calculate_freight_allocation',
  'calculate_duty_allocation',
  'calculate_alc',
  'process_receipt_and_update_alc',
  'calculate_bundle_virtual_stock',
  'run_nightly_virtual_stock_reconciliation'
);

-- Test 3: Check if RLS is enabled on key tables
SELECT 
  'RLS Enabled Test' as test_name,
  CASE 
    WHEN COUNT(*) = 8 THEN 'PASS'
    ELSE 'FAIL'
  END as result,
  COUNT(*) as tables_with_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN (
  'user_preferences',
  'notifications',
  'approval_queue', 
  'purchase_orders',
  'purchase_order_receipts',
  'purchase_order_line_items',
  'product_cost_history',
  'cost_audit_trail'
)
AND c.relrowsecurity = true;

-- Test 4: Check if triggers exist
SELECT 
  'Trigger Existence Test' as test_name,
  CASE 
    WHEN COUNT(*) >= 8 THEN 'PASS'
    ELSE 'FAIL'
  END as result,
  COUNT(*) as triggers_found
FROM information_schema.triggers
WHERE trigger_name IN (
  'set_user_preferences_updated_at',
  'set_notifications_updated_at',
  'set_approval_queue_updated_at',
  'set_approval_queue_last_updated',
  'set_purchase_orders_updated_at',
  'set_purchase_order_receipts_updated_at',
  'set_purchase_order_line_items_updated_at',
  'trigger_sync_alc_to_shopify'
);

-- Test 5: Check if indexes exist
SELECT 
  'Index Existence Test' as test_name,
  CASE 
    WHEN COUNT(*) >= 20 THEN 'PASS'
    ELSE 'FAIL'
  END as result,
  COUNT(*) as indexes_found
FROM pg_indexes
WHERE tablename IN (
  'user_preferences',
  'notifications',
  'approval_queue',
  'purchase_orders',
  'purchase_order_receipts',
  'purchase_order_line_items',
  'product_cost_history',
  'cost_audit_trail'
);

-- Test 6: Test function execution (safe tests)
SELECT 
  'Function Execution Test' as test_name,
  CASE 
    WHEN get_approval_queue_stats('test-shop.myshopify.com') IS NOT NULL THEN 'PASS'
    ELSE 'FAIL'
  END as result;

-- Test 7: Check if Realtime is configured
SELECT 
  'Realtime Configuration Test' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'approval_queue'
    ) THEN 'PASS'
    ELSE 'FAIL'
  END as result;

-- Test 8: Check if decision_log protection is in place
SELECT 
  'Decision Log Protection Test' as test_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_audit_decision_log_changes'
    ) THEN 'PASS'
    ELSE 'FAIL'
  END as result;

-- =============================================================================
-- SUMMARY REPORT
-- =============================================================================

SELECT 
  'MIGRATION TEST SUMMARY' as report_type,
  NOW() as test_timestamp,
  'DATA Agent Migrations' as migration_set,
  '2025-10-25' as migration_date;
