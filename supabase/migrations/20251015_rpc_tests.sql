-- RPC Test Harness
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: Backlog 21 - Test harness for RPCs

-- ============================================================================
-- Test Results Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rpc_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  rpc_function TEXT NOT NULL,
  test_params JSONB,
  expected_result JSONB,
  actual_result JSONB,
  status TEXT CHECK (status IN ('pass', 'fail', 'error')) NOT NULL,
  error_message TEXT,
  execution_time_ms NUMERIC,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rpc_test_results_function_idx ON public.rpc_test_results (rpc_function);
CREATE INDEX IF NOT EXISTS rpc_test_results_status_idx ON public.rpc_test_results (status);
CREATE INDEX IF NOT EXISTS rpc_test_results_executed_at_idx ON public.rpc_test_results (executed_at DESC);

COMMENT ON TABLE public.rpc_test_results IS 'Test results for RPC function testing';

-- ============================================================================
-- Test Runner Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.run_rpc_test(
  p_test_name TEXT,
  p_rpc_function TEXT,
  p_test_params JSONB DEFAULT NULL,
  p_expected_keys TEXT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
  v_result JSONB;
  v_status TEXT;
  v_error_message TEXT;
  v_execution_time_ms NUMERIC;
  v_test_result JSONB;
BEGIN
  v_start_time := clock_timestamp();
  
  BEGIN
    -- Execute the RPC function
    EXECUTE format('SELECT %I(%L)', p_rpc_function, COALESCE(p_test_params::TEXT, ''))
    INTO v_result;
    
    -- Check if expected keys are present
    IF p_expected_keys IS NOT NULL THEN
      FOR i IN 1..array_length(p_expected_keys, 1) LOOP
        IF NOT (v_result ? p_expected_keys[i]) THEN
          v_status := 'fail';
          v_error_message := format('Missing expected key: %s', p_expected_keys[i]);
          EXIT;
        END IF;
      END LOOP;
      
      IF v_status IS NULL THEN
        v_status := 'pass';
      END IF;
    ELSE
      v_status := 'pass';
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    v_status := 'error';
    v_error_message := SQLERRM;
    v_result := NULL;
  END;
  
  v_end_time := clock_timestamp();
  v_execution_time_ms := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;
  
  -- Insert test result
  INSERT INTO rpc_test_results (
    test_name,
    rpc_function,
    test_params,
    actual_result,
    status,
    error_message,
    execution_time_ms
  ) VALUES (
    p_test_name,
    p_rpc_function,
    p_test_params,
    v_result,
    v_status,
    v_error_message,
    v_execution_time_ms
  ) RETURNING row_to_json(rpc_test_results.*) INTO v_test_result;
  
  RETURN v_test_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.run_rpc_test TO service_role;
COMMENT ON FUNCTION public.run_rpc_test IS 'Run a single RPC test and record results';

-- ============================================================================
-- Test Suite Runner
-- ============================================================================

CREATE OR REPLACE FUNCTION public.run_all_rpc_tests()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_results JSONB[];
  v_test_result JSONB;
  v_summary JSONB;
  v_pass_count INTEGER := 0;
  v_fail_count INTEGER := 0;
  v_error_count INTEGER := 0;
BEGIN
  -- Test 1: get_revenue_tile
  v_test_result := run_rpc_test(
    'Revenue Tile - Basic',
    'get_revenue_tile',
    NULL,
    ARRAY['current_30d', 'previous_30d', 'trend_pct', 'trend_direction', 'last_updated']
  );
  v_results := array_append(v_results, v_test_result);
  IF (v_test_result->>'status') = 'pass' THEN v_pass_count := v_pass_count + 1;
  ELSIF (v_test_result->>'status') = 'fail' THEN v_fail_count := v_fail_count + 1;
  ELSE v_error_count := v_error_count + 1; END IF;
  
  -- Test 2: get_aov_tile
  v_test_result := run_rpc_test(
    'AOV Tile - Basic',
    'get_aov_tile',
    NULL,
    ARRAY['current_aov', 'previous_aov', 'trend_pct', 'trend_direction']
  );
  v_results := array_append(v_results, v_test_result);
  IF (v_test_result->>'status') = 'pass' THEN v_pass_count := v_pass_count + 1;
  ELSIF (v_test_result->>'status') = 'fail' THEN v_fail_count := v_fail_count + 1;
  ELSE v_error_count := v_error_count + 1; END IF;
  
  -- Test 3: get_approvals_queue_tile
  v_test_result := run_rpc_test(
    'Approvals Queue Tile - Basic',
    'get_approvals_queue_tile',
    NULL,
    ARRAY['pending_count', 'by_kind', 'urgency']
  );
  v_results := array_append(v_results, v_test_result);
  IF (v_test_result->>'status') = 'pass' THEN v_pass_count := v_pass_count + 1;
  ELSIF (v_test_result->>'status') = 'fail' THEN v_fail_count := v_fail_count + 1;
  ELSE v_error_count := v_error_count + 1; END IF;
  
  -- Test 4: get_ads_performance with 30 days
  v_test_result := run_rpc_test(
    'Ads Performance - 30 days',
    'get_ads_performance',
    '30'::jsonb,
    ARRAY['total_spend', 'total_impressions', 'avg_roas']
  );
  v_results := array_append(v_results, v_test_result);
  IF (v_test_result->>'status') = 'pass' THEN v_pass_count := v_pass_count + 1;
  ELSIF (v_test_result->>'status') = 'fail' THEN v_fail_count := v_fail_count + 1;
  ELSE v_error_count := v_error_count + 1; END IF;
  
  -- Test 5: get_content_engagement
  v_test_result := run_rpc_test(
    'Content Engagement - 30 days',
    'get_content_engagement',
    '30'::jsonb,
    ARRAY['blog_posts_published', 'social_posts', 'emails_sent']
  );
  v_results := array_append(v_results, v_test_result);
  IF (v_test_result->>'status') = 'pass' THEN v_pass_count := v_pass_count + 1;
  ELSIF (v_test_result->>'status') = 'fail' THEN v_fail_count := v_fail_count + 1;
  ELSE v_error_count := v_error_count + 1; END IF;
  
  -- Build summary
  v_summary := jsonb_build_object(
    'total_tests', array_length(v_results, 1),
    'passed', v_pass_count,
    'failed', v_fail_count,
    'errors', v_error_count,
    'pass_rate_pct', ROUND((v_pass_count::NUMERIC / NULLIF(array_length(v_results, 1), 0)) * 100, 2),
    'executed_at', NOW(),
    'results', to_jsonb(v_results)
  );
  
  RETURN v_summary;
END;
$$;

GRANT EXECUTE ON FUNCTION public.run_all_rpc_tests TO service_role;
COMMENT ON FUNCTION public.run_all_rpc_tests IS 'Run all RPC tests and return summary';

-- ============================================================================
-- View: Latest Test Results
-- ============================================================================

CREATE OR REPLACE VIEW public.v_latest_test_results AS
SELECT 
  rpc_function,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'pass') as passes,
  COUNT(*) FILTER (WHERE status = 'fail') as failures,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  AVG(execution_time_ms) as avg_execution_time_ms,
  MAX(executed_at) as last_run_at
FROM rpc_test_results
WHERE executed_at >= NOW() - INTERVAL '7 days'
GROUP BY rpc_function
ORDER BY last_run_at DESC;

GRANT SELECT ON public.v_latest_test_results TO authenticated, service_role;
COMMENT ON VIEW public.v_latest_test_results IS 'Summary of RPC test results from last 7 days';

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT ON public.rpc_test_results TO authenticated, service_role;
GRANT ALL ON public.rpc_test_results TO service_role;

