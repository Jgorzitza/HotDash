-- Inventory Actions (Inventory Modal Audit Trail)
-- Task: DATA-NEW-005
-- Date: 2025-10-20
-- Ref: docs/design/modal-refresh-handoff.md, AGENT_LAUNCH_PROMPT_OCT20.md

-- ============================================================================
-- TABLE: inventory_actions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action_type TEXT NOT NULL CHECK (action_type IN ('reorder_approved','reorder_rejected','vendor_selected','velocity_reviewed','other')),
  variant_id TEXT, -- Reference to variants table (optional FK when variants table applied)
  sku TEXT,
  reorder_quantity INTEGER,
  vendor_id UUID, -- Reference to vendors table (optional FK when vendors table applied)
  velocity_analysis TEXT, -- 14-day velocity summary
  operator_name TEXT NOT NULL,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ'
);

CREATE INDEX IF NOT EXISTS idx_inventory_actions_created ON public.inventory_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_actions_type ON public.inventory_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_inventory_actions_variant ON public.inventory_actions(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_actions_project ON public.inventory_actions(project);

COMMENT ON TABLE public.inventory_actions IS 'Inventory Modal action audit trail with reorder approvals';

-- ============================================================================
-- RLS Enable & Policies
-- ============================================================================
ALTER TABLE public.inventory_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY inventory_actions_service_role_all
  ON public.inventory_actions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY inventory_actions_read_by_project
  ON public.inventory_actions FOR SELECT TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

CREATE POLICY inventory_actions_insert_by_project
  ON public.inventory_actions FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

-- ============================================================================
-- Grants
-- ============================================================================
GRANT SELECT, INSERT ON public.inventory_actions TO authenticated;
GRANT ALL ON public.inventory_actions TO service_role;

