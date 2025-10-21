-- Migration: Create Social Analytics table
-- Phase: 7-8 (Growth)
-- Created: 2025-10-21
-- Task: DATA-011
-- Dependencies: social_posts table (already exists)

-- Create table
CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  platform TEXT NOT NULL,  -- 'facebook', 'instagram', 'twitter', 'linkedin'
  
  -- Engagement metrics
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  saves INT DEFAULT 0,
  
  -- Reach metrics
  reach INT DEFAULT 0,
  impressions INT DEFAULT 0,
  
  -- Click metrics
  link_clicks INT DEFAULT 0,
  profile_visits INT DEFAULT 0,
  
  -- Engagement rate (calculated)
  engagement_rate DECIMAL(5, 2),  -- (likes + comments + shares) / reach * 100
  
  -- Video-specific (if applicable)
  video_views INT DEFAULT 0,
  avg_watch_time DECIMAL(8, 2),  -- seconds
  
  -- Tracking
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_analytics_post 
ON social_analytics(social_post_id, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_analytics_shop_platform 
ON social_analytics(shop_domain, platform, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_analytics_engagement 
ON social_analytics(engagement_rate DESC) 
WHERE engagement_rate IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_social_analytics_project 
ON social_analytics(project);

-- Enable RLS
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their shop social analytics"
  ON social_analytics FOR SELECT
  TO authenticated
  USING (shop_domain = current_setting('app.current_shop', true));

CREATE POLICY "System can insert social analytics"
  ON social_analytics FOR INSERT
  TO authenticated
  WITH CHECK (shop_domain = current_setting('app.current_shop', true));

-- Update statistics
ANALYZE social_analytics;


