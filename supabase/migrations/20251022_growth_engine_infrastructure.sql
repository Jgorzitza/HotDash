-- Growth Engine Infrastructure Database Schema
-- Migration: 20251022_growth_engine_infrastructure.sql
-- Purpose: Create tables for Growth Engine phases 9-12

-- ============================================================================
-- Action Queue Table
-- ============================================================================

CREATE TABLE action_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- seo_fix, perf_task, inventory_risk, content_draft, etc.
  target TEXT NOT NULL, -- page/SKU/collection/customer-safe-id
  draft TEXT NOT NULL, -- what will change (human-readable)
  evidence JSONB NOT NULL, -- {mcp_request_ids: [], dataset_links: [], telemetry_refs: []}
  expected_impact JSONB NOT NULL, -- {metric: string, delta: number, unit: string}
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  ease TEXT NOT NULL CHECK (ease IN ('simple', 'medium', 'hard')),
  risk_tier TEXT NOT NULL CHECK (risk_tier IN ('policy', 'safety', 'perf', 'none')),
  can_execute BOOLEAN NOT NULL DEFAULT true,
  rollback_plan TEXT NOT NULL,
  freshness_label TEXT NOT NULL,
  agent TEXT NOT NULL, -- which agent created this action
  score DECIMAL(10,2) GENERATED ALWAYS AS (
    (expected_impact->>'delta')::DECIMAL * confidence * 
    CASE ease 
      WHEN 'simple' THEN 1.0 
      WHEN 'medium' THEN 0.7 
      WHEN 'hard' THEN 0.4 
    END
  ) STORED,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  approved_by TEXT, -- operator who approved
  executed_by TEXT, -- agent who executed
  execution_result JSONB -- result of execution
);

-- Indexes for Action Queue
CREATE INDEX idx_action_queue_status ON action_queue(status);
CREATE INDEX idx_action_queue_score ON action_queue(score DESC);
CREATE INDEX idx_action_queue_agent ON action_queue(agent);
CREATE INDEX idx_action_queue_created_at ON action_queue(created_at);
CREATE INDEX idx_action_queue_type ON action_queue(type);

-- ============================================================================
-- Agent Handoff Log
-- ============================================================================

CREATE TABLE agent_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  context JSONB NOT NULL, -- {customerId, sessionId, requestType, priority}
  payload JSONB NOT NULL, -- request payload
  response JSONB, -- response from target agent
  success BOOLEAN NOT NULL,
  error_message TEXT,
  mcp_request_ids TEXT[],
  evidence JSONB, -- {dataSource, confidence, freshness}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for Agent Handoffs
CREATE INDEX idx_agent_handoffs_from_agent ON agent_handoffs(from_agent);
CREATE INDEX idx_agent_handoffs_to_agent ON agent_handoffs(to_agent);
CREATE INDEX idx_agent_handoffs_created_at ON agent_handoffs(created_at);
CREATE INDEX idx_agent_handoffs_success ON agent_handoffs(success);

-- ============================================================================
-- PII Broker Audit Log
-- ============================================================================

CREATE TABLE pii_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL,
  action TEXT NOT NULL, -- redact, create_pii_card, log_audit
  mcp_request_id TEXT NOT NULL,
  customer_id TEXT,
  session_id TEXT,
  redaction_rules JSONB, -- which rules were applied
  pii_detected JSONB, -- what PII was detected
  redacted_content TEXT, -- redacted version
  pii_card_content TEXT, -- full PII card (encrypted)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for PII Audit Log
CREATE INDEX idx_pii_audit_agent ON pii_audit_log(agent);
CREATE INDEX idx_pii_audit_mcp_request ON pii_audit_log(mcp_request_id);
CREATE INDEX idx_pii_audit_customer_id ON pii_audit_log(customer_id);
CREATE INDEX idx_pii_audit_created_at ON pii_audit_log(created_at);

-- ============================================================================
-- Telemetry Pipeline Data
-- ============================================================================

CREATE TABLE telemetry_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('gsc', 'ga4', 'shopify', 'chatwoot')),
  data_type TEXT NOT NULL, -- gsc_query, ga4_landing_page, shopify_order, etc.
  data JSONB NOT NULL,
  freshness_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Indexes for Telemetry Data
