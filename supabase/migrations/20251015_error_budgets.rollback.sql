-- Rollback: Error Budgets and Alerts
-- Date: 2025-10-15

-- Unschedule cron job
SELECT cron.unschedule('error-budget-check');

-- Drop trigger
DROP TRIGGER IF EXISTS trg_error_budgets_updated_at ON public.error_budgets;

-- Drop functions
DROP FUNCTION IF EXISTS public.get_active_alerts();
DROP FUNCTION IF EXISTS public.check_error_budgets();

-- Drop tables
DROP TABLE IF EXISTS public.alert_history;
DROP TABLE IF EXISTS public.error_budgets;

