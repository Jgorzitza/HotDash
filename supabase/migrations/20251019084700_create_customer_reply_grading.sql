-- Create customer_reply_grading table
CREATE TABLE IF NOT EXISTS customer_reply_grading (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  draft_reply TEXT NOT NULL,
  human_reply TEXT,
  
  -- Grading scores (1-5 scale)
  tone INTEGER NOT NULL CHECK (tone >= 1 AND tone <= 5),
  accuracy INTEGER NOT NULL CHECK (accuracy >= 1 AND accuracy <= 5),
  policy INTEGER NOT NULL CHECK (policy >= 1 AND policy <= 5),
  
  -- Learning signals
  edit_distance INTEGER,
  approved BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  graded_by TEXT NOT NULL,
  graded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Context (JSONB for flexibility)
  rag_sources JSONB,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_customer_reply_grading_conversation_id 
  ON customer_reply_grading(conversation_id);
  
CREATE INDEX IF NOT EXISTS idx_customer_reply_grading_graded_at 
  ON customer_reply_grading(graded_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_customer_reply_grading_approved 
  ON customer_reply_grading(approved);

-- Create view for quality metrics
CREATE OR REPLACE VIEW customer_reply_quality_metrics AS
SELECT
  DATE_TRUNC('day', graded_at) as date,
  COUNT(*) as total_replies,
  COUNT(*) FILTER (WHERE approved = TRUE) as approved_count,
  ROUND(AVG(tone), 2) as avg_tone,
  ROUND(AVG(accuracy), 2) as avg_accuracy,
  ROUND(AVG(policy), 2) as avg_policy,
  ROUND(AVG(edit_distance), 2) as avg_edit_distance,
  ROUND((COUNT(*) FILTER (WHERE approved = TRUE)::DECIMAL / COUNT(*)) * 100, 2) as approval_rate_pct
FROM customer_reply_grading
GROUP BY DATE_TRUNC('day', graded_at)
ORDER BY date DESC;

-- Row Level Security (RLS)
ALTER TABLE customer_reply_grading ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read
CREATE POLICY "Allow authenticated read access" ON customer_reply_grading
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service role can insert/update
CREATE POLICY "Allow service role write access" ON customer_reply_grading
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

