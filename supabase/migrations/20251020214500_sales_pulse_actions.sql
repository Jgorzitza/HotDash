-- Sales Pulse Actions (Sales Modal Audit Trail)
-- Task: DATA-NEW-004
-- Date: 2025-10-20
-- Ref: docs/design/modal-refresh-handoff.md, AGENT_LAUNCH_PROMPT_OCT20.md

-- ============================================================================
-- TABLE: sales_pulse_actions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sales_pulse_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action_type TEXT NOT NULL CHECK (action_type IN ('variance_review','note_added','sku_flagged','other')),
  revenue_variance NUMERIC(12,2), -- WoW variance amount
  selected_action TEXT, -- Dropdown action selected by operator
  notes TEXT,
  operator_name TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ'
);

CREATE INDEX IF NOT EXISTS idx_sales_pulse_actions_created ON public.sales_pulse_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_pulse_actions_type ON public.sales_pulse_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_sales_pulse_actions_project ON public.sales_pulse_actions(project);

COMMENT ON TABLE public.sales_pulse_actions IS 'Sales Modal action audit trail with variance review notes';

-- ============================================================================
-- RLS Enable & Policies
-- ============================================================================
ALTER TABLE public.sales_pulse_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY sales_pulse_actions_service_role_all
  ON public.sales_pulse_actions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY sales_pulse_actions_read_by_project
  ON public.sales_pulse_actions FOR SELECT TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

CREATE POLICY sales_pulse_actions_insert_by_project
  ON public.sales_pulse_actions FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

-- ============================================================================
-- Grants
-- ============================================================================
GRANT SELECT, INSERT ON public.sales_pulse_actions TO authenticated;
GRANT ALL ON public.sales_pulse_actions TO service_role;

