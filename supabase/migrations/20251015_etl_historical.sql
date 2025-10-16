-- ETL for Historical Data Imports
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: Backlog 25 - ETL for historical imports (if needed)

-- ============================================================================
-- ETL Job Tracking Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.etl_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  job_type TEXT CHECK (job_type IN ('import', 'export', 'transform', 'sync')) NOT NULL,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) NOT NULL DEFAULT 'pending',
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS etl_jobs_status_idx ON public.etl_jobs (status);
CREATE INDEX IF NOT EXISTS etl_jobs_created_at_idx ON public.etl_jobs (created_at DESC);

COMMENT ON TABLE public.etl_jobs IS 'ETL job tracking and history';

-- ============================================================================
-- Function: Import Historical Sales Data
-- ============================================================================

CREATE OR REPLACE FUNCTION public.import_historical_sales(
  p_data JSONB,
  p_source TEXT DEFAULT 'manual_import'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_id UUID;
  v_record JSONB;
  v_processed INTEGER := 0;
  v_failed INTEGER := 0;
  v_error_message TEXT;
BEGIN
  -- Create ETL job
  INSERT INTO etl_jobs (job_name, job_type, source, destination, status, started_at)
  VALUES ('Historical Sales Import', 'import', p_source, 'sales_metrics_daily', 'running', NOW())
  RETURNING id INTO v_job_id;
  
  -- Process each record
  FOR v_record IN SELECT * FROM jsonb_array_elements(p_data) LOOP
    BEGIN
      INSERT INTO sales_metrics_daily (
        metric_date,
        shop_domain,
        total_revenue,
        order_count,
        avg_order_value
      ) VALUES (
        (v_record->>'date')::DATE,
        COALESCE(v_record->>'shop_domain', 'hotrodan.myshopify.com'),
        (v_record->>'revenue')::NUMERIC,
        (v_record->>'orders')::INTEGER,
        (v_record->>'aov')::NUMERIC
      )
      ON CONFLICT (metric_date, shop_domain) DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        order_count = EXCLUDED.order_count,
        avg_order_value = EXCLUDED.avg_order_value,
        updated_at = NOW();
      
      v_processed := v_processed + 1;
      
    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed + 1;
      v_error_message := SQLERRM;
    END;
  END LOOP;
  
  -- Update job status
  UPDATE etl_jobs
  SET status = CASE WHEN v_failed = 0 THEN 'completed' ELSE 'failed' END,
      records_processed = v_processed,
      records_failed = v_failed,
      error_message = v_error_message,
      completed_at = NOW()
  WHERE id = v_job_id;
  
  RETURN jsonb_build_object(
    'job_id', v_job_id,
    'status', CASE WHEN v_failed = 0 THEN 'completed' ELSE 'failed' END,
    'processed', v_processed,
    'failed', v_failed,
    'error_message', v_error_message
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.import_historical_sales TO service_role;
COMMENT ON FUNCTION public.import_historical_sales IS 'Import historical sales data from JSONB array';

-- ============================================================================
-- Function: Import Historical CX Data
-- ============================================================================

CREATE OR REPLACE FUNCTION public.import_historical_cx(
  p_data JSONB,
  p_source TEXT DEFAULT 'manual_import'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_id UUID;
  v_record JSONB;
  v_processed INTEGER := 0;
  v_failed INTEGER := 0;
  v_error_message TEXT;
BEGIN
  -- Create ETL job
  INSERT INTO etl_jobs (job_name, job_type, source, destination, status, started_at)
  VALUES ('Historical CX Import', 'import', p_source, 'cx_metrics_daily', 'running', NOW())
  RETURNING id INTO v_job_id;
  
  -- Process each record
  FOR v_record IN SELECT * FROM jsonb_array_elements(p_data) LOOP
    BEGIN
      INSERT INTO cx_metrics_daily (
        metric_date,
        conversations_total,
        conversations_resolved,
        avg_first_response_minutes,
        sla_compliance_pct
      ) VALUES (
        (v_record->>'date')::DATE,
        (v_record->>'total')::INTEGER,
        (v_record->>'resolved')::INTEGER,
        (v_record->>'avg_response_time')::NUMERIC,
        (v_record->>'sla_compliance')::NUMERIC
      )
      ON CONFLICT (metric_date, shop_domain) DO UPDATE SET
        conversations_total = EXCLUDED.conversations_total,
        conversations_resolved = EXCLUDED.conversations_resolved,
        avg_first_response_minutes = EXCLUDED.avg_first_response_minutes,
        sla_compliance_pct = EXCLUDED.sla_compliance_pct,
        updated_at = NOW();
      
      v_processed := v_processed + 1;
      
    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed + 1;
      v_error_message := SQLERRM;
    END;
  END LOOP;
  
  -- Update job status
  UPDATE etl_jobs
  SET status = CASE WHEN v_failed = 0 THEN 'completed' ELSE 'failed' END,
      records_processed = v_processed,
      records_failed = v_failed,
      error_message = v_error_message,
      completed_at = NOW()
  WHERE id = v_job_id;
  
  RETURN jsonb_build_object(
    'job_id', v_job_id,
    'status', CASE WHEN v_failed = 0 THEN 'completed' ELSE 'failed' END,
    'processed', v_processed,
    'failed', v_failed,
    'error_message', v_error_message
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.import_historical_cx TO service_role;
COMMENT ON FUNCTION public.import_historical_cx IS 'Import historical CX data from JSONB array';

-- ============================================================================
-- Function: Get ETL Job Status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_etl_job_status(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT row_to_json(j)
  INTO v_result
  FROM etl_jobs j
  WHERE id = p_job_id;
  
  RETURN COALESCE(v_result, jsonb_build_object('error', 'Job not found'));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_etl_job_status TO authenticated, service_role;
COMMENT ON FUNCTION public.get_etl_job_status IS 'Get status of an ETL job by ID';

-- ============================================================================
-- View: Recent ETL Jobs
-- ============================================================================

CREATE OR REPLACE VIEW public.v_recent_etl_jobs AS
SELECT 
  id,
  job_name,
  job_type,
  source,
  destination,
  status,
  records_processed,
  records_failed,
  EXTRACT(EPOCH FROM (completed_at - started_at)) as duration_seconds,
  created_at,
  started_at,
  completed_at
FROM etl_jobs
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 100;

GRANT SELECT ON public.v_recent_etl_jobs TO authenticated, service_role;
COMMENT ON VIEW public.v_recent_etl_jobs IS 'Recent ETL jobs from last 30 days';

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT ON public.etl_jobs TO authenticated, service_role;
GRANT ALL ON public.etl_jobs TO service_role;

