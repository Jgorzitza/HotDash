-- Migration: Growth Engine Data Architecture (Phases 9-12)
-- Description: Implement growth engine data architecture with advanced features
-- Date: 2025-10-22
-- Agent: data
-- Task: DATA-109

-- =============================================================================
-- TABLE 1: growth_engine_phases (Phase tracking and configuration)
-- =============================================================================
CREATE TABLE IF NOT EXISTS growth_engine_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Phase Configuration
  phase_number INTEGER NOT NULL UNIQUE,
  phase_name TEXT NOT NULL,
  phase_description TEXT,
  phase_status TEXT NOT NULL DEFAULT 'pending' CHECK (phase_status IN ('pending', 'active', 'completed', 'paused')),
  
  -- Phase Requirements
  required_features JSONB DEFAULT '[]',
  acceptance_criteria JSONB DEFAULT '[]',
  allowed_paths JSONB DEFAULT '[]',
  
  -- Dependencies
  depends_on_phases INTEGER[] DEFAULT '{}',
  blocks_phases INTEGER[] DEFAULT '{}',
  
  -- Timeline
  estimated_hours INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for growth_engine_phases
CREATE INDEX idx_ge_phases_number ON growth_engine_phases(phase_number);
CREATE INDEX idx_ge_phases_status ON growth_engine_phases(phase_status);
CREATE INDEX idx_ge_phases_dependencies ON growth_engine_phases USING GIN(depends_on_phases);

-- =============================================================================
-- TABLE 2: mcp_evidence_logs (MCP Evidence JSONL tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS mcp_evidence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Evidence Context
  agent_name TEXT NOT NULL,
  task_id TEXT NOT NULL,
  evidence_date DATE NOT NULL,
  
  -- MCP Tool Information
  tool_name TEXT NOT NULL,
  doc_ref TEXT,
  request_id TEXT NOT NULL,
  purpose TEXT NOT NULL,
  
  -- Evidence Data
  evidence_data JSONB NOT NULL DEFAULT '{}',
  file_path TEXT NOT NULL, -- artifacts/<agent>/<date>/mcp/<topic>.jsonl
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for mcp_evidence_logs
CREATE INDEX idx_mcp_agent_task ON mcp_evidence_logs(agent_name, task_id);
CREATE INDEX idx_mcp_date ON mcp_evidence_logs(evidence_date);
CREATE INDEX idx_mcp_tool ON mcp_evidence_logs(tool_name);
CREATE INDEX idx_mcp_timestamp ON mcp_evidence_logs(timestamp DESC);

-- =============================================================================
-- TABLE 3: agent_heartbeat_logs (Heartbeat tracking for long tasks)
-- =============================================================================
CREATE TABLE IF NOT EXISTS agent_heartbeat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Heartbeat Context
  agent_name TEXT NOT NULL,
  task_id TEXT NOT NULL,
  heartbeat_date DATE NOT NULL,
  
  -- Heartbeat Data
  status TEXT NOT NULL CHECK (status IN ('doing', 'done', 'blocked', 'paused')),
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  current_file TEXT,
  notes TEXT,
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for agent_heartbeat_logs
CREATE INDEX idx_heartbeat_agent_task ON agent_heartbeat_logs(agent_name, task_id);
CREATE INDEX idx_heartbeat_date ON agent_heartbeat_logs(heartbeat_date);
CREATE INDEX idx_heartbeat_timestamp ON agent_heartbeat_logs(timestamp DESC);
CREATE INDEX idx_heartbeat_status ON agent_heartbeat_logs(status);

-- =============================================================================
-- TABLE 4: dev_mcp_ban_violations (Dev MCP ban enforcement tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS dev_mcp_ban_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Violation Context
  agent_name TEXT NOT NULL,
  task_id TEXT,
  file_path TEXT NOT NULL,
  line_number INTEGER,
  
  -- Violation Details
  banned_import TEXT NOT NULL,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('import', 'usage', 'reference')),
  severity TEXT NOT NULL DEFAULT 'critical' CHECK (severity IN ('critical', 'high', 'medium')),
  
  -- Resolution
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Timestamps
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for dev_mcp_ban_violations
CREATE INDEX idx_ban_agent ON dev_mcp_ban_violations(agent_name);
CREATE INDEX idx_ban_status ON dev_mcp_ban_violations(status);
CREATE INDEX idx_ban_severity ON dev_mcp_ban_violations(severity);
CREATE INDEX idx_ban_detected ON dev_mcp_ban_violations(detected_at DESC);

-- =============================================================================
-- TABLE 5: growth_engine_metrics (Performance and success metrics)
-- =============================================================================
CREATE TABLE IF NOT EXISTS growth_engine_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metric Context
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL CHECK (metric_category IN ('performance', 'reliability', 'quality', 'throughput', 'governance')),
  phase_number INTEGER,
  
  -- Metric Values
  current_value DECIMAL(15,4),
  target_value DECIMAL(15,4),
  baseline_value DECIMAL(15,4),
  unit TEXT,
  
  -- Time Series
  measurement_date DATE NOT NULL,
  measurement_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for growth_engine_metrics
CREATE INDEX idx_metrics_name ON growth_engine_metrics(metric_name);
CREATE INDEX idx_metrics_category ON growth_engine_metrics(metric_category);
CREATE INDEX idx_metrics_phase ON growth_engine_metrics(phase_number);
CREATE INDEX idx_metrics_date ON growth_engine_metrics(measurement_date);

-- =============================================================================
-- TABLE 6: ci_guard_results (CI guard enforcement results)
-- =============================================================================
CREATE TABLE IF NOT EXISTS ci_guard_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Guard Context
  guard_name TEXT NOT NULL CHECK (guard_name IN ('guard-mcp', 'idle-guard', 'dev-mcp-ban')),
  pr_number INTEGER,
  commit_sha TEXT,
  branch_name TEXT,
  
  -- Guard Results
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'warning')),
  message TEXT,
  details JSONB DEFAULT '{}',
  
  -- Timestamps
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ci_guard_results
CREATE INDEX idx_guard_name ON ci_guard_results(guard_name);
CREATE INDEX idx_guard_status ON ci_guard_results(status);
CREATE INDEX idx_guard_pr ON ci_guard_results(pr_number);
CREATE INDEX idx_guard_executed ON ci_guard_results(executed_at DESC);

