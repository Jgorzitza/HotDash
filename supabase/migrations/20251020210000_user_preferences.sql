-- User Preferences (Dashboard Personalization)
-- Task: DATA-NEW-001
-- Date: 2025-10-20
-- Ref: docs/design/dashboard-features-1K-1P.md (Task 1K)

-- ============================================================================
-- TABLE: user_preferences
-- Stores per-user dashboard personalization settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Supabase Auth user.id
  tile_order TEXT[] NOT NULL DEFAULT '{}',
  visible_tiles TEXT[] NOT NULL DEFAULT '{}',
  default_view TEXT NOT NULL DEFAULT 'grid', -- grid | list
  theme TEXT NOT NULL DEFAULT 'auto',        -- light | dark | auto
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ',       -- Multi-tenant isolation key
  UNIQUE(user_id, project)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_project ON public.user_preferences(project);

COMMENT ON TABLE public.user_preferences IS 'Per-user dashboard personalization (order, visibility, theme)';
COMMENT ON COLUMN public.user_preferences.tile_order IS 'Array of tile ids in preferred order';
COMMENT ON COLUMN public.user_preferences.visible_tiles IS 'Array of visible tile ids';

-- ============================================================================
-- Trigger: updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RLS: Enable and define policies
-- ============================================================================
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY user_preferences_service_role_all
  ON public.user_preferences
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users: read their project-scoped preferences
CREATE POLICY user_preferences_read_by_project
  ON public.user_preferences
  FOR SELECT
  TO authenticated
  USING (
    project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project')
  );

-- Authenticated users: insert/update within their project
CREATE POLICY user_preferences_insert_by_project
  ON public.user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project')
  );

CREATE POLICY user_preferences_update_by_project
  ON public.user_preferences
  FOR UPDATE
  TO authenticated
  USING (
    project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project')
  );

-- ============================================================================
-- Grants
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;


