-- Rollback: Agent SDK Approval Queue Table
-- Date: 2025-10-11
-- WARNING: This removes the agent_approvals table and all data

DO $$
DECLARE
  has_table BOOLEAN;
  has_seq BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'agent_approvals'
  ) INTO has_table;

  IF NOT has_table THEN
    RAISE NOTICE 'agent_approvals missing, skipping rollback';
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_depend dep
    WHERE dep.objid = 'public.agent_approvals'::regclass
      AND dep.deptype = 'n'
  ) THEN
    RAISE NOTICE 'agent_approvals has dependent objects, skipping rollback';
    RETURN;
  END IF;

  EXECUTE 'DROP TRIGGER IF EXISTS trg_agent_approvals_updated_at ON public.agent_approvals';

  EXECUTE 'DROP POLICY IF EXISTS agent_approvals_service_role_all ON public.agent_approvals';
  EXECUTE 'DROP POLICY IF EXISTS agent_approvals_read_own ON public.agent_approvals';
  EXECUTE 'DROP POLICY IF EXISTS agent_approvals_insert_service_only ON public.agent_approvals';
  EXECUTE 'DROP POLICY IF EXISTS agent_approvals_update_service_only ON public.agent_approvals';
  EXECUTE 'DROP POLICY IF EXISTS agent_approvals_no_delete ON public.agent_approvals';

  EXECUTE 'REVOKE SELECT ON public.agent_approvals FROM authenticated';
  EXECUTE 'REVOKE ALL ON public.agent_approvals FROM service_role';

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
      AND sequence_name = 'agent_approvals_id_seq'
  ) INTO has_seq;

  IF has_seq THEN
    EXECUTE 'REVOKE USAGE, SELECT ON SEQUENCE agent_approvals_id_seq FROM service_role';
  END IF;

  EXECUTE 'DROP INDEX IF EXISTS public.agent_approvals_conversation_id_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_approvals_created_at_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_approvals_status_idx';
  EXECUTE 'DROP INDEX IF EXISTS public.agent_approvals_status_created_idx';

  EXECUTE 'DROP TABLE IF EXISTS public.agent_approvals';
END;
$$;
