-- Approvals History & Audit Export Support
-- Task: DATA-NEW-003
-- Date: 2025-10-20
-- Ref: docs/design/HANDOFF-approval-queue-ui.md, AGENT_LAUNCH_PROMPT_OCT20.md

-- ============================================================================
-- TABLE: approvals_history
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.approvals_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  conversation_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved','rejected')),
  operator_name TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ'
);

CREATE INDEX IF NOT EXISTS idx_approvals_history_created ON public.approvals_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_history_action ON public.approvals_history(action);
CREATE INDEX IF NOT EXISTS idx_approvals_history_project ON public.approvals_history(project);

COMMENT ON TABLE public.approvals_history IS 'History of approval decisions for audit and export (CSV)';

-- ============================================================================
-- RLS Enable & Policies
-- ============================================================================
ALTER TABLE public.approvals_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY approvals_history_service_role_all
  ON public.approvals_history FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY approvals_history_read_by_project
  ON public.approvals_history FOR SELECT TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

-- Write operations restricted to service processes; no authenticated INSERT/UPDATE by default

-- ============================================================================
-- Grants
-- ============================================================================
GRANT SELECT ON public.approvals_history TO authenticated;
GRANT ALL ON public.approvals_history TO service_role;


