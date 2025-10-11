-- Rollback: Agent SDK Query Tracking Table
-- Date: 2025-10-11
-- WARNING: This removes the agent_queries table and all query logs

-- Drop trigger
DROP TRIGGER IF EXISTS trg_agent_queries_updated_at ON public.agent_queries;

-- Drop policies
DROP POLICY IF EXISTS agent_queries_service_role_all ON public.agent_queries;
DROP POLICY IF EXISTS agent_queries_read_own ON public.agent_queries;
DROP POLICY IF EXISTS agent_queries_read_operators ON public.agent_queries;
DROP POLICY IF EXISTS agent_queries_insert_service_only ON public.agent_queries;
DROP POLICY IF EXISTS agent_queries_update_service_and_operators ON public.agent_queries;
DROP POLICY IF EXISTS agent_queries_no_delete ON public.agent_queries;

-- Revoke permissions
REVOKE SELECT ON public.agent_queries FROM authenticated;
REVOKE ALL ON public.agent_queries FROM service_role;
REVOKE USAGE, SELECT ON SEQUENCE agent_queries_id_seq FROM service_role;

-- Drop indexes
DROP INDEX IF EXISTS public.agent_queries_conversation_id_idx;
DROP INDEX IF EXISTS public.agent_queries_created_at_idx;
DROP INDEX IF EXISTS public.agent_queries_agent_idx;
DROP INDEX IF EXISTS public.agent_queries_approved_idx;
DROP INDEX IF EXISTS public.agent_queries_agent_created_idx;
DROP INDEX IF EXISTS public.agent_queries_latency_idx;

-- Drop table
DROP TABLE IF EXISTS public.agent_queries;

