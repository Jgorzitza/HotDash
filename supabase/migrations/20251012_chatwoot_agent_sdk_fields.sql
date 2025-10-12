-- Agent SDK: Chatwoot-Specific Fields Extension
-- Priority: HIGH (Chatwoot Agent SDK integration)
-- Owner: chatwoot
-- Date: 2025-10-12
-- Ref: docs/integrations/agent_sdk_integration_plan.md

-- Add Chatwoot-specific fields to agent_approvals table
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS chatwoot_conversation_id BIGINT;
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS chatwoot_message_id BIGINT;
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS inbox_id INTEGER;

-- Customer context fields
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS customer_message TEXT;

-- Agent SDK output fields
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS draft_response TEXT;
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS confidence_score INTEGER CHECK (confidence_score IS NULL OR (confidence_score BETWEEN 0 AND 100));
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS knowledge_sources JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS suggested_tags TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS sentiment_analysis JSONB DEFAULT '{}'::JSONB;
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS recommended_action TEXT CHECK (recommended_action IS NULL OR recommended_action IN ('approve', 'edit', 'escalate', 'reject'));

-- Queue management fields
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Operator interaction fields
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES auth.users(id);
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS operator_action TEXT CHECK (operator_action IS NULL OR operator_action IN ('approve', 'edit', 'escalate', 'reject'));
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS operator_notes TEXT;
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS edited_response TEXT;
ALTER TABLE public.agent_approvals ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Add indexes for Chatwoot integration
CREATE INDEX IF NOT EXISTS agent_approvals_chatwoot_conversation_idx 
  ON public.agent_approvals (chatwoot_conversation_id) 
  WHERE chatwoot_conversation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS agent_approvals_priority_idx 
  ON public.agent_approvals (priority, created_at DESC);

CREATE INDEX IF NOT EXISTS agent_approvals_operator_idx 
  ON public.agent_approvals (operator_id) 
  WHERE operator_id IS NOT NULL;

-- Update comments
COMMENT ON COLUMN public.agent_approvals.chatwoot_conversation_id IS 'Chatwoot conversation ID (indexed for lookup)';
COMMENT ON COLUMN public.agent_approvals.chatwoot_message_id IS 'Chatwoot private note ID containing the draft';
COMMENT ON COLUMN public.agent_approvals.customer_message IS 'Original customer message from Chatwoot';
COMMENT ON COLUMN public.agent_approvals.draft_response IS 'AI-generated draft response';
COMMENT ON COLUMN public.agent_approvals.confidence_score IS 'AI confidence score (0-100)';
COMMENT ON COLUMN public.agent_approvals.knowledge_sources IS 'Knowledge base articles used';
COMMENT ON COLUMN public.agent_approvals.priority IS 'Queue priority (low, normal, high, urgent)';
COMMENT ON COLUMN public.agent_approvals.operator_id IS 'UUID of operator who reviewed';
COMMENT ON COLUMN public.agent_approvals.operator_action IS 'Action taken by operator';
COMMENT ON COLUMN public.agent_approvals.edited_response IS 'Edited version if operator modified draft';

-- Create learning data table
CREATE TABLE IF NOT EXISTS public.agent_sdk_learning_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Queue reference
  queue_item_id BIGINT REFERENCES public.agent_approvals(id),
  
  -- Training data
  customer_message TEXT NOT NULL,
  agent_draft TEXT NOT NULL,
  operator_version TEXT,
  operator_action TEXT NOT NULL,
  
  -- Outcome tracking
  outcome TEXT CHECK (outcome IN ('pending', 'customer_satisfied', 'customer_followup', 'escalated', 'rejected')),
  customer_response_time_seconds INTEGER,
  resolution_time_seconds INTEGER,
  
  -- Metadata
  knowledge_gaps JSONB,
  edit_diff JSONB,
  feedback_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for learning data
CREATE INDEX IF NOT EXISTS agent_sdk_learning_queue_idx 
  ON public.agent_sdk_learning_data (queue_item_id);

CREATE INDEX IF NOT EXISTS agent_sdk_learning_created_idx 
  ON public.agent_sdk_learning_data (created_at DESC);

COMMENT ON TABLE public.agent_sdk_learning_data IS 'Learning data for Agent SDK improvement based on operator feedback';

-- Enable RLS on learning data
ALTER TABLE public.agent_sdk_learning_data ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY agent_sdk_learning_service_role_all
  ON public.agent_sdk_learning_data
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read learning data (for analytics)
CREATE POLICY agent_sdk_learning_read
  ON public.agent_sdk_learning_data
  FOR SELECT
  TO authenticated
  USING (true);

-- Grant permissions
GRANT SELECT ON public.agent_sdk_learning_data TO authenticated;
GRANT ALL ON public.agent_sdk_learning_data TO service_role;

-- Create notifications table for real-time alerts
CREATE TABLE IF NOT EXISTS public.agent_sdk_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  type TEXT NOT NULL CHECK (type IN ('new_draft', 'urgent_review_needed', 'escalation')),
  queue_item_id BIGINT REFERENCES public.agent_approvals(id),
  conversation_id BIGINT NOT NULL,
  
  recipient_user_id UUID REFERENCES auth.users(id),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS agent_sdk_notifications_recipient_idx 
  ON public.agent_sdk_notifications (recipient_user_id, created_at DESC) 
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS agent_sdk_notifications_created_idx 
  ON public.agent_sdk_notifications (created_at DESC);

COMMENT ON TABLE public.agent_sdk_notifications IS 'Real-time notifications for operators about Agent SDK queue items';

-- Enable RLS on notifications
ALTER TABLE public.agent_sdk_notifications ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY agent_sdk_notifications_service_role_all
  ON public.agent_sdk_notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can read their own notifications or broadcast messages (recipient_user_id IS NULL)
CREATE POLICY agent_sdk_notifications_read_own
  ON public.agent_sdk_notifications
  FOR SELECT
  TO authenticated
  USING (recipient_user_id = auth.uid() OR recipient_user_id IS NULL);

-- Users can update their own notifications (mark as read)
CREATE POLICY agent_sdk_notifications_update_own
  ON public.agent_sdk_notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_user_id = auth.uid())
  WITH CHECK (recipient_user_id = auth.uid());

-- Grant permissions
GRANT SELECT, UPDATE ON public.agent_sdk_notifications TO authenticated;
GRANT ALL ON public.agent_sdk_notifications TO service_role;