CREATE INDEX idx_telemetry_source ON telemetry_data(source);
CREATE INDEX idx_telemetry_data_type ON telemetry_data(data_type);
CREATE INDEX idx_telemetry_created_at ON telemetry_data(created_at);
CREATE INDEX idx_telemetry_processed_at ON telemetry_data(processed_at);

-- ============================================================================
-- Specialist Agent Runs
-- ============================================================================

CREATE TABLE specialist_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  run_type TEXT NOT NULL, -- daily, hourly, continuous, event
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  actions_emitted INTEGER NOT NULL DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB -- additional run information
);

-- Indexes for Specialist Agent Runs
CREATE INDEX idx_specialist_agent_runs_agent ON specialist_agent_runs(agent_name);
CREATE INDEX idx_specialist_agent_runs_status ON specialist_agent_runs(status);
CREATE INDEX idx_specialist_agent_runs_start_time ON specialist_agent_runs(start_time);

-- ============================================================================
-- MCP Evidence Tracking
-- ============================================================================

CREATE TABLE mcp_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL,
  tool TEXT NOT NULL, -- storefront, customer-accounts, context7, etc.
  mcp_request_id TEXT NOT NULL,
  purpose TEXT NOT NULL, -- what the request was for
  doc_ref TEXT, -- URL to documentation
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  response_data JSONB, -- response from MCP
  error_message TEXT
);

-- Indexes for MCP Evidence
CREATE INDEX idx_mcp_evidence_agent ON mcp_evidence(agent);
CREATE INDEX idx_mcp_evidence_tool ON mcp_evidence(tool);
CREATE INDEX idx_mcp_evidence_request_id ON mcp_evidence(mcp_request_id);
CREATE INDEX idx_mcp_evidence_timestamp ON mcp_evidence(timestamp);

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Action Queue RLS
ALTER TABLE action_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Action Queue - All access for authenticated users" ON action_queue
  FOR ALL USING (auth.role() = 'authenticated');

-- Agent Handoffs RLS
ALTER TABLE agent_handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agent Handoffs - All access for authenticated users" ON agent_handoffs
  FOR ALL USING (auth.role() = 'authenticated');

-- PII Audit Log RLS (restricted access)
ALTER TABLE pii_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PII Audit Log - Restricted access" ON pii_audit_log
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'operator');

-- Telemetry Data RLS
ALTER TABLE telemetry_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Telemetry Data - All access for authenticated users" ON telemetry_data
  FOR ALL USING (auth.role() = 'authenticated');

-- Specialist Agent Runs RLS
ALTER TABLE specialist_agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Specialist Agent Runs - All access for authenticated users" ON specialist_agent_runs
  FOR ALL USING (auth.role() = 'authenticated');

-- MCP Evidence RLS
ALTER TABLE mcp_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MCP Evidence - All access for authenticated users" ON mcp_evidence
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to action_queue
CREATE TRIGGER update_action_queue_updated_at 
  BEFORE UPDATE ON action_queue 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get top actions by score
CREATE OR REPLACE FUNCTION get_top_actions(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  type TEXT,
  target TEXT,
  draft TEXT,
  score DECIMAL(10,2),
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aq.id,
    aq.type,
    aq.target,
    aq.draft,
    aq.score,
    aq.status,
    aq.created_at
  FROM action_queue aq
  WHERE aq.status = 'pending'
  ORDER BY aq.score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get agent performance metrics
CREATE OR REPLACE FUNCTION get_agent_performance(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS TABLE (
  agent TEXT,
  total_actions INTEGER,
  approved_actions INTEGER,
  approval_rate DECIMAL(5,2),
  avg_confidence DECIMAL(3,2),
  avg_score DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aq.agent,
    COUNT(*)::INTEGER as total_actions,
    COUNT(CASE WHEN aq.status = 'approved' THEN 1 END)::INTEGER as approved_actions,
    ROUND(
      (COUNT(CASE WHEN aq.status = 'approved' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
      2
    ) as approval_rate,
    ROUND(AVG(aq.confidence), 2) as avg_confidence,
    ROUND(AVG(aq.score), 2) as avg_score
  FROM action_queue aq
  WHERE aq.created_at BETWEEN start_date AND end_date
  GROUP BY aq.agent
  ORDER BY avg_score DESC;
END;
$$ LANGUAGE plpgsql;
