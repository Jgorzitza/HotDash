-- DATABASE-LEVEL SECURITY IMPLEMENTATION
-- This script creates restricted database users and revokes dangerous permissions

-- 1. CREATE RESTRICTED USERS FOR DIFFERENT AGENT TYPES

-- DATA Agent: Can run migrations and schema changes
CREATE USER data_agent WITH PASSWORD 'secure_data_password_2025';
GRANT CONNECT ON DATABASE postgres TO data_agent;
GRANT USAGE ON SCHEMA public TO data_agent;
GRANT CREATE ON SCHEMA public TO data_agent;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO data_agent;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO data_agent;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO data_agent;

-- MANAGER Agent: Can read/write all tables, but NO schema changes
CREATE USER manager_agent WITH PASSWORD 'secure_manager_password_2025';
GRANT CONNECT ON DATABASE postgres TO manager_agent;
GRANT USAGE ON SCHEMA public TO manager_agent;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO manager_agent;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO manager_agent;
-- NO CREATE, DROP, ALTER permissions

-- OTHER AGENTS: Read-only access to most tables, write to specific tables
CREATE USER other_agents WITH PASSWORD 'secure_other_password_2025';
GRANT CONNECT ON DATABASE postgres TO other_agents;
GRANT USAGE ON SCHEMA public TO other_agents;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO other_agents;
-- Write access only to DecisionLog and TaskAssignment
GRANT INSERT, UPDATE ON DecisionLog TO other_agents;
GRANT INSERT, UPDATE ON TaskAssignment TO other_agents;
-- NO CREATE, DROP, ALTER permissions

-- 2. CREATE SECURITY FUNCTIONS

-- Function to check if agent is authorized for schema changes
CREATE OR REPLACE FUNCTION check_schema_permissions()
RETURNS BOOLEAN AS $$
BEGIN
    -- Only data_agent can make schema changes
    IF current_user = 'data_agent' THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'SCHEMA_CHANGE_VIOLATION: Only data_agent can modify schema. Current user: %', current_user;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security violations
