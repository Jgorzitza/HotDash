-- Rollback: Picker Payouts Schema
-- Date: 2025-10-15

-- Drop trigger
DROP TRIGGER IF EXISTS trg_picker_payouts_updated_at ON public.picker_payouts;

-- Drop policies
DROP POLICY IF EXISTS picker_payouts_service_role ON public.picker_payouts;
DROP POLICY IF EXISTS picker_payouts_read_all ON public.picker_payouts;
DROP POLICY IF EXISTS picker_payouts_update_managers ON public.picker_payouts;
DROP POLICY IF EXISTS picker_payouts_insert_service ON public.picker_payouts;
DROP POLICY IF EXISTS picker_payouts_no_delete ON public.picker_payouts;

-- Revoke permissions
REVOKE SELECT ON public.picker_payouts FROM authenticated;
REVOKE ALL ON public.picker_payouts FROM service_role;

-- Drop indexes
DROP INDEX IF EXISTS public.picker_payouts_picker_email_idx;
DROP INDEX IF EXISTS public.picker_payouts_period_idx;
DROP INDEX IF EXISTS public.picker_payouts_status_idx;
DROP INDEX IF EXISTS public.picker_payouts_unique_period_idx;

-- Drop table
DROP TABLE IF EXISTS public.picker_payouts;

