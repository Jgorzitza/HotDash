-- Programmatic SEO data scaffolding
-- Purpose: support Programmatic SEO Factory (metaobject-driven landers)
-- Date: 2025-10-19
-- Flags: feature.programmaticSeoFactory remains OFF (dev-only data contract)

-- Primary blueprint table captures the structured blueprint for a generated page.
CREATE TABLE IF NOT EXISTS public.programmatic_seo_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_slug TEXT NOT NULL UNIQUE,
  metaobject_type TEXT NOT NULL CHECK (metaobject_type IN ('landing_page', 'comparison', 'location_page')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'approved', 'archived')),
  primary_topic JSONB NOT NULL DEFAULT '{}'::JSONB,
  preview_path TEXT,
  production_path TEXT,
  hero_content JSONB NOT NULL DEFAULT '{}'::JSONB,
  structured_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  generation_notes TEXT,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS programmatic_seo_blueprints_metaobject_type_idx
  ON public.programmatic_seo_blueprints (metaobject_type);

CREATE INDEX IF NOT EXISTS programmatic_seo_blueprints_status_idx
  ON public.programmatic_seo_blueprints (status, updated_at DESC);

-- Generation runs store each attempt to materialise content for a blueprint.
CREATE TABLE IF NOT EXISTS public.programmatic_seo_generation_runs (
  id BIGSERIAL PRIMARY KEY,
  blueprint_id UUID NOT NULL REFERENCES public.programmatic_seo_blueprints(id) ON DELETE CASCADE,
  requested_by TEXT,
  template_version TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  run_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  run_completed_at TIMESTAMPTZ,
  payload JSONB,
  failure_reason TEXT
);

CREATE INDEX IF NOT EXISTS programmatic_seo_generation_runs_blueprint_idx
  ON public.programmatic_seo_generation_runs (blueprint_id, run_started_at DESC);

CREATE INDEX IF NOT EXISTS programmatic_seo_generation_runs_status_idx
  ON public.programmatic_seo_generation_runs (status);

-- Internal links provide idempotent recommendations for nightly sweeps.
CREATE TABLE IF NOT EXISTS public.programmatic_seo_internal_links (
  id BIGSERIAL PRIMARY KEY,
  blueprint_id UUID NOT NULL REFERENCES public.programmatic_seo_blueprints(id) ON DELETE CASCADE,
  target_slug TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'related' CHECK (relationship IN ('related', 'upsell', 'faq', 'supporting')),
  confidence NUMERIC(5,2) CHECK (confidence BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (blueprint_id, target_slug, anchor_text)
);

CREATE INDEX IF NOT EXISTS programmatic_seo_internal_links_relationship_idx
  ON public.programmatic_seo_internal_links (relationship, created_at DESC);

-- Reuse shared updated_at trigger if available.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'set_updated_at'
      AND pg_function_is_visible(oid)
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_programmatic_seo_blueprints_updated_at ON public.programmatic_seo_blueprints';
    EXECUTE 'CREATE TRIGGER trg_programmatic_seo_blueprints_updated_at
              BEFORE UPDATE ON public.programmatic_seo_blueprints
              FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at()';
  END IF;
END;
$$;

-- Enable RLS for all tables and apply baseline policies.
ALTER TABLE public.programmatic_seo_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmatic_seo_generation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmatic_seo_internal_links ENABLE ROW LEVEL SECURITY;

-- Service role full access
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS programmatic_seo_blueprints_service_role_all ON public.programmatic_seo_blueprints';
  EXECUTE 'CREATE POLICY programmatic_seo_blueprints_service_role_all
             ON public.programmatic_seo_blueprints
             FOR ALL
             TO service_role
             USING (true)
             WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS programmatic_seo_generation_runs_service_role_all ON public.programmatic_seo_generation_runs';
  EXECUTE 'CREATE POLICY programmatic_seo_generation_runs_service_role_all
             ON public.programmatic_seo_generation_runs
             FOR ALL
             TO service_role
             USING (true)
             WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS programmatic_seo_internal_links_service_role_all ON public.programmatic_seo_internal_links';
  EXECUTE 'CREATE POLICY programmatic_seo_internal_links_service_role_all
             ON public.programmatic_seo_internal_links
             FOR ALL
             TO service_role
             USING (true)
             WITH CHECK (true)';
END;
$$;

-- Authenticated operators can read blueprints/internal links; generation runs limited to summaries.
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS programmatic_seo_blueprints_read ON public.programmatic_seo_blueprints';
  EXECUTE 'CREATE POLICY programmatic_seo_blueprints_read
             ON public.programmatic_seo_blueprints
             FOR SELECT
             TO authenticated
             USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS programmatic_seo_generation_runs_read ON public.programmatic_seo_generation_runs';
  EXECUTE 'CREATE POLICY programmatic_seo_generation_runs_read
             ON public.programmatic_seo_generation_runs
             FOR SELECT
             TO authenticated
             USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS programmatic_seo_internal_links_read ON public.programmatic_seo_internal_links';
  EXECUTE 'CREATE POLICY programmatic_seo_internal_links_read
             ON public.programmatic_seo_internal_links
             FOR SELECT
             TO authenticated
             USING (true)';
END;
$$;

-- Grants mirror policies.
GRANT SELECT ON public.programmatic_seo_blueprints TO authenticated;
GRANT SELECT ON public.programmatic_seo_generation_runs TO authenticated;
GRANT SELECT ON public.programmatic_seo_internal_links TO authenticated;

GRANT ALL ON public.programmatic_seo_blueprints TO service_role;
GRANT ALL ON public.programmatic_seo_generation_runs TO service_role;
GRANT ALL ON public.programmatic_seo_internal_links TO service_role;

