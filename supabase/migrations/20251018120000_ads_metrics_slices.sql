-- Ads Metrics Data Model & Slice Rollups
-- Date: 2025-10-18
-- Owner: data
-- Purpose: Provide Supabase-backed aggregates for Ads dashboard slices B & C.

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- ============================================================================
-- Base Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ads_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  platform TEXT NOT NULL,
  campaign TEXT,
  ad_group TEXT,
  daily_budget NUMERIC(14,2),
  spend NUMERIC(14,2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  revenue NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.ads_metrics_daily IS
  'Daily ads metrics ingested from Google/Meta used for dashboard pacing and attribution slices.';

CREATE INDEX IF NOT EXISTS idx_ads_metrics_daily_date_platform
  ON public.ads_metrics_daily (metric_date DESC, platform);

CREATE INDEX IF NOT EXISTS idx_ads_metrics_daily_campaign
  ON public.ads_metrics_daily (campaign);

-- ============================================================================
-- Slice B: Budget Pacing Rollup
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS public.ads_slice_b_rollup;

CREATE MATERIALIZED VIEW public.ads_slice_b_rollup AS
SELECT
  metric_date,
  platform,
  campaign,
  SUM(spend) AS spend,
  SUM(daily_budget) AS daily_budget,
  CASE
    WHEN SUM(daily_budget) > 0 THEN ROUND((SUM(spend) / SUM(daily_budget)) * 100, 2)
    ELSE NULL
  END AS pacing_pct,
  SUM(clicks) AS clicks,
  SUM(conversions) AS conversions,
  SUM(revenue) AS revenue
FROM public.ads_metrics_daily
GROUP BY metric_date, platform, campaign;

CREATE INDEX IF NOT EXISTS idx_ads_slice_b_rollup_metric_date
  ON public.ads_slice_b_rollup (metric_date DESC);

GRANT SELECT ON public.ads_slice_b_rollup TO authenticated, service_role;

-- ============================================================================
-- Slice C: Attribution Rollup
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS public.ads_slice_c_attribution;

CREATE MATERIALIZED VIEW public.ads_slice_c_attribution AS
SELECT
  platform,
  campaign,
  SUM(spend) AS spend,
  SUM(revenue) AS revenue,
  SUM(conversions) AS conversions,
  CASE
    WHEN SUM(spend) > 0 THEN ROUND(SUM(revenue) / SUM(spend), 2)
    ELSE NULL
  END AS roas,
  CASE
    WHEN SUM(conversions) > 0 THEN ROUND(SUM(spend) / SUM(conversions), 2)
    ELSE NULL
  END AS cpa,
  CASE
    WHEN SUM(clicks) > 0 THEN ROUND((SUM(conversions)::NUMERIC / SUM(clicks)) * 100, 2)
    ELSE NULL
  END AS conversion_rate_pct,
  SUM(clicks) AS clicks
FROM public.ads_metrics_daily
GROUP BY platform, campaign;

GRANT SELECT ON public.ads_slice_c_attribution TO authenticated, service_role;

-- ============================================================================
-- Backfill RPC helpers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.ads_slice_a_refresh()
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Slice A currently hydrated via ingestion pipeline; nothing to refresh.
  RETURN NOW();
END;
$$;

COMMENT ON FUNCTION public.ads_slice_a_refresh IS
  'Placeholder refresh helper so automation can run without failing when Supabase is not yet provisioned.';

CREATE OR REPLACE FUNCTION public.ads_slice_b_rollup_refresh()
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.ads_slice_b_rollup;
  RETURN NOW();
END;
$$;

COMMENT ON FUNCTION public.ads_slice_b_rollup_refresh IS
  'Refreshes the materialized view used for Ads Slice B pacing calculations.';

CREATE OR REPLACE FUNCTION public.ads_slice_c_refresh()
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.ads_slice_c_attribution;
  RETURN NOW();
END;
$$;

COMMENT ON FUNCTION public.ads_slice_c_refresh IS
  'Refreshes the materialized view used for Ads Slice C attribution metrics.';

GRANT EXECUTE ON FUNCTION public.ads_slice_a_refresh TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ads_slice_b_rollup_refresh TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ads_slice_c_refresh TO authenticated, service_role;