-- =============================================================================
-- FUNCTIONS: Growth Engine Data Architecture
-- =============================================================================

-- Function to check if MCP evidence is required for a task
CREATE OR REPLACE FUNCTION is_mcp_evidence_required(
  p_task_id TEXT,
  p_agent_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_task_type TEXT;
  v_evidence_required BOOLEAN := FALSE;
BEGIN
  -- Check if task involves code changes
  SELECT task_type INTO v_task_type
  FROM task_assignments 
  WHERE id = p_task_id;
  
  -- MCP evidence required for code changes
  IF v_task_type IN ('code', 'feature', 'bugfix', 'refactor') THEN
    v_evidence_required := TRUE;
  END IF;
  
  RETURN v_evidence_required;
END;
$$ LANGUAGE plpgsql;

-- Function to check if heartbeat is required for a task
CREATE OR REPLACE FUNCTION is_heartbeat_required(
  p_task_id TEXT,
  p_estimated_hours INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Heartbeat required for tasks >2 hours
  RETURN p_estimated_hours > 2;
END;
$$ LANGUAGE plpgsql;

-- Function to validate MCP evidence completeness
CREATE OR REPLACE FUNCTION validate_mcp_evidence(
  p_task_id TEXT,
  p_agent_name TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_evidence_count INTEGER;
  v_required BOOLEAN;
  v_result JSONB;
BEGIN
  v_required := is_mcp_evidence_required(p_task_id, p_agent_name);
  
  IF NOT v_required THEN
    RETURN jsonb_build_object(
      'required', false,
      'status', 'not_required',
      'message', 'No MCP evidence required for this task type'
    );
  END IF;
  
  -- Count evidence entries for this task
  SELECT COUNT(*) INTO v_evidence_count
  FROM mcp_evidence_logs
  WHERE task_id = p_task_id AND agent_name = p_agent_name;
  
  IF v_evidence_count = 0 THEN
    v_result := jsonb_build_object(
      'required', true,
      'status', 'missing',
      'message', 'MCP evidence required but not found',
      'evidence_count', v_evidence_count
    );
  ELSE
    v_result := jsonb_build_object(
      'required', true,
      'status', 'present',
      'message', 'MCP evidence found',
      'evidence_count', v_evidence_count
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to check heartbeat staleness
CREATE OR REPLACE FUNCTION check_heartbeat_staleness(
  p_task_id TEXT,
  p_agent_name TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_last_heartbeat TIMESTAMPTZ;
  v_required BOOLEAN;
  v_staleness_minutes INTEGER;
  v_result JSONB;
BEGIN
  v_required := is_heartbeat_required(p_task_id, NULL);
  
  IF NOT v_required THEN
    RETURN jsonb_build_object(
      'required', false,
      'status', 'not_required',
      'message', 'Heartbeat not required for this task'
    );
  END IF;
  
  -- Get last heartbeat
  SELECT MAX(timestamp) INTO v_last_heartbeat
  FROM agent_heartbeat_logs
  WHERE task_id = p_task_id AND agent_name = p_agent_name;
  
  IF v_last_heartbeat IS NULL THEN
    v_result := jsonb_build_object(
      'required', true,
      'status', 'missing',
      'message', 'No heartbeat found for required task',
      'staleness_minutes', NULL
    );
  ELSE
    v_staleness_minutes := EXTRACT(EPOCH FROM (NOW() - v_last_heartbeat)) / 60;
    
    IF v_staleness_minutes > 15 THEN
      v_result := jsonb_build_object(
        'required', true,
        'status', 'stale',
        'message', 'Heartbeat is stale (>15 minutes)',
        'staleness_minutes', v_staleness_minutes,
        'last_heartbeat', v_last_heartbeat
      );
    ELSE
      v_result := jsonb_build_object(
        'required', true,
        'status', 'fresh',
        'message', 'Heartbeat is fresh',
        'staleness_minutes', v_staleness_minutes,
        'last_heartbeat', v_last_heartbeat
      );
    END IF;
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE growth_engine_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_evidence_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_heartbeat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev_mcp_ban_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_engine_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ci_guard_results ENABLE ROW LEVEL SECURITY;

-- Growth Engine Phases RLS Policies
CREATE POLICY "ge_phases_read_authenticated"
  ON growth_engine_phases
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "ge_phases_manage_operators"
  ON growth_engine_phases
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('operator', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('operator', 'admin'));

-- MCP Evidence Logs RLS Policies
CREATE POLICY "mcp_evidence_read_authenticated"
  ON mcp_evidence_logs
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "mcp_evidence_insert_agents"
  ON mcp_evidence_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('agent', 'operator', 'admin'));

-- Agent Heartbeat Logs RLS Policies
CREATE POLICY "heartbeat_read_authenticated"
  ON agent_heartbeat_logs
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "heartbeat_insert_agents"
  ON agent_heartbeat_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('agent', 'operator', 'admin'));

-- Dev MCP Ban Violations RLS Policies
CREATE POLICY "ban_violations_read_operators"
  ON dev_mcp_ban_violations
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('operator', 'admin'));

CREATE POLICY "ban_violations_insert_system"
  ON dev_mcp_ban_violations
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- Growth Engine Metrics RLS Policies
CREATE POLICY "metrics_read_authenticated"
  ON growth_engine_metrics
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "metrics_insert_system"
  ON growth_engine_metrics
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- CI Guard Results RLS Policies
CREATE POLICY "guard_results_read_authenticated"
  ON ci_guard_results
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "guard_results_insert_system"
  ON ci_guard_results
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- =============================================================================
-- INITIAL DATA: Growth Engine Phases 9-12
-- =============================================================================
INSERT INTO growth_engine_phases (phase_number, phase_name, phase_description, required_features, acceptance_criteria, estimated_hours) VALUES
(9, 'MCP Evidence System', 'Implement MCP evidence tracking and validation', 
 '["mcp_evidence_logs", "validate_mcp_evidence()", "CI guard-mcp"]',
 '["MCP evidence required for code changes", "CI blocks merge without evidence", "Evidence JSONL files tracked"]',
 2),
(10, 'Heartbeat System', 'Implement agent heartbeat tracking for long tasks',
 '["agent_heartbeat_logs", "check_heartbeat_staleness()", "CI idle-guard"]',
 '["Heartbeat required for tasks >2h", "CI blocks merge if heartbeat stale", "15min max staleness"]',
 2),
(11, 'Dev MCP Ban System', 'Implement Dev MCP ban enforcement',
 '["dev_mcp_ban_violations", "CI dev-mcp-ban", "Production safety"]',
 '["Dev MCP banned in production", "CI fails build if Dev MCP detected", "Violations tracked"]',
 1),
(12, 'Performance Optimization', 'Apply performance optimizations and monitoring',
 '["growth_engine_metrics", "ci_guard_results", "Performance monitoring"]',
 '["Performance metrics tracked", "CI guard results logged", "Optimizations applied"]',
 3);

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE growth_engine_phases IS 'Growth Engine phase tracking and configuration for phases 9-12';
COMMENT ON TABLE mcp_evidence_logs IS 'MCP evidence tracking for CI merge blockers';
COMMENT ON TABLE agent_heartbeat_logs IS 'Agent heartbeat tracking for long-running tasks';
COMMENT ON TABLE dev_mcp_ban_violations IS 'Dev MCP ban violation tracking for production safety';
COMMENT ON TABLE growth_engine_metrics IS 'Growth Engine performance and success metrics';
COMMENT ON TABLE ci_guard_results IS 'CI guard enforcement results and status';

COMMENT ON FUNCTION is_mcp_evidence_required IS 'Determines if MCP evidence is required for a task';
COMMENT ON FUNCTION is_heartbeat_required IS 'Determines if heartbeat is required for a task';
COMMENT ON FUNCTION validate_mcp_evidence IS 'Validates MCP evidence completeness for a task';
COMMENT ON FUNCTION check_heartbeat_staleness IS 'Checks heartbeat staleness for long-running tasks';
