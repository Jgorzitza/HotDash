-- Approvals RPC Functions
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-16
-- Tasks: 7-8 - RPC get_approvals_list and get_approvals_queue_tile

-- ============================================================================
-- Task 7: RPC get_approvals_list(filters, paging)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_approvals_list(
  p_state TEXT DEFAULT NULL,
  p_kind TEXT DEFAULT NULL,
  p_reviewer TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  kind TEXT,
  state TEXT,
  summary TEXT,
  created_by TEXT,
  reviewer TEXT,
  evidence JSONB,
  impact JSONB,
  risk JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.kind,
    a.state,
    a.summary,
    a.created_by,
    a.reviewer,
    a.evidence,
    a.impact,
    a.risk,
    a.created_at,
    a.updated_at
  FROM approvals a
  WHERE (p_state IS NULL OR a.state = p_state)
    AND (p_kind IS NULL OR a.kind = p_kind)
    AND (p_reviewer IS NULL OR a.reviewer = p_reviewer)
  ORDER BY 
    CASE a.state
      WHEN 'pending_review' THEN 1
      WHEN 'draft' THEN 2
      WHEN 'approved' THEN 3
      WHEN 'applied' THEN 4
      WHEN 'audited' THEN 5
      WHEN 'learned' THEN 6
    END,
    a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_approvals_list TO authenticated, service_role;
COMMENT ON FUNCTION public.get_approvals_list IS 'Get filtered and paginated list of approvals';

-- ============================================================================
-- Task 8: RPC get_approvals_queue_tile()
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_approvals_queue_tile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_pending_count INTEGER;
  v_by_kind JSONB;
  v_urgency JSONB;
  v_oldest_pending TIMESTAMPTZ;
BEGIN
  -- Get pending count
  SELECT COUNT(*)
  INTO v_pending_count
  FROM approvals
  WHERE state = 'pending_review';
  
  -- Get count by kind
  SELECT jsonb_object_agg(kind, count)
  INTO v_by_kind
  FROM (
    SELECT 
      kind,
      COUNT(*)::INTEGER as count
    FROM approvals
    WHERE state = 'pending_review'
    GROUP BY kind
  ) counts;
  
  -- Get oldest pending approval
  SELECT MIN(created_at)
  INTO v_oldest_pending
  FROM approvals
  WHERE state = 'pending_review';
  
  -- Calculate urgency
  v_urgency := jsonb_build_object(
    'critical', (
      SELECT COUNT(*)
      FROM approvals
      WHERE state = 'pending_review'
        AND created_at < NOW() - INTERVAL '2 hours'
    ),
    'warning', (
      SELECT COUNT(*)
      FROM approvals
      WHERE state = 'pending_review'
        AND created_at < NOW() - INTERVAL '1 hour'
        AND created_at >= NOW() - INTERVAL '2 hours'
    ),
    'normal', (
      SELECT COUNT(*)
      FROM approvals
      WHERE state = 'pending_review'
        AND created_at >= NOW() - INTERVAL '1 hour'
    )
  );
  
  -- Build result
  v_result := jsonb_build_object(
    'pending_count', v_pending_count,
    'by_kind', COALESCE(v_by_kind, '{}'::jsonb),
    'urgency', v_urgency,
    'oldest_pending_at', v_oldest_pending,
    'oldest_pending_age_minutes', EXTRACT(EPOCH FROM (NOW() - v_oldest_pending))/60,
    'last_updated', NOW()
  );
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_approvals_queue_tile TO authenticated, service_role;
COMMENT ON FUNCTION public.get_approvals_queue_tile IS 'Get approvals queue summary for dashboard tile';

-- ============================================================================
-- Task 13: RPC validate_approval(approval_id)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_approval(p_approval_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_approval RECORD;
  v_errors TEXT[] := '{}';
BEGIN
  SELECT * INTO v_approval FROM approvals WHERE id = p_approval_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'errors', ARRAY['Approval not found']);
  END IF;

  -- Check evidence
  IF v_approval.evidence IS NULL THEN
    v_errors := array_append(v_errors, 'Missing evidence');
  END IF;

  -- Check rollback
  IF v_approval.rollback IS NULL OR NOT (v_approval.rollback ? 'action') THEN
    v_errors := array_append(v_errors, 'Missing or incomplete rollback plan');
  END IF;

  -- Check impact
  IF v_approval.impact IS NULL THEN
    v_errors := array_append(v_errors, 'Missing impact assessment');
  END IF;

  -- Check actions
  IF v_approval.actions IS NULL OR jsonb_array_length(v_approval.actions) = 0 THEN
    v_errors := array_append(v_errors, 'Missing or empty actions');
  END IF;

  -- Check state
  IF v_approval.state NOT IN ('draft', 'pending_review') THEN
    v_errors := array_append(v_errors, 'Cannot approve from state: ' || v_approval.state);
  END IF;

  RETURN jsonb_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', COALESCE(v_errors, '{}'),
    'approval_id', p_approval_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_approval TO authenticated, service_role;
COMMENT ON FUNCTION public.validate_approval IS 'Validate approval before enabling Approve button in UI';

-- ============================================================================
-- Task 17: RPC get_approval_detail(id)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_approval_detail(p_approval_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_approval JSONB;
  v_items JSONB;
  v_grades JSONB;
  v_edits JSONB;
BEGIN
  -- Get approval
  SELECT row_to_json(a)::jsonb
  INTO v_approval
  FROM approvals a
  WHERE id = p_approval_id;

  IF v_approval IS NULL THEN
    RETURN jsonb_build_object('error', 'Approval not found');
  END IF;

  -- Get items
  SELECT jsonb_agg(row_to_json(i))
  INTO v_items
  FROM approval_items i
  WHERE approval_id = p_approval_id;

  -- Get grades
  SELECT row_to_json(g)::jsonb
  INTO v_grades
  FROM approval_grades g
  WHERE approval_id = p_approval_id;

  -- Get edits
  SELECT jsonb_agg(row_to_json(e))
  INTO v_edits
  FROM approval_edits e
  WHERE approval_id = p_approval_id;

  RETURN jsonb_build_object(
    'approval', v_approval,
    'items', COALESCE(v_items, '[]'::jsonb),
    'grades', v_grades,
    'edits', COALESCE(v_edits, '[]'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_approval_detail TO authenticated, service_role;
COMMENT ON FUNCTION public.get_approval_detail IS 'Get full approval details including items, grades, and edits';

-- ============================================================================
-- Task 18: RPC approve_approval(id, reviewer, grades)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.approve_approval(
  p_approval_id BIGINT,
  p_reviewer TEXT,
  p_tone INTEGER DEFAULT NULL,
  p_accuracy INTEGER DEFAULT NULL,
  p_policy INTEGER DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_approval RECORD;
  v_result JSONB;
BEGIN
  -- Get approval
  SELECT * INTO v_approval FROM approvals WHERE id = p_approval_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Approval not found');
  END IF;

  -- Check state
  IF v_approval.state NOT IN ('draft', 'pending_review') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot approve from state: ' || v_approval.state);
  END IF;

  -- Update approval
  UPDATE approvals
  SET state = 'approved',
      reviewer = p_reviewer,
      updated_at = NOW()
  WHERE id = p_approval_id;

  -- Insert grades if provided
  IF p_tone IS NOT NULL OR p_accuracy IS NOT NULL OR p_policy IS NOT NULL THEN
    INSERT INTO approval_grades (approval_id, reviewer, tone, accuracy, policy, notes)
    VALUES (p_approval_id, p_reviewer, p_tone, p_accuracy, p_policy, p_notes)
    ON CONFLICT (approval_id) DO UPDATE SET
      tone = COALESCE(EXCLUDED.tone, approval_grades.tone),
      accuracy = COALESCE(EXCLUDED.accuracy, approval_grades.accuracy),
      policy = COALESCE(EXCLUDED.policy, approval_grades.policy),
      notes = COALESCE(EXCLUDED.notes, approval_grades.notes);
  END IF;

  -- Log to audit
  INSERT INTO audit_logs (actor, action, entity_type, entity_id, payload, result, result_details)
  VALUES (
    p_reviewer,
    'approval.approved',
    'approval',
    p_approval_id::TEXT,
    jsonb_build_object('kind', v_approval.kind, 'summary', v_approval.summary),
    'success',
    jsonb_build_object('state_change', v_approval.state || ' -> approved', 'grades_provided', p_tone IS NOT NULL)
  );

  v_result := jsonb_build_object(
    'success', true,
    'approval_id', p_approval_id,
    'new_state', 'approved',
    'reviewer', p_reviewer
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_approval TO authenticated, service_role;
COMMENT ON FUNCTION public.approve_approval IS 'Approve an approval and optionally record grades';

