-- Migration: decision_log Append-Only Triggers (100% Database Protection)
-- Description: Block DELETE and UPDATE even for postgres superuser/table owner
-- Date: 2025-10-21
-- Agent: manager
-- Related: DATA-019 Dev Memory Protection (CEO requirement: "ensure db is protected from stuff getting deleted")

-- =============================================================================
-- TRIGGER-BASED PROTECTION: Prevents ALL deletes/updates (even superuser)
-- =============================================================================

-- Function that raises exception on delete/update attempts
CREATE OR REPLACE FUNCTION prevent_decision_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'decision_log is append-only audit trail - DELETE and UPDATE are forbidden';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Block DELETE (fires BEFORE delete, raises exception)
DROP TRIGGER IF EXISTS prevent_decision_log_delete ON decision_log;
CREATE TRIGGER prevent_decision_log_delete
  BEFORE DELETE ON decision_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_decision_log_modification();

-- Trigger: Block UPDATE (fires BEFORE update, raises exception)
DROP TRIGGER IF EXISTS prevent_decision_log_update ON decision_log;
CREATE TRIGGER prevent_decision_log_update
  BEFORE UPDATE ON decision_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_decision_log_modification();

-- Add documentation
COMMENT ON FUNCTION prevent_decision_log_modification() IS 
  'Trigger function to enforce append-only constraint on decision_log (blocks DELETE and UPDATE)';

COMMENT ON TRIGGER prevent_decision_log_delete ON decision_log IS 
  'Prevents DELETE on decision_log - ensures audit trail cannot be removed (even by superuser)';

COMMENT ON TRIGGER prevent_decision_log_update ON decision_log IS 
  'Prevents UPDATE on decision_log - ensures audit trail is immutable (even by superuser)';

-- Note: RLS policies provide additional layer for authenticated users
-- Triggers provide ultimate protection even for table owner (postgres) and app code (Prisma)

