-- Rollback: Agent SDK Training Data / Feedback Table
-- Date: 2025-10-11
-- WARNING: This removes the agent_feedback table and all training data

DO $$
DECLARE
  has_table BOOLEAN;
  has_seq BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'agent_feedback'
  ) INTO has_table;

  IF NOT has_table THEN
    RAISE NOTICE 'agent_feedback missing, skipping rollback';
    RETURN;
  END IF;

  EXECUTE 'DROP TRIGGER IF EXISTS trg_agent_feedback_updated_at ON public.agent_feedback';

  EXECUTE 'DROP POLICY IF EXISTS agent_feedback_service_role_all ON public.agent_feedback';
  EXECUTE 'DROP POLICY IF EXISTS agent_feedback_read_own ON public.agent_feedback';
  EXECUTE 'DROP POLICY IF EXISTS agent_feedback_read_annotators ON public.agent_feedback';
  EXECUTE 'DROP POLICY IF EXISTS agent_feedback_insert_service_only ON public.agent_feedback';
  EXECUTE 'DROP POLICY IF EXISTS agent_feedback_update_service_and_annotators ON public.agent_feedback';
  EXECUTE 'DROP POLICY IF EXISTS agent_feedback_no_delete ON public.agent_feedback';

  EXECUTE 'REVOKE SELECT ON public.agent_feedback FROM authenticated';
  EXECUTE 'REVOKE ALL ON public.agent_feedback FROM service_role';

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
      AND sequence_name = 'agent_feedback_id_seq'
  ) INTO has_seq;

  IF has_seq THEN
    EXECUTE 'REVOKE USAGE, SELECT ON SEQUENCE agent_feedback_id_seq FROM service_role';
  END IF;

  EXECUTE 'DROP INDEX IF EXISTS public.agent_feedback_conversation_id_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_feedback_created_at_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_feedback_annotator_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_feedback_safe_to_send_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_feedback_labels_gin';

  EXECUTE 'DROP TABLE IF EXISTS public.agent_feedback';
END;
$$;
