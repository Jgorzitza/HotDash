-- Rollback: Disable RLS on facts table
-- Date: 2025-10-11
-- WARNING: This removes all security policies on the facts table

-- Drop all policies
DROP POLICY IF EXISTS facts_service_role_all ON public.facts;
DROP POLICY IF EXISTS facts_read_by_project ON public.facts;
DROP POLICY IF EXISTS facts_read_ai_readonly ON public.facts;
DROP POLICY IF EXISTS facts_insert_by_project ON public.facts;
DROP POLICY IF EXISTS facts_no_update ON public.facts;
DROP POLICY IF EXISTS facts_no_delete ON public.facts;
-- Revoke permissions (keep service_role)
REVOKE SELECT ON public.facts FROM authenticated;
REVOKE SELECT ON public.facts FROM ai_readonly;
REVOKE SELECT ON public.facts FROM analytics_reader;
REVOKE INSERT ON public.facts FROM authenticated;
-- Disable RLS
ALTER TABLE public.facts DISABLE ROW LEVEL SECURITY;
-- Restore original comment
COMMENT ON TABLE public.facts IS 'Operator analytics facts mirrored from Prisma dashboard_fact (180 day retention).';
