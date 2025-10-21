-- Migration: Create SEO Rankings table
-- Phase: 7-8 (Growth)
-- Created: 2025-10-21
-- Task: DATA-011
-- Dependencies: None

-- Create table
CREATE TABLE IF NOT EXISTS seo_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  keyword TEXT NOT NULL,
  
  -- Ranking data
  position INT CHECK (position > 0),
  previous_position INT,
  position_change INT,  -- Calculated: previous_position - position
  
  -- Search metadata
  search_volume INT,  -- Monthly search volume
  search_engine TEXT NOT NULL DEFAULT 'google',  -- 'google', 'bing', etc.
  location TEXT,  -- e.g., 'US', 'CA', 'UK'
  device TEXT,  -- 'desktop', 'mobile'
  
  -- URL data
  ranking_url TEXT,  -- Which page is ranking
  featured_snippet BOOLEAN DEFAULT FALSE,
  
  -- Tracking
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  project TEXT NOT NULL DEFAULT 'occ'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seo_rankings_shop_keyword_tracked 
ON seo_rankings(shop_domain, keyword, tracked_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_rankings_keyword 
ON seo_rankings(keyword);

CREATE INDEX IF NOT EXISTS idx_seo_rankings_position 
ON seo_rankings(position) 
WHERE position <= 100;

CREATE INDEX IF NOT EXISTS idx_seo_rankings_project 
ON seo_rankings(project);

-- Enable RLS
ALTER TABLE seo_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their shop SEO rankings"
  ON seo_rankings FOR SELECT
  TO authenticated
  USING (shop_domain = current_setting('app.current_shop', true));

CREATE POLICY "System can insert SEO rankings"
  ON seo_rankings FOR INSERT
  TO authenticated
  WITH CHECK (shop_domain = current_setting('app.current_shop', true));

-- Update statistics
ANALYZE seo_rankings;

