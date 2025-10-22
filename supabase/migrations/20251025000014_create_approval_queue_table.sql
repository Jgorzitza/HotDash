-- Migration: Create approval_queue table + Realtime
-- Description: Add approval_queue table and enable Supabase Realtime for queue updates
-- Date: 2025-10-22
-- Agent: data
-- Task: DATA-106

-- =============================================================================
-- TABLE: approval_queue (Approval queue management with Realtime)
-- =============================================================================
CREATE TABLE IF NOT EXISTS approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Queue Identification
  queue_id TEXT NOT NULL, -- Human-readable queue identifier
  shop_domain TEXT NOT NULL,
  
  -- Request Information
  request_type TEXT NOT NULL CHECK (request_type IN ('inventory', 'customer', 'marketing', 'system', 'approval', 'order', 'product')),
  request_title TEXT NOT NULL,
  request_description TEXT,
  request_data JSONB NOT NULL DEFAULT '{}', -- Full request payload
  
  -- Approval Context
  approval_context JSONB DEFAULT '{}', -- Context for approval decision
  evidence_url TEXT, -- URL to evidence/documentation
  projected_impact JSONB DEFAULT '{}', -- Expected impact metrics
  risk_assessment JSONB DEFAULT '{}', -- Risk analysis
  rollback_plan JSONB DEFAULT '{}', -- Rollback strategy
  
  -- Requestor Information
  requested_by TEXT NOT NULL, -- User ID or agent name
  requested_by_role TEXT NOT NULL, -- 'user', 'agent', 'system'
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Approval Information
  approved_by TEXT, -- User ID who approved
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  approval_grade INTEGER CHECK (approval_grade >= 1 AND approval_grade <= 5), -- 1-5 rating
  
  -- Status Management
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- SLA Management
  sla_deadline TIMESTAMPTZ, -- When this must be reviewed
  sla_breach_at TIMESTAMPTZ, -- When SLA was breached
  escalation_level INTEGER DEFAULT 0, -- 0 = normal, 1+ = escalated
  
  -- Realtime Metadata
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER DEFAULT 1, -- For optimistic locking
  
  -- Audit Trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for approval_queue
CREATE INDEX idx_approval_queue_shop ON approval_queue(shop_domain);
CREATE INDEX idx_approval_queue_type ON approval_queue(request_type);
CREATE INDEX idx_approval_queue_status ON approval_queue(status);
CREATE INDEX idx_approval_queue_priority ON approval_queue(priority);
CREATE INDEX idx_approval_queue_requested_by ON approval_queue(requested_by);
CREATE INDEX idx_approval_queue_approved_by ON approval_queue(approved_by);
CREATE INDEX idx_approval_queue_sla ON approval_queue(sla_deadline) WHERE status = 'pending';
CREATE INDEX idx_approval_queue_escalation ON approval_queue(escalation_level) WHERE status = 'pending';
CREATE INDEX idx_approval_queue_created ON approval_queue(created_at DESC);
CREATE INDEX idx_approval_queue_updated ON approval_queue(last_updated_at DESC);

-- Trigger to update updated_at and last_updated_at
CREATE TRIGGER set_approval_queue_updated_at
  BEFORE UPDATE ON approval_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Additional trigger for last_updated_at
CREATE OR REPLACE FUNCTION update_approval_queue_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_approval_queue_last_updated
  BEFORE UPDATE ON approval_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_approval_queue_last_updated();

-- =============================================================================
-- REALTIME CONFIGURATION
-- =============================================================================

-- Enable Realtime for approval_queue table
ALTER PUBLICATION supabase_realtime ADD TABLE approval_queue;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS on approval_queue table
ALTER TABLE approval_queue ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read all approval queue items for their shop
CREATE POLICY "approval_queue_read_shop"
  ON approval_queue
  FOR SELECT
  TO authenticated
  USING (shop_domain = current_setting('app.current_shop', true));

-- Policy 2: Users can insert approval requests
CREATE POLICY "approval_queue_insert_authenticated"
  ON approval_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_domain = current_setting('app.current_shop', true) AND
    auth.uid()::text = requested_by
  );

