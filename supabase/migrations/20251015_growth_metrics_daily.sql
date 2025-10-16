-- Growth Metrics: Daily Aggregation Schema
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Task: 6 - Growth Metrics Schema

-- ============================================================================
-- Table: growth_metrics_daily
-- Purpose: Daily aggregation of SEO, ads, and content performance
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.growth_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  shop_domain TEXT NOT NULL DEFAULT 'hotrodan.myshopify.com',
  
  -- SEO metrics
  organic_sessions INTEGER DEFAULT 0,
  organic_pageviews INTEGER DEFAULT 0,
  organic_bounce_rate_pct NUMERIC(5,2),
  avg_session_duration_seconds INTEGER,
  pages_indexed INTEGER,
  avg_page_rank NUMERIC(5,2),
  
  -- Traffic anomalies
  traffic_anomalies_count INTEGER DEFAULT 0,
  pages_with_drops_count INTEGER DEFAULT 0,
  avg_traffic_change_pct NUMERIC(5,2),
  
  -- Ads metrics
  ad_spend NUMERIC(10,2) DEFAULT 0,
  ad_impressions INTEGER DEFAULT 0,
  ad_clicks INTEGER DEFAULT 0,
  ad_ctr_pct NUMERIC(5,2),
  ad_conversions INTEGER DEFAULT 0,
  ad_conversion_rate_pct NUMERIC(5,2),
  ad_roas NUMERIC(5,2),
  
  -- Content metrics
  blog_posts_published INTEGER DEFAULT 0,
  blog_pageviews INTEGER DEFAULT 0,
  blog_avg_time_on_page_seconds INTEGER,
  blog_social_shares INTEGER DEFAULT 0,
  
  -- Email metrics
  emails_sent INTEGER DEFAULT 0,
  email_open_rate_pct NUMERIC(5,2),
  email_click_rate_pct NUMERIC(5,2),
  email_conversions INTEGER DEFAULT 0,
  
  -- Social metrics
  social_posts_count INTEGER DEFAULT 0,
  social_impressions INTEGER DEFAULT 0,
  social_engagement_count INTEGER DEFAULT 0,
  social_engagement_rate_pct NUMERIC(5,2),
  social_clicks INTEGER DEFAULT 0,
  
  -- Conversion metrics
  total_conversions INTEGER DEFAULT 0,
  conversion_rate_pct NUMERIC(5,2),
  revenue_from_organic NUMERIC(10,2) DEFAULT 0,
  revenue_from_ads NUMERIC(10,2) DEFAULT 0,
  revenue_from_social NUMERIC(10,2) DEFAULT 0,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT growth_metrics_daily_unique_date UNIQUE (metric_date, shop_domain),
  CONSTRAINT growth_metrics_daily_roas_check CHECK (ad_roas >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS growth_metrics_daily_date_idx ON public.growth_metrics_daily (metric_date DESC);
CREATE INDEX IF NOT EXISTS growth_metrics_daily_shop_idx ON public.growth_metrics_daily (shop_domain);
CREATE INDEX IF NOT EXISTS growth_metrics_daily_anomalies_idx ON public.growth_metrics_daily (traffic_anomalies_count) 
  WHERE traffic_anomalies_count > 0;
CREATE INDEX IF NOT EXISTS growth_metrics_daily_roas_idx ON public.growth_metrics_daily (ad_roas DESC);

-- Comments
COMMENT ON TABLE public.growth_metrics_daily IS 'Daily aggregation of SEO, ads, and content performance metrics';
COMMENT ON COLUMN public.growth_metrics_daily.metric_date IS 'Date of metrics aggregation';
COMMENT ON COLUMN public.growth_metrics_daily.organic_sessions IS 'Organic search sessions';
COMMENT ON COLUMN public.growth_metrics_daily.traffic_anomalies_count IS 'Number of pages with traffic anomalies';
COMMENT ON COLUMN public.growth_metrics_daily.ad_roas IS 'Return on ad spend (revenue / spend)';
COMMENT ON COLUMN public.growth_metrics_daily.social_engagement_rate_pct IS 'Social media engagement rate';

-- Trigger for updated_at
CREATE TRIGGER trg_growth_metrics_daily_updated_at
BEFORE UPDATE ON public.growth_metrics_daily
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.growth_metrics_daily ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role full access
CREATE POLICY growth_metrics_daily_service_role
  ON public.growth_metrics_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can read all
CREATE POLICY growth_metrics_daily_read_all
  ON public.growth_metrics_daily
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Service role can insert/update
CREATE POLICY growth_metrics_daily_insert_service
  ON public.growth_metrics_daily
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY growth_metrics_daily_update_service
  ON public.growth_metrics_daily
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 4: No deletes (audit trail)
CREATE POLICY growth_metrics_daily_no_delete
  ON public.growth_metrics_daily
  FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================================
-- Permissions
-- ============================================================================

GRANT SELECT ON public.growth_metrics_daily TO authenticated;
GRANT ALL ON public.growth_metrics_daily TO service_role;

