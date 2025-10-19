-- CWV to Revenue telemetry schema
-- Date: 2025-10-19
-- Alignment: docs/specs/hitl/seo-telemetry.md (CWV→$$ mapping) and docs/specs/hitl/main-dashboard.action-dock.md (CWV → Revenue)

CREATE TABLE IF NOT EXISTS public.seo_cwv_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  normalized_path TEXT NOT NULL,
  device_category TEXT NOT NULL CHECK (device_category IN ('desktop','mobile','tablet','unknown')),
  metric_driver TEXT NOT NULL CHECK (metric_driver IN ('LCP','INP','CLS')),
  rank_band TEXT CHECK (rank_band IN ('1-3','4-6','7-10','>10')),
  sessions_delta INTEGER,
  conversion_rate NUMERIC(6,4),
  average_order_value NUMERIC(12,2),
  expected_revenue_lift NUMERIC(14,2) NOT NULL,
  confidence NUMERIC(4,3),
  ease_score NUMERIC(4,3),
  brand_excluded BOOLEAN NOT NULL DEFAULT FALSE,
  low_signal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT seo_cwv_opportunities_unique UNIQUE (report_date, normalized_path, device_category, metric_driver)
);

CREATE INDEX IF NOT EXISTS seo_cwv_opportunities_report_date_idx
  ON public.seo_cwv_opportunities (report_date DESC);

CREATE INDEX IF NOT EXISTS seo_cwv_opportunities_lift_idx
  ON public.seo_cwv_opportunities (expected_revenue_lift DESC);

CREATE INDEX IF NOT EXISTS seo_cwv_opportunities_path_idx
  ON public.seo_cwv_opportunities (normalized_path);

CREATE TABLE IF NOT EXISTS public.seo_cwv_backtests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  normalized_path TEXT NOT NULL,
  device_category TEXT NOT NULL CHECK (device_category IN ('desktop','mobile','tablet','unknown')),
  metric_driver TEXT NOT NULL CHECK (metric_driver IN ('LCP','INP','CLS')),
  expected_revenue_lift NUMERIC(14,2) NOT NULL,
  observed_revenue_lift NUMERIC(14,2),
  absolute_error NUMERIC(14,2),
  mae_window_days INT,
  sample_sessions INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS seo_cwv_backtests_report_date_idx
  ON public.seo_cwv_backtests (report_date DESC);

CREATE INDEX IF NOT EXISTS seo_cwv_backtests_path_idx
  ON public.seo_cwv_backtests (normalized_path);

-- Updated_at trigger reuse if available
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'set_updated_at'
      AND pg_function_is_visible(oid)
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_seo_cwv_opportunities_updated_at ON public.seo_cwv_opportunities';
    EXECUTE 'CREATE TRIGGER trg_seo_cwv_opportunities_updated_at
              BEFORE UPDATE ON public.seo_cwv_opportunities
              FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at()';
  END IF;
END;
$$;

-- Enable RLS and baseline policies
ALTER TABLE public.seo_cwv_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_cwv_backtests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS seo_cwv_opportunities_service_role_all ON public.seo_cwv_opportunities';
  EXECUTE 'CREATE POLICY seo_cwv_opportunities_service_role_all
             ON public.seo_cwv_opportunities
             FOR ALL TO service_role
             USING (true)
             WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS seo_cwv_backtests_service_role_all ON public.seo_cwv_backtests';
  EXECUTE 'CREATE POLICY seo_cwv_backtests_service_role_all
             ON public.seo_cwv_backtests
             FOR ALL TO service_role
             USING (true)
             WITH CHECK (true)';

  EXECUTE 'DROP POLICY IF EXISTS seo_cwv_opportunities_read ON public.seo_cwv_opportunities';
  EXECUTE 'CREATE POLICY seo_cwv_opportunities_read
             ON public.seo_cwv_opportunities
             FOR SELECT TO authenticated
             USING (true)';

  EXECUTE 'DROP POLICY IF EXISTS seo_cwv_backtests_read ON public.seo_cwv_backtests';
  EXECUTE 'CREATE POLICY seo_cwv_backtests_read
             ON public.seo_cwv_backtests
             FOR SELECT TO authenticated
             USING (true)';
END;
$$;

GRANT ALL ON public.seo_cwv_opportunities TO service_role;
GRANT ALL ON public.seo_cwv_backtests TO service_role;
GRANT SELECT ON public.seo_cwv_opportunities TO authenticated;
GRANT SELECT ON public.seo_cwv_backtests TO authenticated;
