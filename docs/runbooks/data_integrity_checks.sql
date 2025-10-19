-- Data Integrity Checks
-- Purpose: Verify data consistency after migration apply
-- Generated: 2025-10-19
-- Usage: psql $DATABASE_URL -f docs/runbooks/data_integrity_checks.sql

\echo '=== DATA INTEGRITY CHECKS ==='
\echo 'Purpose: Verify data consistency and referential integrity'
\echo ''

-- Check 1: Orphaned records (foreign key violations)
\echo 'Check 1: Orphaned Records'

-- Note: Actual foreign key checks depend on which tables exist
-- These are examples for tables that SHOULD exist

-- Check for orphaned agent approvals
SELECT 
  'agent_approvals' as table_name,
  COUNT(*) as orphan_count,
  'Missing agent references' as issue
FROM agent_approvals
WHERE agent NOT IN ('ai-customer', 'ai-knowledge', 'inventory', 'seo', 'ads', 'content')
UNION ALL

-- Check for orphaned agent feedback
SELECT 
  'agent_feedback' as table_name,
  COUNT(*) as orphan_count,
  'Missing agent references' as issue  
FROM agent_feedback
WHERE agent NOT IN ('ai-customer', 'ai-knowledge', 'inventory', 'seo', 'ads', 'content');

\echo ''

-- Check 2: Invalid enum values
\echo 'Check 2: Invalid Enum Values'

-- Check for invalid lifecycle stages
SELECT 
  'customer_segments' as table_name,
  COUNT(*) as invalid_count,
  'Invalid lifecycle_stage values' as issue
FROM customer_segments
WHERE lifecycle_stage NOT IN ('new', 'active', 'at_risk', 'churned', 'reactivated')
UNION ALL

-- Check for invalid inventory velocity
SELECT 
  'product_categories' as table_name,
  COUNT(*) as invalid_count,
  'Invalid inventory_velocity values' as issue
FROM product_categories
WHERE inventory_velocity NOT IN ('fast', 'medium', 'slow');

\echo ''

-- Check 3: Null constraint violations
\echo 'Check 3: Null Constraint Violations (should all return 0)'

-- Check for required fields that are NULL
SELECT 
  'product_categories' as table_name,
  COUNT(*) as null_count,
  'category_l1 is NULL' as issue
FROM product_categories
WHERE category_l1 IS NULL
UNION ALL

SELECT 
  'customer_segments' as table_name,
  COUNT(*) as null_count,
  'primary_segment is NULL' as issue
FROM customer_segments
WHERE primary_segment IS NULL;

\echo ''

-- Check 4: Data range validations
\echo 'Check 4: Data Range Validations'

-- Check for negative values where not allowed
SELECT 
  'customer_segments' as table_name,
  COUNT(*) as issue_count,
  'Negative total_orders' as issue
FROM customer_segments
WHERE total_orders < 0
UNION ALL

SELECT 
  'product_categories' as table_name,
  COUNT(*) as issue_count,
  'Negative margin_pct' as issue
FROM product_categories
WHERE margin_pct < 0 OR margin_pct > 100;

\echo ''

-- Check 5: Future dates (data quality)
\echo 'Check 5: Future Dates (should return 0)'

SELECT 
  'customer_segments' as table_name,
  COUNT(*) as future_date_count,
  'created_at in future' as issue
FROM customer_segments
WHERE created_at > NOW()
UNION ALL

SELECT 
  'product_categories' as table_name,
  COUNT(*) as future_date_count,
  'created_at in future' as issue
FROM product_categories
WHERE created_at > NOW();

\echo ''

-- Check 6: Duplicate records (should return 0)
\echo 'Check 6: Duplicate Records'

-- Check for duplicate shopify_product_ids
SELECT 
  'product_categories' as table_name,
  shopify_product_id,
  COUNT(*) as duplicate_count
FROM product_categories
GROUP BY shopify_product_id
HAVING COUNT(*) > 1;

-- Check for duplicate shopify_customer_ids
SELECT 
  'customer_segments' as table_name,
  shopify_customer_id,
  COUNT(*) as duplicate_count
FROM customer_segments
GROUP BY shopify_customer_id
HAVING COUNT(*) > 1;

\echo ''

-- Check 7: RLS policies active
\echo 'Check 7: RLS Policies Active (should return 8 tables)'

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'product_categories', 'customer_segments',
    'facts', 'decision_sync_event_logs', 'observability_logs',
    'agent_approvals', 'agent_feedback', 'agent_queries'
  )
ORDER BY tablename;

\echo ''

-- Check 8: Index existence
\echo 'Check 8: Critical Indexes Exist'

SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('product_categories', 'customer_segments', 'agent_approvals')
ORDER BY tablename, indexname;

\echo ''

-- Check 9: Table row counts
\echo 'Check 9: Table Row Counts (sanity check)'

SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

\echo ''

-- Summary
\echo '=== INTEGRITY CHECK SUMMARY ==='
\echo 'Expected Results:'
\echo '  - Orphaned records: 0'
\echo '  - Invalid enum values: 0'
\echo '  - Null violations: 0'
\echo '  - Data range issues: 0'
\echo '  - Future dates: 0'
\echo '  - Duplicate records: 0'
\echo '  - RLS enabled: 8 tables'
\echo '  - Indexes: Present on all key tables'
\echo ''
\echo 'If any checks fail, investigate before proceeding with production apply.'
\echo '=== END INTEGRITY CHECKS ==='

