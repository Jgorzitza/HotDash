-- Rollback: Chatwoot Agent SDK Fields Extension
-- Removes Chatwoot-specific columns and related tables from agent_approvals

-- Drop additional tables first
DROP TABLE IF EXISTS public.agent_sdk_notifications CASCADE;
DROP TABLE IF EXISTS public.agent_sdk_learning_data CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS public.agent_approvals_operator_idx;
DROP INDEX IF EXISTS public.agent_approvals_priority_idx;
DROP INDEX IF EXISTS public.agent_approvals_chatwoot_conversation_idx;

-- Remove added columns from agent_approvals
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS reviewed_at;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS edited_response;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS operator_notes;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS operator_action;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS operator_id;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS priority;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS recommended_action;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS sentiment_analysis;
ALTER TABLE public.agent_approvals DROP COLUMN IF NOT EXISTS suggested_tags;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS knowledge_sources;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS confidence_score;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS draft_response;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS customer_message;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS customer_email;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS customer_name;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS inbox_id;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS chatwoot_message_id;
ALTER TABLE public.agent_approvals DROP COLUMN IF EXISTS chatwoot_conversation_id;

-- Note: This rollback reverts agent_approvals to its original schema from 20251011150400_agent_approvals.sql

