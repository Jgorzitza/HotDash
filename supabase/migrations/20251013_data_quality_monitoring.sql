-- Migration: 20251013_data_quality_monitoring.sql
-- Description: Data quality monitoring and validation framework

-- ============================================================================
-- DATA QUALITY TABLES
-- ============================================================================

-- Data quality check results
CREATE TABLE IF NOT EXISTS data_quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name TEXT NOT NULL,
  check_type TEXT NOT NULL, -- 'completeness', 'accuracy', 'timeliness', 'consistency'
  table_name TEXT NOT NULL,
  column_name TEXT,
  check_query TEXT NOT NULL,
  expected_result JSONB,
  actual_result JSONB,
  passed BOOLEAN NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'error', 'critical'
  error_message TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_data_quality_checks_table ON data_quality_checks(table_name, checked_at DESC);
CREATE INDEX idx_data_quality_checks_passed ON data_quality_checks(passed, checked_at DESC);
CREATE INDEX idx_data_quality_checks_severity ON data_quality_checks(severity, checked_at DESC);

COMMENT ON TABLE data_quality_checks IS
'Data quality check results for monitoring data integrity';

-- Data quality metrics
CREATE TABLE IF NOT EXISTS data_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  table_name TEXT NOT NULL,
  total_checks INTEGER NOT NULL DEFAULT 0,
  passed_checks INTEGER NOT NULL DEFAULT 0,
  failed_checks INTEGER NOT NULL DEFAULT 0,
  completeness_score NUMERIC(5,2),
  accuracy_score NUMERIC(5,2),
  timeliness_score NUMERIC(5,2),
  consistency_score NUMERIC(5,2),
  overall_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date, table_name)
);

CREATE INDEX idx_data_quality_metrics_date ON data_quality_metrics(date DESC);
CREATE INDEX idx_data_quality_metrics_table ON data_quality_metrics(table_name, date DESC);
CREATE INDEX idx_data_quality_metrics_score ON data_quality_metrics(overall_score, date DESC);

COMMENT ON TABLE data_quality_metrics IS
'Daily data quality metrics aggregated by table';

-- ============================================================================
-- DATA VALIDATION FUNCTIONS
-- ============================================================================

