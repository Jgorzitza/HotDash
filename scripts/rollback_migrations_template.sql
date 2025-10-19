-- Migration Rollback Script Template
-- Purpose: Revert migrations in case of failed apply or critical issues
-- Generated: 2025-10-19
-- Usage: psql $DATABASE_URL -f scripts/rollback_migrations_YYYYMMDD.sql

-- ⚠️ CRITICAL: This script should be customized per migration apply session
-- ⚠️ Test on staging before using in production
-- ⚠️ Requires Manager approval for production rollback

\echo '=== MIGRATION ROLLBACK SCRIPT ==='
\echo 'Purpose: Revert migrations applied on [DATE]'
\echo 'Migrations to revert: [LIST MIGRATION TIMESTAMPS]'
\echo ''
\echo '⚠️  WARNING: This will revert database schema changes'
\echo 'Press Ctrl+C to cancel, or wait 10 seconds to proceed...'
\echo ''

-- Wait 10 seconds to allow cancel
SELECT pg_sleep(10);

BEGIN;

\echo 'Starting rollback transaction...'

-- Step 1: Drop new tables (in reverse order of creation)
-- Example:
-- DROP TABLE IF EXISTS new_table_from_migration CASCADE;

-- Step 2: Drop new views
-- Example:
-- DROP VIEW IF EXISTS v_new_view CASCADE;

-- Step 3: Drop new functions/RPCs
-- Example:
-- DROP FUNCTION IF EXISTS new_rpc_function(args) CASCADE;

-- Step 4: Revert column additions
-- Example:
-- ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column CASCADE;

-- Step 5: Revert RLS policies
-- Example:
-- DROP POLICY IF EXISTS new_policy_name ON table_name;
-- ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Step 6: Revert indexes
-- Example:
-- DROP INDEX IF EXISTS idx_new_index;

-- Step 7: Delete migration records from schema_migrations table
-- This tells Supabase that these migrations are no longer applied
-- Example:
-- DELETE FROM supabase_migrations.schema_migrations 
-- WHERE version IN ('20251015_dashboard_rpc_functions', '20251015_dashboard_tile_queries');

-- Verification queries
\echo ''
\echo 'Rollback verification:'

-- Check that rolled-back tables no longer exist
SELECT 
  COUNT(*) as remaining_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('list', 'of', 'rolled_back', 'tables');
-- Expected: 0

-- Check that rolled-back functions no longer exist
SELECT 
  COUNT(*) as remaining_functions 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('list', 'of', 'rolled_back', 'functions');
-- Expected: 0

-- Check migration records removed
SELECT version, name 
FROM supabase_migrations.schema_migrations 
WHERE version IN ('list', 'of', 'rolled_back', 'versions')
ORDER BY version DESC;
-- Expected: No rows

-- Prompt for commit or rollback
\echo ''
\echo 'Rollback transaction prepared.'
\echo 'Review verification results above.'
\echo 'Type COMMIT; to apply rollback, or ROLLBACK; to cancel.'
\echo ''

-- The transaction remains open for manual review
-- User must type COMMIT; or ROLLBACK; to complete

