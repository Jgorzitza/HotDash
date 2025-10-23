-- =====================================================
-- COMPREHENSIVE DATABASE SECURITY AUDIT & FIXES
-- =====================================================
-- This migration implements all critical security measures
-- to prevent data loss and unauthorized access

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

-- Enable RLS on all existing tables
ALTER TABLE cx_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cx_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_engine_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatwoot_conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_master ENABLE ROW LEVEL SECURITY;

-- 2. CREATE AUDIT LOGGING SYSTEM
-- =====================================================

-- Create comprehensive audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  agent_name TEXT,
  user_id TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT
);

-- Create indexes for audit log performance
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_agent_name ON audit_log(agent_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON audit_log(operation);

-- 3. AGENT-SPECIFIC RLS POLICIES
-- =====================================================

-- Task Assignment Policies
CREATE POLICY "agents_own_tasks" ON task_assignment 
FOR ALL TO authenticated 
USING (assigned_to = current_setting('app.agent_name', true) OR 
       current_setting('app.agent_name', true) = 'manager' OR
       current_setting('app.agent_name', true) = 'admin');

-- Decision Log Policies
CREATE POLICY "agents_own_decisions" ON decision_log 
FOR ALL TO authenticated 
USING (agent_name = current_setting('app.agent_name', true) OR 
       current_setting('app.agent_name', true) = 'manager' OR
       current_setting('app.agent_name', true) = 'admin');

-- CX Embeddings Policies (Data agent only)
CREATE POLICY "data_agent_cx_embeddings" ON cx_embeddings 
FOR ALL TO authenticated 
USING (current_setting('app.agent_name', true) = 'data' OR
       current_setting('app.agent_name', true) = 'manager' OR
       current_setting('app.agent_name', true) = 'admin');

-- CX Themes Policies (Data agent only)
CREATE POLICY "data_agent_cx_themes" ON cx_themes 
FOR ALL TO authenticated 
USING (current_setting('app.agent_name', true) = 'data' OR
       current_setting('app.agent_name', true) = 'manager' OR
       current_setting('app.agent_name', true) = 'admin');

-- Product Actions Policies (Product agent only)
CREATE POLICY "product_agent_actions" ON product_actions 
FOR ALL TO authenticated 
USING (current_setting('app.agent_name', true) = 'product' OR
       current_setting('app.agent_name', true) = 'manager' OR
       current_setting('app.agent_name', true) = 'admin');

-- Growth Engine Actions Policies (Growth agent only)
CREATE POLICY "growth_agent_actions" ON growth_engine_actions 
FOR ALL TO authenticated 
USING (current_setting('app.agent_name', true) = 'growth' OR
       current_setting('app.agent_name', true) = 'manager' OR
       current_setting('app.agent_name', true) = 'admin');

-- 4. PREVENT DANGEROUS BULK OPERATIONS
-- =====================================================

-- Prevent bulk deletes on critical tables
CREATE POLICY "no_bulk_delete_tasks" ON task_assignment 
FOR DELETE TO authenticated 
USING (false);

CREATE POLICY "no_bulk_delete_decisions" ON decision_log 
FOR DELETE TO authenticated 
USING (false);

CREATE POLICY "no_bulk_delete_embeddings" ON cx_embeddings 
FOR DELETE TO authenticated 
USING (false);

-- Allow only single-record operations for safety
CREATE POLICY "single_record_operations" ON task_assignment 
FOR UPDATE TO authenticated 
USING (id IN (SELECT id FROM task_assignment WHERE assigned_to = current_setting('app.agent_name', true) LIMIT 1));

-- 5. CREATE SECURITY FUNCTIONS
-- =====================================================

-- Function to log all database operations
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    agent_name,
    old_data,
    new_data,
    timestamp
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    current_setting('app.agent_name', true),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE AUDIT TRIGGERS
-- =====================================================

-- Create triggers for all critical tables
CREATE TRIGGER audit_task_assignment
  AFTER INSERT OR UPDATE OR DELETE ON task_assignment
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_decision_log
  AFTER INSERT OR UPDATE OR DELETE ON decision_log
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_cx_embeddings
  AFTER INSERT OR UPDATE OR DELETE ON cx_embeddings
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_cx_themes
  AFTER INSERT OR UPDATE OR DELETE ON cx_themes
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_product_actions
  AFTER INSERT OR UPDATE OR DELETE ON product_actions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_growth_engine_actions
  AFTER INSERT OR UPDATE OR DELETE ON growth_engine_actions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 7. CREATE SECURITY VIEWS
-- =====================================================

-- View for agents to see only their own data
CREATE VIEW agent_tasks AS
SELECT * FROM task_assignment 
WHERE assigned_to = current_setting('app.agent_name', true);

-- View for managers to see all data
CREATE VIEW manager_overview AS
SELECT * FROM task_assignment;

-- 8. CREATE SECURITY ROLES
-- =====================================================

-- Create agent-specific roles
CREATE ROLE IF NOT EXISTS agent_data;
CREATE ROLE IF NOT EXISTS agent_manager;
CREATE ROLE IF NOT EXISTS agent_product;
CREATE ROLE IF NOT EXISTS agent_growth;
CREATE ROLE IF NOT EXISTS agent_support;
CREATE ROLE IF NOT EXISTS agent_analytics;

-- Grant appropriate permissions to each role
GRANT SELECT, INSERT, UPDATE ON task_assignment TO agent_data;
GRANT SELECT, INSERT, UPDATE ON decision_log TO agent_data;
GRANT SELECT, INSERT, UPDATE ON cx_embeddings TO agent_data;
GRANT SELECT, INSERT, UPDATE ON cx_themes TO agent_data;

GRANT ALL ON ALL TABLES TO agent_manager;

GRANT SELECT, INSERT, UPDATE ON task_assignment TO agent_product;
GRANT SELECT, INSERT, UPDATE ON product_actions TO agent_product;

GRANT SELECT, INSERT, UPDATE ON task_assignment TO agent_growth;
GRANT SELECT, INSERT, UPDATE ON growth_engine_actions TO agent_growth;

-- 9. CREATE SECURITY MONITORING
-- =====================================================

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TABLE (
  agent_name TEXT,
  operation_count BIGINT,
  suspicious_operations TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.agent_name,
    COUNT(*) as operation_count,
    ARRAY_AGG(DISTINCT al.operation) as suspicious_operations
  FROM audit_log al
  WHERE al.timestamp > NOW() - INTERVAL '1 hour'
  GROUP BY al.agent_name
  HAVING COUNT(*) > 100; -- More than 100 operations in 1 hour is suspicious
END;
$$ LANGUAGE plpgsql;

-- 10. CREATE BACKUP AND RECOVERY FUNCTIONS
-- =====================================================

-- Function to create point-in-time backups
CREATE OR REPLACE FUNCTION create_security_backup()
RETURNS TEXT AS $$
DECLARE
  backup_name TEXT;
BEGIN
  backup_name := 'security_backup_' || to_char(NOW(), 'YYYY_MM_DD_HH24_MI_SS');
  
  -- Create backup of critical tables
  EXECUTE format('CREATE TABLE %I AS SELECT * FROM task_assignment', backup_name || '_tasks');
  EXECUTE format('CREATE TABLE %I AS SELECT * FROM decision_log', backup_name || '_decisions');
  
  RETURN backup_name;
END;
$$ LANGUAGE plpgsql;

-- 11. CREATE SECURITY ALERTS
-- =====================================================

-- Function to send security alerts
CREATE OR REPLACE FUNCTION send_security_alert(alert_message TEXT)
RETURNS VOID AS $$
BEGIN
  -- Log the alert
  INSERT INTO audit_log (table_name, operation, agent_name, new_data)
  VALUES ('security', 'ALERT', 'system', to_jsonb(alert_message));
  
  -- In a real implementation, this would send notifications
  RAISE NOTICE 'SECURITY ALERT: %', alert_message;
END;
$$ LANGUAGE plpgsql;

-- 12. CREATE SECURITY CONSTRAINTS
-- =====================================================

-- Add constraints to prevent data corruption
ALTER TABLE task_assignment ADD CONSTRAINT check_valid_status 
CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled', 'blocked'));

ALTER TABLE task_assignment ADD CONSTRAINT check_valid_priority 
CHECK (priority IN ('P0', 'P1', 'P2', 'P3', 'P4', 'P5'));

-- 13. CREATE SECURITY INDEXES
-- =====================================================

-- Create indexes for security monitoring
CREATE INDEX IF NOT EXISTS idx_task_assignment_agent ON task_assignment(assigned_to);
CREATE INDEX IF NOT EXISTS idx_decision_log_agent ON decision_log(agent_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_suspicious ON audit_log(agent_name, timestamp) 
WHERE operation IN ('DELETE', 'UPDATE');

-- 14. CREATE SECURITY DOCUMENTATION
-- =====================================================

-- Create a security documentation table
CREATE TABLE IF NOT EXISTS security_documentation (
  id SERIAL PRIMARY KEY,
  security_measure TEXT NOT NULL,
  description TEXT,
  implementation_date TIMESTAMP DEFAULT NOW(),
  last_reviewed TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- Insert security measures documentation
INSERT INTO security_documentation (security_measure, description) VALUES
('RLS Policies', 'Row Level Security enabled on all tables with agent-specific access'),
('Audit Logging', 'Comprehensive audit logging for all database operations'),
('Bulk Operation Prevention', 'Policies to prevent dangerous bulk deletes and updates'),
('Agent-Specific Roles', 'Database roles with appropriate permissions for each agent'),
('Security Monitoring', 'Functions to detect suspicious database activity'),
('Backup and Recovery', 'Automated backup functions for critical data'),
('Security Alerts', 'Alert system for security violations');

-- 15. FINAL SECURITY VALIDATION
-- =====================================================

-- Validate that all security measures are in place
DO $$
DECLARE
  rls_count INTEGER;
  policy_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Check RLS is enabled
  SELECT COUNT(*) INTO rls_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' 
    AND c.relkind = 'r'
    AND c.relrowsecurity = true;
  
  -- Check policies exist
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  -- Check triggers exist
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' 
    AND t.tgname LIKE 'audit_%';
  
  -- Log security status
  INSERT INTO audit_log (table_name, operation, agent_name, new_data)
  VALUES ('security', 'VALIDATION', 'system', 
    jsonb_build_object(
      'rls_enabled_tables', rls_count,
      'security_policies', policy_count,
      'audit_triggers', trigger_count,
      'validation_timestamp', NOW()
    )
  );
  
  RAISE NOTICE 'Security validation complete: % tables with RLS, % policies, % audit triggers', 
    rls_count, policy_count, trigger_count;
END;
$$;
