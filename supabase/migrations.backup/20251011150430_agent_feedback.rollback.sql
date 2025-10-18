-- Rollback: Agent SDK Training Data / Feedback Table
-- Date: 2025-10-11
-- WARNING: This removes the agent_feedback table and all training data

-- Drop trigger
DROP TRIGGER IF EXISTS trg_agent_feedback_updated_at ON public.agent_feedback;

-- Drop policies
DROP POLICY IF EXISTS agent_feedback_service_role_all ON public.agent_feedback;
DROP POLICY IF EXISTS agent_feedback_read_own ON public.agent_feedback;
DROP POLICY IF EXISTS agent_feedback_read_annotators ON public.agent_feedback;
DROP POLICY IF EXISTS agent_feedback_insert_service_only ON public.agent_feedback;
DROP POLICY IF EXISTS agent_feedback_update_service_and_annotators ON public.agent_feedback;
DROP POLICY IF EXISTS agent_feedback_no_delete ON public.agent_feedback;

-- Revoke permissions
REVOKE SELECT ON public.agent_feedback FROM authenticated;
REVOKE ALL ON public.agent_feedback FROM service_role;
REVOKE USAGE, SELECT ON SEQUENCE agent_feedback_id_seq FROM service_role;

-- Drop indexes
DROP INDEX IF EXISTS public.agent_feedback_conversation_id_idx;
DROP INDEX IF EXISTS public.agent_feedback_created_at_idx;
DROP INDEX IF EXISTS public.agent_feedback_annotator_idx;
DROP INDEX IF EXISTS public.agent_feedback_safe_to_send_idx;
DROP INDEX IF EXISTS public.agent_feedback_labels_gin;

-- Drop table
DROP TABLE IF EXISTS public.agent_feedback;

