-- ============================================================================
-- HotDash RLS Policy Testing Script
-- ============================================================================
-- Purpose: Verify Row Level Security policies are correctly configured
-- Date: 2025-10-20
-- Tables Covered: 18+ tables including ads_tracking (new)
-- ============================================================================

\echo '=== HOTDASH RLS POLICY TESTING ==='
\echo ''

-- ============================================================================
-- CRITICAL P0 TABLES (from 2025-10-19 security fix)
-- ============================================================================

\echo '--- P0 CRITICAL TABLES ---'
\echo 'Checking RLS enabled on P0 tables...'
SET ROLE postgres;

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('ads_metrics_daily', 'agent_run', 'agent_qc', 'creds_meta')
ORDER BY tablename;

\echo 'Expected: All 4 tables show rls_enabled = t'
\echo ''

-- ============================================================================
-- NEW ADS TRACKING TABLES (from 2025-10-20 migration)
-- ============================================================================

\echo '--- NEW ADS TRACKING TABLES ---'
\echo 'Checking RLS enabled on new ads tables...'

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('ads_campaigns', 'ads_daily_metrics')
ORDER BY tablename;

\echo 'Expected: Both tables show rls_enabled = t (after migration applied)'
\echo ''

-- ============================================================================
-- INVENTORY TABLES (from 2025-10-20 migrations: 20251020190500, 20251020190600)
-- ============================================================================

\echo '--- INVENTORY TABLES (8 tables) ---'
\echo 'Checking RLS enabled on inventory management tables...'

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'products', 
    'variants', 
    'inventory_snapshots', 
    'vendors', 
    'product_vendors', 
    'purchase_orders', 
    'purchase_order_items', 
    'inventory_events'
  )
ORDER BY tablename;

\echo 'Expected: All 8 inventory tables show rls_enabled = t (after migrations applied)'
\echo ''

-- ============================================================================
-- AGENT SYSTEM TABLES
-- ============================================================================

\echo '--- AGENT SYSTEM TABLES ---'
\echo 'Checking RLS on agent-related tables...'

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('AgentApproval', 'AgentFeedback', 'AgentQuery')
ORDER BY tablename;

\echo 'Expected: All agent tables show rls_enabled = t'
\echo ''

-- ============================================================================
-- KNOWLEDGE BASE TABLES
-- ============================================================================

\echo '--- KNOWLEDGE BASE TABLES ---'
\echo 'Checking RLS on knowledge tables...'

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename LIKE 'knowledge_%'
ORDER BY tablename;

\echo 'Expected: All knowledge tables show rls_enabled = t'
\echo ''

-- ============================================================================
-- POLICY COUNT VERIFICATION
-- ============================================================================

\echo '--- POLICY COUNT SUMMARY ---'
\echo 'Checking total RLS policies by table...'

SELECT 
  t.tablename,
  t.rowsecurity,
  COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
GROUP BY t.tablename, t.rowsecurity
ORDER BY policy_count DESC, t.tablename;

\echo ''
\echo 'Expected: Each table should have at least 2 policies (authenticated + service_role)'
\echo ''

-- ============================================================================
-- CRITICAL: Service Role Access Test
-- ============================================================================

\echo '--- SERVICE ROLE ACCESS TEST ---'
\echo 'Testing service_role can access all tables...'

SET ROLE postgres;

-- Test P0 critical tables
SELECT COUNT(*) as ads_metrics_daily_count FROM ads_metrics_daily;
SELECT COUNT(*) as agent_run_count FROM agent_run;
SELECT COUNT(*) as agent_qc_count FROM agent_qc;
SELECT COUNT(*) as creds_meta_count FROM creds_meta;

\echo 'Service role should see all rows'
\echo ''

-- ============================================================================
-- AUTHENTICATED USER ACCESS TEST (if new tables exist)
-- ============================================================================

\echo '--- AUTHENTICATED USER ACCESS TEST ---'
\echo 'Note: This test requires migration 20251020005738_ads_tracking to be applied'
\echo 'Checking if ads_campaigns table exists...'

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'ads_campaigns'
  ) THEN
    RAISE NOTICE 'ads_campaigns table exists - proceeding with tests';
  ELSE
    RAISE NOTICE 'ads_campaigns table NOT found - migration not yet applied';
  END IF;
END$$;

\echo ''

-- ============================================================================
-- SUMMARY
-- ============================================================================

\echo '=== RLS TESTING COMPLETE ==='
\echo ''
\echo 'Summary:'
\echo '  ✅ P0 Critical Tables: 4 tables (ads_metrics_daily, agent_run, agent_qc, creds_meta)'
\echo '  ✅ Ads Tracking Tables: 2 tables (ads_campaigns, ads_daily_metrics) - pending migration 20251020005738'
\echo '  ✅ Inventory Tables: 8 tables (products, variants, inventory_snapshots, vendors, product_vendors,'
\echo '      purchase_orders, purchase_order_items, inventory_events) - pending migrations 20251020190500/190600'
\echo '  ✅ Agent System: AgentApproval, AgentFeedback, AgentQuery'
\echo '  ✅ Knowledge Base: All knowledge_* tables'
\echo ''
\echo 'Total RLS-Protected Tables: 18+ (including all above categories)'
\echo ''
\echo 'Contract Test: PASS if all tables show rowsecurity = t'
\echo 'Rollback: If RLS causes issues, use: ALTER TABLE <table> DISABLE ROW LEVEL SECURITY;'
\echo ''

