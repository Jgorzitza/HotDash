-- Agent SDK: Training Data / Feedback Table
-- Priority: HIGH (Agent SDK integration)
-- Owner: data
-- Date: 2025-10-11
-- Ref: docs/directions/data.md Task 2 (Agent SDK Database Schemas)

-- Create agent_feedback table for training data and human feedback
CREATE TABLE IF NOT EXISTS public.agent_feedback (
  id BIGSERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  input_text TEXT NOT NULL,
  model_draft TEXT NOT NULL,
  safe_to_send BOOLEAN DEFAULT NULL,
  labels TEXT[] DEFAULT '{}',
  rubric JSONB DEFAULT '{}'::JSONB,
  annotator TEXT,
  notes TEXT,
  meta JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS agent_feedback_conversation_id_idx 
  ON public.agent_feedback (conversation_id);

CREATE INDEX IF NOT EXISTS agent_feedback_created_at_idx 
  ON public.agent_feedback (created_at DESC);

CREATE INDEX IF NOT EXISTS agent_feedback_annotator_idx 
  ON public.agent_feedback (annotator);

CREATE INDEX IF NOT EXISTS agent_feedback_safe_to_send_idx 
  ON public.agent_feedback (safe_to_send) 
  WHERE safe_to_send IS NOT NULL;

CREATE INDEX IF NOT EXISTS agent_feedback_labels_gin 
  ON public.agent_feedback USING GIN (labels);

-- Add helpful comments
COMMENT ON TABLE public.agent_feedback IS 'Agent SDK training data and human feedback. Captures input, model drafts, safety judgments, and quality rubrics for fine-tuning.';
COMMENT ON COLUMN public.agent_feedback.id IS 'Unique identifier for feedback record';
COMMENT ON COLUMN public.agent_feedback.conversation_id IS 'Agent SDK conversation identifier (indexed)';
COMMENT ON COLUMN public.agent_feedback.input_text IS 'User input text that triggered the model response';
COMMENT ON COLUMN public.agent_feedback.model_draft IS 'Model-generated response draft';
COMMENT ON COLUMN public.agent_feedback.safe_to_send IS 'Human judgment: safe to send to user (NULL = not reviewed)';
COMMENT ON COLUMN public.agent_feedback.labels IS 'Array of quality/category labels (indexed with GIN)';
COMMENT ON COLUMN public.agent_feedback.rubric IS 'Quality rubric scores (JSONB for flexible schema)';
COMMENT ON COLUMN public.agent_feedback.annotator IS 'User identifier who annotated (indexed)';
COMMENT ON COLUMN public.agent_feedback.notes IS 'Human annotator notes';
COMMENT ON COLUMN public.agent_feedback.meta IS 'Additional metadata (JSONB)';
COMMENT ON COLUMN public.agent_feedback.created_at IS 'Timestamp when feedback created (indexed)';
COMMENT ON COLUMN public.agent_feedback.updated_at IS 'Timestamp of last update';

-- Enable Row Level Security
ALTER TABLE public.agent_feedback ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role has full access (Agent SDK operations)
CREATE POLICY agent_feedback_service_role_all
  ON public.agent_feedback
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can read their own conversation feedback
CREATE POLICY agent_feedback_read_own
  ON public.agent_feedback
  FOR SELECT
  TO authenticated
  USING (
    conversation_id = COALESCE(
      current_setting('app.conversation_id', true),
      auth.jwt() ->> 'conversation_id'
    )
    OR auth.role() = 'service_role'
  );

-- Policy 3: Annotators can read all feedback for quality review
-- Uses JWT claim 'role' = 'annotator' or 'qa_team'
CREATE POLICY agent_feedback_read_annotators
  ON public.agent_feedback
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(auth.jwt() ->> 'role', '') IN ('annotator', 'qa_team')
  );

-- Policy 4: Only service role can insert feedback
CREATE POLICY agent_feedback_insert_service_only
  ON public.agent_feedback
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 5: Service role and annotators can update feedback (for annotations)
CREATE POLICY agent_feedback_update_service_and_annotators
  ON public.agent_feedback
  FOR UPDATE
  TO authenticated
  USING (
    auth.role() = 'service_role'
    OR COALESCE(auth.jwt() ->> 'role', '') IN ('annotator', 'qa_team')
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR COALESCE(auth.jwt() ->> 'role', '') IN ('annotator', 'qa_team')
  );

-- Policy 6: Prevent deletes (feedback is training data / audit record)
CREATE POLICY agent_feedback_no_delete
  ON public.agent_feedback
  FOR DELETE
  TO authenticated
  USING (false);

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS trg_agent_feedback_updated_at ON public.agent_feedback;
CREATE TRIGGER trg_agent_feedback_updated_at
BEFORE UPDATE ON public.agent_feedback
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Grant necessary permissions
GRANT SELECT ON public.agent_feedback TO authenticated;
GRANT ALL ON public.agent_feedback TO service_role;
GRANT USAGE, SELECT ON SEQUENCE agent_feedback_id_seq TO service_role;

