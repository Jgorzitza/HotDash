-- Migration: Create Ad Performance table
-- Phase: 7-8 (Growth)
-- Created: 2025-10-21
-- Task: DATA-011
-- Dependencies: ad_campaigns table

-- Create table
CREATE TABLE IF NOT EXISTS ad_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Core metrics
  impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  
  -- Financial metrics
  cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Calculated metrics (stored for quick access)
  ctr DECIMAL(5, 2),  -- Click-through rate (clicks/impressions * 100)
  cpc DECIMAL(10, 2),  -- Cost per click (cost/clicks)
  cpa DECIMAL(10, 2),  -- Cost per acquisition (cost/conversions)
  roas DECIMAL(8, 2),  -- Return on ad spend (revenue/cost)
  
  -- Additional metrics
  avg_position DECIMAL(4, 2),  -- Average ad position
  quality_score DECIMAL(3, 1),  -- Google Ads quality score
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ad_performance_campaign_date 
ON ad_performance(campaign_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_ad_performance_shop_date 
ON ad_performance(shop_domain, date DESC);

CREATE INDEX IF NOT EXISTS idx_ad_performance_roas 
ON ad_performance(roas DESC) 
WHERE roas IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ad_performance_project 
ON ad_performance(project);

-- Enable RLS
ALTER TABLE ad_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their shop ad performance"
  ON ad_performance FOR SELECT
  TO authenticated
  USING (shop_domain = current_setting('app.current_shop', true));

CREATE POLICY "System can insert ad performance"
  ON ad_performance FOR INSERT
  TO authenticated
  WITH CHECK (shop_domain = current_setting('app.current_shop', true));

-- Update statistics
ANALYZE ad_performance;

