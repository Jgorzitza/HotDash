-- Data Quality Monitoring Tables
-- Task: DATA-023 (Production Data Quality Monitoring & Validation)
-- Date: 2025-10-23
-- Purpose: Track data quality metrics, validation results, and anomalies

-- ============================================================================
-- Data Quality Metrics Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metric identification
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('completeness', 'accuracy', 'consistency', 'timeliness', 'validity', 'uniqueness')),
  data_source TEXT NOT NULL, -- 'shopify', 'ga4', 'gsc', 'chatwoot', 'database'
  table_name TEXT,
  column_name TEXT,
  
  -- Metric values
  total_records BIGINT NOT NULL DEFAULT 0,
  valid_records BIGINT NOT NULL DEFAULT 0,
  invalid_records BIGINT NOT NULL DEFAULT 0,
  null_records BIGINT NOT NULL DEFAULT 0,
  duplicate_records BIGINT NOT NULL DEFAULT 0,
  
  -- Calculated scores (0-100)
  quality_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  completeness_score DECIMAL(5,2),
  accuracy_score DECIMAL(5,2),
  
  -- Thresholds
  warning_threshold DECIMAL(5,2) DEFAULT 80.0,
  critical_threshold DECIMAL(5,2) DEFAULT 60.0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical')),
  
  -- Timestamps
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB
);

-- ============================================================================
-- Data Validation Rules Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rule identification
  rule_name TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('schema', 'range', 'format', 'reference', 'business', 'custom')),
  data_source TEXT NOT NULL,
  table_name TEXT NOT NULL,
  column_name TEXT,
  
  -- Rule definition
  rule_definition JSONB NOT NULL,
  validation_query TEXT,
  
  -- Rule configuration
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Execution
  last_run_at TIMESTAMPTZ,
  last_result TEXT,
  failure_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  description TEXT,
  owner TEXT,
  tags TEXT[]
);

-- ============================================================================
-- Data Quality Anomalies Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_quality_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Anomaly identification
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN ('spike', 'drop', 'missing', 'duplicate', 'outlier', 'pattern')),
  data_source TEXT NOT NULL,
  table_name TEXT,
  column_name TEXT,
  
  -- Anomaly details
  expected_value DECIMAL(12,2),
  actual_value DECIMAL(12,2),
  deviation_pct DECIMAL(5,2),
  
  -- Severity
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT,
  
  -- Timestamps
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB,
  affected_records BIGINT
);

-- ============================================================================
-- Data Freshness Checks Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_freshness_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Check identification
  check_name TEXT NOT NULL UNIQUE,
  data_source TEXT NOT NULL,
  table_name TEXT NOT NULL,
  timestamp_column TEXT NOT NULL,
  
  -- Freshness configuration
  expected_frequency_minutes INT NOT NULL, -- How often data should update
  staleness_threshold_minutes INT NOT NULL, -- When to alert
  
  -- Check results
  last_data_timestamp TIMESTAMPTZ,
  last_check_timestamp TIMESTAMPTZ,
  minutes_since_update INT,
  is_stale BOOLEAN DEFAULT false,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  description TEXT,
  alert_enabled BOOLEAN DEFAULT true
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Data Quality Metrics indexes
CREATE INDEX IF NOT EXISTS idx_data_quality_metrics_source 
  ON data_quality_metrics(data_source);
CREATE INDEX IF NOT EXISTS idx_data_quality_metrics_table 
  ON data_quality_metrics(table_name);
CREATE INDEX IF NOT EXISTS idx_data_quality_metrics_status 
  ON data_quality_metrics(status);
CREATE INDEX IF NOT EXISTS idx_data_quality_metrics_measured_at 
  ON data_quality_metrics(measured_at DESC);

-- Data Validation Rules indexes
CREATE INDEX IF NOT EXISTS idx_data_validation_rules_source 
  ON data_validation_rules(data_source);
