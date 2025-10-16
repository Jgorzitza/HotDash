-- Additional RPC Functions for Growth Metrics
-- Priority: P0 - Launch Critical
-- Owner: data
-- Date: 2025-10-15
-- Tasks: 8, 9, 10 - SEO anomalies, ads performance, content engagement

-- ============================================================================
-- Task 8: RPC - SEO Anomalies Feed
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_seo_anomalies_feed(
  p_limit INTEGER DEFAULT 50,
  p_min_drop_pct NUMERIC DEFAULT -20
)
RETURNS TABLE (
  page_url TEXT,
  traffic_change_pct NUMERIC,
  current_sessions INTEGER,
  previous_sessions INTEGER,
  detected_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (value->>'page_url')::TEXT as page_url,
    (value->>'traffic_change_pct')::NUMERIC as traffic_change_pct,
    (value->>'current_sessions')::INTEGER as current_sessions,
    (value->>'previous_sessions')::INTEGER as previous_sessions,
    created_at as detected_at
  FROM facts
  WHERE topic = 'analytics.traffic'
    AND (value->>'traffic_change_pct')::NUMERIC < p_min_drop_pct
    AND created_at >= NOW() - INTERVAL '7 days'
  ORDER BY (value->>'traffic_change_pct')::NUMERIC ASC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_seo_anomalies_feed TO authenticated, service_role;
COMMENT ON FUNCTION public.get_seo_anomalies_feed IS 'Returns pages with significant traffic drops (default > 20%)';

-- ============================================================================
-- Task 9: RPC - Ads Performance Aggregates
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_ads_performance(
  p_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_spend', COALESCE(SUM(ad_spend), 0),
    'total_impressions', COALESCE(SUM(ad_impressions), 0),
    'total_clicks', COALESCE(SUM(ad_clicks), 0),
    'avg_ctr_pct', COALESCE(AVG(ad_ctr_pct), 0),
    'total_conversions', COALESCE(SUM(ad_conversions), 0),
    'avg_conversion_rate_pct', COALESCE(AVG(ad_conversion_rate_pct), 0),
    'avg_roas', COALESCE(AVG(ad_roas), 0),
    'total_revenue', COALESCE(SUM(revenue_from_ads), 0),
    'period_days', p_days,
    'last_updated', NOW()
  )
  INTO v_result
  FROM growth_metrics_daily
  WHERE metric_date >= CURRENT_DATE - p_days;
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ads_performance TO authenticated, service_role;
COMMENT ON FUNCTION public.get_ads_performance IS 'Returns aggregated ads performance metrics for specified period';

-- ============================================================================
-- Task 10: RPC - Content Engagement Aggregates
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_content_engagement(
  p_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'blog_posts_published', COALESCE(SUM(blog_posts_published), 0),
    'total_blog_pageviews', COALESCE(SUM(blog_pageviews), 0),
    'avg_time_on_page_seconds', COALESCE(AVG(blog_avg_time_on_page_seconds), 0),
    'total_social_shares', COALESCE(SUM(blog_social_shares), 0),
    'emails_sent', COALESCE(SUM(emails_sent), 0),
    'avg_email_open_rate_pct', COALESCE(AVG(email_open_rate_pct), 0),
    'avg_email_click_rate_pct', COALESCE(AVG(email_click_rate_pct), 0),
    'email_conversions', COALESCE(SUM(email_conversions), 0),
    'social_posts', COALESCE(SUM(social_posts_count), 0),
    'social_impressions', COALESCE(SUM(social_impressions), 0),
    'social_engagement', COALESCE(SUM(social_engagement_count), 0),
    'avg_social_engagement_rate_pct', COALESCE(AVG(social_engagement_rate_pct), 0),
    'period_days', p_days,
    'last_updated', NOW()
  )
  INTO v_result
  FROM growth_metrics_daily
  WHERE metric_date >= CURRENT_DATE - p_days;
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_content_engagement TO authenticated, service_role;
COMMENT ON FUNCTION public.get_content_engagement IS 'Returns aggregated content and social engagement metrics';

-- ============================================================================
-- Additional Helper RPC: Approvals List with Filters
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_approvals_list(
  p_state TEXT DEFAULT NULL,
  p_kind TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id BIGINT,
  kind TEXT,
  state TEXT,
  summary TEXT,
  created_by TEXT,
  reviewer TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.kind,
    a.state,
    a.summary,
    a.created_by,
    a.reviewer,
    a.created_at,
    a.updated_at
  FROM approvals a
  WHERE (p_state IS NULL OR a.state = p_state)
    AND (p_kind IS NULL OR a.kind = p_kind)
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_approvals_list TO authenticated, service_role;
COMMENT ON FUNCTION public.get_approvals_list IS 'Returns filtered list of approvals with pagination';

