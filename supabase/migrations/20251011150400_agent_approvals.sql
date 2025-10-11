-- Agent SDK: Approval Queue Table
-- Priority: HIGH (Agent SDK integration)
-- Owner: data
-- Date: 2025-10-11
-- Ref: docs/directions/data.md Task 2 (Agent SDK Database Schemas)

-- Create agent_approvals table for approval queue and training data
CREATE TABLE IF NOT EXISTS public.agent_approvals (
  id BIGSERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  serialized JSONB NOT NULL,
  last_interruptions JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS agent_approvals_conversation_id_idx 
  ON public.agent_approvals (conversation_id);

CREATE INDEX IF NOT EXISTS agent_approvals_created_at_idx 
  ON public.agent_approvals (created_at DESC);

CREATE INDEX IF NOT EXISTS agent_approvals_status_idx 
  ON public.agent_approvals (status);

CREATE INDEX IF NOT EXISTS agent_approvals_status_created_idx 
  ON public.agent_approvals (status, created_at DESC) 
  WHERE status = 'pending';

-- Add helpful comments
COMMENT ON TABLE public.agent_approvals IS 'Agent SDK approval queue for human-in-the-loop workflows. Stores serialized conversation state awaiting approval.';
COMMENT ON COLUMN public.agent_approvals.id IS 'Unique identifier for approval record';
COMMENT ON COLUMN public.agent_approvals.conversation_id IS 'Agent SDK conversation identifier (indexed for lookup)';
COMMENT ON COLUMN public.agent_approvals.serialized IS 'Serialized conversation state (JSONB for flexible schema)';
COMMENT ON COLUMN public.agent_approvals.last_interruptions IS 'Array of interruption events (JSONB)';
COMMENT ON COLUMN public.agent_approvals.created_at IS 'Timestamp when approval request created (indexed)';
COMMENT ON COLUMN public.agent_approvals.approved_by IS 'User identifier who approved/rejected';
COMMENT ON COLUMN public.agent_approvals.status IS 'Approval status: pending, approved, rejected, expired';
COMMENT ON COLUMN public.agent_approvals.updated_at IS 'Timestamp of last status change';

-- Enable Row Level Security
ALTER TABLE public.agent_approvals ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role has full access (Agent SDK operations)
CREATE POLICY agent_approvals_service_role_all
  ON public.agent_approvals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can read their own conversation approvals
-- Uses JWT claim 'conversation_id' or session variable
CREATE POLICY agent_approvals_read_own
  ON public.agent_approvals
  FOR SELECT
  TO authenticated
  USING (
    conversation_id = COALESCE(
      current_setting('app.conversation_id', true),
      auth.jwt() ->> 'conversation_id'
    )
    OR auth.role() = 'service_role'
  );

-- Policy 3: Only service role can insert approvals
CREATE POLICY agent_approvals_insert_service_only
  ON public.agent_approvals
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 4: Only service role can update approvals (for status changes)
CREATE POLICY agent_approvals_update_service_only
  ON public.agent_approvals
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 5: Prevent deletes (approvals are audit records)
-- Only service role can delete for cleanup
CREATE POLICY agent_approvals_no_delete
  ON public.agent_approvals
  FOR DELETE
  TO authenticated
  USING (false);

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_agent_approvals_updated_at ON public.agent_approvals;
CREATE TRIGGER trg_agent_approvals_updated_at
BEFORE UPDATE ON public.agent_approvals
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Grant necessary permissions
GRANT SELECT ON public.agent_approvals TO authenticated;
GRANT ALL ON public.agent_approvals TO service_role;
GRANT USAGE, SELECT ON SEQUENCE agent_approvals_id_seq TO service_role;

