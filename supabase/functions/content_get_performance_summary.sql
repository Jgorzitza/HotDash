-- RPC Function: Get Content Performance Summary
-- Returns aggregated metrics for specified date range
-- Author: content agent
-- Date: 2025-10-19

CREATE OR REPLACE FUNCTION public.content_get_performance_summary(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_platform TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_posts BIGINT,
  avg_engagement_rate DECIMAL,
  avg_click_through_rate DECIMAL,
  total_impressions BIGINT,
  total_clicks BIGINT,
  total_conversions BIGINT,
  total_revenue DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total_posts,
    AVG(engagement_rate)::DECIMAL(5,2) AS avg_engagement_rate,
    AVG(click_through_rate)::DECIMAL(5,2) AS avg_click_through_rate,
    SUM(impressions)::BIGINT AS total_impressions,
    SUM(clicks)::BIGINT AS total_clicks,
    SUM(conversions)::BIGINT AS total_conversions,
    SUM(revenue)::DECIMAL(10,2) AS total_revenue
  FROM public.content_performance
  WHERE published_at BETWEEN p_start_date AND p_end_date
    AND (p_platform IS NULL OR platform = p_platform);
END;
$$;

GRANT EXECUTE ON FUNCTION public.content_get_performance_summary(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO authenticated;

COMMENT ON FUNCTION public.content_get_performance_summary IS 'Get aggregated content performance for date range';