-- Policy 3: Users can update their own requests (before approval)
CREATE POLICY "approval_queue_update_own_pending"
  ON approval_queue
  FOR UPDATE
  TO authenticated
  USING (
    shop_domain = current_setting('app.current_shop', true) AND
    auth.uid()::text = requested_by AND
    status = 'pending'
  )
  WITH CHECK (
    shop_domain = current_setting('app.current_shop', true) AND
    auth.uid()::text = requested_by AND
    status = 'pending'
  );

-- Policy 4: Operators can approve/reject requests
CREATE POLICY "approval_queue_approve_operators"
  ON approval_queue
  FOR UPDATE
  TO authenticated
  USING (
    shop_domain = current_setting('app.current_shop', true) AND
    auth.jwt() ->> 'role' IN ('operator', 'admin') AND
    status = 'pending'
  )
  WITH CHECK (
    shop_domain = current_setting('app.current_shop', true) AND
    auth.jwt() ->> 'role' IN ('operator', 'admin') AND
    status IN ('approved', 'rejected')
  );

-- Policy 5: Service role has full access (for system operations)
CREATE POLICY "approval_queue_service_role_all"
  ON approval_queue
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- =============================================================================
-- FUNCTIONS: Approval Queue Management
-- =============================================================================

-- Function to get approval queue with filtering
CREATE OR REPLACE FUNCTION get_approval_queue(
  p_shop_domain TEXT,
  p_status TEXT DEFAULT NULL,
  p_request_type TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_queue_items JSONB;
  v_total_count INTEGER;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM approval_queue
  WHERE shop_domain = p_shop_domain
    AND (p_status IS NULL OR status = p_status)
    AND (p_request_type IS NULL OR request_type = p_request_type)
    AND (p_priority IS NULL OR priority = p_priority);
  
  -- Get queue items
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'queue_id', queue_id,
      'request_type', request_type,
      'request_title', request_title,
      'request_description', request_description,
      'request_data', request_data,
      'approval_context', approval_context,
      'evidence_url', evidence_url,
      'projected_impact', projected_impact,
      'risk_assessment', risk_assessment,
      'rollback_plan', rollback_plan,
      'requested_by', requested_by,
      'requested_by_role', requested_by_role,
      'requested_at', requested_at,
      'approved_by', approved_by,
      'approved_at', approved_at,
      'approval_notes', approval_notes,
      'approval_grade', approval_grade,
      'status', status,
      'priority', priority,
      'sla_deadline', sla_deadline,
      'sla_breach_at', sla_breach_at,
      'escalation_level', escalation_level,
      'last_updated_at', last_updated_at,
      'version', version,
      'created_at', created_at
    ) ORDER BY 
      CASE priority 
        WHEN 'urgent' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
      END,
      created_at ASC
  ) INTO v_queue_items
  FROM approval_queue
  WHERE shop_domain = p_shop_domain
    AND (p_status IS NULL OR status = p_status)
    AND (p_request_type IS NULL OR request_type = p_request_type)
    AND (p_priority IS NULL OR priority = p_priority)
  LIMIT p_limit OFFSET p_offset;
  
  RETURN jsonb_build_object(
    'queue_items', COALESCE(v_queue_items, '[]'::jsonb),
    'total_count', v_total_count,
    'limit', p_limit,
    'offset', p_offset
  );
END;
$$ LANGUAGE plpgsql;

