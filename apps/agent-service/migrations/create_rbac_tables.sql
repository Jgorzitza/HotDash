-- Migration: Create RBAC (Role-Based Access Control) tables
-- Purpose: User management, roles, permissions, and access audit logs
-- Author: Compliance Agent
-- Date: 2025-10-14

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('system', 'admin', 'operator', 'viewer')),
  shopify_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create access_logs table (audit trail for all access attempts)
CREATE TABLE IF NOT EXISTS access_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  method VARCHAR(10) NOT NULL,
  path TEXT NOT NULL,
  ip VARCHAR(45),
  result VARCHAR(20) NOT NULL CHECK (result IN ('GRANTED', 'DENIED')),
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_shopify_id ON users(shopify_id);

CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_result ON access_logs(result);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_role ON access_logs(user_role);

-- Comments
COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID or Shopify ID)';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.role IS 'User role: system, admin, operator, or viewer';
COMMENT ON COLUMN users.shopify_id IS 'Optional Shopify user ID for integration';

COMMENT ON TABLE access_logs IS 'Audit log of all access attempts (granted and denied)';
COMMENT ON COLUMN access_logs.result IS 'Access result: GRANTED or DENIED';
COMMENT ON COLUMN access_logs.reason IS 'Reason for access decision (e.g., "Missing permissions")';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (for initial setup)
INSERT INTO users (id, email, role, created_at)
VALUES ('admin-system', 'admin@hotdash.app', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON users TO agent_service;
-- GRANT SELECT, INSERT ON access_logs TO agent_service;
-- GRANT USAGE, SELECT ON SEQUENCE access_logs_id_seq TO agent_service;

