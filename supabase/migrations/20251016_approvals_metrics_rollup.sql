-- Approvals Metrics Nightly Rollup
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-16
-- Task: 12 - Nightly rollup job for approvals metrics

-- ============================================================================
-- Table: approvals_metrics_daily
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.approvals_metrics_daily (
  id BIGSERIAL PRIMARY KEY,
  metric_date DATE NOT NULL,
  
  -- Volume metrics
  total_approvals INTEGER DEFAULT 0,
  by_kind_cx_reply INTEGER DEFAULT 0,
  by_kind_inventory INTEGER DEFAULT 0,
  by_kind_growth INTEGER DEFAULT 0,
  by_kind_misc INTEGER DEFAULT 0,
  
  -- State metrics
  draft_count INTEGER DEFAULT 0,
  pending_review_count INTEGER DEFAULT 0,
  approved_count INTEGER DEFAULT 0,
  applied_count INTEGER DEFAULT 0,
  
  -- Performance metrics
  avg_review_time_minutes NUMERIC(10,2),
  median_review_time_minutes NUMERIC(10,2),
  p95_review_time_minutes NUMERIC(10,2),
  
  -- Quality metrics (from approval_grades)
  avg_tone_grade NUMERIC(3,2),
  avg_accuracy_grade NUMERIC(3,2),
  avg_policy_grade NUMERIC(3,2),
  graded_count INTEGER DEFAULT 0,
  
  -- Edit metrics
  total_edits INTEGER DEFAULT 0,
  avg_edit_distance NUMERIC(10,2),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT approvals_metrics_daily_unique_date UNIQUE (metric_date)
);

CREATE INDEX IF NOT EXISTS approvals_metrics_daily_date_idx ON public.approvals_metrics_daily (metric_date DESC);

COMMENT ON TABLE public.approvals_metrics_daily IS 'Daily aggregation of approvals workflow metrics';

-- ============================================================================
-- Rollup Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rollup_approvals_metrics_daily(p_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_total INTEGER;
BEGIN
  -- Insert or update daily metrics
  INSERT INTO approvals_metrics_daily (
    metric_date,
    total_approvals,
    by_kind_cx_reply,
    by_kind_inventory,
    by_kind_growth,
    by_kind_misc,
    draft_count,
    pending_review_count,
    approved_count,
    applied_count,
    avg_review_time_minutes,
    median_review_time_minutes,
    p95_review_time_minutes,
    avg_tone_grade,
    avg_accuracy_grade,
    avg_policy_grade,
    graded_count,
    total_edits,
    avg_edit_distance
  )
  SELECT 
    p_date,
    COUNT(*),
    COUNT(*) FILTER (WHERE kind = 'cx_reply'),
    COUNT(*) FILTER (WHERE kind = 'inventory'),
    COUNT(*) FILTER (WHERE kind = 'growth'),
    COUNT(*) FILTER (WHERE kind = 'misc'),
    COUNT(*) FILTER (WHERE state = 'draft'),
    COUNT(*) FILTER (WHERE state = 'pending_review'),
    COUNT(*) FILTER (WHERE state = 'approved'),
    COUNT(*) FILTER (WHERE state = 'applied'),
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) FILTER (WHERE state IN ('approved', 'applied')),
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at))/60) FILTER (WHERE state IN ('approved', 'applied')),
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at))/60) FILTER (WHERE state IN ('approved', 'applied')),
    (SELECT AVG(tone) FROM approval_grades WHERE approval_id IN (SELECT id FROM approvals WHERE DATE(created_at) = p_date)),
    (SELECT AVG(accuracy) FROM approval_grades WHERE approval_id IN (SELECT id FROM approvals WHERE DATE(created_at) = p_date)),
    (SELECT AVG(policy) FROM approval_grades WHERE approval_id IN (SELECT id FROM approvals WHERE DATE(created_at) = p_date)),
    (SELECT COUNT(*) FROM approval_grades WHERE approval_id IN (SELECT id FROM approvals WHERE DATE(created_at) = p_date)),
    (SELECT COUNT(*) FROM approval_edits WHERE approval_id IN (SELECT id FROM approvals WHERE DATE(created_at) = p_date)),
    (SELECT AVG(edit_distance) FROM approval_edits WHERE approval_id IN (SELECT id FROM approvals WHERE DATE(created_at) = p_date))
  FROM approvals
  WHERE DATE(created_at) = p_date
  ON CONFLICT (metric_date) DO UPDATE SET
    total_approvals = EXCLUDED.total_approvals,
    by_kind_cx_reply = EXCLUDED.by_kind_cx_reply,
    by_kind_inventory = EXCLUDED.by_kind_inventory,
    by_kind_growth = EXCLUDED.by_kind_growth,
    draft_count = EXCLUDED.draft_count,
    pending_review_count = EXCLUDED.pending_review_count,
    approved_count = EXCLUDED.approved_count,
    applied_count = EXCLUDED.applied_count,
    avg_review_time_minutes = EXCLUDED.avg_review_time_minutes,
    avg_tone_grade = EXCLUDED.avg_tone_grade,
    avg_accuracy_grade = EXCLUDED.avg_accuracy_grade,
    avg_policy_grade = EXCLUDED.avg_policy_grade,
    updated_at = NOW();
  
  GET DIAGNOSTICS v_total = ROW_COUNT;
  
  v_result := jsonb_build_object(
    'date', p_date,
    'rows_affected', v_total,
    'completed_at', NOW()
  );
  
  -- Log to audit
  INSERT INTO audit_logs (actor, action, entity_type, payload, result, result_details)
  VALUES ('system', 'approvals_metrics.rollup', 'rollup', v_result, 'success', v_result);
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rollup_approvals_metrics_daily TO service_role;
COMMENT ON FUNCTION public.rollup_approvals_metrics_daily IS 'Rollup approvals metrics for a specific date (default: yesterday)';

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.approvals_metrics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY approvals_metrics_daily_service_role ON public.approvals_metrics_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY approvals_metrics_daily_read_all ON public.approvals_metrics_daily FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.approvals_metrics_daily TO authenticated;
GRANT ALL ON public.approvals_metrics_daily TO service_role;

-- ============================================================================
-- Schedule Nightly Rollup (2:30 AM daily)
-- ============================================================================

SELECT cron.schedule(
  'approvals-metrics-rollup',
  '30 2 * * *',
  $$SELECT public.rollup_approvals_metrics_daily()$$
);

