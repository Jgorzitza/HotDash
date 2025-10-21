-- Migration: Create Experiments table
-- Phase: 10-13 (Advanced)
-- Created: 2025-10-21
-- Task: DATA-013
-- Dependencies: None

-- Create table
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  
  -- Experiment definition
  experiment_key TEXT NOT NULL,  -- Unique identifier for code reference
  experiment_name TEXT NOT NULL,
  hypothesis TEXT,  -- What we're testing
  description TEXT,
  
  -- Configuration
  variants JSONB NOT NULL,  -- Array of variant definitions [{key, name, weight, config}]
  traffic_allocation DECIMAL(5, 2) DEFAULT 100.00,  -- % of traffic included
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft', 'running', 'paused', 'completed'
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Target metrics
  primary_metric TEXT,  -- e.g., 'conversion_rate', 'revenue_per_user'
  secondary_metrics TEXT[],
  
  -- Sample size
  target_sample_size INT,
  current_sample_size INT DEFAULT 0,
  
  -- Results (populated when experiment completes)
  winning_variant TEXT,
  confidence_level DECIMAL(5, 2),  -- Statistical confidence (e.g., 95.00)
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ',
  
  UNIQUE(shop_domain, experiment_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_experiments_shop_status 
ON experiments(shop_domain, status);

CREATE INDEX IF NOT EXISTS idx_experiments_key 
ON experiments(experiment_key);

CREATE INDEX IF NOT EXISTS idx_experiments_dates 
ON experiments(started_at, ended_at);

CREATE INDEX IF NOT EXISTS idx_experiments_project 
ON experiments(project);

-- Enable RLS
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their shop experiments"
  ON experiments
  TO authenticated
  USING (shop_domain = current_setting('app.current_shop', true));

-- Update statistics
ANALYZE experiments;

