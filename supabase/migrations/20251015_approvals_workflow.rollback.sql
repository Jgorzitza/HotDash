-- Rollback: Approvals Workflow Schema
-- Date: 2025-10-15

-- Drop triggers
DROP TRIGGER IF EXISTS trg_approvals_updated_at ON public.approvals;
DROP FUNCTION IF EXISTS public.set_updated_at();

-- Drop policies (in reverse order)
DROP POLICY IF EXISTS approval_edits_no_update ON public.approval_edits;
DROP POLICY IF EXISTS approval_items_no_update ON public.approval_items;
DROP POLICY IF EXISTS approval_edits_no_delete ON public.approval_edits;
DROP POLICY IF EXISTS approval_grades_no_delete ON public.approval_grades;
DROP POLICY IF EXISTS approval_items_no_delete ON public.approval_items;
DROP POLICY IF EXISTS approvals_no_delete ON public.approvals;
DROP POLICY IF EXISTS approvals_read_own ON public.approvals;
DROP POLICY IF EXISTS approval_grades_update_reviewers ON public.approval_grades;
DROP POLICY IF EXISTS approval_grades_insert_reviewers ON public.approval_grades;
DROP POLICY IF EXISTS approvals_update_reviewers ON public.approvals;
DROP POLICY IF EXISTS approval_edits_read_all ON public.approval_edits;
DROP POLICY IF EXISTS approval_grades_read_all ON public.approval_grades;
DROP POLICY IF EXISTS approval_items_read_all ON public.approval_items;
DROP POLICY IF EXISTS approvals_read_all ON public.approvals;
DROP POLICY IF EXISTS approval_edits_service_role ON public.approval_edits;
DROP POLICY IF EXISTS approval_grades_service_role ON public.approval_grades;
DROP POLICY IF EXISTS approval_items_service_role ON public.approval_items;
DROP POLICY IF EXISTS approvals_service_role ON public.approvals;

-- Revoke permissions
REVOKE ALL ON public.approval_edits FROM service_role;
REVOKE ALL ON public.approval_grades FROM service_role;
REVOKE ALL ON public.approval_items FROM service_role;
REVOKE ALL ON public.approvals FROM service_role;

REVOKE SELECT ON public.approval_edits FROM authenticated;
REVOKE SELECT ON public.approval_grades FROM authenticated;
REVOKE SELECT ON public.approval_items FROM authenticated;
REVOKE SELECT ON public.approvals FROM authenticated;

-- Drop indexes
DROP INDEX IF EXISTS public.approval_edits_editor_created_at_idx;
DROP INDEX IF EXISTS public.approval_edits_field_created_at_idx;
DROP INDEX IF EXISTS public.approval_edits_approval_id_created_at_idx;
DROP INDEX IF EXISTS public.approval_grades_created_at_idx;
DROP INDEX IF EXISTS public.approval_grades_approval_id_idx;
DROP INDEX IF EXISTS public.approval_items_path_idx;
DROP INDEX IF EXISTS public.approval_items_approval_id_created_at_idx;
DROP INDEX IF EXISTS public.approvals_reviewer_updated_at_idx;
DROP INDEX IF EXISTS public.approvals_created_by_created_at_idx;
DROP INDEX IF EXISTS public.approvals_state_kind_created_at_idx;

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS public.approval_edits;
DROP TABLE IF EXISTS public.approval_grades;
DROP TABLE IF EXISTS public.approval_items;
DROP TABLE IF EXISTS public.approvals;