CREATE INDEX IF NOT EXISTS idx_data_validation_rules_enabled 
  ON data_validation_rules(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_data_validation_rules_severity 
  ON data_validation_rules(severity);

-- Data Quality Anomalies indexes
CREATE INDEX IF NOT EXISTS idx_data_quality_anomalies_source 
  ON data_quality_anomalies(data_source);
CREATE INDEX IF NOT EXISTS idx_data_quality_anomalies_status 
  ON data_quality_anomalies(status);
CREATE INDEX IF NOT EXISTS idx_data_quality_anomalies_severity 
  ON data_quality_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_data_quality_anomalies_detected_at 
  ON data_quality_anomalies(detected_at DESC);

-- Data Freshness Checks indexes
CREATE INDEX IF NOT EXISTS idx_data_freshness_checks_source 
  ON data_freshness_checks(data_source);
CREATE INDEX IF NOT EXISTS idx_data_freshness_checks_stale 
  ON data_freshness_checks(is_stale) WHERE is_stale = true;
CREATE INDEX IF NOT EXISTS idx_data_freshness_checks_status 
  ON data_freshness_checks(status);

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to calculate quality score
CREATE OR REPLACE FUNCTION calculate_quality_score(
  p_total_records BIGINT,
  p_valid_records BIGINT
) RETURNS DECIMAL(5,2) AS $$
BEGIN
  IF p_total_records = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((p_valid_records::DECIMAL / p_total_records::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update quality metric status
CREATE OR REPLACE FUNCTION update_quality_metric_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quality_score >= NEW.warning_threshold THEN
    NEW.status = 'healthy';
  ELSIF NEW.quality_score >= NEW.critical_threshold THEN
    NEW.status = 'warning';
  ELSE
    NEW.status = 'critical';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quality_metric_status_trigger
  BEFORE INSERT OR UPDATE ON data_quality_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_quality_metric_status();

-- Function to update freshness check status
CREATE OR REPLACE FUNCTION update_freshness_check_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.minutes_since_update IS NULL THEN
    NEW.status = 'healthy';
    NEW.is_stale = false;
  ELSIF NEW.minutes_since_update > NEW.staleness_threshold_minutes * 2 THEN
    NEW.status = 'critical';
    NEW.is_stale = true;
  ELSIF NEW.minutes_since_update > NEW.staleness_threshold_minutes THEN
    NEW.status = 'warning';
    NEW.is_stale = true;
  ELSE
    NEW.status = 'healthy';
    NEW.is_stale = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_freshness_check_status_trigger
  BEFORE INSERT OR UPDATE ON data_freshness_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_freshness_check_status();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE data_quality_metrics IS 'Tracks data quality metrics across all data sources';
COMMENT ON TABLE data_validation_rules IS 'Defines validation rules for data quality checks';
COMMENT ON TABLE data_quality_anomalies IS 'Records detected data quality anomalies';
COMMENT ON TABLE data_freshness_checks IS 'Monitors data freshness across sources';

COMMENT ON COLUMN data_quality_metrics.quality_score IS 'Overall quality score (0-100)';
COMMENT ON COLUMN data_quality_metrics.completeness_score IS 'Percentage of non-null values';
COMMENT ON COLUMN data_quality_metrics.accuracy_score IS 'Percentage of valid values';

COMMENT ON COLUMN data_validation_rules.rule_definition IS 'JSON definition of validation rule';
COMMENT ON COLUMN data_validation_rules.validation_query IS 'SQL query to execute validation';

COMMENT ON COLUMN data_quality_anomalies.deviation_pct IS 'Percentage deviation from expected value';
COMMENT ON COLUMN data_quality_anomalies.affected_records IS 'Number of records affected by anomaly';

COMMENT ON COLUMN data_freshness_checks.expected_frequency_minutes IS 'Expected update frequency in minutes';
COMMENT ON COLUMN data_freshness_checks.staleness_threshold_minutes IS 'Minutes before data considered stale';