-- Check for null/missing values
CREATE OR REPLACE FUNCTION check_completeness(
  p_table_name TEXT,
  p_column_name TEXT,
  p_threshold NUMERIC DEFAULT 0.95
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
AS $$
DECLARE
  v_total_count BIGINT;
  v_non_null_count BIGINT;
  v_completeness_ratio NUMERIC;
  v_passed BOOLEAN;
BEGIN
  -- Count total and non-null records
  EXECUTE format('SELECT COUNT(*), COUNT(%I) FROM %I', p_column_name, p_table_name)
    INTO v_total_count, v_non_null_count;
  
  -- Calculate completeness ratio
  IF v_total_count > 0 THEN
    v_completeness_ratio := v_non_null_count::NUMERIC / v_total_count;
  ELSE
    v_completeness_ratio := 1.0;
  END IF;
  
  v_passed := v_completeness_ratio >= p_threshold;
  
  -- Log the check
  INSERT INTO data_quality_checks (
    check_name,
    check_type,
    table_name,
    column_name,
    check_query,
    expected_result,
    actual_result,
    passed,
    severity
  ) VALUES (
    'Completeness Check',
    'completeness',
    p_table_name,
    p_column_name,
    format('SELECT COUNT(*), COUNT(%I) FROM %I', p_column_name, p_table_name),
    jsonb_build_object('threshold', p_threshold),
    jsonb_build_object(
      'total', v_total_count,
      'non_null', v_non_null_count,
      'ratio', v_completeness_ratio
    ),
    v_passed,
    CASE WHEN v_passed THEN 'info' ELSE 'warning' END
  );
  
  RETURN v_passed;
END;
$$;

COMMENT ON FUNCTION check_completeness(TEXT, TEXT, NUMERIC) IS
'Check if a column has sufficient non-null values (default 95% threshold)';

-- Check referential integrity
CREATE OR REPLACE FUNCTION check_referential_integrity(
  p_table_name TEXT,
  p_column_name TEXT,
  p_ref_table TEXT,
  p_ref_column TEXT
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
AS $$
DECLARE
  v_orphaned_count BIGINT;
  v_passed BOOLEAN;
BEGIN
  -- Count orphaned records
  EXECUTE format(
    'SELECT COUNT(*) FROM %I t WHERE t.%I IS NOT NULL AND NOT EXISTS (SELECT 1 FROM %I r WHERE r.%I = t.%I)',
    p_table_name, p_column_name, p_ref_table, p_ref_column, p_column_name
  ) INTO v_orphaned_count;
  
  v_passed := v_orphaned_count = 0;
  
  -- Log the check
  INSERT INTO data_quality_checks (
    check_name,
    check_type,
    table_name,
    column_name,
    check_query,
    expected_result,
    actual_result,
    passed,
    severity
  ) VALUES (
    'Referential Integrity Check',
    'consistency',
    p_table_name,
    p_column_name,
    format(
      'SELECT COUNT(*) FROM %I t WHERE t.%I IS NOT NULL AND NOT EXISTS (SELECT 1 FROM %I r WHERE r.%I = t.%I)',
      p_table_name, p_column_name, p_ref_table, p_ref_column, p_column_name
    ),
    jsonb_build_object('orphaned_count', 0),
    jsonb_build_object('orphaned_count', v_orphaned_count),
    v_passed,
    CASE WHEN v_passed THEN 'info' ELSE 'error' END
  );
  
  RETURN v_passed;
END;
$$;

COMMENT ON FUNCTION check_referential_integrity(TEXT, TEXT, TEXT, TEXT) IS
'Check if foreign key references are valid';

-- Check data freshness
CREATE OR REPLACE FUNCTION check_data_freshness(
  p_table_name TEXT,
  p_timestamp_column TEXT,
  p_max_age_hours INTEGER DEFAULT 24
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
AS $$
DECLARE
  v_latest_timestamp TIMESTAMPTZ;
  v_age_hours NUMERIC;
  v_passed BOOLEAN;
BEGIN
  -- Get latest timestamp
  EXECUTE format('SELECT MAX(%I) FROM %I', p_timestamp_column, p_table_name)
    INTO v_latest_timestamp;
  
  IF v_latest_timestamp IS NULL THEN
    v_age_hours := NULL;
    v_passed := FALSE;
  ELSE
    v_age_hours := EXTRACT(EPOCH FROM (NOW() - v_latest_timestamp)) / 3600;
    v_passed := v_age_hours <= p_max_age_hours;
  END IF;
  
  -- Log the check
  INSERT INTO data_quality_checks (
    check_name,
    check_type,
    table_name,
    column_name,
    check_query,
    expected_result,
    actual_result,
    passed,
    severity
  ) VALUES (
    'Data Freshness Check',
    'timeliness',
    p_table_name,
    p_timestamp_column,
    format('SELECT MAX(%I) FROM %I', p_timestamp_column, p_table_name),
    jsonb_build_object('max_age_hours', p_max_age_hours),
    jsonb_build_object(
      'latest_timestamp', v_latest_timestamp,
      'age_hours', v_age_hours
    ),
    v_passed,
    CASE WHEN v_passed THEN 'info' ELSE 'warning' END
  );
  
  RETURN v_passed;
END;
$$;

COMMENT ON FUNCTION check_data_freshness(TEXT, TEXT, INTEGER) IS
'Check if data is recent enough (default 24 hours)';

-- Run all quality checks for a table
CREATE OR REPLACE FUNCTION run_quality_checks_for_table(p_table_name TEXT)
RETURNS TABLE (
  check_name TEXT,
  passed BOOLEAN,
  severity TEXT
)
LANGUAGE PLPGSQL
AS $$
BEGIN
  -- Example checks - customize based on your tables
  CASE p_table_name
    WHEN 'DashboardFact' THEN
      PERFORM check_completeness('DashboardFact', 'shopDomain', 1.0);
      PERFORM check_completeness('DashboardFact', 'factType', 1.0);
      PERFORM check_completeness('DashboardFact', 'value', 1.0);
      PERFORM check_data_freshness('DashboardFact', 'createdAt', 24);
    
    WHEN 'sales_metrics_daily' THEN
      PERFORM check_completeness('sales_metrics_daily', 'date', 1.0);
      PERFORM check_completeness('sales_metrics_daily', 'total_orders', 1.0);
      PERFORM check_data_freshness('sales_metrics_daily', 'created_at', 48);
    
    WHEN 'picker_earnings' THEN
      PERFORM check_completeness('picker_earnings', 'order_id', 1.0);
      PERFORM check_completeness('picker_earnings', 'picker_email', 1.0);
      PERFORM check_referential_integrity('picker_earnings', 'picker_email', 'pickers', 'email');
      PERFORM check_data_freshness('picker_earnings', 'created_at', 168); -- 7 days
  END CASE;
  
  -- Return recent check results
  RETURN QUERY
  SELECT 
    dqc.check_name,
    dqc.passed,
    dqc.severity
  FROM data_quality_checks dqc
  WHERE dqc.table_name = p_table_name
    AND dqc.checked_at >= NOW() - INTERVAL '1 hour'
  ORDER BY dqc.checked_at DESC;
END;
$$;

COMMENT ON FUNCTION run_quality_checks_for_table(TEXT) IS
'Run all configured quality checks for a specific table';

-- Calculate daily quality metrics
CREATE OR REPLACE FUNCTION calculate_daily_quality_metrics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE PLPGSQL
AS $$
DECLARE
  v_table RECORD;
BEGIN
  -- Calculate metrics for each table with checks
  FOR v_table IN 
    SELECT DISTINCT table_name 
    FROM data_quality_checks 
    WHERE DATE(checked_at) = p_date
  LOOP
    INSERT INTO data_quality_metrics (
      date,
      table_name,
      total_checks,
      passed_checks,
      failed_checks,
      completeness_score,
      accuracy_score,
      timeliness_score,
      consistency_score,
      overall_score
    )
    SELECT
      p_date,
      v_table.table_name,
      COUNT(*),
      COUNT(*) FILTER (WHERE passed),
      COUNT(*) FILTER (WHERE NOT passed),
      ROUND(AVG(CASE WHEN check_type = 'completeness' AND passed THEN 100 ELSE 0 END), 2),
      ROUND(AVG(CASE WHEN check_type = 'accuracy' AND passed THEN 100 ELSE 0 END), 2),
      ROUND(AVG(CASE WHEN check_type = 'timeliness' AND passed THEN 100 ELSE 0 END), 2),
      ROUND(AVG(CASE WHEN check_type = 'consistency' AND passed THEN 100 ELSE 0 END), 2),
      ROUND(AVG(CASE WHEN passed THEN 100 ELSE 0 END), 2)
    FROM data_quality_checks
    WHERE table_name = v_table.table_name
      AND DATE(checked_at) = p_date
    ON CONFLICT (date, table_name)
    DO UPDATE SET
      total_checks = EXCLUDED.total_checks,
      passed_checks = EXCLUDED.passed_checks,
      failed_checks = EXCLUDED.failed_checks,
      completeness_score = EXCLUDED.completeness_score,
      accuracy_score = EXCLUDED.accuracy_score,
      timeliness_score = EXCLUDED.timeliness_score,
      consistency_score = EXCLUDED.consistency_score,
      overall_score = EXCLUDED.overall_score;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION calculate_daily_quality_metrics(DATE) IS
'Calculate and store daily data quality metrics for all tables';

-- ============================================================================
-- DATA QUALITY VIEWS
-- ============================================================================

-- Current quality status
CREATE OR REPLACE VIEW v_data_quality_current AS
SELECT
  table_name,
  COUNT(*) as total_checks,
  COUNT(*) FILTER (WHERE passed) as passed_checks,
  COUNT(*) FILTER (WHERE NOT passed) as failed_checks,
  ROUND(AVG(CASE WHEN passed THEN 100 ELSE 0 END), 2) as pass_rate,
  MAX(checked_at) as last_checked
FROM data_quality_checks
WHERE checked_at >= NOW() - INTERVAL '24 hours'
GROUP BY table_name
ORDER BY pass_rate ASC, failed_checks DESC;

COMMENT ON VIEW v_data_quality_current IS
'Current data quality status for all tables (last 24 hours)';

-- Quality trend
CREATE OR REPLACE VIEW v_data_quality_trend AS
SELECT
  date,
  table_name,
  overall_score,
  completeness_score,
  timeliness_score,
  consistency_score,
  failed_checks
FROM data_quality_metrics
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC, overall_score ASC;

COMMENT ON VIEW v_data_quality_trend IS
'30-day data quality trend by table';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE data_quality_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "data_quality_checks_read_authenticated"
  ON data_quality_checks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "data_quality_checks_service_role"
  ON data_quality_checks FOR ALL
  TO service_role
  USING (true);

ALTER TABLE data_quality_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "data_quality_metrics_read_authenticated"
  ON data_quality_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "data_quality_metrics_service_role"
  ON data_quality_metrics FOR ALL
  TO service_role
  USING (true);
