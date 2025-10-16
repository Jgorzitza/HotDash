-- Ads Supabase Schema
-- Owner: ads agent
-- Date: 2025-10-16
-- Version: 1.0

-- Daily aggregations table
CREATE TABLE IF NOT EXISTS ads_daily_aggregations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok', 'all')),
  total_campaigns INTEGER NOT NULL DEFAULT 0,
  total_ad_spend DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_impressions BIGINT NOT NULL DEFAULT 0,
  total_clicks BIGINT NOT NULL DEFAULT 0,
  total_conversions INTEGER NOT NULL DEFAULT 0,
  aggregated_roas DECIMAL(10, 2) NOT NULL DEFAULT 0,
  average_cpc DECIMAL(10, 2) NOT NULL DEFAULT 0,
  average_cpm DECIMAL(10, 2) NOT NULL DEFAULT 0,
  average_cpa DECIMAL(10, 2) NOT NULL DEFAULT 0,
  aggregated_ctr DECIMAL(10, 2) NOT NULL DEFAULT 0,
  aggregated_conversion_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date, platform)
);

-- Campaign performance snapshots
CREATE TABLE IF NOT EXISTS ads_campaign_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok')),
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed')),
  ad_spend DECIMAL(12, 2) NOT NULL DEFAULT 0,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  roas DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cpc DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cpm DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cpa DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ctr DECIMAL(10, 2) NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, snapshot_date)
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS ads_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('budget_increase', 'budget_decrease', 'pause_campaign', 'new_campaign', 'optimize_targeting', 'refresh_creative', 'adjust_bidding')),
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  campaign_id TEXT,
  campaign_name TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  evidence JSONB NOT NULL,
  action JSONB NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  estimated_impact TEXT NOT NULL CHECK (estimated_impact IN ('high', 'medium', 'low')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'applied')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Anomalies table
CREATE TABLE IF NOT EXISTS ads_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('spend_spike', 'spend_drop', 'roas_drop', 'ctr_drop', 'conversion_drop', 'cpa_spike', 'budget_depleted', 'performance_degradation')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok')),
  metric TEXT NOT NULL,
  current_value DECIMAL(12, 2) NOT NULL,
  expected_value DECIMAL(12, 2) NOT NULL,
  deviation DECIMAL(12, 2) NOT NULL,
  deviation_percent DECIMAL(10, 2) NOT NULL,
  message TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer journeys for attribution
CREATE TABLE IF NOT EXISTS ads_customer_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  touchpoints JSONB NOT NULL,
  conversion_value DECIMAL(12, 2) NOT NULL,
  conversion_timestamp TIMESTAMPTZ NOT NULL,
  journey_duration_days INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ads_daily_aggregations_date ON ads_daily_aggregations(date DESC);
CREATE INDEX IF NOT EXISTS idx_ads_daily_aggregations_platform ON ads_daily_aggregations(platform);
CREATE INDEX IF NOT EXISTS idx_ads_campaign_snapshots_campaign_id ON ads_campaign_snapshots(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ads_campaign_snapshots_date ON ads_campaign_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_ads_recommendations_status ON ads_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ads_recommendations_created_at ON ads_recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_anomalies_status ON ads_anomalies(status);
CREATE INDEX IF NOT EXISTS idx_ads_anomalies_severity ON ads_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_ads_anomalies_detected_at ON ads_anomalies(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_customer_journeys_customer_id ON ads_customer_journeys(customer_id);

-- Row Level Security (RLS)
ALTER TABLE ads_daily_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_campaign_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_customer_journeys ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow authenticated users to read all, write with service role)
CREATE POLICY "Allow authenticated read access" ON ads_daily_aggregations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON ads_campaign_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON ads_recommendations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON ads_anomalies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON ads_customer_journeys FOR SELECT TO authenticated USING (true);

-- Comments
COMMENT ON TABLE ads_daily_aggregations IS 'Daily aggregated ad performance metrics';
COMMENT ON TABLE ads_campaign_snapshots IS 'Point-in-time snapshots of campaign performance';
COMMENT ON TABLE ads_recommendations IS 'AI-generated campaign recommendations with HITL approval';
COMMENT ON TABLE ads_anomalies IS 'Detected performance anomalies and alerts';
COMMENT ON TABLE ads_customer_journeys IS 'Customer touchpoint journeys for attribution analysis';

