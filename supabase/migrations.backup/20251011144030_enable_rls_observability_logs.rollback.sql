-- Rollback: Disable RLS on observability_logs table
-- Date: 2025-10-11
-- WARNING: This removes all security policies on the observability_logs table

DO $$
DECLARE
  logs_table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'observability_logs'
  ) INTO logs_table_exists;

  IF NOT logs_table_exists THEN
    RAISE NOTICE 'observability_logs missing, skipping rollback';
    RETURN;
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS observability_logs_service_role_all ON public.observability_logs';
  EXECUTE 'DROP POLICY IF EXISTS observability_logs_read_monitoring ON public.observability_logs';
  EXECUTE 'DROP POLICY IF EXISTS observability_logs_read_own_requests ON public.observability_logs';
  EXECUTE 'DROP POLICY IF EXISTS observability_logs_insert_service_only ON public.observability_logs';
  EXECUTE 'DROP POLICY IF EXISTS observability_logs_no_update ON public.observability_logs';
  EXECUTE 'DROP POLICY IF EXISTS observability_logs_no_delete ON public.observability_logs';

  EXECUTE 'REVOKE SELECT ON public.observability_logs FROM authenticated';
  EXECUTE 'REVOKE SELECT ON public.observability_logs FROM monitoring_team';
  EXECUTE 'REVOKE INSERT ON public.observability_logs FROM service_role';

  EXECUTE 'ALTER TABLE public.observability_logs DISABLE ROW LEVEL SECURITY';
END;
$$;
