-- Migration: Create Feature Tours table
-- Phase: 9 (Onboarding)
-- Created: 2025-10-21
-- Task: DATA-012
-- Dependencies: None

-- Create table
CREATE TABLE IF NOT EXISTS feature_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Tour identification
  tour_key TEXT NOT NULL,  -- e.g., 'dashboard_overview', 'approval_queue_intro'
  tour_name TEXT NOT NULL,
  tour_description TEXT,
  
  -- Tour configuration
  steps JSONB NOT NULL,  -- Array of step definitions with selectors, content
  trigger_condition TEXT,  -- 'manual', 'first_visit', 'after_onboarding'
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'started', 'completed', 'dismissed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  current_step INT DEFAULT 0,
  
  -- Engagement
  times_shown INT DEFAULT 0,
  interactions INT DEFAULT 0,  -- Number of clicks/interactions
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ',
  
  UNIQUE(user_id, tour_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feature_tours_user_status 
ON feature_tours(user_id, status);

CREATE INDEX IF NOT EXISTS idx_feature_tours_key 
ON feature_tours(tour_key);

CREATE INDEX IF NOT EXISTS idx_feature_tours_completed 
ON feature_tours(completed_at DESC) 
WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_feature_tours_project 
ON feature_tours(project);

-- Enable RLS
ALTER TABLE feature_tours ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own feature tours"
  ON feature_tours
  TO authenticated
  USING ((SELECT auth.uid())::text = user_id);

-- Update statistics
ANALYZE feature_tours;


