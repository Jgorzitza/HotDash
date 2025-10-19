-- Enable RLS on facts table
-- Priority: CRITICAL (multi-tenant data isolation)
-- Owner: data
-- Date: 2025-10-11
-- Ref: feedback/data.md section 4 (RLS Security Gap)

-- Enable Row Level Security on facts table
ALTER TABLE public.facts ENABLE ROW LEVEL SECURITY;

-- Create read-only role for AI/analytics if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ai_readonly') THEN
    CREATE ROLE ai_readonly NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analytics_reader') THEN
    CREATE ROLE analytics_reader NOINHERIT;
  END IF;
END$$;

DROP POLICY IF EXISTS facts_service_role_all
  ON public.facts;

CREATE POLICY facts_service_role_all
  ON public.facts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can read facts for their project
-- Uses JWT claim 'app.current_project' or falls back to service_role
DROP POLICY IF EXISTS facts_read_by_project
  ON public.facts;

CREATE POLICY facts_read_by_project
  ON public.facts
  FOR SELECT
  TO authenticated, anon
  USING (
    project = COALESCE(
      current_setting('app.current_project', true),
      auth.jwt() ->> 'project'
    )
    OR auth.role() = 'service_role'
  );

-- Policy 3: AI readonly role can read all facts (for cross-project analysis)
DROP POLICY IF EXISTS facts_read_ai_readonly
  ON public.facts;

CREATE POLICY facts_read_ai_readonly
  ON public.facts
  FOR SELECT
  TO ai_readonly, analytics_reader
  USING (true);

-- Policy 4: Authenticated users can insert facts for their project
DROP POLICY IF EXISTS facts_insert_by_project
  ON public.facts;

CREATE POLICY facts_insert_by_project
  ON public.facts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project = COALESCE(
      current_setting('app.current_project', true),
      auth.jwt() ->> 'project'
    )
    OR auth.role() = 'service_role'
  );

-- Policy 5: Prevent updates (facts are immutable audit records)
-- Only service_role can update for corrections
DROP POLICY IF EXISTS facts_no_update
  ON public.facts;

CREATE POLICY facts_no_update
  ON public.facts
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Policy 6: Prevent deletes (facts are immutable audit records)
-- Only service_role can delete for retention/cleanup
DROP POLICY IF EXISTS facts_no_delete
  ON public.facts;

CREATE POLICY facts_no_delete
  ON public.facts
  FOR DELETE
  TO authenticated
  USING (false);

-- Add helpful comments
COMMENT ON TABLE public.facts IS 'Analytics facts with RLS enabled (project isolation). Immutable audit records.';
COMMENT ON COLUMN public.facts.project IS 'Project namespace for RLS isolation (e.g., occ, chatwoot).';

-- Grant necessary permissions
GRANT SELECT ON public.facts TO authenticated;
GRANT SELECT ON public.facts TO ai_readonly;
GRANT SELECT ON public.facts TO analytics_reader;
GRANT INSERT ON public.facts TO authenticated;
GRANT ALL ON public.facts TO service_role;
