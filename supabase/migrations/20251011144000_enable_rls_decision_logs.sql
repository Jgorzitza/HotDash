-- Enable RLS on decision_sync_event_logs table
-- Priority: HIGH (operational telemetry isolation)
-- Owner: data
-- Date: 2025-10-11
-- Ref: feedback/data.md section 4 (RLS Security Gap)

-- Enable Row Level Security on decision_sync_event_logs
ALTER TABLE public.decision_sync_event_logs ENABLE ROW LEVEL SECURITY;

-- Create operator roles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'operator_readonly') THEN
    CREATE ROLE operator_readonly NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'qa_team') THEN
    CREATE ROLE qa_team NOINHERIT;
  END IF;
END$$;

-- Policy 1: Service role has full access (system operations)
DROP POLICY IF EXISTS decision_logs_service_role_all
  ON public.decision_sync_event_logs;

CREATE POLICY decision_logs_service_role_all
  ON public.decision_sync_event_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can read decision logs for their scope
-- Uses JWT claim 'app.current_scope' for scope isolation
DROP POLICY IF EXISTS decision_logs_read_by_scope
  ON public.decision_sync_event_logs;

CREATE POLICY decision_logs_read_by_scope
  ON public.decision_sync_event_logs
  FOR SELECT
  TO authenticated, anon
  USING (
    scope = COALESCE(
      current_setting('app.current_scope', true),
      auth.jwt() ->> 'scope',
      'ops'  -- Default to 'ops' scope for backward compatibility
    )
    OR auth.role() = 'service_role'
  );

-- Policy 3: Operator readonly role can read all decision logs (for monitoring)
DROP POLICY IF EXISTS decision_logs_read_operators
  ON public.decision_sync_event_logs;

CREATE POLICY decision_logs_read_operators
  ON public.decision_sync_event_logs
  FOR SELECT
  TO operator_readonly, qa_team
  USING (true);

-- Policy 4: Authenticated users can insert decision logs for their scope
DROP POLICY IF EXISTS decision_logs_insert_by_scope
  ON public.decision_sync_event_logs;

CREATE POLICY decision_logs_insert_by_scope
  ON public.decision_sync_event_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    scope = COALESCE(
      current_setting('app.current_scope', true),
      auth.jwt() ->> 'scope',
      'ops'
    )
    OR auth.role() = 'service_role'
  );

-- Policy 5: Prevent updates (decision logs are immutable audit records)
DROP POLICY IF EXISTS decision_logs_no_update
  ON public.decision_sync_event_logs;

CREATE POLICY decision_logs_no_update
  ON public.decision_sync_event_logs
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Policy 6: Prevent deletes (decision logs are immutable audit records)
-- Only service_role can delete for retention/cleanup
DROP POLICY IF EXISTS decision_logs_no_delete
  ON public.decision_sync_event_logs;

CREATE POLICY decision_logs_no_delete
  ON public.decision_sync_event_logs
  FOR DELETE
  TO authenticated
  USING (false);

-- Add helpful comments
COMMENT ON TABLE public.decision_sync_event_logs IS 'Decision sync telemetry with RLS enabled (scope isolation). Immutable audit records.';
COMMENT ON COLUMN public.decision_sync_event_logs.scope IS 'Operational scope for RLS isolation (e.g., ops, cx, analytics).';

-- Grant necessary permissions
GRANT SELECT ON public.decision_sync_event_logs TO authenticated;
GRANT SELECT ON public.decision_sync_event_logs TO operator_readonly;
GRANT SELECT ON public.decision_sync_event_logs TO qa_team;
GRANT INSERT ON public.decision_sync_event_logs TO authenticated;
GRANT ALL ON public.decision_sync_event_logs TO service_role;

-- Ensure the view still works after RLS enablement
-- The view inherits RLS policies from the underlying table
COMMENT ON VIEW public.decision_sync_events IS 'Public view of decision_sync_event_logs. RLS policies apply from base table.';
