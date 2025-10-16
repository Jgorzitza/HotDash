-- Ads Supabase RPC Functions
-- Owner: ads agent
-- Date: 2025-10-16
-- Version: 1.0

-- Function: Get aggregated performance for date range
CREATE OR REPLACE FUNCTION get_ads_performance_range(
  start_date DATE,
  end_date DATE,
  filter_platform TEXT DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  platform TEXT,
  total_ad_spend DECIMAL,
  total_revenue DECIMAL,
  aggregated_roas DECIMAL,
  total_impressions BIGINT,
  total_clicks BIGINT,
  total_conversions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.date,
    a.platform,
    a.total_ad_spend,
    a.total_revenue,
    a.aggregated_roas,
    a.total_impressions,
    a.total_clicks,
    a.total_conversions
  FROM ads_daily_aggregations a
  WHERE a.date >= start_date
    AND a.date <= end_date
    AND (filter_platform IS NULL OR a.platform = filter_platform)
  ORDER BY a.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get top performing campaigns
CREATE OR REPLACE FUNCTION get_top_campaigns(
  limit_count INTEGER DEFAULT 10,
  filter_platform TEXT DEFAULT NULL,
  min_roas DECIMAL DEFAULT 0
)
RETURNS TABLE (
  campaign_id TEXT,
  campaign_name TEXT,
  platform TEXT,
  roas DECIMAL,
  revenue DECIMAL,
  ad_spend DECIMAL,
  conversions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (s.campaign_id)
    s.campaign_id,
    s.campaign_name,
    s.platform,
    s.roas,
    s.revenue,
    s.ad_spend,
    s.conversions
  FROM ads_campaign_snapshots s
  WHERE s.roas >= min_roas
    AND (filter_platform IS NULL OR s.platform = filter_platform)
  ORDER BY s.campaign_id, s.snapshot_date DESC, s.roas DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get pending recommendations
CREATE OR REPLACE FUNCTION get_pending_recommendations(
  filter_priority TEXT DEFAULT NULL
)
RETURNS TABLE (
  recommendation_id TEXT,
  type TEXT,
  priority TEXT,
  campaign_name TEXT,
  platform TEXT,
  title TEXT,
  confidence INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.recommendation_id,
    r.type,
    r.priority,
    r.campaign_name,
    r.platform,
    r.title,
    r.confidence,
    r.created_at
  FROM ads_recommendations r
  WHERE r.status = 'pending'
    AND (filter_priority IS NULL OR r.priority = filter_priority)
  ORDER BY
    CASE r.priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    r.confidence DESC,
    r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get active anomalies
CREATE OR REPLACE FUNCTION get_active_anomalies(
  filter_severity TEXT DEFAULT NULL
)
RETURNS TABLE (
  alert_id TEXT,
  type TEXT,
  severity TEXT,
  campaign_name TEXT,
  platform TEXT,
  message TEXT,
  detected_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.alert_id,
    a.type,
    a.severity,
    a.campaign_name,
    a.platform,
    a.message,
    a.detected_at
  FROM ads_anomalies a
  WHERE a.status = 'open'
    AND (filter_severity IS NULL OR a.severity = filter_severity)
  ORDER BY
    CASE a.severity
      WHEN 'critical' THEN 1
      WHEN 'warning' THEN 2
      WHEN 'info' THEN 3
    END,
    a.detected_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Approve recommendation
CREATE OR REPLACE FUNCTION approve_recommendation(
  rec_id TEXT,
  approver TEXT,
  feedback_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ads_recommendations
  SET
    status = 'approved',
    approved_by = approver,
    approved_at = NOW(),
    feedback = feedback_text
  WHERE recommendation_id = rec_id
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Reject recommendation
CREATE OR REPLACE FUNCTION reject_recommendation(
  rec_id TEXT,
  approver TEXT,
  feedback_text TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ads_recommendations
  SET
    status = 'rejected',
    approved_by = approver,
    approved_at = NOW(),
    feedback = feedback_text
  WHERE recommendation_id = rec_id
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Acknowledge anomaly
CREATE OR REPLACE FUNCTION acknowledge_anomaly(
  anomaly_id TEXT,
  acknowledger TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ads_anomalies
  SET
    status = 'acknowledged',
    acknowledged_by = acknowledger,
    acknowledged_at = NOW()
  WHERE alert_id = anomaly_id
    AND status = 'open';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Resolve anomaly
CREATE OR REPLACE FUNCTION resolve_anomaly(
  anomaly_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ads_anomalies
  SET
    status = 'resolved',
    resolved_at = NOW()
  WHERE alert_id = anomaly_id
    AND status IN ('open', 'acknowledged');
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get platform comparison
CREATE OR REPLACE FUNCTION get_platform_comparison(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  platform TEXT,
  total_ad_spend DECIMAL,
  total_revenue DECIMAL,
  avg_roas DECIMAL,
  total_campaigns INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.platform,
    SUM(a.total_ad_spend) as total_ad_spend,
    SUM(a.total_revenue) as total_revenue,
    AVG(a.aggregated_roas) as avg_roas,
    SUM(a.total_campaigns) as total_campaigns
  FROM ads_daily_aggregations a
  WHERE a.date >= start_date
    AND a.date <= end_date
    AND a.platform != 'all'
  GROUP BY a.platform
  ORDER BY avg_roas DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON FUNCTION get_ads_performance_range IS 'Get aggregated ad performance for a date range';
COMMENT ON FUNCTION get_top_campaigns IS 'Get top performing campaigns by ROAS';
COMMENT ON FUNCTION get_pending_recommendations IS 'Get pending recommendations awaiting approval';
COMMENT ON FUNCTION get_active_anomalies IS 'Get active anomalies that need attention';
COMMENT ON FUNCTION approve_recommendation IS 'Approve a pending recommendation';
COMMENT ON FUNCTION reject_recommendation IS 'Reject a pending recommendation';
COMMENT ON FUNCTION acknowledge_anomaly IS 'Acknowledge an anomaly alert';
COMMENT ON FUNCTION resolve_anomaly IS 'Mark an anomaly as resolved';
COMMENT ON FUNCTION get_platform_comparison IS 'Compare performance across platforms';

