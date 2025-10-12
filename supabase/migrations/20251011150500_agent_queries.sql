-- Agent SDK: Query Tracking Table
-- Priority: HIGH (Agent SDK integration)
-- Owner: data
-- Date: 2025-10-11
-- Ref: docs/directions/data.md Task 2 (Agent SDK Database Schemas)

-- Create agent_queries table for tracking agent queries and results
CREATE TABLE IF NOT EXISTS public.agent_queries (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  result JSONB NOT NULL,
  conversation_id TEXT NOT NULL,
  agent TEXT NOT NULL,
  approved BOOLEAN DEFAULT NULL,
  human_edited BOOLEAN DEFAULT FALSE,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS agent_queries_conversation_id_idx 
  ON public.agent_queries (conversation_id);

CREATE INDEX IF NOT EXISTS agent_queries_created_at_idx 
  ON public.agent_queries (created_at DESC);

CREATE INDEX IF NOT EXISTS agent_queries_agent_idx 
  ON public.agent_queries (agent);

CREATE INDEX IF NOT EXISTS agent_queries_approved_idx 
  ON public.agent_queries (approved) 
  WHERE approved IS NOT NULL;

CREATE INDEX IF NOT EXISTS agent_queries_agent_created_idx 
  ON public.agent_queries (agent, created_at DESC);

CREATE INDEX IF NOT EXISTS agent_queries_latency_idx 
  ON public.agent_queries (latency_ms DESC) 
  WHERE latency_ms IS NOT NULL;

-- Add helpful comments
COMMENT ON TABLE public.agent_queries IS 'Agent SDK query tracking. Logs all agent queries, results, approvals, and performance metrics.';
COMMENT ON COLUMN public.agent_queries.id IS 'Unique identifier for query record';
COMMENT ON COLUMN public.agent_queries.query IS 'Query text submitted to agent';
COMMENT ON COLUMN public.agent_queries.result IS 'Query result (JSONB for flexible schema)';
COMMENT ON COLUMN public.agent_queries.conversation_id IS 'Agent SDK conversation identifier (indexed)';
COMMENT ON COLUMN public.agent_queries.agent IS 'Agent identifier (e.g., "data", "engineer", "support") (indexed)';
COMMENT ON COLUMN public.agent_queries.approved IS 'Human approval status (NULL = not reviewed, TRUE = approved, FALSE = rejected)';
COMMENT ON COLUMN public.agent_queries.human_edited IS 'Whether result was edited by human before sending';
COMMENT ON COLUMN public.agent_queries.latency_ms IS 'Query execution time in milliseconds (indexed for performance analysis)';
COMMENT ON COLUMN public.agent_queries.created_at IS 'Timestamp when query executed (indexed)';
COMMENT ON COLUMN public.agent_queries.updated_at IS 'Timestamp of last update';

-- Enable Row Level Security
ALTER TABLE public.agent_queries ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role has full access (Agent SDK operations)
CREATE POLICY agent_queries_service_role_all
  ON public.agent_queries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can read their own conversation queries
CREATE POLICY agent_queries_read_own
  ON public.agent_queries
  FOR SELECT
  TO authenticated
  USING (
    conversation_id = COALESCE(
      current_setting('app.conversation_id', true),
      auth.jwt() ->> 'conversation_id'
    )
    OR auth.role() = 'service_role'
  );

-- Policy 3: Operators and QA can read all queries for monitoring
CREATE POLICY agent_queries_read_operators
  ON public.agent_queries
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(auth.jwt() ->> 'role', '') IN ('operator_readonly', 'qa_team', 'monitoring_team')
  );

-- Policy 4: Only service role can insert queries
CREATE POLICY agent_queries_insert_service_only
  ON public.agent_queries
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 5: Service role and operators can update queries (for approval status)
CREATE POLICY agent_queries_update_service_and_operators
  ON public.agent_queries
  FOR UPDATE
  TO authenticated
  USING (
    auth.role() = 'service_role'
    OR COALESCE(auth.jwt() ->> 'role', '') IN ('operator_readonly', 'qa_team')
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR COALESCE(auth.jwt() ->> 'role', '') IN ('operator_readonly', 'qa_team')
  );

-- Policy 6: Prevent deletes (queries are audit records)
CREATE POLICY agent_queries_no_delete
  ON public.agent_queries
  FOR DELETE
  TO authenticated
  USING (false);

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS trg_agent_queries_updated_at ON public.agent_queries;
CREATE TRIGGER trg_agent_queries_updated_at
BEFORE UPDATE ON public.agent_queries
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Grant necessary permissions
GRANT SELECT ON public.agent_queries TO authenticated;
GRANT ALL ON public.agent_queries TO service_role;
GRANT USAGE, SELECT ON SEQUENCE agent_queries_id_seq TO service_role;

