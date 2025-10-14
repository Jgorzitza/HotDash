-- Migration: Approval Tracking & CEO Edit Pattern Analytics
-- Created: 2025-10-14
-- Owner: data agent
-- Purpose: Track approval patterns and CEO editing behavior for AI improvement

-- ============================================================================
-- TABLE: approval_tracking_events
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID NOT NULL REFERENCES agent_approvals(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'viewed', 'edited', 'approved', 'rejected', 
    'escalated', 'timeout', 'auto_approved'
  )),
  actor_id BIGINT, -- User ID who performed action
  actor_role TEXT, -- 'ceo', 'operator', 'system'
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approval_events_approval ON approval_tracking_events (approval_id, created_at DESC);
CREATE INDEX idx_approval_events_type ON approval_tracking_events (event_type, created_at DESC);
CREATE INDEX idx_approval_events_actor ON approval_tracking_events (actor_id, created_at DESC);

COMMENT ON TABLE approval_tracking_events IS 
  'Event log tracking approval lifecycle (created, viewed, edited, approved, rejected, etc.)';

-- ============================================================================
-- TABLE: ceo_edit_patterns
-- ============================================================================

CREATE TABLE IF NOT EXISTS ceo_edit_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID NOT NULL REFERENCES agent_approvals(id),
  original_draft TEXT NOT NULL,
  edited_response TEXT NOT NULL,
  edit_distance INTEGER, -- Levenshtein distance
  edit_categories JSONB DEFAULT '[]'::jsonb, -- ['tone_adjustment', 'factual_correction', 'added_details']
  edited_sections JSONB DEFAULT '[]'::jsonb, -- Which parts changed
  edit_summary TEXT, -- Brief description of changes
  edit_time_seconds INTEGER, -- Time spent editing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ceo_edits_approval ON ceo_edit_patterns (approval_id);
CREATE INDEX idx_ceo_edits_distance ON ceo_edit_patterns (edit_distance DESC);
CREATE INDEX idx_ceo_edits_created ON ceo_edit_patterns (created_at DESC);

COMMENT ON TABLE ceo_edit_patterns IS 
  'Captures CEO edits to agent drafts for pattern analysis and AI improvement';

-- ============================================================================
-- VIEW: approval_lifecycle_metrics
-- ============================================================================

CREATE OR REPLACE VIEW approval_lifecycle_metrics AS
WITH lifecycle AS (
  SELECT
    aa.id,
    aa.conversation_id,
    aa.status,
    aa.priority,
    aa.confidence_score,
    aa.created_at,
    aa.reviewed_at,
    -- Time to first view
    MIN(ate.created_at) FILTER (WHERE ate.event_type = 'viewed') as first_viewed_at,
    -- Time to first edit (if any)
    MIN(ate.created_at) FILTER (WHERE ate.event_type = 'edited') as first_edited_at,
    -- Total edits count
    COUNT(*) FILTER (WHERE ate.event_type = 'edited') as edit_count,
    -- Final action
    MAX(ate.created_at) FILTER (WHERE ate.event_type IN ('approved', 'rejected')) as final_action_at
  FROM agent_approvals aa
  LEFT JOIN approval_tracking_events ate ON aa.id = ate.approval_id
  WHERE aa.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY aa.id, aa.conversation_id, aa.status, aa.priority, aa.confidence_score, aa.created_at, aa.reviewed_at
)
SELECT
  id,
  conversation_id,
  status,
  priority,
  confidence_score,
  created_at,
  first_viewed_at,
  first_edited_at,
  edit_count,
  final_action_at,
  -- Calculate time metrics
  EXTRACT(EPOCH FROM (first_viewed_at - created_at)) / 60 as minutes_to_first_view,
  EXTRACT(EPOCH FROM (first_edited_at - created_at)) / 60 as minutes_to_first_edit,
  EXTRACT(EPOCH FROM (final_action_at - created_at)) / 60 as minutes_to_resolution,
  -- Boolean flags
  first_edited_at IS NOT NULL as was_edited,
  edit_count > 0 as required_editing
FROM lifecycle
WHERE final_action_at IS NOT NULL;

COMMENT ON VIEW approval_lifecycle_metrics IS 
  'Approval lifecycle timing metrics (time to view, edit, resolution)';

-- ============================================================================
-- VIEW: ceo_editing_patterns
-- ============================================================================