-- Function to approve a request
CREATE OR REPLACE FUNCTION approve_request(
  p_queue_id UUID,
  p_approved_by TEXT,
  p_approval_notes TEXT DEFAULT NULL,
  p_approval_grade INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE approval_queue
  SET 
    status = 'approved',
    approved_by = p_approved_by,
    approved_at = NOW(),
    approval_notes = p_approval_notes,
    approval_grade = p_approval_grade,
    last_updated_at = NOW(),
    version = version + 1
  WHERE id = p_queue_id 
    AND status = 'pending';
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to reject a request
CREATE OR REPLACE FUNCTION reject_request(
  p_queue_id UUID,
  p_approved_by TEXT,
  p_approval_notes TEXT DEFAULT NULL,
  p_approval_grade INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE approval_queue
  SET 
    status = 'rejected',
    approved_by = p_approved_by,
    approved_at = NOW(),
    approval_notes = p_approval_notes,
    approval_grade = p_approval_grade,
    last_updated_at = NOW(),
    version = version + 1
  WHERE id = p_queue_id 
    AND status = 'pending';
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to create approval request
CREATE OR REPLACE FUNCTION create_approval_request(
  p_queue_id TEXT,
  p_shop_domain TEXT,
  p_request_type TEXT,
  p_request_title TEXT,
  p_request_description TEXT DEFAULT NULL,
  p_request_data JSONB DEFAULT '{}',
  p_approval_context JSONB DEFAULT '{}',
  p_evidence_url TEXT DEFAULT NULL,
  p_projected_impact JSONB DEFAULT '{}',
  p_risk_assessment JSONB DEFAULT '{}',
  p_rollback_plan JSONB DEFAULT '{}',
  p_requested_by TEXT,
  p_requested_by_role TEXT DEFAULT 'user',
  p_priority TEXT DEFAULT 'medium',
  p_sla_deadline TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_approval_id UUID;
BEGIN
  INSERT INTO approval_queue (
    queue_id, shop_domain, request_type, request_title, request_description,
    request_data, approval_context, evidence_url, projected_impact,
    risk_assessment, rollback_plan, requested_by, requested_by_role,
    priority, sla_deadline
  ) VALUES (
    p_queue_id, p_shop_domain, p_request_type, p_request_title, p_request_description,
    p_request_data, p_approval_context, p_evidence_url, p_projected_impact,
    p_risk_assessment, p_rollback_plan, p_requested_by, p_requested_by_role,
    p_priority, p_sla_deadline
  ) RETURNING id INTO v_approval_id;
  
  RETURN v_approval_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get queue statistics
CREATE OR REPLACE FUNCTION get_approval_queue_stats(
  p_shop_domain TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_requests', COUNT(*),
    'pending_requests', COUNT(*) FILTER (WHERE status = 'pending'),
    'approved_requests', COUNT(*) FILTER (WHERE status = 'approved'),
    'rejected_requests', COUNT(*) FILTER (WHERE status = 'rejected'),
    'expired_requests', COUNT(*) FILTER (WHERE status = 'expired'),
    'by_type', jsonb_object_agg(request_type, COUNT(*)),
    'by_priority', jsonb_object_agg(priority, COUNT(*) FILTER (WHERE status = 'pending')),
    'sla_breaches', COUNT(*) FILTER (WHERE sla_breach_at IS NOT NULL),
    'escalated_requests', COUNT(*) FILTER (WHERE escalation_level > 0),
    'avg_approval_time_hours', AVG(EXTRACT(EPOCH FROM (approved_at - requested_at)) / 3600) FILTER (WHERE approved_at IS NOT NULL)
  ) INTO v_stats
  FROM approval_queue
  WHERE shop_domain = p_shop_domain;
  
  RETURN COALESCE(v_stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE approval_queue IS 'Approval queue management with Supabase Realtime support';
COMMENT ON COLUMN approval_queue.queue_id IS 'Human-readable queue identifier';
COMMENT ON COLUMN approval_queue.request_type IS 'Type of request (inventory, customer, marketing, system, approval, order, product)';
COMMENT ON COLUMN approval_queue.request_data IS 'Full request payload as JSONB';
COMMENT ON COLUMN approval_queue.approval_context IS 'Context information for approval decision';
COMMENT ON COLUMN approval_queue.projected_impact IS 'Expected impact metrics as JSONB';
COMMENT ON COLUMN approval_queue.risk_assessment IS 'Risk analysis as JSONB';
COMMENT ON COLUMN approval_queue.rollback_plan IS 'Rollback strategy as JSONB';
COMMENT ON COLUMN approval_queue.approval_grade IS '1-5 rating for approval quality';
COMMENT ON COLUMN approval_queue.sla_deadline IS 'When this request must be reviewed';
COMMENT ON COLUMN approval_queue.escalation_level IS 'Escalation level (0 = normal, 1+ = escalated)';
COMMENT ON COLUMN approval_queue.version IS 'Version number for optimistic locking';

COMMENT ON FUNCTION get_approval_queue IS 'Gets approval queue items with filtering and pagination';
COMMENT ON FUNCTION approve_request IS 'Approves a pending request';
COMMENT ON FUNCTION reject_request IS 'Rejects a pending request';
COMMENT ON FUNCTION create_approval_request IS 'Creates a new approval request';
COMMENT ON FUNCTION get_approval_queue_stats IS 'Gets approval queue statistics and metrics';
