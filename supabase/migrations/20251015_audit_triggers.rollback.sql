-- Rollback: Audit Triggers
-- Date: 2025-10-15

-- Drop triggers
DROP TRIGGER IF EXISTS trg_approvals_audit ON public.approvals;
DROP TRIGGER IF EXISTS trg_approval_grades_audit ON public.approval_grades;
DROP TRIGGER IF EXISTS trg_picker_payouts_audit ON public.picker_payouts;
DROP TRIGGER IF EXISTS trg_cx_conversations_audit ON public.cx_conversations;

-- Drop function
DROP FUNCTION IF EXISTS public.log_audit_event();

