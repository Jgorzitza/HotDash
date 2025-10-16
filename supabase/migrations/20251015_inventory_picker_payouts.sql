-- Inventory: Picker Payouts Schema
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: 4 - Inventory Schema (picker_payouts table)

-- ============================================================================
-- Table: picker_payouts
-- Purpose: Track picker performance and payout calculations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.picker_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  picker_name TEXT NOT NULL,
  picker_email TEXT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  
  -- Performance metrics
  orders_picked INTEGER NOT NULL DEFAULT 0,
  units_picked INTEGER NOT NULL DEFAULT 0,
  pick_accuracy_pct NUMERIC(5,2) DEFAULT 100.00,
  avg_pick_time_seconds INTEGER,
  
  -- Payout calculation
  base_rate_per_order NUMERIC(10,2) NOT NULL DEFAULT 0,
  bonus_rate_per_unit NUMERIC(10,2) DEFAULT 0,
  accuracy_bonus NUMERIC(10,2) DEFAULT 0,
  speed_bonus NUMERIC(10,2) DEFAULT 0,
  total_payout NUMERIC(10,2) NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'pending_review', 'approved', 'paid')) NOT NULL DEFAULT 'draft',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT picker_payouts_period_check CHECK (pay_period_end >= pay_period_start),
  CONSTRAINT picker_payouts_accuracy_check CHECK (pick_accuracy_pct >= 0 AND pick_accuracy_pct <= 100),
  CONSTRAINT picker_payouts_payout_check CHECK (total_payout >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS picker_payouts_picker_email_idx ON public.picker_payouts (picker_email);
CREATE INDEX IF NOT EXISTS picker_payouts_period_idx ON public.picker_payouts (pay_period_start DESC, pay_period_end DESC);
CREATE INDEX IF NOT EXISTS picker_payouts_status_idx ON public.picker_payouts (status);
CREATE UNIQUE INDEX IF NOT EXISTS picker_payouts_unique_period_idx 
  ON public.picker_payouts (picker_email, pay_period_start, pay_period_end);

-- Comments
COMMENT ON TABLE public.picker_payouts IS 'Picker performance tracking and payout calculations';
COMMENT ON COLUMN public.picker_payouts.picker_name IS 'Full name of the picker';
COMMENT ON COLUMN public.picker_payouts.picker_email IS 'Email address (unique identifier)';
COMMENT ON COLUMN public.picker_payouts.pay_period_start IS 'Start date of pay period';
COMMENT ON COLUMN public.picker_payouts.pay_period_end IS 'End date of pay period';
COMMENT ON COLUMN public.picker_payouts.orders_picked IS 'Total orders picked in period';
COMMENT ON COLUMN public.picker_payouts.units_picked IS 'Total units picked in period';
COMMENT ON COLUMN public.picker_payouts.pick_accuracy_pct IS 'Picking accuracy percentage (0-100)';
COMMENT ON COLUMN public.picker_payouts.total_payout IS 'Total payout amount for period';
COMMENT ON COLUMN public.picker_payouts.status IS 'Payout status: draft, pending_review, approved, paid';

-- Trigger for updated_at
CREATE TRIGGER trg_picker_payouts_updated_at
BEFORE UPDATE ON public.picker_payouts
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.picker_payouts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role full access
CREATE POLICY picker_payouts_service_role
  ON public.picker_payouts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can read all
CREATE POLICY picker_payouts_read_all
  ON public.picker_payouts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Managers can update (approve payouts)
CREATE POLICY picker_payouts_update_managers
  ON public.picker_payouts
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(auth.jwt() ->> 'role', '') IN ('manager', 'admin')
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    COALESCE(auth.jwt() ->> 'role', '') IN ('manager', 'admin')
    OR auth.role() = 'service_role'
  );

-- Policy 4: Service role can insert
CREATE POLICY picker_payouts_insert_service
  ON public.picker_payouts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 5: No deletes (audit trail)
CREATE POLICY picker_payouts_no_delete
  ON public.picker_payouts
  FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT ON public.picker_payouts TO authenticated;
GRANT ALL ON public.picker_payouts TO service_role;
GRANT USAGE, SELECT ON SEQUENCE picker_payouts_id_seq TO service_role;

