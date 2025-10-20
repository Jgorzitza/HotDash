-- Social Posts (Growth HITL Posting)
-- Task: DATA-006
-- Date: 2025-10-20
-- Ref: docs/manager/PROJECT_PLAN.md (Phase 12: Publer UI Integration)

-- ============================================================================
-- TABLE: social_posts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook','instagram','twitter','linkedin','tiktok')),
  status TEXT NOT NULL CHECK (status IN ('draft','approved','published','failed','cancelled')),
  content TEXT NOT NULL,
  media_urls TEXT[],
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  publer_post_id TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ'
);

CREATE INDEX IF NOT EXISTS idx_social_posts_shop_status ON public.social_posts(shop_domain, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON public.social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON public.social_posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_posts_project ON public.social_posts(project);

COMMENT ON TABLE public.social_posts IS 'Social media posts for HITL approval workflow (Publer integration)';

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

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RLS Enable & Policies
-- ============================================================================
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY social_posts_service_role_all
  ON public.social_posts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY social_posts_read_by_project
  ON public.social_posts FOR SELECT TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

CREATE POLICY social_posts_insert_by_project
  ON public.social_posts FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

CREATE POLICY social_posts_update_by_project
  ON public.social_posts FOR UPDATE TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project'));

-- ============================================================================
-- Grants
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON public.social_posts TO authenticated;
GRANT ALL ON public.social_posts TO service_role;


