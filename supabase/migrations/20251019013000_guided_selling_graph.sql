-- Guided Selling graph tables
-- Purpose: power fit-finder node graph for Programmatic Guided Selling / Kit Composer
-- Date: 2025-10-19

CREATE TABLE IF NOT EXISTS public.guided_vehicle_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_slug TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  model_year INT NOT NULL,
  trim TEXT,
  engine TEXT,
  fuel TEXT,
  horsepower_min INT,
  horsepower_max INT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS guided_vehicle_profiles_make_model_idx
  ON public.guided_vehicle_profiles (make, model, model_year);

CREATE TABLE IF NOT EXISTS public.guided_use_case_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  tow_capacity_min INT,
  tow_capacity_max INT,
  altitude_min_ft INT,
  altitude_max_ft INT,
  horsepower_band JSONB NOT NULL DEFAULT '{}'::JSONB,
  adjustment_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guided_kit_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_slug TEXT NOT NULL UNIQUE,
  base_sku TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  required_parts JSONB NOT NULL DEFAULT '[]'::JSONB,
  optional_parts JSONB NOT NULL DEFAULT '[]'::JSONB,
  install_time_minutes INT,
  labor_hours_estimate NUMERIC(6,2),
  rationale TEXT,
  notes JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS guided_kit_bundles_base_sku_idx
  ON public.guided_kit_bundles (base_sku);

CREATE TABLE IF NOT EXISTS public.guided_conflict_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  incompatible_parts JSONB NOT NULL DEFAULT '[]'::JSONB,
  fallback_message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warn' CHECK (severity IN ('info','warn','error')),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guided_recommendation_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_type TEXT NOT NULL CHECK (from_type IN ('VehicleProfile','UseCaseModifier','KitBundle')),
  from_slug TEXT NOT NULL,
  to_type TEXT NOT NULL CHECK (to_type IN ('KitBundle','ConflictRule','UseCaseModifier')),
  to_slug TEXT NOT NULL,
  rationale TEXT,
  evidence_link TEXT,
  weight NUMERIC(6,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (from_type, from_slug, to_type, to_slug)
);

CREATE INDEX IF NOT EXISTS guided_recommendation_edges_from_idx
  ON public.guided_recommendation_edges (from_type, from_slug);

CREATE INDEX IF NOT EXISTS guided_recommendation_edges_to_idx
  ON public.guided_recommendation_edges (to_type, to_slug);

-- Reuse updated_at trigger if available
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'set_updated_at'
      AND pg_function_is_visible(oid)
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_guided_vehicle_profiles_updated_at ON public.guided_vehicle_profiles';
    EXECUTE 'CREATE TRIGGER trg_guided_vehicle_profiles_updated_at
              BEFORE UPDATE ON public.guided_vehicle_profiles
              FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at()';

    EXECUTE 'DROP TRIGGER IF EXISTS trg_guided_use_case_modifiers_updated_at ON public.guided_use_case_modifiers';
    EXECUTE 'CREATE TRIGGER trg_guided_use_case_modifiers_updated_at
              BEFORE UPDATE ON public.guided_use_case_modifiers
              FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at()';

    EXECUTE 'DROP TRIGGER IF EXISTS trg_guided_kit_bundles_updated_at ON public.guided_kit_bundles';
    EXECUTE 'CREATE TRIGGER trg_guided_kit_bundles_updated_at
              BEFORE UPDATE ON public.guided_kit_bundles
              FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at()';

    EXECUTE 'DROP TRIGGER IF EXISTS trg_guided_conflict_rules_updated_at ON public.guided_conflict_rules';
    EXECUTE 'CREATE TRIGGER trg_guided_conflict_rules_updated_at
              BEFORE UPDATE ON public.guided_conflict_rules
              FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at()';

    EXECUTE 'DROP TRIGGER IF EXISTS trg_guided_recommendation_edges_updated_at ON public.guided_recommendation_edges';
    EXECUTE 'CREATE TRIGGER trg_guided_recommendation_edges_updated_at
              BEFORE UPDATE ON public.guided_recommendation_edges
              FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at()';
  END IF;
END;
$$;

-- Enable RLS
ALTER TABLE public.guided_vehicle_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guided_use_case_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guided_kit_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guided_conflict_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guided_recommendation_edges ENABLE ROW LEVEL SECURITY;

-- Service role access
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS guided_vehicle_profiles_service_role_all ON public.guided_vehicle_profiles';
  EXECUTE 'CREATE POLICY guided_vehicle_profiles_service_role_all ON public.guided_vehicle_profiles
             FOR ALL TO service_role USING (true) WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS guided_use_case_modifiers_service_role_all ON public.guided_use_case_modifiers';
  EXECUTE 'CREATE POLICY guided_use_case_modifiers_service_role_all ON public.guided_use_case_modifiers
             FOR ALL TO service_role USING (true) WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS guided_kit_bundles_service_role_all ON public.guided_kit_bundles';
  EXECUTE 'CREATE POLICY guided_kit_bundles_service_role_all ON public.guided_kit_bundles
             FOR ALL TO service_role USING (true) WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS guided_conflict_rules_service_role_all ON public.guided_conflict_rules';
  EXECUTE 'CREATE POLICY guided_conflict_rules_service_role_all ON public.guided_conflict_rules
             FOR ALL TO service_role USING (true) WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS guided_recommendation_edges_service_role_all ON public.guided_recommendation_edges';
  EXECUTE 'CREATE POLICY guided_recommendation_edges_service_role_all ON public.guided_recommendation_edges
             FOR ALL TO service_role USING (true) WITH CHECK (true)';
END;
$$;

-- Authenticated read-only access for operators/analytics
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS guided_vehicle_profiles_read ON public.guided_vehicle_profiles';
  EXECUTE 'CREATE POLICY guided_vehicle_profiles_read ON public.guided_vehicle_profiles
             FOR SELECT TO authenticated USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS guided_use_case_modifiers_read ON public.guided_use_case_modifiers';
  EXECUTE 'CREATE POLICY guided_use_case_modifiers_read ON public.guided_use_case_modifiers
             FOR SELECT TO authenticated USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS guided_kit_bundles_read ON public.guided_kit_bundles';
  EXECUTE 'CREATE POLICY guided_kit_bundles_read ON public.guided_kit_bundles
             FOR SELECT TO authenticated USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS guided_conflict_rules_read ON public.guided_conflict_rules';
  EXECUTE 'CREATE POLICY guided_conflict_rules_read ON public.guided_conflict_rules
             FOR SELECT TO authenticated USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS guided_recommendation_edges_read ON public.guided_recommendation_edges';
  EXECUTE 'CREATE POLICY guided_recommendation_edges_read ON public.guided_recommendation_edges
             FOR SELECT TO authenticated USING (true)';
END;
$$;

GRANT SELECT ON public.guided_vehicle_profiles TO authenticated;
GRANT SELECT ON public.guided_use_case_modifiers TO authenticated;
GRANT SELECT ON public.guided_kit_bundles TO authenticated;
GRANT SELECT ON public.guided_conflict_rules TO authenticated;
GRANT SELECT ON public.guided_recommendation_edges TO authenticated;

GRANT ALL ON public.guided_vehicle_profiles TO service_role;
GRANT ALL ON public.guided_use_case_modifiers TO service_role;
GRANT ALL ON public.guided_kit_bundles TO service_role;
GRANT ALL ON public.guided_conflict_rules TO service_role;
GRANT ALL ON public.guided_recommendation_edges TO service_role;
