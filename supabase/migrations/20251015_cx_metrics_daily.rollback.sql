-- Rollback: CX Metrics Daily Schema
-- Date: 2025-10-15

-- Drop trigger
DROP TRIGGER IF EXISTS trg_cx_metrics_daily_updated_at ON public.cx_metrics_daily;

-- Drop policies
DROP POLICY IF EXISTS cx_metrics_daily_service_role ON public.cx_metrics_daily;
DROP POLICY IF EXISTS cx_metrics_daily_read_all ON public.cx_metrics_daily;
DROP POLICY IF EXISTS cx_metrics_daily_insert_service ON public.cx_metrics_daily;
DROP POLICY IF EXISTS cx_metrics_daily_update_service ON public.cx_metrics_daily;
DROP POLICY IF EXISTS cx_metrics_daily_no_delete ON public.cx_metrics_daily;

-- Revoke permissions
REVOKE SELECT ON public.cx_metrics_daily FROM authenticated;
REVOKE ALL ON public.cx_metrics_daily FROM service_role;

-- Drop indexes
DROP INDEX IF EXISTS public.cx_metrics_daily_date_idx;
DROP INDEX IF EXISTS public.cx_metrics_daily_shop_idx;
DROP INDEX IF EXISTS public.cx_metrics_daily_sla_idx;

-- Drop table
DROP TABLE IF EXISTS public.cx_metrics_daily;

