-- Rollback: Nightly Rollups
-- Date: 2025-10-15

-- Unschedule cron job
SELECT cron.unschedule('nightly-rollups');

-- Drop functions
DROP FUNCTION IF EXISTS public.run_nightly_rollups();
DROP FUNCTION IF EXISTS public.rollup_growth_metrics_daily(DATE);
DROP FUNCTION IF EXISTS public.rollup_cx_metrics_daily(DATE);

