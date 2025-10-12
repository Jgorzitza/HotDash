-- Training Data Collection Schema for Supabase
-- Supports Agent SDK feedback collection and LlamaIndex query optimization
--
-- Usage: Run this migration in Supabase to create the required tables
-- 
-- Tables:
-- 1. agent_training_samples: Core training data with query-response pairs
-- 2. agent_query_performance: Performance metrics for optimization
-- 3. agent_training_batches: Batch metadata for corpus tracking

-- Main training samples table
CREATE TABLE IF NOT EXISTS agent_training_samples (
  sample_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  
  -- Source information
  source JSONB NOT NULL,
  -- Expected structure:
  -- {
  --   "agent_name": "Order Support",
  --   "agent_sdk_version": "1.0.0",
  --   "conversation_id": 12345,
  --   "chatwoot_conversation_id": 67890
  -- }
  
  -- Query data
  query JSONB NOT NULL,
  -- Expected structure:
  -- {
  --   "text": "How do I...",
  --   "intent": "order_status",
  --   "metadata": {...}
  -- }
  
  -- Agent response
  agent_response JSONB NOT NULL,
  -- Expected structure:
  -- {
  --   "text": "To do this...",
  --   "sources": [...],
  --   "confidence": 0.85,
  --   "processing_time_ms": 450
  -- }
  
  -- Human feedback
  human_feedback JSONB NOT NULL DEFAULT '{"approved": false}'::jsonb,
  -- Expected structure:
  -- {
  --   "approved": true,
  --   "approved_by": "operator123",
  --   "approved_at": "2025-10-11T...",
  --   "human_edited_text": "...",
  --   "edit_reason": "tone_adjustment",
  --   "quality_scores": {
  --     "factuality": 4,
  --     "helpfulness": 5,
  --     "tone": 4,
  --     "policy_alignment": 5,
  --     "citation_quality": 4
  --   },
  --   "overall_rating": "excellent",
  --   "notes": "..."
  -- }
  
  -- Customer outcome
  customer_outcome JSONB,
  -- Expected structure:
  -- {
  --   "resolved": true,
  --   "csat_score": 5,
  --   "resolution_time_minutes": 12,
  --   "required_escalation": false
  -- }
  
  -- Tags for filtering
  tags TEXT[] DEFAULT '{}',
  
  -- Training corpus flags
  training_flags JSONB NOT NULL DEFAULT '{"include_in_training": true, "include_in_evaluation": false, "quality_reviewed": false, "pii_redacted": false}'::jsonb
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_training_samples_created_at ON agent_training_samples(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_samples_agent_name ON agent_training_samples((source->>'agent_name'));
CREATE INDEX IF NOT EXISTS idx_training_samples_approved ON agent_training_samples((human_feedback->>'approved'));
CREATE INDEX IF NOT EXISTS idx_training_samples_tags ON agent_training_samples USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_training_samples_quality_reviewed ON agent_training_samples((training_flags->>'quality_reviewed'));

-- Query performance metrics table
CREATE TABLE IF NOT EXISTS agent_query_performance (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  query_text TEXT NOT NULL,
  query_hash TEXT NOT NULL, -- For deduplication
  
  performance JSONB NOT NULL,
  -- Expected structure:
  -- {
  --   "latency_ms": 450,
  --   "topK": 5,
  --   "cache_hit": false,
  --   "index_version": "20251011-1400"
  -- }
  
  quality JSONB NOT NULL,
  -- Expected structure:
  -- {
  --   "sources_count": 5,
  --   "avg_source_score": 0.87,
  --   "confidence": 0.85
  -- }
  
  outcome JSONB
  -- Expected structure:
  -- {
  --   "approved": true,
  --   "edited": false,
  --   "human_rating": 4
  -- }
);

-- Indexes for performance queries
CREATE INDEX IF NOT EXISTS idx_query_performance_timestamp ON agent_query_performance(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_query_performance_query_hash ON agent_query_performance(query_hash);
CREATE INDEX IF NOT EXISTS idx_query_performance_latency ON agent_query_performance((performance->>'latency_ms'));

-- Training batches for corpus tracking
CREATE TABLE IF NOT EXISTS agent_training_batches (
  batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  samples_count INT NOT NULL DEFAULT 0,
  
  date_range JSONB NOT NULL,
  -- Expected structure:
  -- {
  --   "start": "2025-10-01T00:00:00Z",
  --   "end": "2025-10-31T23:59:59Z"
  -- }
  
  sources TEXT[] NOT NULL DEFAULT '{}',
  
  quality_metrics JSONB NOT NULL,
  -- Expected structure:
  -- {
  --   "approval_rate": 0.85,
  --   "avg_factuality": 4.2,
  --   "avg_helpfulness": 4.5,
  --   "edit_rate": 0.15
  -- }
  
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_training_batches_created_at ON agent_training_batches(created_at DESC);

-- View for approved training samples
CREATE OR REPLACE VIEW approved_training_samples AS
SELECT 
  sample_id,
  created_at,
  source->>'agent_name' AS agent_name,
  query->>'text' AS query_text,
  query->>'intent' AS query_intent,
  agent_response->>'text' AS response_text,
  human_feedback->>'approved_by' AS approved_by,
  human_feedback->>'approved_at' AS approved_at,
  human_feedback->>'overall_rating' AS overall_rating,
  (human_feedback->'quality_scores'->>'factuality')::numeric AS factuality_score,
  (human_feedback->'quality_scores'->>'helpfulness')::numeric AS helpfulness_score,
  tags
FROM agent_training_samples
WHERE human_feedback->>'approved' = 'true';

-- View for evaluation samples
CREATE OR REPLACE VIEW evaluation_samples AS
SELECT 
  sample_id,
  created_at,
  query->>'text' AS query_text,
  agent_response->>'text' AS response_text,
  human_feedback->>'human_edited_text' AS expected_text,
  (human_feedback->'quality_scores'->>'factuality')::numeric AS factuality_score,
  tags
FROM agent_training_samples
WHERE training_flags->>'include_in_evaluation' = 'true'
  AND training_flags->>'quality_reviewed' = 'true';

-- Function to calculate aggregated metrics
CREATE OR REPLACE FUNCTION get_training_metrics(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_samples BIGINT,
  approved_samples BIGINT,
  evaluation_samples BIGINT,
  approval_rate NUMERIC,
  edit_rate NUMERIC,
  avg_factuality NUMERIC,
  avg_helpfulness NUMERIC,
  avg_citation_quality NUMERIC,
  avg_latency_ms NUMERIC,
  p95_latency_ms NUMERIC,
  cache_hit_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH sample_stats AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE human_feedback->>'approved' = 'true') AS approved,
      COUNT(*) FILTER (WHERE training_flags->>'include_in_evaluation' = 'true') AS eval_count,
      COUNT(*) FILTER (WHERE human_feedback->>'human_edited_text' IS NOT NULL) AS edited,
      AVG((human_feedback->'quality_scores'->>'factuality')::numeric) AS avg_fact,
      AVG((human_feedback->'quality_scores'->>'helpfulness')::numeric) AS avg_help,
      AVG((human_feedback->'quality_scores'->>'citation_quality')::numeric) AS avg_cite
    FROM agent_training_samples
    WHERE created_at BETWEEN start_date AND end_date
  ),
  perf_stats AS (
    SELECT
      AVG((performance->>'latency_ms')::numeric) AS avg_lat,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (performance->>'latency_ms')::numeric) AS p95_lat,
      AVG(CASE WHEN performance->>'cache_hit' = 'true' THEN 1.0 ELSE 0.0 END) AS cache_rate
    FROM agent_query_performance
    WHERE timestamp BETWEEN start_date AND end_date
  )
  SELECT
    s.total,
    s.approved,
    s.eval_count,
    CASE WHEN s.total > 0 THEN s.approved::numeric / s.total ELSE 0 END AS approval_rate,
    CASE WHEN s.total > 0 THEN s.edited::numeric / s.total ELSE 0 END AS edit_rate,
    s.avg_fact,
    s.avg_help,
    s.avg_cite,
    p.avg_lat,
    p.p95_lat,
    p.cache_rate
  FROM sample_stats s, perf_stats p;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE agent_training_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_query_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_training_batches ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert and read their own data
CREATE POLICY "Users can insert training samples" ON agent_training_samples
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read training samples" ON agent_training_samples
  FOR SELECT USING (true);

CREATE POLICY "Users can update training samples" ON agent_training_samples
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert performance metrics" ON agent_query_performance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read performance metrics" ON agent_query_performance
  FOR SELECT USING (true);

CREATE POLICY "Users can insert training batches" ON agent_training_batches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read training batches" ON agent_training_batches
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON agent_training_samples TO authenticated;
GRANT ALL ON agent_query_performance TO authenticated;
GRANT ALL ON agent_training_batches TO authenticated;
GRANT SELECT ON approved_training_samples TO authenticated;
GRANT SELECT ON evaluation_samples TO authenticated;
GRANT EXECUTE ON FUNCTION get_training_metrics(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE agent_training_samples IS 'Training data samples from Agent SDK feedback for LlamaIndex optimization';
COMMENT ON TABLE agent_query_performance IS 'Query performance metrics for optimization tracking';
COMMENT ON TABLE agent_training_batches IS 'Batch metadata for training corpus tracking';
COMMENT ON FUNCTION get_training_metrics IS 'Calculates aggregated metrics for a date range';

