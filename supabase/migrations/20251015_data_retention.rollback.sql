-- Rollback: Data Retention Policies
-- Date: 2025-10-15

-- Unschedule cron job
SELECT cron.unschedule('weekly-retention-cleanup');

-- Drop table
DROP TABLE IF EXISTS public.data_retention_policies;

-- Drop functions
DROP FUNCTION IF EXISTS public.run_data_retention_cleanup();
DROP FUNCTION IF EXISTS public.cleanup_picker_payouts(INTEGER);
DROP FUNCTION IF EXISTS public.cleanup_growth_metrics(INTEGER);
DROP FUNCTION IF EXISTS public.cleanup_cx_metrics(INTEGER);
DROP FUNCTION IF EXISTS public.cleanup_audit_logs(INTEGER);

