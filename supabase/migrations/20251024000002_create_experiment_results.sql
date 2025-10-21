-- Migration: Create Experiment Results table
-- Phase: 10-13 (Advanced)
-- Created: 2025-10-21
-- Task: DATA-013
-- Dependencies: experiments table

-- Create table
CREATE TABLE IF NOT EXISTS experiment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  variant_key TEXT NOT NULL,
  
  -- Sample metrics
  participants INT DEFAULT 0,
  conversions INT DEFAULT 0,
  
  -- Performance metrics
  conversion_rate DECIMAL(6, 3),  -- e.g., 3.450 (%)
  avg_order_value DECIMAL(12, 2),
  total_revenue DECIMAL(12, 2),
  revenue_per_user DECIMAL(12, 2),
  
  -- Engagement metrics
  avg_time_on_site DECIMAL(10, 2),  -- seconds
  bounce_rate DECIMAL(5, 2),  -- %
  pages_per_visit DECIMAL(5, 2),
  
  -- Statistical significance
  confidence_interval_lower DECIMAL(6, 3),
  confidence_interval_upper DECIMAL(6, 3),
  p_value DECIMAL(8, 6),
  
  -- Tracking
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_experiment_results_experiment 
ON experiment_results(experiment_id, variant_key);

CREATE INDEX IF NOT EXISTS idx_experiment_results_conversion 
ON experiment_results(conversion_rate DESC);

CREATE INDEX IF NOT EXISTS idx_experiment_results_measured 
ON experiment_results(measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_experiment_results_project 
ON experiment_results(project);

-- Enable RLS
ALTER TABLE experiment_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view experiment results for their experiments"
  ON experiment_results FOR SELECT
  TO authenticated
  USING (
    experiment_id IN (
      SELECT id FROM experiments 
      WHERE shop_domain = current_setting('app.current_shop', true)
    )
  );

-- Update statistics
ANALYZE experiment_results;


