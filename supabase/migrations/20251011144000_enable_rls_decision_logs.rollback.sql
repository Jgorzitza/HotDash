-- Rollback: Disable RLS on decision_sync_event_logs table
-- Date: 2025-10-11
-- WARNING: This removes all security policies on the decision_sync_event_logs table

-- Drop all policies
DROP POLICY IF EXISTS decision_logs_service_role_all ON public.decision_sync_event_logs;
DROP POLICY IF EXISTS decision_logs_read_by_scope ON public.decision_sync_event_logs;
DROP POLICY IF EXISTS decision_logs_read_operators ON public.decision_sync_event_logs;
DROP POLICY IF EXISTS decision_logs_insert_by_scope ON public.decision_sync_event_logs;
DROP POLICY IF EXISTS decision_logs_no_update ON public.decision_sync_event_logs;
DROP POLICY IF EXISTS decision_logs_no_delete ON public.decision_sync_event_logs;

-- Revoke permissions (keep service_role)
REVOKE SELECT ON public.decision_sync_event_logs FROM authenticated;
REVOKE SELECT ON public.decision_sync_event_logs FROM operator_readonly;
REVOKE SELECT ON public.decision_sync_event_logs FROM qa_team;
REVOKE INSERT ON public.decision_sync_event_logs FROM authenticated;

-- Disable RLS
ALTER TABLE public.decision_sync_event_logs DISABLE ROW LEVEL SECURITY;

