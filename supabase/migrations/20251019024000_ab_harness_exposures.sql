-- A/B harness exposure and decision log staging
-- Date: 2025-10-19
-- Alignment: docs/specs/hitl/ab-harness.md (Supabase decision log entries) & registry

CREATE TABLE IF NOT EXISTS public.ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('planned','running','paused','archived')),
  primary_metric TEXT NOT NULL,
  min_effect_pct NUMERIC(5,2),
  ga4_dimension TEXT NOT NULL,
  cookie_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ab_arms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  arm_id TEXT NOT NULL,
  rollout NUMERIC(4,3) NOT NULL,
  UNIQUE (experiment_id, arm_id)
);

CREATE TABLE IF NOT EXISTS public.ab_assignments (
  id BIGSERIAL PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  arm_id TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT,
  source TEXT,
  UNIQUE (experiment_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS public.ab_exposures (
  id BIGSERIAL PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  assignment_id BIGINT REFERENCES public.ab_assignments(id) ON DELETE SET NULL,
  visitor_id TEXT NOT NULL,
  arm_id TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  context JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS ab_exposures_experiment_idx
  ON public.ab_exposures (experiment_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.ab_outcomes (
  id BIGSERIAL PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  arm_id TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  metric_value NUMERIC,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ab_outcomes_experiment_metric_idx
  ON public.ab_outcomes (experiment_id, metric_key, occurred_at DESC);

-- Enable RLS
ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_arms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_exposures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_outcomes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS ab_experiments_service_role_all ON public.ab_experiments';
  EXECUTE 'CREATE POLICY ab_experiments_service_role_all ON public.ab_experiments FOR ALL TO service_role USING (true) WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS ab_arms_service_role_all ON public.ab_arms';
  EXECUTE 'CREATE POLICY ab_arms_service_role_all ON public.ab_arms FOR ALL TO service_role USING (true) WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS ab_assignments_service_role_all ON public.ab_assignments';
  EXECUTE 'CREATE POLICY ab_assignments_service_role_all ON public.ab_assignments FOR ALL TO service_role USING (true) WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS ab_exposures_service_role_all ON public.ab_exposures';
  EXECUTE 'CREATE POLICY ab_exposures_service_role_all ON public.ab_exposures FOR ALL TO service_role USING (true) WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS ab_outcomes_service_role_all ON public.ab_outcomes';
  EXECUTE 'CREATE POLICY ab_outcomes_service_role_all ON public.ab_outcomes FOR ALL TO service_role USING (true) WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS ab_experiments_read ON public.ab_experiments';
  EXECUTE 'CREATE POLICY ab_experiments_read ON public.ab_experiments FOR SELECT TO authenticated USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS ab_arms_read ON public.ab_arms';
  EXECUTE 'CREATE POLICY ab_arms_read ON public.ab_arms FOR SELECT TO authenticated USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS ab_assignments_read ON public.ab_assignments';
  EXECUTE 'CREATE POLICY ab_assignments_read ON public.ab_assignments FOR SELECT TO authenticated USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS ab_exposures_read ON public.ab_exposures';
  EXECUTE 'CREATE POLICY ab_exposures_read ON public.ab_exposures FOR SELECT TO authenticated USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS ab_outcomes_read ON public.ab_outcomes';
  EXECUTE 'CREATE POLICY ab_outcomes_read ON public.ab_outcomes FOR SELECT TO authenticated USING (true)';
END;
$$;

GRANT ALL ON public.ab_experiments TO service_role;
GRANT ALL ON public.ab_arms TO service_role;
GRANT ALL ON public.ab_assignments TO service_role;
GRANT ALL ON public.ab_exposures TO service_role;
GRANT ALL ON public.ab_outcomes TO service_role;
GRANT SELECT ON public.ab_experiments TO authenticated;
GRANT SELECT ON public.ab_arms TO authenticated;
GRANT SELECT ON public.ab_assignments TO authenticated;
GRANT SELECT ON public.ab_exposures TO authenticated;
GRANT SELECT ON public.ab_outcomes TO authenticated;
