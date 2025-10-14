-- Migration: Create idempotency_records table
-- Purpose: Store idempotency keys and responses for duplicate request prevention
-- Author: Compliance Agent
-- Date: 2025-10-14

-- Create idempotency_records table
CREATE TABLE IF NOT EXISTS idempotency_records (
  key VARCHAR(255) PRIMARY KEY,
  request_hash VARCHAR(64),
  response_status INTEGER NOT NULL,
  response_body JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for TTL cleanup queries
CREATE INDEX IF NOT EXISTS idx_idempotency_created_at 
  ON idempotency_records(created_at);

-- Index for key lookup (primary key already provides this)
-- CREATE INDEX IF NOT EXISTS idx_idempotency_key ON idempotency_records(key);

-- Comments
COMMENT ON TABLE idempotency_records IS 'Stores idempotency keys and cached responses to prevent duplicate processing';
COMMENT ON COLUMN idempotency_records.key IS 'Unique idempotency key from client (e.g., UUID)';
COMMENT ON COLUMN idempotency_records.request_hash IS 'SHA256 hash of request body for conflict detection';
COMMENT ON COLUMN idempotency_records.response_status IS 'HTTP status code of cached response';
COMMENT ON COLUMN idempotency_records.response_body IS 'JSON response body to replay';
COMMENT ON COLUMN idempotency_records.created_at IS 'Timestamp for TTL expiration (24 hours)';

-- Auto-cleanup function (runs on insert to keep table clean)
CREATE OR REPLACE FUNCTION cleanup_old_idempotency_records()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM idempotency_records 
  WHERE created_at < NOW() - INTERVAL '24 hours';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-cleanup on insert
DROP TRIGGER IF EXISTS trigger_cleanup_idempotency ON idempotency_records;
CREATE TRIGGER trigger_cleanup_idempotency
  AFTER INSERT ON idempotency_records
  EXECUTE FUNCTION cleanup_old_idempotency_records();

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, DELETE ON idempotency_records TO agent_service;

