-- Audit Log Schema
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: Immutable audit trail with append-only trigger

-- ============================================================================
-- Table: audit_logs
-- Purpose: Immutable audit trail for all actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  payload JSONB,
  result TEXT CHECK (result IN ('success', 'failure', 'pending')) NOT NULL,
  result_details JSONB,
  rollback_ref TEXT,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_created_at_idx ON public.audit_logs (actor, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_created_at_idx ON public.audit_logs (action, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_entity_type_id_created_at_idx ON public.audit_logs (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_result_created_at_idx ON public.audit_logs (result, created_at DESC);

COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail for all actions (append-only)';
COMMENT ON COLUMN public.audit_logs.actor IS 'Who performed the action (user email or system)';
COMMENT ON COLUMN public.audit_logs.action IS 'Action performed (e.g., approval.approved, inventory.updated)';
COMMENT ON COLUMN public.audit_logs.entity_type IS 'Type of entity affected (e.g., approval, product, conversation)';
COMMENT ON COLUMN public.audit_logs.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN public.audit_logs.payload IS 'Action payload (before/after state, parameters)';
COMMENT ON COLUMN public.audit_logs.result IS 'Result of the action: success, failure, pending';
COMMENT ON COLUMN public.audit_logs.result_details IS 'Detailed result information (errors, warnings)';
COMMENT ON COLUMN public.audit_logs.rollback_ref IS 'Reference to rollback artifact if applicable';
COMMENT ON COLUMN public.audit_logs.context IS 'Additional context (request ID, session, etc.)';

-- ============================================================================
-- Append-Only Trigger (Prevent Updates/Deletes)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: updates and deletes are not allowed';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_logs_prevent_update
BEFORE UPDATE ON public.audit_logs
FOR EACH ROW EXECUTE PROCEDURE public.prevent_audit_log_modification();

CREATE TRIGGER trg_audit_logs_prevent_delete
BEFORE DELETE ON public.audit_logs
FOR EACH ROW EXECUTE PROCEDURE public.prevent_audit_log_modification();

COMMENT ON FUNCTION public.prevent_audit_log_modification IS 'Prevents updates and deletes on audit_logs table';

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role: Full access (FOR ALL)
CREATE POLICY audit_logs_service_role
  ON public.audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users: Read-only (FOR SELECT)
CREATE POLICY audit_logs_read_all
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role only: Can insert
CREATE POLICY audit_logs_insert_service
  ON public.audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- No updates for authenticated users (trigger will block anyway)
CREATE POLICY audit_logs_no_update
  ON public.audit_logs
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- No deletes for authenticated users (trigger will block anyway)
CREATE POLICY audit_logs_no_delete
  ON public.audit_logs
  FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
GRANT USAGE, SELECT ON SEQUENCE audit_logs_id_seq TO service_role;

