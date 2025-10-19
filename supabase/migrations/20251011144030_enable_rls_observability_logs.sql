-- Enable RLS on observability_logs table
-- Priority: MEDIUM (edge function logs isolation)
-- Owner: data
-- Date: 2025-10-11
-- Ref: feedback/data.md section 4 (RLS Security Gap)

DO $$
DECLARE
  logs_table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'observability_logs'
  )
  INTO logs_table_exists;

  IF NOT logs_table_exists THEN
    RAISE NOTICE 'observability_logs missing in staging, skipping RLS enable';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'monitoring_team') THEN
    EXECUTE 'CREATE ROLE monitoring_team NOINHERIT';
  END IF;

  EXECUTE 'ALTER TABLE public.observability_logs ENABLE ROW LEVEL SECURITY';

  EXECUTE 'DROP POLICY IF EXISTS observability_logs_service_role_all ON public.observability_logs';
  EXECUTE 'CREATE POLICY observability_logs_service_role_all
             ON public.observability_logs
             FOR ALL
             TO service_role
             USING (true)
             WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS observability_logs_read_monitoring ON public.observability_logs';
  EXECUTE 'CREATE POLICY observability_logs_read_monitoring
             ON public.observability_logs
             FOR SELECT
             TO monitoring_team, operator_readonly
             USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS observability_logs_read_own_requests ON public.observability_logs';
  EXECUTE 'CREATE POLICY observability_logs_read_own_requests
             ON public.observability_logs
             FOR SELECT
             TO authenticated
             USING (
               request_id = COALESCE(
                 current_setting(''app.request_id'', true),
                 auth.jwt() ->> ''request_id''
               )
               OR auth.role() = ''service_role''
               OR level IN (''INFO'', ''WARN'')
             )';

  EXECUTE 'DROP POLICY IF EXISTS observability_logs_insert_service_only ON public.observability_logs';
  EXECUTE 'CREATE POLICY observability_logs_insert_service_only
             ON public.observability_logs
             FOR INSERT
             TO service_role
             WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS observability_logs_no_update ON public.observability_logs';
  EXECUTE 'CREATE POLICY observability_logs_no_update
             ON public.observability_logs
             FOR UPDATE
             TO authenticated
             USING (false)
             WITH CHECK (false)';

  EXECUTE 'DROP POLICY IF EXISTS observability_logs_no_delete ON public.observability_logs';
  EXECUTE 'CREATE POLICY observability_logs_no_delete
             ON public.observability_logs
             FOR DELETE
             TO authenticated
             USING (false)';

  EXECUTE 'COMMENT ON TABLE public.observability_logs IS ''Edge function logs with RLS enabled. Accessible by service_role and monitoring team.''';
  EXECUTE 'COMMENT ON COLUMN public.observability_logs.request_id IS ''Request ID for correlating logs with user sessions (RLS filter).''';
  EXECUTE 'COMMENT ON COLUMN public.observability_logs.level IS ''Log level: INFO (public), WARN (public), ERROR (restricted).''';

  EXECUTE 'GRANT SELECT ON public.observability_logs TO authenticated';
  EXECUTE 'GRANT SELECT ON public.observability_logs TO monitoring_team';
  EXECUTE 'GRANT INSERT ON public.observability_logs TO service_role';
  EXECUTE 'GRANT ALL ON public.observability_logs TO service_role';
END;
$$;
