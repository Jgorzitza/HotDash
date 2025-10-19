-- Ads Metrics Daily Table Migration
-- Created: 2025-10-19
-- Purpose: Store daily advertising campaign metrics for Meta and Google Ads

-- Create ads_metrics_daily table
CREATE TABLE IF NOT EXISTS ads_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google', 'unknown')),
  date DATE NOT NULL,
  spend DECIMAL(10, 2) NOT NULL DEFAULT 0,
  revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  roas DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cpc DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cpa DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ctr DECIMAL(10, 2) NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ads_metrics_campaign_date 
  ON ads_metrics_daily(campaign_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_ads_metrics_platform_date 
  ON ads_metrics_daily(platform, date DESC);

CREATE INDEX IF NOT EXISTS idx_ads_metrics_date 
  ON ads_metrics_daily(date DESC);

-- Enable Row Level Security
ALTER TABLE ads_metrics_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read all metrics
CREATE POLICY "Allow authenticated read access to ads metrics"
  ON ads_metrics_daily
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Allow service role full access (for backend writes)
CREATE POLICY "Allow service role full access to ads metrics"
  ON ads_metrics_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to ads_metrics_daily
CREATE TRIGGER update_ads_metrics_daily_updated_at
  BEFORE UPDATE ON ads_metrics_daily
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add table comment
COMMENT ON TABLE ads_metrics_daily IS 'Daily advertising campaign metrics from Meta and Google Ads platforms';

-- Add column comments
COMMENT ON COLUMN ads_metrics_daily.campaign_id IS 'Unique identifier for the campaign';
COMMENT ON COLUMN ads_metrics_daily.platform IS 'Ad platform: meta, google, or unknown';
COMMENT ON COLUMN ads_metrics_daily.date IS 'Date of metrics snapshot (YYYY-MM-DD)';
COMMENT ON COLUMN ads_metrics_daily.spend IS 'Total advertising spend in currency';
COMMENT ON COLUMN ads_metrics_daily.revenue IS 'Total revenue generated in currency';
COMMENT ON COLUMN ads_metrics_daily.impressions IS 'Total number of impressions/views';
COMMENT ON COLUMN ads_metrics_daily.clicks IS 'Total number of clicks';
COMMENT ON COLUMN ads_metrics_daily.conversions IS 'Total number of conversions/acquisitions';
COMMENT ON COLUMN ads_metrics_daily.roas IS 'Return on Ad Spend (revenue / spend)';
COMMENT ON COLUMN ads_metrics_daily.cpc IS 'Cost Per Click (spend / clicks)';
COMMENT ON COLUMN ads_metrics_daily.cpa IS 'Cost Per Acquisition (spend / conversions)';
COMMENT ON COLUMN ads_metrics_daily.ctr IS 'Click-Through Rate as percentage';
COMMENT ON COLUMN ads_metrics_daily.conversion_rate IS 'Conversion Rate as percentage';

