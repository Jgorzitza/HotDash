-- RPC Function: Get Top Performing Posts
-- Returns best performing posts by engagement rate
-- Author: content agent
-- Date: 2025-10-19

CREATE OR REPLACE FUNCTION public.content_get_top_performers(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_limit INT DEFAULT 10,
  p_sort_by TEXT DEFAULT 'engagement'
)
RETURNS TABLE (
  post_id TEXT,
  platform TEXT,
  post_type TEXT,
  published_at TIMESTAMPTZ,
  engagement_rate DECIMAL,
  click_through_rate DECIMAL,
  impressions INT,
  likes INT,
  comments INT,
  shares INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.post_id,
    cp.platform,
    cp.post_type,
    cp.published_at,
    cp.engagement_rate,
    cp.click_through_rate,
    cp.impressions,
    cp.likes,
    cp.comments,
    cp.shares
  FROM public.content_performance cp
  WHERE cp.published_at BETWEEN p_start_date AND p_end_date
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'engagement' THEN cp.engagement_rate
      WHEN p_sort_by = 'clicks' THEN cp.click_through_rate
      WHEN p_sort_by = 'reach' THEN cp.reach::DECIMAL
      ELSE cp.engagement_rate
    END DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.content_get_top_performers(TIMESTAMPTZ, TIMESTAMPTZ, INT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.content_get_top_performers IS 'Get top N performing posts sorted by specified metric';

