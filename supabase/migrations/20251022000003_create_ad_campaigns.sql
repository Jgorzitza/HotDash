-- Migration: Create Ad Campaigns table
-- Phase: 7-8 (Growth)
-- Created: 2025-10-21
-- Task: DATA-011
-- Dependencies: None

-- Create table
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  
  -- Campaign identification
  platform_campaign_id TEXT NOT NULL,  -- Google Ads campaign ID
  platform TEXT NOT NULL DEFAULT 'google_ads',  -- 'google_ads', 'facebook_ads', etc.
  campaign_name TEXT NOT NULL,
  campaign_status TEXT NOT NULL,  -- 'active', 'paused', 'ended'
  
  -- Budget & bidding
  daily_budget DECIMAL(12, 2),
  total_budget DECIMAL(12, 2),
  bid_strategy TEXT,  -- 'manual_cpc', 'target_cpa', 'maximize_conversions'
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Targeting
  target_locations TEXT[],
  target_keywords TEXT[],
  
  -- Tracking
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_shop_status 
ON ad_campaigns(shop_domain, campaign_status);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_platform_id 
ON ad_campaigns(platform_campaign_id);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_dates 
ON ad_campaigns(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_project 
ON ad_campaigns(project);

-- Enable RLS
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their shop ad campaigns"
  ON ad_campaigns
  TO authenticated
  USING (shop_domain = current_setting('app.current_shop', true));

-- Update statistics
ANALYZE ad_campaigns;


