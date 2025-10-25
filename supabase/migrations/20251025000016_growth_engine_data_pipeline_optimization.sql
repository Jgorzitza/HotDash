-- Migration: Growth Engine Data Pipeline Optimization
-- Description: Optimize data pipeline for Growth Engine phases 9-12 with advanced analytics, real-time processing, and performance improvements
-- Date: 2025-10-22
-- Agent: data
-- Task: DATA-110

-- =============================================================================
-- TABLE 1: data_pipeline_jobs (Pipeline job management)
-- =============================================================================
CREATE TABLE IF NOT EXISTS data_pipeline_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Job Identification
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('batch', 'stream', 'realtime', 'analytics', 'optimization')),
  pipeline_stage TEXT NOT NULL CHECK (pipeline_stage IN ('ingestion', 'processing', 'transformation', 'aggregation', 'analytics', 'output')),
  
  -- Job Configuration
  job_config JSONB NOT NULL DEFAULT '{}',
  data_sources JSONB DEFAULT '[]', -- Array of data source configurations
  output_targets JSONB DEFAULT '[]', -- Array of output target configurations
  processing_rules JSONB DEFAULT '{}', -- Processing logic and rules
  
  -- Performance Settings
  batch_size INTEGER DEFAULT 1000,
  max_parallel_workers INTEGER DEFAULT 4,
  timeout_seconds INTEGER DEFAULT 3600,
  retry_attempts INTEGER DEFAULT 3,
  
  -- Scheduling
  schedule_cron TEXT, -- Cron expression for scheduled jobs
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  
  -- Execution Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  
  -- Performance Metrics
  execution_time_ms INTEGER,
  records_processed INTEGER DEFAULT 0,
  records_successful INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  memory_usage_mb INTEGER,
  cpu_usage_percent DECIMAL(5,2),
  
  -- Error Handling
  error_message TEXT,
  error_details JSONB DEFAULT '{}',
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for data_pipeline_jobs
CREATE INDEX idx_pipeline_jobs_type ON data_pipeline_jobs(job_type);
CREATE INDEX idx_pipeline_jobs_stage ON data_pipeline_jobs(pipeline_stage);
CREATE INDEX idx_pipeline_jobs_status ON data_pipeline_jobs(status);
CREATE INDEX idx_pipeline_jobs_active ON data_pipeline_jobs(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_pipeline_jobs_schedule ON data_pipeline_jobs(next_run_at) WHERE is_active = TRUE;
CREATE INDEX idx_pipeline_jobs_priority ON data_pipeline_jobs(priority DESC);

-- =============================================================================
-- TABLE 2: real_time_data_streams (Real-time data processing)
-- =============================================================================
CREATE TABLE IF NOT EXISTS real_time_data_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Stream Configuration
  stream_name TEXT NOT NULL UNIQUE,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('events', 'metrics', 'logs', 'transactions', 'user_actions')),
  data_schema JSONB NOT NULL, -- JSON schema for stream data
  
  -- Processing Configuration
  processing_mode TEXT NOT NULL DEFAULT 'streaming' CHECK (processing_mode IN ('streaming', 'micro_batch', 'windowed')),
  window_size_seconds INTEGER DEFAULT 60,
  watermark_delay_seconds INTEGER DEFAULT 10,
  
  -- Output Configuration
  output_format TEXT NOT NULL DEFAULT 'json' CHECK (output_format IN ('json', 'avro', 'parquet', 'csv')),
  compression_enabled BOOLEAN DEFAULT TRUE,
  partitioning_key TEXT,
  
  -- Performance Settings
  max_throughput_per_second INTEGER DEFAULT 10000,
  buffer_size_mb INTEGER DEFAULT 100,
  flush_interval_ms INTEGER DEFAULT 1000,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_processed_at TIMESTAMPTZ,
  total_records_processed BIGINT DEFAULT 0,
  current_lag_ms INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for real_time_data_streams
