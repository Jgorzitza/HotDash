-- Rollback: Agent SDK Approval Queue Table
-- Date: 2025-10-11
-- WARNING: This removes the agent_approvals table and all data

-- Drop trigger
DROP TRIGGER IF EXISTS trg_agent_approvals_updated_at ON public.agent_approvals;

-- Drop policies
DROP POLICY IF EXISTS agent_approvals_service_role_all ON public.agent_approvals;
DROP POLICY IF EXISTS agent_approvals_read_own ON public.agent_approvals;
DROP POLICY IF EXISTS agent_approvals_insert_service_only ON public.agent_approvals;
DROP POLICY IF EXISTS agent_approvals_update_service_only ON public.agent_approvals;
DROP POLICY IF EXISTS agent_approvals_no_delete ON public.agent_approvals;

-- Revoke permissions
REVOKE SELECT ON public.agent_approvals FROM authenticated;
REVOKE ALL ON public.agent_approvals FROM service_role;
REVOKE USAGE, SELECT ON SEQUENCE agent_approvals_id_seq FROM service_role;

-- Drop indexes
DROP INDEX IF EXISTS public.agent_approvals_conversation_id_idx;
DROP INDEX IF EXISTS public.agent_approvals_created_at_idx;
DROP INDEX IF EXISTS public.agent_approvals_status_idx;
DROP INDEX IF EXISTS public.agent_approvals_status_created_idx;

-- Drop table
DROP TABLE IF EXISTS public.agent_approvals;

