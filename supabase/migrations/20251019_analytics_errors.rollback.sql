-- Rollback analytics_errors table
-- Date: 2025-10-19

DROP TRIGGER IF EXISTS analytics_errors_updated_at ON analytics_errors;
DROP FUNCTION IF EXISTS update_analytics_errors_updated_at();
DROP POLICY IF EXISTS "Authenticated users can read errors" ON analytics_errors;
DROP POLICY IF EXISTS "Service role full access" ON analytics_errors;
DROP TABLE IF EXISTS analytics_errors;

