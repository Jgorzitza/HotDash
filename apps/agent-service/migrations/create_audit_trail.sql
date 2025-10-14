-- Migration: Create audit_trail table (immutable, append-only)
-- Purpose: Tamper-proof audit logging with hash chaining for integrity
-- Author: Compliance Agent
-- Date: 2025-10-14

-- Create audit_trail table
CREATE TABLE IF NOT EXISTS audit_trail (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  resource VARCHAR(100),
  resource_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  previous_hash VARCHAR(64),
  event_hash VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_email ON audit_trail(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_trail_event_type ON audit_trail(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource ON audit_trail(resource);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource_id ON audit_trail(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_event_hash ON audit_trail(event_hash);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_time ON audit_trail(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource_time ON audit_trail(resource, resource_id, created_at DESC);

-- Prevent UPDATE (append-only enforcement)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit trail is immutable - modifications not allowed';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_audit_update ON audit_trail;
CREATE TRIGGER prevent_audit_update
  BEFORE UPDATE ON audit_trail
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

-- Prevent DELETE (append-only enforcement)
DROP TRIGGER IF EXISTS prevent_audit_delete ON audit_trail;
CREATE TRIGGER prevent_audit_delete
  BEFORE DELETE ON audit_trail
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

-- Comments
COMMENT ON TABLE audit_trail IS 'Immutable audit log with hash chaining for tamper detection and compliance reporting';
COMMENT ON COLUMN audit_trail.event_type IS 'Type of event: action:approved, data:accessed, config:changed, etc.';
COMMENT ON COLUMN audit_trail.user_id IS 'User who performed the action';
COMMENT ON COLUMN audit_trail.resource IS 'Resource type being accessed (e.g., "order", "customer", "config")';
COMMENT ON COLUMN audit_trail.resource_id IS 'Specific resource identifier (e.g., order ID)';
COMMENT ON COLUMN audit_trail.action IS 'Action performed (e.g., "approve_refund", "export_data")';
COMMENT ON COLUMN audit_trail.metadata IS 'Additional context (approval details, changes made, etc.)';
COMMENT ON COLUMN audit_trail.previous_hash IS 'SHA256 hash of previous event for chain integrity verification';
COMMENT ON COLUMN audit_trail.event_hash IS 'SHA256 hash of this event (unique, tamper detection)';

-- Create view for recent activity (last 24 hours)
CREATE OR REPLACE VIEW audit_recent_activity AS
SELECT 
  event_type,
  user_email,
  user_role,
  resource,
  action,
  created_at
FROM audit_trail
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Create view for denied access attempts
CREATE OR REPLACE VIEW audit_denied_access AS
SELECT 
  user_email,
  user_role,
  action,
  reason,
  created_at
FROM access_logs
WHERE result = 'DENIED'
ORDER BY created_at DESC;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT ON audit_trail TO agent_service;
-- GRANT USAGE, SELECT ON SEQUENCE audit_trail_id_seq TO agent_service;
-- GRANT SELECT ON audit_recent_activity TO agent_service;
-- GRANT SELECT ON audit_denied_access TO agent_service;

