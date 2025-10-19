-- Rollback: Agent SDK Query Tracking Table
-- Date: 2025-10-11
-- WARNING: This removes the agent_queries table and all query logs

-- Drop trigger
DO $$
DECLARE
  has_table BOOLEAN;
  has_seq BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'agent_queries'
  ) INTO has_table;

  IF NOT has_table THEN
    RAISE NOTICE 'agent_queries missing, skipping rollback';
    RETURN;
  END IF;

  EXECUTE 'DROP TRIGGER IF EXISTS trg_agent_queries_updated_at ON public.agent_queries';

  EXECUTE 'DROP POLICY IF EXISTS agent_queries_service_role_all ON public.agent_queries';
  EXECUTE 'DROP POLICY IF EXISTS agent_queries_read_own ON public.agent_queries';
  EXECUTE 'DROP POLICY IF EXISTS agent_queries_read_operators ON public.agent_queries';
  EXECUTE 'DROP POLICY IF EXISTS agent_queries_insert_service_only ON public.agent_queries';
  EXECUTE 'DROP POLICY IF EXISTS agent_queries_update_service_and_operators ON public.agent_queries';
  EXECUTE 'DROP POLICY IF EXISTS agent_queries_no_delete ON public.agent_queries';

  EXECUTE 'REVOKE SELECT ON public.agent_queries FROM authenticated';
  EXECUTE 'REVOKE ALL ON public.agent_queries FROM service_role';

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
      AND sequence_name = 'agent_queries_id_seq'
  ) INTO has_seq;

  IF has_seq THEN
    EXECUTE 'REVOKE USAGE, SELECT ON SEQUENCE agent_queries_id_seq FROM service_role';
  END IF;

  EXECUTE 'DROP INDEX IF EXISTS public.agent_queries_conversation_id_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_queries_created_at_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_queries_agent_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_queries_approved_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_queries_agent_created_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_queries_latency_idx';

  EXECUTE 'DROP TABLE IF EXISTS public.agent_queries';
END;
$$;
