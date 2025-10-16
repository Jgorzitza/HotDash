-- Test Harness for Approvals RPCs
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-16
-- Task: 20 - Test harness for approvals RPCs

-- ============================================================================
-- Test Results Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.approvals_test_results (
  id BIGSERIAL PRIMARY KEY,
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

CREATE INDEX IF NOT EXISTS approvals_test_results_function_idx ON public.approvals_test_results (rpc_function);
CREATE INDEX IF NOT EXISTS approvals_test_results_status_idx ON public.approvals_test_results (status);
CREATE INDEX IF NOT EXISTS approvals_test_results_executed_at_idx ON public.approvals_test_results (executed_at DESC);

COMMENT ON TABLE public.approvals_test_results IS 'Test results for approvals RPC functions';

-- ============================================================================
-- Test Runner Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.run_approvals_rpc_test(
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
    CASE p_rpc_function
      WHEN 'get_approvals_list' THEN
        SELECT to_jsonb(array_agg(row_to_json(r)))
        INTO v_result
        FROM get_approvals_list(
          (p_test_params->>'state')::TEXT,
          (p_test_params->>'kind')::TEXT,
          (p_test_params->>'reviewer')::TEXT,
          COALESCE((p_test_params->>'limit')::INTEGER, 50),
          COALESCE((p_test_params->>'offset')::INTEGER, 0)
        ) r;
        
      WHEN 'get_approvals_queue_tile' THEN
        SELECT get_approvals_queue_tile() INTO v_result;
        
      WHEN 'validate_approval' THEN
        SELECT validate_approval((p_test_params->>'approval_id')::BIGINT) INTO v_result;
        
      WHEN 'get_approval_detail' THEN
        SELECT get_approval_detail((p_test_params->>'approval_id')::BIGINT) INTO v_result;
        
      WHEN 'approve_approval' THEN
        SELECT approve_approval(
          (p_test_params->>'approval_id')::BIGINT,
          (p_test_params->>'reviewer')::TEXT,
          (p_test_params->>'tone')::INTEGER,
          (p_test_params->>'accuracy')::INTEGER,
          (p_test_params->>'policy')::INTEGER,
          (p_test_params->>'notes')::TEXT
        ) INTO v_result;
        
      ELSE
        RAISE EXCEPTION 'Unknown RPC function: %', p_rpc_function;
    END CASE;
    
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
  INSERT INTO approvals_test_results (
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
  ) RETURNING row_to_json(approvals_test_results.*) INTO v_test_result;
  
  RETURN v_test_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.run_approvals_rpc_test TO service_role;
COMMENT ON FUNCTION public.run_approvals_rpc_test IS 'Run a single approvals RPC test and record results';

-- ============================================================================
-- Test Suite Runner
-- ============================================================================

CREATE OR REPLACE FUNCTION public.run_all_approvals_tests()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_results JSONB[];
  v_test_result JSONB;
  v_pass_count INTEGER := 0;
  v_fail_count INTEGER := 0;
  v_error_count INTEGER := 0;
BEGIN
  -- Test 1: get_approvals_queue_tile
  v_test_result := run_approvals_rpc_test(
    'Approvals Queue Tile - Basic',
    'get_approvals_queue_tile',
    NULL,
    ARRAY['pending_count', 'by_kind', 'urgency', 'last_updated']
  );
  v_results := array_append(v_results, v_test_result);
  IF (v_test_result->>'status') = 'pass' THEN v_pass_count := v_pass_count + 1;
  ELSIF (v_test_result->>'status') = 'fail' THEN v_fail_count := v_fail_count + 1;
  ELSE v_error_count := v_error_count + 1; END IF;
  
  -- Test 2: get_approvals_list - all
  v_test_result := run_approvals_rpc_test(
    'Approvals List - All',
    'get_approvals_list',
    '{"limit": 10}'::jsonb,
    NULL
  );
  v_results := array_append(v_results, v_test_result);
  IF (v_test_result->>'status') = 'pass' THEN v_pass_count := v_pass_count + 1;
  ELSIF (v_test_result->>'status') = 'fail' THEN v_fail_count := v_fail_count + 1;
  ELSE v_error_count := v_error_count + 1; END IF;
  
  -- Test 3: get_approvals_list - pending CX
  v_test_result := run_approvals_rpc_test(
    'Approvals List - Pending CX',
    'get_approvals_list',
    '{"state": "pending_review", "kind": "cx_reply", "limit": 10}'::jsonb,
    NULL
  );
  v_results := array_append(v_results, v_test_result);
  IF (v_test_result->>'status') = 'pass' THEN v_pass_count := v_pass_count + 1;
  ELSIF (v_test_result->>'status') = 'fail' THEN v_fail_count := v_fail_count + 1;
  ELSE v_error_count := v_error_count + 1; END IF;
  
  -- Test 4: validate_approval - valid approval
  v_test_result := run_approvals_rpc_test(
    'Validate Approval - Valid',
    'validate_approval',
    jsonb_build_object('approval_id', (SELECT id FROM approvals WHERE state = 'pending_review' LIMIT 1)),
    ARRAY['valid', 'errors', 'approval_id']
  );
  v_results := array_append(v_results, v_test_result);
  IF (v_test_result->>'status') = 'pass' THEN v_pass_count := v_pass_count + 1;
  ELSIF (v_test_result->>'status') = 'fail' THEN v_fail_count := v_fail_count + 1;
  ELSE v_error_count := v_error_count + 1; END IF;
  
  -- Test 5: get_approval_detail
  v_test_result := run_approvals_rpc_test(
    'Approval Detail - Full',
    'get_approval_detail',
    jsonb_build_object('approval_id', (SELECT id FROM approvals LIMIT 1)),
    ARRAY['approval', 'items', 'grades', 'edits']
  );
  v_results := array_append(v_results, v_test_result);
  IF (v_test_result->>'status') = 'pass' THEN v_pass_count := v_pass_count + 1;
  ELSIF (v_test_result->>'status') = 'fail' THEN v_fail_count := v_fail_count + 1;
  ELSE v_error_count := v_error_count + 1; END IF;
  
  -- Build summary
  RETURN jsonb_build_object(
    'total_tests', array_length(v_results, 1),
    'passed', v_pass_count,
    'failed', v_fail_count,
    'errors', v_error_count,
    'pass_rate_pct', ROUND((v_pass_count::NUMERIC / NULLIF(array_length(v_results, 1), 0)) * 100, 2),
    'executed_at', NOW(),
    'results', to_jsonb(v_results)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.run_all_approvals_tests TO service_role;
COMMENT ON FUNCTION public.run_all_approvals_tests IS 'Run all approvals RPC tests and return summary';

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.approvals_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY approvals_test_results_service_role ON public.approvals_test_results FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY approvals_test_results_read_all ON public.approvals_test_results FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.approvals_test_results TO authenticated;
GRANT ALL ON public.approvals_test_results TO service_role;

