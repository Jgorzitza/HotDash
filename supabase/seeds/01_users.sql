-- Seed Data: Test Users
-- Purpose: Create test users with different roles for RLS testing
-- Generated: 2025-10-19
-- Safety: LOCAL DEVELOPMENT ONLY - Do not apply to production

-- Clean up existing test data (if rerunning)
DO $$
BEGIN
  -- Create roles if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_user') THEN
    CREATE ROLE admin_user LOGIN PASSWORD 'admin-test-123';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'operator_user') THEN
    CREATE ROLE operator_user LOGIN PASSWORD 'operator-test-123';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'viewer_user') THEN
    CREATE ROLE viewer_user LOGIN PASSWORD 'viewer-test-123';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rls_test_user') THEN
    CREATE ROLE rls_test_user LOGIN PASSWORD 'rls-test-123';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ai_readonly') THEN
    CREATE ROLE ai_readonly NOINHERIT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analytics_reader') THEN
    CREATE ROLE analytics_reader NOINHERIT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'annotator') THEN
    CREATE ROLE annotator NOINHERIT;
  END IF;
END$$;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO admin_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin_user;

GRANT USAGE ON SCHEMA public TO operator_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO operator_user;
GRANT INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO operator_user;

GRANT USAGE ON SCHEMA public TO viewer_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO viewer_user;

GRANT USAGE ON SCHEMA public TO rls_test_user;
GRANT authenticated TO rls_test_user;

-- AI and analytics roles
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_reader;

-- Annotator role (for agent feedback)
GRANT SELECT, UPDATE ON ALL TABLES IN SCHEMA public TO annotator;

-- Log seed application
DO $$
BEGIN
  RAISE NOTICE 'Seed 01_users.sql applied successfully';
  RAISE NOTICE 'Test users created: admin_user, operator_user, viewer_user, rls_test_user';
  RAISE NOTICE 'Special roles created: ai_readonly, analytics_reader, annotator';
END$$;

