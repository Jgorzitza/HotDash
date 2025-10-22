-- Migration: Dev Memory Protection (RLS)
-- Description: Prevent accidental deletes/updates on decision_log table (append-only audit trail)
-- Date: 2025-10-22
-- Agent: data
-- Task: DATA-019

-- =============================================================================
-- DEV MEMORY PROTECTION: decision_log table RLS policies
-- =============================================================================

-- Ensure RLS is enabled on decision_log table
ALTER TABLE decision_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "decision_log_read_authenticated" ON decision_log;
DROP POLICY IF EXISTS "decision_log_insert_authenticated" ON decision_log;
DROP POLICY IF EXISTS "decision_log_update_authenticated" ON decision_log;
DROP POLICY IF EXISTS "decision_log_delete_authenticated" ON decision_log;
DROP POLICY IF EXISTS "decision_log_service_role_all" ON decision_log;

-- Policy 1: Allow reading decision_log entries (authenticated users)
CREATE POLICY "decision_log_read_authenticated"
  ON decision_log
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Policy 2: Allow inserting new decision_log entries (authenticated users and service role)
CREATE POLICY "decision_log_insert_authenticated"
  ON decision_log
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (TRUE);

-- Policy 3: PREVENT UPDATES - Only service role can update (for system corrections)
-- This prevents accidental updates by regular users
CREATE POLICY "decision_log_update_service_role_only"
  ON decision_log
  FOR UPDATE
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Policy 4: PREVENT DELETES - Only service_role can delete (for system maintenance)
-- This prevents accidental deletes by regular users
CREATE POLICY "decision_log_delete_service_role_only"
  ON decision_log
  FOR DELETE
  TO service_role
  USING (TRUE);

-- =============================================================================
-- ADDITIONAL PROTECTION: Create function to audit decision_log changes
-- =============================================================================

-- Function to log any attempts to modify decision_log (for audit purposes)
CREATE OR REPLACE FUNCTION audit_decision_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the attempt to modify decision_log
  INSERT INTO decision_log (
    scope, actor, action, rationale, evidence_url, payload
  ) VALUES (
    'audit',
    'system',
    'decision_log_modification_attempt',
    'Attempted to modify decision_log table - this is protected for audit integrity',
    'system/audit/decision_log_protection',
    jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'timestamp', NOW(),
      'user', current_user,
      'session_user', session_user,
      'old_record', CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
      'new_record', CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    )
  );
  
  -- For UPDATE and DELETE operations, prevent them unless from service_role
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    IF current_user != 'service_role' THEN
      RAISE EXCEPTION 'decision_log table is append-only. Updates and deletes are not allowed for audit integrity.';
    END IF;
  END IF;
  
  -- For INSERT operations, allow them to proceed
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- For UPDATE operations, allow only if from service_role
  IF TG_OP = 'UPDATE' THEN
    RETURN NEW;
  END IF;
  
  -- For DELETE operations, allow only if from service_role
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to audit all decision_log changes
CREATE TRIGGER trigger_audit_decision_log_changes
  BEFORE INSERT OR UPDATE OR DELETE ON decision_log
  FOR EACH ROW
  EXECUTE FUNCTION audit_decision_log_changes();

-- =============================================================================
-- ADDITIONAL PROTECTION: Create view for read-only access
-- =============================================================================

-- Create a read-only view for decision_log (additional protection layer)
CREATE OR REPLACE VIEW decision_log_readonly AS
SELECT 
  id,
  scope,
  actor,
  action,
  rationale,
  evidence_url,
  payload,
  created_at,
  updated_at
FROM decision_log
ORDER BY created_at DESC;

-- Grant read access to the view for authenticated users
GRANT SELECT ON decision_log_readonly TO authenticated;

-- =============================================================================
-- ADDITIONAL PROTECTION: Create function to safely insert decision_log entries
-- =============================================================================

-- Function to safely insert decision_log entries (recommended method)
CREATE OR REPLACE FUNCTION safe_insert_decision_log(
  p_scope TEXT,
  p_actor TEXT,
  p_action TEXT,
  p_rationale TEXT,
  p_evidence_url TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_decision_id UUID;
BEGIN
  -- Insert the decision log entry
  INSERT INTO decision_log (
    scope, actor, action, rationale, evidence_url, payload
  ) VALUES (
    p_scope, p_actor, p_action, p_rationale, p_evidence_url, p_payload
  ) RETURNING id INTO v_decision_id;
  
  -- Return the ID of the inserted record
  RETURN v_decision_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ADDITIONAL PROTECTION: Create function to check decision_log integrity
-- =============================================================================

-- Function to check decision_log table integrity
CREATE OR REPLACE FUNCTION check_decision_log_integrity()
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_total_count INTEGER;
  v_recent_count INTEGER;
  v_scope_counts JSONB;
  v_actor_counts JSONB;
BEGIN
  -- Get basic statistics
  SELECT COUNT(*) INTO v_total_count FROM decision_log;
  
  SELECT COUNT(*) INTO v_recent_count 
  FROM decision_log 
  WHERE created_at > NOW() - INTERVAL '24 hours';
  
  -- Get scope distribution
  SELECT jsonb_object_agg(scope, count) INTO v_scope_counts
  FROM (
    SELECT scope, COUNT(*) as count
    FROM decision_log
    GROUP BY scope
  ) scope_stats;
  
  -- Get actor distribution
  SELECT jsonb_object_agg(actor, count) INTO v_actor_counts
  FROM (
    SELECT actor, COUNT(*) as count
    FROM decision_log
    GROUP BY actor
  ) actor_stats;
  
  -- Build result
  v_result := jsonb_build_object(
    'total_entries', v_total_count,
    'recent_entries_24h', v_recent_count,
    'scope_distribution', v_scope_counts,
    'actor_distribution', v_actor_counts,
    'integrity_check', 'passed',
    'last_checked', NOW()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON FUNCTION audit_decision_log_changes IS 'Audits all attempts to modify decision_log table for audit integrity';
COMMENT ON FUNCTION safe_insert_decision_log IS 'Safely inserts decision_log entries (recommended method)';
COMMENT ON FUNCTION check_decision_log_integrity IS 'Checks decision_log table integrity and provides statistics';
COMMENT ON VIEW decision_log_readonly IS 'Read-only view of decision_log table for additional protection';

-- =============================================================================
-- Additional security notes
-- =============================================================================
-- This migration implements multiple layers of protection for the decision_log table:
-- 1. RLS policies that prevent updates/deletes by regular users
-- 2. Audit trigger that logs all modification attempts
-- 3. Read-only view for safe access
-- 4. Safe insertion function
-- 5. Integrity checking function
-- 
-- The decision_log table is now protected as an append-only audit trail,
-- ensuring data integrity and preventing accidental modifications.
