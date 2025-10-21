-- Migration: Create Onboarding Progress table
-- Phase: 9 (Onboarding)
-- Created: 2025-10-21
-- Task: DATA-012
-- Dependencies: None

-- Create table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  shop_domain TEXT NOT NULL,
  
  -- Step tracking
  step_key TEXT NOT NULL,  -- e.g., 'connect_shopify', 'configure_inventory', 'first_approval'
  step_category TEXT NOT NULL,  -- 'setup', 'configuration', 'first_use'
  step_order INT NOT NULL,  -- Display order
  
  -- Status
  status TEXT NOT NULL DEFAULT 'not_started',  -- 'not_started', 'in_progress', 'completed', 'skipped'
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  
  -- Progress data
  attempts INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,  -- Aggregate time spent on this step
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ',
  
  UNIQUE(user_id, shop_domain, step_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_user_shop 
ON onboarding_progress(user_id, shop_domain, step_order);

CREATE INDEX IF NOT EXISTS idx_onboarding_status 
ON onboarding_progress(status);

CREATE INDEX IF NOT EXISTS idx_onboarding_completed 
ON onboarding_progress(completed_at DESC) 
WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_onboarding_project 
ON onboarding_progress(project);

-- Enable RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own onboarding progress"
  ON onboarding_progress
  TO authenticated
  USING ((SELECT auth.uid())::text = user_id);

-- Update statistics
ANALYZE onboarding_progress;