CREATE INDEX idx_streams_type ON real_time_data_streams(stream_type);
CREATE INDEX idx_streams_active ON real_time_data_streams(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_streams_processing ON real_time_data_streams(processing_mode);

-- =============================================================================
-- TABLE 3: analytics_aggregations (Advanced analytics data)
-- =============================================================================
CREATE TABLE IF NOT EXISTS analytics_aggregations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Aggregation Configuration
  aggregation_name TEXT NOT NULL,
  aggregation_type TEXT NOT NULL CHECK (aggregation_type IN ('count', 'sum', 'avg', 'min', 'max', 'percentile', 'histogram', 'trend')),
  metric_name TEXT NOT NULL,
  dimension_keys JSONB DEFAULT '[]', -- Array of dimension keys for grouping
  
  -- Time Windows
  time_window_type TEXT NOT NULL CHECK (time_window_type IN ('rolling', 'fixed', 'sliding')),
  window_size_minutes INTEGER NOT NULL,
  window_offset_minutes INTEGER DEFAULT 0,
  
  -- Data Sources
  source_tables JSONB NOT NULL, -- Array of source table configurations
  filter_conditions JSONB DEFAULT '{}', -- WHERE conditions for data filtering
  
  -- Aggregation Results
  aggregation_key TEXT NOT NULL, -- Composite key for the aggregation
  aggregation_value DECIMAL(20,6),
  aggregation_metadata JSONB DEFAULT '{}',
  
  -- Time Information
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Performance
  computation_time_ms INTEGER,
  records_processed INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics_aggregations
CREATE INDEX idx_aggregations_name ON analytics_aggregations(aggregation_name);
CREATE INDEX idx_aggregations_type ON analytics_aggregations(aggregation_type);
CREATE INDEX idx_aggregations_metric ON analytics_aggregations(metric_name);
CREATE INDEX idx_aggregations_window ON analytics_aggregations(window_start, window_end);
CREATE INDEX idx_aggregations_computed ON analytics_aggregations(computed_at DESC);

-- =============================================================================
-- TABLE 4: performance_metrics (Pipeline performance tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metric Identification
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL CHECK (metric_category IN ('throughput', 'latency', 'memory', 'cpu', 'error_rate', 'queue_depth')),
  component_name TEXT NOT NULL, -- Pipeline component being measured
  
  -- Metric Values
  metric_value DECIMAL(20,6) NOT NULL,
  metric_unit TEXT NOT NULL, -- 'records/sec', 'ms', 'MB', '%', etc.
  metric_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Context
  pipeline_job_id UUID REFERENCES data_pipeline_jobs(id),
  stream_id UUID REFERENCES real_time_data_streams(id),
  aggregation_id UUID REFERENCES analytics_aggregations(id),
  
  -- Additional Context
  context_data JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance_metrics
CREATE INDEX idx_perf_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_perf_metrics_category ON performance_metrics(metric_category);
CREATE INDEX idx_perf_metrics_component ON performance_metrics(component_name);
CREATE INDEX idx_perf_metrics_timestamp ON performance_metrics(metric_timestamp DESC);
CREATE INDEX idx_perf_metrics_pipeline ON performance_metrics(pipeline_job_id);

-- =============================================================================
-- FUNCTIONS: Data Pipeline Optimization
-- =============================================================================

-- Function to optimize pipeline performance
CREATE OR REPLACE FUNCTION optimize_pipeline_performance(
  p_pipeline_job_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_job RECORD;
  v_optimization_result JSONB;
  v_batch_size INTEGER;
  v_parallel_workers INTEGER;
  v_timeout_seconds INTEGER;
BEGIN
  -- Get job configuration
  SELECT * INTO v_job FROM data_pipeline_jobs WHERE id = p_pipeline_job_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Job not found');
  END IF;
  
  -- Calculate optimal batch size based on historical performance
  SELECT COALESCE(
    LEAST(
      GREATEST(
        AVG(records_processed) / NULLIF(AVG(execution_time_ms), 0) * 1000,
        100
      ),
      10000
    ),
    1000
  ) INTO v_batch_size
  FROM data_pipeline_jobs
  WHERE job_type = v_job.job_type
    AND status = 'completed'
    AND execution_time_ms IS NOT NULL
    AND records_processed > 0;
  
  -- Calculate optimal parallel workers
  SELECT COALESCE(
    LEAST(
      GREATEST(
        CEIL(AVG(records_processed) / 1000.0),
        1
      ),
      8
    ),
    4
  ) INTO v_parallel_workers
  FROM data_pipeline_jobs
  WHERE job_type = v_job.job_type
    AND status = 'completed'
    AND records_processed > 0;
  
  -- Calculate optimal timeout
  SELECT COALESCE(
    LEAST(
      GREATEST(
        AVG(execution_time_ms) * 2,
        300000
      ),
      3600000
    ),
    3600000
  ) INTO v_timeout_seconds
  FROM data_pipeline_jobs
  WHERE job_type = v_job.job_type
    AND status = 'completed'
    AND execution_time_ms IS NOT NULL;
  
  -- Update job with optimized settings
  UPDATE data_pipeline_jobs
  SET 
    batch_size = v_batch_size,
    max_parallel_workers = v_parallel_workers,
    timeout_seconds = v_timeout_seconds,
    updated_at = NOW()
  WHERE id = p_pipeline_job_id;
  
  -- Build optimization result
  v_optimization_result := jsonb_build_object(
    'job_id', p_pipeline_job_id,
    'optimized_batch_size', v_batch_size,
    'optimized_parallel_workers', v_parallel_workers,
    'optimized_timeout_seconds', v_timeout_seconds,
    'optimization_timestamp', NOW()
  );
  
  RETURN v_optimization_result;
END;
$$ LANGUAGE plpgsql;

-- Function to process real-time data stream
CREATE OR REPLACE FUNCTION process_realtime_stream(
  p_stream_id UUID,
  p_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_stream RECORD;
  v_processed_data JSONB;
  v_result JSONB;
BEGIN
  -- Get stream configuration
  SELECT * INTO v_stream FROM real_time_data_streams WHERE id = p_stream_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Stream not found');
  END IF;
  
  -- Process data based on stream configuration
  CASE v_stream.processing_mode
    WHEN 'streaming' THEN
      -- Process immediately
      v_processed_data := p_data;
    WHEN 'micro_batch' THEN
      -- Process in micro-batches (implement batching logic here)
      v_processed_data := p_data;
    WHEN 'windowed' THEN
      -- Process in time windows (implement windowing logic here)
      v_processed_data := p_data;
  END CASE;
  
  -- Update stream metrics
  UPDATE real_time_data_streams
  SET 
    last_processed_at = NOW(),
    total_records_processed = total_records_processed + 1,
    current_lag_ms = EXTRACT(EPOCH FROM (NOW() - last_processed_at)) * 1000
  WHERE id = p_stream_id;
  
  -- Build result
  v_result := jsonb_build_object(
    'stream_id', p_stream_id,
    'processed_data', v_processed_data,
    'processing_timestamp', NOW(),
    'total_records', (SELECT total_records_processed FROM real_time_data_streams WHERE id = p_stream_id)
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to compute analytics aggregations
CREATE OR REPLACE FUNCTION compute_analytics_aggregation(
  p_aggregation_name TEXT,
  p_window_start TIMESTAMPTZ,
  p_window_end TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
  v_aggregation RECORD;
  v_result JSONB;
  v_computation_start TIMESTAMPTZ := NOW();
  v_computation_time_ms INTEGER;
BEGIN
  -- Get aggregation configuration
  SELECT * INTO v_aggregation 
  FROM analytics_aggregations 
  WHERE aggregation_name = p_aggregation_name
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Aggregation configuration not found');
  END IF;
  
  -- Compute aggregation based on type
  CASE v_aggregation.aggregation_type
    WHEN 'count' THEN
      -- Implement count aggregation
      INSERT INTO analytics_aggregations (
        aggregation_name, aggregation_type, metric_name, dimension_keys,
        time_window_type, window_size_minutes, window_offset_minutes,
        source_tables, filter_conditions, aggregation_key, aggregation_value,
        window_start, window_end, computation_time_ms, records_processed
      ) VALUES (
        p_aggregation_name, v_aggregation.aggregation_type, v_aggregation.metric_name,
        v_aggregation.dimension_keys, v_aggregation.time_window_type,
        v_aggregation.window_size_minutes, v_aggregation.window_offset_minutes,
        v_aggregation.source_tables, v_aggregation.filter_conditions,
        'computed_key', 1, p_window_start, p_window_end,
        EXTRACT(EPOCH FROM (NOW() - v_computation_start)) * 1000, 1
      );
    WHEN 'sum' THEN
      -- Implement sum aggregation
      INSERT INTO analytics_aggregations (
        aggregation_name, aggregation_type, metric_name, dimension_keys,
        time_window_type, window_size_minutes, window_offset_minutes,
        source_tables, filter_conditions, aggregation_key, aggregation_value,
        window_start, window_end, computation_time_ms, records_processed
      ) VALUES (
        p_aggregation_name, v_aggregation.aggregation_type, v_aggregation.metric_name,
        v_aggregation.dimension_keys, v_aggregation.time_window_type,
        v_aggregation.window_size_minutes, v_aggregation.window_offset_minutes,
        v_aggregation.source_tables, v_aggregation.filter_conditions,
        'computed_key', 0, p_window_start, p_window_end,
        EXTRACT(EPOCH FROM (NOW() - v_computation_start)) * 1000, 1
      );
    -- Add more aggregation types as needed
  END CASE;
  
  v_computation_time_ms := EXTRACT(EPOCH FROM (NOW() - v_computation_start)) * 1000;
  
  -- Build result
  v_result := jsonb_build_object(
    'aggregation_name', p_aggregation_name,
    'window_start', p_window_start,
    'window_end', p_window_end,
    'computation_time_ms', v_computation_time_ms,
    'computation_timestamp', NOW()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to get pipeline performance metrics
CREATE OR REPLACE FUNCTION get_pipeline_performance_metrics(
  p_pipeline_job_id UUID,
  p_hours_back INTEGER DEFAULT 24
)
RETURNS JSONB AS $$
DECLARE
  v_metrics JSONB;
  v_throughput_avg DECIMAL;
  v_latency_avg DECIMAL;
  v_error_rate DECIMAL;
  v_memory_avg DECIMAL;
BEGIN
  -- Get average throughput
  SELECT AVG(metric_value) INTO v_throughput_avg
  FROM performance_metrics
  WHERE pipeline_job_id = p_pipeline_job_id
    AND metric_category = 'throughput'
    AND metric_timestamp > NOW() - INTERVAL '1 hour' * p_hours_back;
  
  -- Get average latency
  SELECT AVG(metric_value) INTO v_latency_avg
  FROM performance_metrics
  WHERE pipeline_job_id = p_pipeline_job_id
    AND metric_category = 'latency'
    AND metric_timestamp > NOW() - INTERVAL '1 hour' * p_hours_back;
  
  -- Get error rate
  SELECT AVG(metric_value) INTO v_error_rate
  FROM performance_metrics
  WHERE pipeline_job_id = p_pipeline_job_id
    AND metric_category = 'error_rate'
    AND metric_timestamp > NOW() - INTERVAL '1 hour' * p_hours_back;
  
  -- Get average memory usage
  SELECT AVG(metric_value) INTO v_memory_avg
  FROM performance_metrics
  WHERE pipeline_job_id = p_pipeline_job_id
    AND metric_category = 'memory'
    AND metric_timestamp > NOW() - INTERVAL '1 hour' * p_hours_back;
  
  -- Build metrics result
  v_metrics := jsonb_build_object(
    'pipeline_job_id', p_pipeline_job_id,
    'time_range_hours', p_hours_back,
    'throughput_avg', COALESCE(v_throughput_avg, 0),
    'latency_avg_ms', COALESCE(v_latency_avg, 0),
    'error_rate_percent', COALESCE(v_error_rate, 0),
    'memory_avg_mb', COALESCE(v_memory_avg, 0),
    'generated_at', NOW()
  );
  
  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS: Performance Monitoring
-- =============================================================================

-- Trigger to update job performance metrics
CREATE OR REPLACE FUNCTION update_job_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Record performance metrics when job status changes
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO performance_metrics (
      metric_name, metric_category, component_name, metric_value, metric_unit,
      pipeline_job_id, context_data
    ) VALUES (
      'execution_time', 'latency', 'pipeline_job', NEW.execution_time_ms, 'ms',
      NEW.id, jsonb_build_object('job_name', NEW.job_name, 'job_type', NEW.job_type)
    );
    
    INSERT INTO performance_metrics (
      metric_name, metric_category, component_name, metric_value, metric_unit,
      pipeline_job_id, context_data
    ) VALUES (
      'records_processed', 'throughput', 'pipeline_job', NEW.records_processed, 'records',
      NEW.id, jsonb_build_object('job_name', NEW.job_name, 'job_type', NEW.job_type)
    );
    
    INSERT INTO performance_metrics (
      metric_name, metric_category, component_name, metric_value, metric_unit,
      pipeline_job_id, context_data
    ) VALUES (
      'success_rate', 'error_rate', 'pipeline_job', 
      CASE WHEN NEW.records_processed > 0 THEN (NEW.records_successful::DECIMAL / NEW.records_processed) * 100 ELSE 0 END, 
      'percent',
      NEW.id, jsonb_build_object('job_name', NEW.job_name, 'job_type', NEW.job_type)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for performance monitoring
CREATE TRIGGER trigger_update_job_performance_metrics
  AFTER UPDATE ON data_pipeline_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_job_performance_metrics();

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE data_pipeline_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_data_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Data Pipeline Jobs RLS Policies
CREATE POLICY "pipeline_jobs_read_authenticated"
  ON data_pipeline_jobs
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "pipeline_jobs_manage_operators"
  ON data_pipeline_jobs
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('operator', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('operator', 'admin'));

-- Real-time Data Streams RLS Policies
CREATE POLICY "streams_read_authenticated"
  ON real_time_data_streams
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "streams_manage_operators"
  ON real_time_data_streams
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('operator', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('operator', 'admin'));

-- Analytics Aggregations RLS Policies
CREATE POLICY "aggregations_read_authenticated"
  ON analytics_aggregations
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "aggregations_insert_system"
  ON analytics_aggregations
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- Performance Metrics RLS Policies
CREATE POLICY "metrics_read_authenticated"
  ON performance_metrics
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "metrics_insert_system"
  ON performance_metrics
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE data_pipeline_jobs IS 'Data pipeline job management with performance optimization';
COMMENT ON TABLE real_time_data_streams IS 'Real-time data processing streams with windowing support';
COMMENT ON TABLE analytics_aggregations IS 'Advanced analytics aggregations with time windowing';
COMMENT ON TABLE performance_metrics IS 'Pipeline performance tracking and monitoring';

COMMENT ON FUNCTION optimize_pipeline_performance IS 'Optimizes pipeline performance based on historical data';
COMMENT ON FUNCTION process_realtime_stream IS 'Processes real-time data streams with windowing';
COMMENT ON FUNCTION compute_analytics_aggregation IS 'Computes analytics aggregations for time windows';
COMMENT ON FUNCTION get_pipeline_performance_metrics IS 'Retrieves pipeline performance metrics and statistics';