CREATE OR REPLACE VIEW ceo_editing_patterns AS
WITH edit_analysis AS (
  SELECT
    cep.id,
    cep.approval_id,
    aa.confidence_score,
    aa.priority,
    aa.status,
    cep.edit_distance,
    cep.edit_categories,
    cep.edit_summary,
    cep.edit_time_seconds,
    cep.created_at,
    -- Categorize edit severity
    CASE
      WHEN edit_distance < 50 THEN 'minor'
      WHEN edit_distance < 200 THEN 'moderate'
      ELSE 'major'
    END as edit_severity,
    -- Check for common patterns
    jsonb_array_length(cep.edit_categories) as category_count
  FROM ceo_edit_patterns cep
  JOIN agent_approvals aa ON cep.approval_id = aa.id
  WHERE cep.created_at >= NOW() - INTERVAL '30 days'
)
SELECT
  id,
  approval_id,
  confidence_score,
  priority,
  status,
  edit_distance,
  edit_severity,
  edit_categories,
  category_count,
  edit_summary,
  edit_time_seconds,
  created_at,
  -- Pattern flags
  edit_categories @> '["tone_adjustment"]'::jsonb as adjusted_tone,
  edit_categories @> '["factual_correction"]'::jsonb as corrected_facts,
  edit_categories @> '["added_details"]'::jsonb as added_detail,
  edit_categories @> '["removed_content"]'::jsonb as removed_content,
  edit_categories @> '["restructured"]'::jsonb as restructured
FROM edit_analysis;

COMMENT ON VIEW ceo_editing_patterns IS 
  'CEO edit pattern analysis for identifying common improvement areas';

-- ============================================================================
-- VIEW: learning_metrics_dashboard
-- ============================================================================

CREATE OR REPLACE VIEW learning_metrics_dashboard AS
WITH metrics_30d AS (
  SELECT
    DATE_TRUNC('day', aa.created_at) as day,
    -- Volume metrics
    COUNT(*) as total_approvals,
    COUNT(*) FILTER (WHERE aa.status = 'approved') as approved_without_edit,
    COUNT(*) FILTER (WHERE aa.status = 'edited') as approved_with_edit,
    COUNT(*) FILTER (WHERE aa.status = 'rejected') as rejected,
    -- Confidence correlation
    ROUND(AVG(aa.confidence_score) FILTER (WHERE aa.status = 'approved'), 2) as avg_confidence_approved,
    ROUND(AVG(aa.confidence_score) FILTER (WHERE aa.status = 'edited'), 2) as avg_confidence_edited,
    ROUND(AVG(aa.confidence_score) FILTER (WHERE aa.status = 'rejected'), 2) as avg_confidence_rejected,
    -- Edit metrics
    ROUND(AVG(cep.edit_distance), 2) as avg_edit_distance,
    COUNT(DISTINCT cep.approval_id) as items_requiring_edits,
    ROUND(AVG(cep.edit_time_seconds), 2) as avg_edit_time_seconds,
    -- Pattern frequency
    COUNT(*) FILTER (WHERE cep.edit_categories @> '["tone_adjustment"]'::jsonb) as tone_adjustments,
    COUNT(*) FILTER (WHERE cep.edit_categories @> '["factual_correction"]'::jsonb) as factual_corrections,
    COUNT(*) FILTER (WHERE cep.edit_categories @> '["added_details"]'::jsonb) as detail_additions
  FROM agent_approvals aa
  LEFT JOIN ceo_edit_patterns cep ON aa.id = cep.approval_id
  WHERE aa.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY day
)
SELECT
  day,
  total_approvals,
  approved_without_edit,
  approved_with_edit,
  rejected,
  -- Calculate rates
  CASE WHEN total_approvals > 0 
    THEN ROUND(approved_without_edit::numeric / total_approvals * 100, 2) 
    ELSE 0 
  END as auto_approval_rate_pct,
  CASE WHEN total_approvals > 0 
    THEN ROUND(approved_with_edit::numeric / total_approvals * 100, 2) 
    ELSE 0 
  END as edit_rate_pct,
  CASE WHEN total_approvals > 0 
    THEN ROUND(rejected::numeric / total_approvals * 100, 2) 
    ELSE 0 
  END as rejection_rate_pct,
  -- Confidence insights
  avg_confidence_approved,
  avg_confidence_edited,
  avg_confidence_rejected,
  -- Edit insights
  avg_edit_distance,
  items_requiring_edits,
  avg_edit_time_seconds,
  -- Pattern frequencies
  tone_adjustments,
  factual_corrections,
  detail_additions
FROM metrics_30d
ORDER BY day DESC;

COMMENT ON VIEW learning_metrics_dashboard IS 
  'Learning metrics showing approval rates, confidence correlation, and CEO edit patterns';

-- ============================================================================
-- VIEW: improvement_recommendations
-- ============================================================================

