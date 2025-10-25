-- Dashboard RPC Functions
-- Priority: HIGH (Dashboard integration)
-- Owner: integrations
-- Date: 2025-10-15
-- Purpose: RPC functions for dashboard metrics and approval queue

-- ============================================================================
-- Function: get_approval_queue
-- Purpose: Fetch pending approvals with pagination
-- Security: Service role only (contains sensitive conversation data)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_approval_queue(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_status TEXT DEFAULT 'pending'
)
RETURNS TABLE (
  id BIGINT,
  conversation_id TEXT,
  serialized JSONB,
  last_interruptions JSONB,
  created_at TIMESTAMPTZ,
  approved_by TEXT,
  status TEXT,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate status parameter
  IF p_status NOT IN ('pending', 'approved', 'rejected', 'expired') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be one of: pending, approved, rejected, expired', p_status;
  END IF;

  -- Validate pagination parameters
  IF p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION 'Invalid limit: %. Must be between 1 and 100', p_limit;
  END IF;

  IF p_offset < 0 THEN
    RAISE EXCEPTION 'Invalid offset: %. Must be >= 0', p_offset;
  END IF;

  -- Return paginated results
  RETURN QUERY
  SELECT 
    a.id,
    a.conversation_id,
    a.serialized,
    a.last_interruptions,
    a.created_at,
    a.approved_by,
    a.status,
    a.updated_at
  FROM public.agent_approvals a
  WHERE a.status = p_status
  ORDER BY a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permission to service role only
REVOKE ALL ON FUNCTION public.get_approval_queue FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_approval_queue TO service_role;

COMMENT ON FUNCTION public.get_approval_queue IS 
  'Fetch approval queue with pagination. Service role only. Returns approvals filtered by status.';

-- ============================================================================
-- Function: log_audit_entry
-- Purpose: Centralized audit logging for all tool calls
-- Security: Service role only
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_audit_entry(
  p_scope TEXT,
  p_actor TEXT,
  p_action TEXT,
  p_rationale TEXT DEFAULT NULL,
  p_evidence_url TEXT DEFAULT NULL,
  p_shop_domain TEXT DEFAULT NULL,
  p_external_ref TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_decision_id BIGINT;
BEGIN
  -- Validate required parameters
  IF p_scope IS NULL OR p_scope = '' THEN
    RAISE EXCEPTION 'scope is required';
  END IF;

  IF p_actor IS NULL OR p_actor = '' THEN
    RAISE EXCEPTION 'actor is required';
  END IF;

  IF p_action IS NULL OR p_action = '' THEN
    RAISE EXCEPTION 'action is required';
  END IF;

  -- Insert audit entry into decision_log table
  INSERT INTO public.decision_log (
    scope,
    actor,
    action,
    rationale,
    evidence_url,
    shop_domain,
    external_ref,
    payload,
    created_at
  ) VALUES (
    p_scope,
    p_actor,
    p_action,
    p_rationale,
    p_evidence_url,
    p_shop_domain,
    p_external_ref,
    p_payload,
    NOW()
  )
  RETURNING id INTO v_decision_id;

  RETURN v_decision_id;
END;
$$;

-- Grant execute permission to service role only
REVOKE ALL ON FUNCTION public.log_audit_entry FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_audit_entry TO service_role;

COMMENT ON FUNCTION public.log_audit_entry IS 
  'Centralized audit logging for all tool calls. Service role only. Returns decision_log ID.';

-- ============================================================================
-- Function: get_dashboard_metrics_history
-- Purpose: Fetch historical dashboard metrics for trend analysis
-- Security: Authenticated users can read their shop metrics
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_metrics_history(
  p_shop_domain TEXT,
  p_fact_type TEXT DEFAULT 'shopify.dashboard.metrics',
  p_limit INTEGER DEFAULT 30,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id INTEGER,
  shop_domain TEXT,
  fact_type TEXT,
  scope TEXT,
  value JSONB,
  metadata JSONB,
  evidence_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate parameters
  IF p_shop_domain IS NULL OR p_shop_domain = '' THEN
    RAISE EXCEPTION 'shop_domain is required';
  END IF;

  IF p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION 'Invalid limit: %. Must be between 1 and 100', p_limit;
  END IF;

  IF p_offset < 0 THEN
    RAISE EXCEPTION 'Invalid offset: %. Must be >= 0', p_offset;
  END IF;

  -- Return historical metrics
  RETURN QUERY
  SELECT 
    df.id,
    df.shop_domain,
    df.fact_type,
    df.scope,
    df.value,
    df.metadata,
    df.evidence_url,
    df.created_at,
    df.updated_at
  FROM public.dashboard_fact df
  WHERE df.shop_domain = p_shop_domain
    AND df.fact_type = p_fact_type
  ORDER BY df.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permission to authenticated users
REVOKE ALL ON FUNCTION public.get_dashboard_metrics_history FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics_history TO authenticated, service_role;

COMMENT ON FUNCTION public.get_dashboard_metrics_history IS 
  'Fetch historical dashboard metrics for trend analysis. Authenticated users can read their shop metrics.';

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Index for decision_log queries by scope and created_at
CREATE INDEX IF NOT EXISTS decision_log_scope_created_at_idx 
  ON public.decision_log (scope, created_at DESC);

-- Index for dashboard_fact queries by shop_domain, fact_type, and created_at
CREATE INDEX IF NOT EXISTS dashboard_fact_shop_fact_type_created_idx 
  ON public.dashboard_fact (shop_domain, fact_type, created_at DESC);

-- ============================================================================
-- Grants and Permissions
-- ============================================================================

-- Ensure service role has access to decision_log table
GRANT SELECT, INSERT ON public.decision_log TO service_role;
GRANT USAGE, SELECT ON SEQUENCE decision_log_id_seq TO service_role;

-- Ensure authenticated users can read dashboard_fact
GRANT SELECT ON public.dashboard_fact TO authenticated;
GRANT SELECT, INSERT ON public.dashboard_fact TO service_role;
GRANT USAGE, SELECT ON SEQUENCE dashboard_fact_id_seq TO service_role;
