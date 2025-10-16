-- Rollback: Audit Log Schema
-- Date: 2025-10-15

-- Drop triggers
DROP TRIGGER IF EXISTS trg_audit_logs_prevent_delete ON public.audit_logs;
DROP TRIGGER IF EXISTS trg_audit_logs_prevent_update ON public.audit_logs;
DROP FUNCTION IF EXISTS public.prevent_audit_log_modification();

-- Drop policies
DROP POLICY IF EXISTS audit_logs_no_delete ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_no_update ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_service ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_read_all ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_service_role ON public.audit_logs;

-- Revoke permissions
REVOKE ALL ON public.audit_logs FROM service_role;
REVOKE SELECT ON public.audit_logs FROM authenticated;

-- Drop indexes
DROP INDEX IF EXISTS public.audit_logs_result_created_at_idx;
DROP INDEX IF EXISTS public.audit_logs_entity_type_id_created_at_idx;
DROP INDEX IF EXISTS public.audit_logs_action_created_at_idx;
DROP INDEX IF EXISTS public.audit_logs_actor_created_at_idx;
DROP INDEX IF EXISTS public.audit_logs_created_at_idx;

-- Drop table
DROP TABLE IF EXISTS public.audit_logs;

