-- Error Budgets and Alerts for Database
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: Backlog 24 - Error budgets & alerts for DB

-- ============================================================================
-- Error Budget Configuration Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.error_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL UNIQUE,
  metric_type TEXT CHECK (metric_type IN ('latency', 'error_rate', 'availability')) NOT NULL,
  target_value NUMERIC NOT NULL,
  threshold_warning NUMERIC NOT NULL,
  threshold_critical NUMERIC NOT NULL,
  measurement_window_minutes INTEGER DEFAULT 60,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS error_budgets_enabled_idx ON public.error_budgets (enabled) WHERE enabled = true;

-- Insert default error budgets
INSERT INTO error_budgets (metric_name, metric_type, target_value, threshold_warning, threshold_critical, measurement_window_minutes)
VALUES
  ('query_p95_latency_ms', 'latency', 100, 150, 200, 60),
  ('query_error_rate_pct', 'error_rate', 0.5, 1.0, 2.0, 60),
  ('database_availability_pct', 'availability', 99.9, 99.5, 99.0, 1440),
  ('connection_pool_usage_pct', 'availability', 80, 90, 95, 15),
  ('disk_usage_pct', 'availability', 70, 85, 95, 60),
  ('replication_lag_seconds', 'latency', 5, 10, 30, 15)
ON CONFLICT (metric_name) DO NOTHING;

COMMENT ON TABLE public.error_budgets IS 'Error budget configuration for database monitoring';

-- ============================================================================
-- Alert History Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  alert_level TEXT CHECK (alert_level IN ('warning', 'critical')) NOT NULL,
  current_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS alert_history_metric_idx ON public.alert_history (metric_name);
CREATE INDEX IF NOT EXISTS alert_history_resolved_idx ON public.alert_history (resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS alert_history_created_at_idx ON public.alert_history (created_at DESC);

COMMENT ON TABLE public.alert_history IS 'History of database alerts';

-- ============================================================================
-- Function: Check Error Budgets
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_error_budgets()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_alerts JSONB[];
  v_budget RECORD;
  v_current_value NUMERIC;
  v_alert_level TEXT;
  v_message TEXT;
BEGIN
  FOR v_budget IN SELECT * FROM error_budgets WHERE enabled = true LOOP
    -- Get current value based on metric type
    CASE v_budget.metric_name
      WHEN 'query_p95_latency_ms' THEN
        SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY mean_exec_time)
        INTO v_current_value
        FROM pg_stat_statements
        WHERE calls > 10;
        
      WHEN 'query_error_rate_pct' THEN
        -- Placeholder: would need error tracking
        v_current_value := 0;
        
      WHEN 'database_availability_pct' THEN
        -- Placeholder: would check connection success rate
        v_current_value := 100;
        
      WHEN 'connection_pool_usage_pct' THEN
        SELECT (COUNT(*)::NUMERIC / NULLIF(current_setting('max_connections')::NUMERIC, 0)) * 100
        INTO v_current_value
        FROM pg_stat_activity;
        
      WHEN 'disk_usage_pct' THEN
        SELECT (SUM(pg_database_size(datname))::NUMERIC / (1024*1024*1024*100)) * 100
        INTO v_current_value
        FROM pg_database;
        
      ELSE
        v_current_value := 0;
    END CASE;
    
    -- Check thresholds
    IF v_current_value >= v_budget.threshold_critical THEN
      v_alert_level := 'critical';
      v_message := format('%s is CRITICAL: %.2f (threshold: %.2f)', 
        v_budget.metric_name, v_current_value, v_budget.threshold_critical);
      
      -- Insert alert
      INSERT INTO alert_history (metric_name, alert_level, current_value, threshold_value, message)
      VALUES (v_budget.metric_name, v_alert_level, v_current_value, v_budget.threshold_critical, v_message);
      
      v_alerts := array_append(v_alerts, jsonb_build_object(
        'metric', v_budget.metric_name,
        'level', v_alert_level,
        'value', v_current_value,
        'threshold', v_budget.threshold_critical,
        'message', v_message
      ));
      
    ELSIF v_current_value >= v_budget.threshold_warning THEN
      v_alert_level := 'warning';
      v_message := format('%s is WARNING: %.2f (threshold: %.2f)', 
        v_budget.metric_name, v_current_value, v_budget.threshold_warning);
      
      -- Insert alert
      INSERT INTO alert_history (metric_name, alert_level, current_value, threshold_value, message)
      VALUES (v_budget.metric_name, v_alert_level, v_current_value, v_budget.threshold_warning, v_message);
      
      v_alerts := array_append(v_alerts, jsonb_build_object(
        'metric', v_budget.metric_name,
        'level', v_alert_level,
        'value', v_current_value,
        'threshold', v_budget.threshold_warning,
        'message', v_message
      ));
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'checked_at', NOW(),
    'alerts', COALESCE(to_jsonb(v_alerts), '[]'::jsonb),
    'alert_count', COALESCE(array_length(v_alerts, 1), 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_error_budgets TO service_role;
COMMENT ON FUNCTION public.check_error_budgets IS 'Check all error budgets and create alerts if thresholds exceeded';

-- ============================================================================
-- Function: Get Active Alerts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_active_alerts()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_agg(row_to_json(a))
  INTO v_result
  FROM (
    SELECT 
      metric_name,
      alert_level,
      current_value,
      threshold_value,
      message,
      created_at
    FROM alert_history
    WHERE resolved = false
    ORDER BY 
      CASE alert_level WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 END,
      created_at DESC
  ) a;
  
  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_alerts TO authenticated, service_role;
COMMENT ON FUNCTION public.get_active_alerts IS 'Get all unresolved alerts';

-- ============================================================================
-- Schedule Error Budget Checks (every 15 minutes)
-- ============================================================================

SELECT cron.schedule(
  'error-budget-check',
  '*/15 * * * *',
  $$SELECT public.check_error_budgets()$$
);

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT ON public.error_budgets TO authenticated, service_role;
GRANT ALL ON public.error_budgets TO service_role;
GRANT SELECT ON public.alert_history TO authenticated, service_role;
GRANT ALL ON public.alert_history TO service_role;

-- Trigger for updated_at
CREATE TRIGGER trg_error_budgets_updated_at
BEFORE UPDATE ON public.error_budgets
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