CREATE OR REPLACE VIEW improvement_recommendations AS
WITH patterns AS (
  SELECT
    -- Identify common edit patterns
    unnest(array(SELECT jsonb_array_elements_text(edit_categories))) as edit_category,
    COUNT(*) as frequency,
    ROUND(AVG(edit_distance), 2) as avg_severity,
    ROUND(AVG(aa.confidence_score), 2) as avg_confidence_when_occurred,
    array_agg(DISTINCT aa.priority) as priorities_affected,
    array_agg(DISTINCT aa.recommended_action) as recommended_actions
  FROM ceo_edit_patterns cep
  JOIN agent_approvals aa ON cep.approval_id = aa.id
  WHERE cep.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY edit_category
),
thresholds AS (
  SELECT
    ROUND(AVG(confidence_score) FILTER (WHERE status = 'approved' AND id NOT IN (SELECT approval_id FROM ceo_edit_patterns)), 2) as min_auto_approve_confidence,
    ROUND(AVG(confidence_score) FILTER (WHERE status = 'rejected'), 2) as max_reject_confidence
  FROM agent_approvals
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT
  p.edit_category as pattern,
  p.frequency as occurrences_30d,
  p.avg_severity as avg_edit_distance,
  p.avg_confidence_when_occurred,
  -- Generate recommendations
  CASE
    WHEN p.edit_category = 'tone_adjustment' THEN 'Improve tone calibration in training data. Add more examples of professional, empathetic responses.'
    WHEN p.edit_category = 'factual_correction' THEN 'Enhance knowledge source accuracy. Verify product specs and policy documentation.'
    WHEN p.edit_category = 'added_details' THEN 'Train model to include more specific details. Add examples with technical specifications.'
    WHEN p.edit_category = 'removed_content' THEN 'Model may be over-explaining. Train on concise, direct responses.'
    WHEN p.edit_category = 'restructured' THEN 'Improve response structure. Add examples with better organization.'
    ELSE 'Review pattern for specific improvement opportunities.'
  END as recommendation,
  -- Confidence threshold insights
  CASE
    WHEN p.avg_confidence_when_occurred < t.min_auto_approve_confidence THEN 
      'Increase review threshold - low confidence correlates with edits'
    WHEN p.avg_confidence_when_occurred > t.min_auto_approve_confidence THEN
      'High confidence items still edited - improve model training'
    ELSE 'Confidence threshold appropriate'
  END as confidence_insight,
  p.priorities_affected,
  NOW() as generated_at
FROM patterns p
CROSS JOIN thresholds t
ORDER BY p.frequency DESC;

COMMENT ON VIEW improvement_recommendations IS 
  'AI improvement recommendations based on CEO edit patterns and approval metrics';

-- ============================================================================
-- FUNCTION: Track Approval Event
-- ============================================================================

CREATE OR REPLACE FUNCTION track_approval_event(
  p_approval_id UUID,
  p_event_type TEXT,
  p_actor_id BIGINT DEFAULT NULL,
  p_actor_role TEXT DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO approval_tracking_events (
    approval_id,
    event_type,
    actor_id,
    actor_role,
    event_data
  ) VALUES (
    p_approval_id,
    p_event_type,
    p_actor_id,
    p_actor_role,
    p_event_data
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

COMMENT ON FUNCTION track_approval_event(UUID, TEXT, BIGINT, TEXT, JSONB) IS 
  'Track approval lifecycle events. Call whenever approval state changes.';

-- ============================================================================
-- FUNCTION: Record CEO Edit
-- ============================================================================

CREATE OR REPLACE FUNCTION record_ceo_edit(
  p_approval_id UUID,
  p_original_draft TEXT,
  p_edited_response TEXT,
  p_edit_categories JSONB DEFAULT '[]'::jsonb,
  p_edit_summary TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_edit_id UUID;
  v_edit_distance INTEGER;
BEGIN
  -- Calculate Levenshtein distance (simplified - character count difference)
  v_edit_distance := ABS(LENGTH(p_edited_response) - LENGTH(p_original_draft));
  
  -- Insert edit record
  INSERT INTO ceo_edit_patterns (
    approval_id,
    original_draft,
    edited_response,
    edit_distance,
    edit_categories,
    edit_summary
  ) VALUES (
    p_approval_id,
    p_original_draft,
    p_edited_response,
    v_edit_distance,
    p_edit_categories,
    p_edit_summary
  )
  RETURNING id INTO v_edit_id;
  
  -- Track edit event
  PERFORM track_approval_event(
    p_approval_id,
    'edited',
    NULL, -- TODO: Get CEO user ID from context
    'ceo',
    jsonb_build_object('edit_id', v_edit_id, 'edit_distance', v_edit_distance)
  );
  
  RETURN v_edit_id;
END;
$$;

COMMENT ON FUNCTION record_ceo_edit(UUID, TEXT, TEXT, JSONB, TEXT) IS 
  'Record CEO edit with pattern categorization for AI learning';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

ALTER TABLE approval_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_edit_patterns ENABLE ROW LEVEL SECURITY;

-- service_role full access
CREATE POLICY "service_role_full_access_events" 
  ON approval_tracking_events FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_full_access_edits" 
  ON ceo_edit_patterns FOR ALL 
  USING (auth.role() = 'service_role');

-- authenticated users can view
CREATE POLICY "authenticated_view_events" 
  ON approval_tracking_events FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_view_edits" 
  ON ceo_edit_patterns FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Grant view access
GRANT SELECT ON approval_lifecycle_metrics TO authenticated;
GRANT SELECT ON ceo_editing_patterns TO authenticated;
GRANT SELECT ON learning_metrics_dashboard TO authenticated;
GRANT SELECT ON improvement_recommendations TO authenticated;

-- Grant function execution
GRANT EXECUTE ON FUNCTION track_approval_event(UUID, TEXT, BIGINT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION record_ceo_edit(UUID, TEXT, TEXT, JSONB, TEXT) TO service_role;
