-- Migration: Create CEO Briefings table
-- Phase: 10-13 (Advanced)
-- Created: 2025-10-21
-- Task: DATA-013
-- Dependencies: None

-- Create table
CREATE TABLE IF NOT EXISTS ceo_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  
  -- Briefing metadata
  briefing_type TEXT NOT NULL,  -- 'daily', 'weekly', 'monthly', 'on_demand'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Content
  title TEXT NOT NULL,
  executive_summary TEXT NOT NULL,  -- High-level overview
  key_metrics JSONB NOT NULL,  -- {revenue, orders, aov, etc.}
  insights JSONB NOT NULL,  -- Array of insight objects
  recommendations JSONB,  -- Array of recommended actions
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft', 'generated', 'reviewed', 'archived'
  generated_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  
  -- Generation metadata
  generation_model TEXT,  -- e.g., 'gpt-4', 'claude-3'
  generation_tokens INT,
  generation_time_ms INT,
  
  -- Feedback
  rating INT CHECK (rating BETWEEN 1 AND 5),
  feedback_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ceo_briefings_shop_type_period 
ON ceo_briefings(shop_domain, briefing_type, period_end DESC);

CREATE INDEX IF NOT EXISTS idx_ceo_briefings_status 
ON ceo_briefings(status);

CREATE INDEX IF NOT EXISTS idx_ceo_briefings_generated 
ON ceo_briefings(generated_at DESC) 
WHERE generated_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ceo_briefings_rating 
ON ceo_briefings(rating DESC) 
WHERE rating IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ceo_briefings_project 
ON ceo_briefings(project);

-- Enable RLS
ALTER TABLE ceo_briefings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "CEOs can manage their shop briefings"
  ON ceo_briefings
  TO authenticated
  USING (shop_domain = current_setting('app.current_shop', true));

-- Update statistics
ANALYZE ceo_briefings;


