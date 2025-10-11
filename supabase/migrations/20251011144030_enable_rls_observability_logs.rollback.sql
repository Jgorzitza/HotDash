-- Rollback: Disable RLS on observability_logs table
-- Date: 2025-10-11
-- WARNING: This removes all security policies on the observability_logs table

-- Drop all policies
DROP POLICY IF EXISTS observability_logs_service_role_all ON public.observability_logs;
DROP POLICY IF EXISTS observability_logs_read_monitoring ON public.observability_logs;
DROP POLICY IF EXISTS observability_logs_read_own_requests ON public.observability_logs;
DROP POLICY IF EXISTS observability_logs_insert_service_only ON public.observability_logs;
DROP POLICY IF EXISTS observability_logs_no_update ON public.observability_logs;
DROP POLICY IF EXISTS observability_logs_no_delete ON public.observability_logs;

-- Revoke permissions (keep service_role)
REVOKE SELECT ON public.observability_logs FROM authenticated;
REVOKE SELECT ON public.observability_logs FROM monitoring_team;
REVOKE INSERT ON public.observability_logs FROM service_role;

-- Disable RLS
ALTER TABLE public.observability_logs DISABLE ROW LEVEL SECURITY;