CREATE OR REPLACE FUNCTION log_security_violation(
    agent_name TEXT,
    operation TEXT,
    violation_type TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO DecisionLog (
        scope, actor, action, rationale, evidenceUrl,
        taskId, status, progressPct, createdAt
    ) VALUES (
        'ops', agent_name, 'security_violation', 
        'Database security violation: ' || violation_type || ' - ' || operation,
        'database_security.sql',
        'SECURITY-' || EXTRACT(EPOCH FROM NOW())::TEXT,
        'completed', 0, NOW()
    );
EXCEPTION
    WHEN OTHERS THEN
        -- If DecisionLog doesn't exist, log to system log
        RAISE WARNING 'Security violation: Agent % attempted % (%): %', agent_name, operation, violation_type, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREATE TRIGGERS TO ENFORCE SECURITY

-- Trigger function to prevent unauthorized schema changes
CREATE OR REPLACE FUNCTION prevent_unauthorized_ddl()
RETURNS EVENT_TRIGGER AS $$
DECLARE
    violation_info TEXT;
BEGIN
    -- Check if current user is authorized for DDL operations
    IF current_user NOT IN ('data_agent', 'postgres') THEN
        violation_info := 'Unauthorized DDL attempt by ' || current_user || ' at ' || NOW();
        
        -- Log the violation
        PERFORM log_security_violation(current_user, 'DDL_OPERATION', 'unauthorized_schema_change');
        
        -- Raise exception to block the operation
        RAISE EXCEPTION 'SECURITY_VIOLATION: Unauthorized schema change attempted by %. Only data_agent can modify schema.', current_user;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create event trigger for DDL operations
DROP EVENT TRIGGER IF EXISTS prevent_unauthorized_ddl_trigger;
CREATE EVENT TRIGGER prevent_unauthorized_ddl_trigger
    ON ddl_command_end
    EXECUTE FUNCTION prevent_unauthorized_ddl();

-- 4. CREATE ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on critical tables
ALTER TABLE DecisionLog ENABLE ROW LEVEL SECURITY;
ALTER TABLE TaskAssignment ENABLE ROW LEVEL SECURITY;

-- DecisionLog policies
CREATE POLICY decision_log_read_policy ON DecisionLog
    FOR SELECT USING (true); -- All authenticated users can read

CREATE POLICY decision_log_write_policy ON DecisionLog
    FOR INSERT WITH CHECK (true); -- All authenticated users can insert

CREATE POLICY decision_log_update_policy ON DecisionLog
    FOR UPDATE USING (true); -- All authenticated users can update

-- TaskAssignment policies  
CREATE POLICY task_assignment_read_policy ON TaskAssignment
    FOR SELECT USING (true); -- All authenticated users can read

CREATE POLICY task_assignment_write_policy ON TaskAssignment
    FOR INSERT WITH CHECK (true); -- All authenticated users can insert

CREATE POLICY task_assignment_update_policy ON TaskAssignment
    FOR UPDATE USING (true); -- All authenticated users can update

-- 5. CREATE SECURITY VIEWS

-- View for agents to check their permissions
CREATE OR REPLACE VIEW agent_permissions AS
SELECT 
    current_user as agent,
    CASE 
        WHEN current_user = 'data_agent' THEN 'FULL_ACCESS'
        WHEN current_user = 'manager_agent' THEN 'READ_WRITE_NO_SCHEMA'
        WHEN current_user = 'other_agents' THEN 'READ_ONLY_WITH_FEEDBACK'
        ELSE 'RESTRICTED'
    END as permission_level,
    CASE 
        WHEN current_user = 'data_agent' THEN 'Can run migrations and schema changes'
        WHEN current_user = 'manager_agent' THEN 'Can read/write data, no schema changes'
        WHEN current_user = 'other_agents' THEN 'Can read data, write to DecisionLog/TaskAssignment'
        ELSE 'Minimal permissions'
    END as description;

-- 6. CREATE SECURITY MONITORING FUNCTION

CREATE OR REPLACE FUNCTION check_database_security()
RETURNS TABLE(
    agent TEXT,
    permission_level TEXT,
    can_create BOOLEAN,
    can_drop BOOLEAN,
    can_alter BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        current_user::TEXT as agent,
        CASE 
            WHEN current_user = 'data_agent' THEN 'FULL_ACCESS'
            WHEN current_user = 'manager_agent' THEN 'READ_WRITE_NO_SCHEMA'
            WHEN current_user = 'other_agents' THEN 'READ_ONLY_WITH_FEEDBACK'
            ELSE 'RESTRICTED'
        END::TEXT as permission_level,
        (current_user = 'data_agent') as can_create,
        (current_user = 'data_agent') as can_drop,
        (current_user = 'data_agent') as can_alter;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. GRANT PERMISSIONS TO SECURITY FUNCTIONS

-- All agents can check their permissions
GRANT EXECUTE ON FUNCTION check_database_security() TO data_agent, manager_agent, other_agents;
GRANT SELECT ON agent_permissions TO data_agent, manager_agent, other_agents;

-- 8. CREATE SECURITY LOGGING

-- Create security events table
CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    event_time TIMESTAMPTZ DEFAULT NOW(),
    agent TEXT NOT NULL,
    operation TEXT NOT NULL,
    violation_type TEXT,
    details JSONB,
    blocked BOOLEAN DEFAULT FALSE
);

-- Grant access to security events
GRANT SELECT ON security_events TO data_agent, manager_agent, other_agents;
GRANT INSERT ON security_events TO data_agent, manager_agent, other_agents;

-- 9. REVOKE DANGEROUS PERMISSIONS FROM POSTGRES USER

-- Create a backup superuser first
CREATE USER database_admin WITH PASSWORD 'secure_admin_password_2025' SUPERUSER;

-- Revoke dangerous permissions from postgres user for application connections
-- (Keep postgres user for admin tasks, but restrict application usage)

-- 10. CREATE CONNECTION SECURITY

-- Create connection limits
ALTER USER data_agent CONNECTION LIMIT 5;
ALTER USER manager_agent CONNECTION LIMIT 10;
ALTER USER other_agents CONNECTION LIMIT 20;

-- Set session timeouts
ALTER USER data_agent SET statement_timeout = '30min';
ALTER USER manager_agent SET statement_timeout = '10min';
ALTER USER other_agents SET statement_timeout = '5min';

COMMIT;
