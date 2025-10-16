-- Approvals Workflow Schema
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: Approvals workflow foundation (approvals, approval_items, approval_grades, approval_edits)

-- ============================================================================
-- Table: approvals
-- Purpose: Core HITL approval workflow
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.approvals (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT CHECK (kind IN ('cx_reply', 'inventory', 'growth', 'misc')) NOT NULL,
  state TEXT CHECK (state IN ('draft', 'pending_review', 'approved', 'applied', 'audited', 'learned')) NOT NULL DEFAULT 'draft',
  summary TEXT NOT NULL,
  created_by TEXT NOT NULL,
  reviewer TEXT,
  evidence JSONB,
  impact JSONB,
  risk JSONB,
  rollback JSONB,
  actions JSONB,
  receipts JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS approvals_state_kind_created_at_idx ON public.approvals (state, kind, created_at DESC);
CREATE INDEX IF NOT EXISTS approvals_created_by_created_at_idx ON public.approvals (created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS approvals_reviewer_updated_at_idx ON public.approvals (reviewer, updated_at DESC);

COMMENT ON TABLE public.approvals IS 'Core HITL approval workflow table';
COMMENT ON COLUMN public.approvals.kind IS 'Type of approval: cx_reply, inventory, growth, misc';
COMMENT ON COLUMN public.approvals.state IS 'Workflow state: draft → pending_review → approved → applied → audited → learned';
COMMENT ON COLUMN public.approvals.evidence IS 'Evidence supporting the suggestion (queries, samples, diffs)';
COMMENT ON COLUMN public.approvals.impact IS 'Projected impact of the action';
COMMENT ON COLUMN public.approvals.risk IS 'Risk assessment and concerns';
COMMENT ON COLUMN public.approvals.rollback IS 'Rollback plan and artifacts';
COMMENT ON COLUMN public.approvals.actions IS 'Tool calls to execute when approved';
COMMENT ON COLUMN public.approvals.receipts IS 'Execution results and logs';

-- ============================================================================
-- Table: approval_items
-- Purpose: Line items/diffs for approvals
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.approval_items (
  id BIGSERIAL PRIMARY KEY,
  approval_id BIGINT NOT NULL REFERENCES public.approvals(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS approval_items_approval_id_created_at_idx ON public.approval_items (approval_id, created_at DESC);
CREATE INDEX IF NOT EXISTS approval_items_path_idx ON public.approval_items (path);

COMMENT ON TABLE public.approval_items IS 'Line items and diffs for approvals';
COMMENT ON COLUMN public.approval_items.path IS 'Entity path (e.g., product/123, conversation/456)';
COMMENT ON COLUMN public.approval_items.diff IS 'Before/after diff for this item';

-- ============================================================================
-- Table: approval_grades
-- Purpose: HITL grading (tone/accuracy/policy 1-5)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.approval_grades (
  id BIGSERIAL PRIMARY KEY,
  approval_id BIGINT NOT NULL UNIQUE REFERENCES public.approvals(id) ON DELETE CASCADE,
  reviewer TEXT NOT NULL,
  tone INTEGER CHECK (tone BETWEEN 1 AND 5),
  accuracy INTEGER CHECK (accuracy BETWEEN 1 AND 5),
  policy INTEGER CHECK (policy BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS approval_grades_approval_id_idx ON public.approval_grades (approval_id);
CREATE INDEX IF NOT EXISTS approval_grades_created_at_idx ON public.approval_grades (created_at DESC);

COMMENT ON TABLE public.approval_grades IS 'HITL grading for approved items (tone/accuracy/policy 1-5)';
COMMENT ON COLUMN public.approval_grades.tone IS 'Tone grade (1-5): empathy, professionalism';
COMMENT ON COLUMN public.approval_grades.accuracy IS 'Accuracy grade (1-5): factual correctness';
COMMENT ON COLUMN public.approval_grades.policy IS 'Policy grade (1-5): compliance with policies';

-- ============================================================================
-- Table: approval_edits
-- Purpose: Human corrections for learning
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.approval_edits (
  id BIGSERIAL PRIMARY KEY,
  approval_id BIGINT NOT NULL REFERENCES public.approvals(id) ON DELETE CASCADE,
  field TEXT NOT NULL,
  original_value TEXT,
  edited_value TEXT,
  edit_distance INTEGER,
  editor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS approval_edits_approval_id_created_at_idx ON public.approval_edits (approval_id, created_at DESC);
CREATE INDEX IF NOT EXISTS approval_edits_field_created_at_idx ON public.approval_edits (field, created_at DESC);
CREATE INDEX IF NOT EXISTS approval_edits_editor_created_at_idx ON public.approval_edits (editor, created_at DESC);

COMMENT ON TABLE public.approval_edits IS 'Human corrections for learning (captures edit distance)';
COMMENT ON COLUMN public.approval_edits.field IS 'Field that was edited';
COMMENT ON COLUMN public.approval_edits.edit_distance IS 'Levenshtein distance between original and edited';

-- ============================================================================
-- Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_approvals_updated_at
BEFORE UPDATE ON public.approvals
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_edits ENABLE ROW LEVEL SECURITY;

-- Service role: Full access
CREATE POLICY approvals_service_role ON public.approvals FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY approval_items_service_role ON public.approval_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY approval_grades_service_role ON public.approval_grades FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY approval_edits_service_role ON public.approval_edits FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated: Read all
CREATE POLICY approvals_read_all ON public.approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY approval_items_read_all ON public.approval_items FOR SELECT TO authenticated USING (true);
CREATE POLICY approval_grades_read_all ON public.approval_grades FOR SELECT TO authenticated USING (true);
CREATE POLICY approval_edits_read_all ON public.approval_edits FOR SELECT TO authenticated USING (true);

-- Reviewers: Can update approvals and insert/update grades
CREATE POLICY approvals_update_reviewers ON public.approvals FOR UPDATE TO authenticated
  USING (COALESCE(auth.jwt() ->> 'role', '') IN ('reviewer', 'manager', 'admin'))
  WITH CHECK (COALESCE(auth.jwt() ->> 'role', '') IN ('reviewer', 'manager', 'admin'));

CREATE POLICY approval_grades_insert_reviewers ON public.approval_grades FOR INSERT TO authenticated
  WITH CHECK (COALESCE(auth.jwt() ->> 'role', '') IN ('reviewer', 'manager', 'admin'));

CREATE POLICY approval_grades_update_reviewers ON public.approval_grades FOR UPDATE TO authenticated
  USING (COALESCE(auth.jwt() ->> 'role', '') IN ('reviewer', 'manager', 'admin'))
  WITH CHECK (COALESCE(auth.jwt() ->> 'role', '') IN ('reviewer', 'manager', 'admin'));

-- Agents: Can read own approvals
CREATE POLICY approvals_read_own ON public.approvals FOR SELECT TO authenticated
  USING (created_by = COALESCE(auth.jwt() ->> 'email', ''));

-- No deletes (audit trail)
CREATE POLICY approvals_no_delete ON public.approvals FOR DELETE TO authenticated USING (false);
CREATE POLICY approval_items_no_delete ON public.approval_items FOR DELETE TO authenticated USING (false);
CREATE POLICY approval_grades_no_delete ON public.approval_grades FOR DELETE TO authenticated USING (false);
CREATE POLICY approval_edits_no_delete ON public.approval_edits FOR DELETE TO authenticated USING (false);

-- Immutability for approval_items and approval_edits (no updates)
CREATE POLICY approval_items_no_update ON public.approval_items FOR UPDATE TO authenticated USING (false);
CREATE POLICY approval_edits_no_update ON public.approval_edits FOR UPDATE TO authenticated USING (false);

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT ON public.approvals TO authenticated;
GRANT SELECT ON public.approval_items TO authenticated;
GRANT SELECT ON public.approval_grades TO authenticated;
GRANT SELECT ON public.approval_edits TO authenticated;

GRANT ALL ON public.approvals TO service_role;
GRANT ALL ON public.approval_items TO service_role;
GRANT ALL ON public.approval_grades TO service_role;
GRANT ALL ON public.approval_edits TO service_role;

GRANT USAGE, SELECT ON SEQUENCE approvals_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE approval_items_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE approval_grades_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE approval_edits_id_seq TO service_role;

