-- Rollback: Agent Metrics schema and KPIs
-- Removes agent_run table, agent_qc table, and v_agent_kpis view

-- Drop view first
DROP VIEW IF EXISTS v_agent_kpis;

-- Drop tables (cascade to remove dependent objects)
DROP TABLE IF EXISTS agent_qc CASCADE;
DROP TABLE IF EXISTS agent_run CASCADE;

-- Drop any remaining indexes
DROP INDEX IF EXISTS idx_agent_run_agent_time;

