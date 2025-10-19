-- Content Performance Schema
-- Stores social media post performance metrics over time
-- Author: content agent
-- Date: 2025-10-19

-- Content Performance Table
CREATE TABLE IF NOT EXISTS public.content_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Post identification
  post_id TEXT NOT NULL,
  publer_post_id TEXT, -- ID from Publer API
  approval_id UUID REFERENCES public.content_approvals(id),
  
  -- Platform
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok')),
  
  -- Post metadata
  post_type TEXT CHECK (post_type IN ('launch', 'evergreen', 'wildcard')),
  fixture_id TEXT, -- Reference to idea pool fixture
  
  -- Publishing
  published_at TIMESTAMPTZ NOT NULL,
  scheduled_at TIMESTAMPTZ,
  
  -- Engagement metrics
  likes INT NOT NULL DEFAULT 0,
  comments INT NOT NULL DEFAULT 0,
  shares INT NOT NULL DEFAULT 0,
  saves INT DEFAULT 0, -- Instagram/TikTok
  
  -- Reach metrics
  impressions INT NOT NULL DEFAULT 0,
  reach INT NOT NULL DEFAULT 0,
  unique_views INT DEFAULT 0,
  
  -- Click metrics
  clicks INT NOT NULL DEFAULT 0,
  link_clicks INT DEFAULT 0,
  profile_clicks INT DEFAULT 0,
  
  -- Conversion metrics (from GA4 correlation)
  conversions INT DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  
  -- Calculated metrics (computed columns)
  engagement_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN impressions > 0 THEN ((likes + comments + shares + COALESCE(saves, 0))::DECIMAL / impressions) * 100
      ELSE 0
    END
  ) STORED,
  
  click_through_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN impressions > 0 THEN (clicks::DECIMAL / impressions) * 100
      ELSE 0
    END
  ) STORED,
  
  conversion_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN clicks > 0 THEN (conversions::DECIMAL / clicks) * 100
      ELSE 0
    END
  ) STORED,
  
  -- Measurement window
  measurement_start TIMESTAMPTZ NOT NULL,
  measurement_end TIMESTAMPTZ NOT NULL,
  
  -- Data source
  data_source TEXT NOT NULL DEFAULT 'publer' CHECK (data_source IN ('publer', 'ga4', 'manual')),
  
  -- Raw data (full API response)
  raw_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_performance_post_id ON public.content_performance(post_id);
CREATE INDEX idx_content_performance_platform ON public.content_performance(platform);
CREATE INDEX idx_content_performance_published_at ON public.content_performance(published_at DESC);
CREATE INDEX idx_content_performance_engagement_rate ON public.content_performance(engagement_rate DESC);
CREATE INDEX idx_content_performance_fixture_id ON public.content_performance(fixture_id);
CREATE INDEX idx_content_performance_measurement_window ON public.content_performance(measurement_start, measurement_end);

-- RLS Policies
ALTER TABLE public.content_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view content performance" ON public.content_performance
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Content agent can insert performance data" ON public.content_performance
  FOR INSERT
  WITH CHECK (true); -- Service account inserts

CREATE POLICY "Content agent can update performance data" ON public.content_performance
  FOR UPDATE
  USING (true);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_content_performance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_performance_updated_at
  BEFORE UPDATE ON public.content_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_content_performance_updated_at();

-- Comments
COMMENT ON TABLE public.content_performance IS 'Social media post performance metrics tracked over time';
COMMENT ON COLUMN public.content_performance.engagement_rate IS 'Calculated: (likes + comments + shares + saves) / impressions * 100';
COMMENT ON COLUMN public.content_performance.click_through_rate IS 'Calculated: clicks / impressions * 100';
COMMENT ON COLUMN public.content_performance.conversion_rate IS 'Calculated: conversions / clicks * 100';

