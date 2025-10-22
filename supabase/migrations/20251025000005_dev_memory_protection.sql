-- Migration: DATA-019 Dev Memory Protection (RLS)
-- Description: Add RLS policies to decision_log to prevent accidental deletes/updates (append-only audit trail)
-- Date: 2025-10-21
-- Agent: data
-- Related: Phase 10 - Vendor Master + ALC

-- =============================================================================
-- RLS POLICIES: decision_log (Append-Only Audit Trail)
-- =============================================================================

-- Enable RLS on decision_log if not already enabled
ALTER TABLE decision_log ENABLE ROW LEVEL SECURITY;

-- Prevent deletes (NO ONE can delete decision_log records)
CREATE POLICY "decision_log_no_delete"
  ON decision_log
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- Prevent updates (immutable audit trail)
CREATE POLICY "decision_log_no_update"
  ON decision_log
  FOR UPDATE
  TO authenticated
  USING (FALSE);

-- Add comments for documentation
COMMENT ON POLICY "decision_log_no_delete" ON decision_log IS 'Append-only audit trail - prevents accidental deletions by agents';
COMMENT ON POLICY "decision_log_no_update" ON decision_log IS 'Immutable audit - prevents modification of historical records';

-- Note: decision_log already allows SELECT and INSERT via existing RLS policies
-- This migration only adds the restrictive DELETE and UPDATE policies

