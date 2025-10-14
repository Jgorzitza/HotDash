-- Enable RLS on observability_logs table
-- Priority: MEDIUM (edge function logs isolation)
-- Owner: data
-- Date: 2025-10-11
-- Ref: feedback/data.md section 4 (RLS Security Gap)

-- Enable Row Level Security on observability_logs
ALTER TABLE public.observability_logs ENABLE ROW LEVEL SECURITY;

-- Create monitoring roles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'monitoring_team') THEN
    CREATE ROLE monitoring_team NOINHERIT;
  END IF;
END$$;

-- Policy 1: Service role has full access (edge functions use service_role)
CREATE POLICY observability_logs_service_role_all
  ON public.observability_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Monitoring team can read all logs (for observability)
CREATE POLICY observability_logs_read_monitoring
  ON public.observability_logs
  FOR SELECT
  TO monitoring_team, operator_readonly
  USING (true);

-- Policy 3: Authenticated users can read logs (for debugging their own requests)
-- Filter by request_id if available in JWT claims
CREATE POLICY observability_logs_read_own_requests
  ON public.observability_logs
  FOR SELECT
  TO authenticated
  USING (
    request_id = COALESCE(
      current_setting('app.request_id', true),
      auth.jwt() ->> 'request_id'
    )
    OR auth.role() = 'service_role'
    OR level IN ('INFO', 'WARN')  -- Allow reading non-sensitive logs
  );

-- Policy 4: Only edge functions (service_role) can insert logs
CREATE POLICY observability_logs_insert_service_only
  ON public.observability_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 5: Prevent updates (logs are immutable)
CREATE POLICY observability_logs_no_update
  ON public.observability_logs
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Policy 6: Prevent deletes (logs are immutable)
-- Only service_role can delete for retention/cleanup
CREATE POLICY observability_logs_no_delete
  ON public.observability_logs
  FOR DELETE
  TO authenticated
  USING (false);

-- Add helpful comments
COMMENT ON TABLE public.observability_logs IS 'Edge function logs with RLS enabled. Accessible by service_role and monitoring team.';
COMMENT ON COLUMN public.observability_logs.request_id IS 'Request ID for correlating logs with user sessions (RLS filter).';
COMMENT ON COLUMN public.observability_logs.level IS 'Log level: INFO (public), WARN (public), ERROR (restricted).';

-- Grant necessary permissions
GRANT SELECT ON public.observability_logs TO authenticated;
GRANT SELECT ON public.observability_logs TO monitoring_team;
GRANT INSERT ON public.observability_logs TO service_role;
GRANT ALL ON public.observability_logs TO service_role;

