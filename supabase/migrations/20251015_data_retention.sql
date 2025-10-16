-- Data Retention Policies
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: Backlog 18 - Data retention policies

-- ============================================================================
-- Retention Function: Audit Logs (90 days)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_audit_logs(p_retention_days INTEGER DEFAULT 90)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
  v_cutoff_date TIMESTAMPTZ;
BEGIN
  v_cutoff_date := NOW() - (p_retention_days || ' days')::INTERVAL;
  
  DELETE FROM audit_logs
  WHERE created_at < v_cutoff_date;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'table', 'audit_logs',
    'retention_days', p_retention_days,
    'cutoff_date', v_cutoff_date,
    'deleted_count', v_deleted_count,
    'executed_at', NOW()
  );
END;
$$;

COMMENT ON FUNCTION public.cleanup_audit_logs IS 'Delete audit logs older than retention period (default: 90 days)';

-- ============================================================================
-- Retention Function: CX Metrics Daily (365 days)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_cx_metrics(p_retention_days INTEGER DEFAULT 365)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
  v_cutoff_date DATE;
BEGIN
  v_cutoff_date := CURRENT_DATE - p_retention_days;
  
  DELETE FROM cx_metrics_daily
  WHERE metric_date < v_cutoff_date;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'table', 'cx_metrics_daily',
    'retention_days', p_retention_days,
    'cutoff_date', v_cutoff_date,
    'deleted_count', v_deleted_count,
    'executed_at', NOW()
  );
END;
$$;

COMMENT ON FUNCTION public.cleanup_cx_metrics IS 'Delete CX metrics older than retention period (default: 365 days)';

-- ============================================================================
-- Retention Function: Growth Metrics Daily (365 days)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_growth_metrics(p_retention_days INTEGER DEFAULT 365)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
  v_cutoff_date DATE;
BEGIN
  v_cutoff_date := CURRENT_DATE - p_retention_days;
  
  DELETE FROM growth_metrics_daily
  WHERE metric_date < v_cutoff_date;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'table', 'growth_metrics_daily',
    'retention_days', p_retention_days,
    'cutoff_date', v_cutoff_date,
    'deleted_count', v_deleted_count,
    'executed_at', NOW()
  );
END;
$$;

COMMENT ON FUNCTION public.cleanup_growth_metrics IS 'Delete growth metrics older than retention period (default: 365 days)';

-- ============================================================================
-- Retention Function: Picker Payouts (730 days / 2 years)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_picker_payouts(p_retention_days INTEGER DEFAULT 730)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
  v_cutoff_date DATE;
BEGIN
  v_cutoff_date := CURRENT_DATE - p_retention_days;
  
  DELETE FROM picker_payouts
  WHERE pay_period_end < v_cutoff_date
    AND status = 'paid';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'table', 'picker_payouts',
    'retention_days', p_retention_days,
    'cutoff_date', v_cutoff_date,
    'deleted_count', v_deleted_count,
    'executed_at', NOW()
  );
END;
$$;

COMMENT ON FUNCTION public.cleanup_picker_payouts IS 'Delete paid picker payouts older than retention period (default: 730 days)';

-- ============================================================================
-- Master Retention Function: Run All Cleanup Tasks
-- ============================================================================

CREATE OR REPLACE FUNCTION public.run_data_retention_cleanup()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_results JSONB;
  v_audit_result JSONB;
  v_cx_result JSONB;
  v_growth_result JSONB;
  v_payouts_result JSONB;
BEGIN
  -- Run all cleanup functions
  v_audit_result := cleanup_audit_logs(90);
  v_cx_result := cleanup_cx_metrics(365);
  v_growth_result := cleanup_growth_metrics(365);
  v_payouts_result := cleanup_picker_payouts(730);
  
  -- Build combined result
  v_results := jsonb_build_object(
    'status', 'success',
    'executed_at', NOW(),
    'results', jsonb_build_array(
      v_audit_result,
      v_cx_result,
      v_growth_result,
      v_payouts_result
    ),
    'total_deleted', 
      (v_audit_result->>'deleted_count')::INTEGER +
      (v_cx_result->>'deleted_count')::INTEGER +
      (v_growth_result->>'deleted_count')::INTEGER +
      (v_payouts_result->>'deleted_count')::INTEGER
  );
  
  -- Log to audit_logs
  INSERT INTO audit_logs (actor, action, entity_type, payload, result, result_details)
  VALUES ('system', 'data_retention.cleanup', 'retention', v_results, 'success', v_results);
  
  RETURN v_results;
END;
$$;

GRANT EXECUTE ON FUNCTION public.run_data_retention_cleanup TO service_role;
COMMENT ON FUNCTION public.run_data_retention_cleanup IS 'Master function to run all data retention cleanup tasks';

-- ============================================================================
-- Schedule Weekly Retention Cleanup (Sunday 3 AM)
-- ============================================================================

SELECT cron.schedule(
  'weekly-retention-cleanup',
  '0 3 * * 0',
  $$SELECT public.run_data_retention_cleanup()$$
);

-- ============================================================================
-- Retention Policy Documentation Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  table_name TEXT PRIMARY KEY,
  retention_days INTEGER NOT NULL,
  cleanup_function TEXT NOT NULL,
  last_cleanup_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO data_retention_policies (table_name, retention_days, cleanup_function, notes)
VALUES
  ('audit_logs', 90, 'cleanup_audit_logs', 'Audit trail - 90 days minimum per compliance'),
  ('cx_metrics_daily', 365, 'cleanup_cx_metrics', 'CX metrics - 1 year for trend analysis'),
  ('growth_metrics_daily', 365, 'cleanup_growth_metrics', 'Growth metrics - 1 year for trend analysis'),
  ('picker_payouts', 730, 'cleanup_picker_payouts', 'Payouts - 2 years for financial records')
ON CONFLICT (table_name) DO NOTHING;

GRANT SELECT ON public.data_retention_policies TO authenticated, service_role;

COMMENT ON TABLE public.data_retention_policies IS 'Documentation of data retention policies for all tables';

