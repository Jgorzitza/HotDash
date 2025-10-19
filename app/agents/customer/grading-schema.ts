/**
 * Grading Metadata Schema — Customer reply quality tracking
 *
 * Defines the schema for storing grading metadata in Supabase.
 * Used for learning signal collection and quality metrics tracking.
 */

export interface CustomerReplyGrading {
  id: string;
  conversation_id: string;
  draft_reply: string;
  human_reply?: string;

  // Grading scores (1-5 scale)
  tone: number; // 1-5: Friendly, professional, aligned with brand voice
  accuracy: number; // 1-5: Factually correct, addresses customer need
  policy: number; // 1-5: Follows company policies and guidelines

  // Learning signals
  edit_distance?: number; // Levenshtein distance between draft and human reply
  approved: boolean; // Whether draft was approved without major edits

  // Metadata
  graded_by: string; // User ID or email of grader
  graded_at: string; // ISO 8601 timestamp
  created_at: string; // ISO 8601 timestamp

  // Context
  rag_sources?: string[]; // RAG sources used for draft
  confidence?: number; // AI confidence score (0-1)
}

/**
 * Supabase SQL Migration for customer_reply_grading table
 *
 * This migration should be run via Supabase CLI or web interface.
 * File: supabase/migrations/YYYYMMDDHHMMSS_create_customer_reply_grading.sql
 */
export const GRADING_TABLE_MIGRATION = `
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
`;

/**
 * TypeScript interface for quality metrics view
 */
export interface CustomerReplyQualityMetrics {
  date: string; // Date (YYYY-MM-DD)
  total_replies: number;
  approved_count: number;
  avg_tone: number;
  avg_accuracy: number;
  avg_policy: number;
  avg_edit_distance: number;
  approval_rate_pct: number;
}

/**
 * Validation helpers
 */
export function validateGradingScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 5;
}

export function validateGrading(
  grading: Partial<CustomerReplyGrading>,
): string[] {
  const errors: string[] = [];

  if (!grading.conversation_id) {
    errors.push("conversation_id is required");
  }

  if (!grading.draft_reply) {
    errors.push("draft_reply is required");
  }

  if (!grading.tone || !validateGradingScore(grading.tone)) {
    errors.push("tone must be an integer between 1 and 5");
  }

  if (!grading.accuracy || !validateGradingScore(grading.accuracy)) {
    errors.push("accuracy must be an integer between 1 and 5");
  }

  if (!grading.policy || !validateGradingScore(grading.policy)) {
    errors.push("policy must be an integer between 1 and 5");
  }

  if (!grading.graded_by) {
    errors.push("graded_by is required");
  }

  if (grading.confidence !== undefined) {
    if (
      typeof grading.confidence !== "number" ||
      grading.confidence < 0 ||
      grading.confidence > 1
    ) {
      errors.push("confidence must be a number between 0 and 1");
    }
  }

  return errors;
}
