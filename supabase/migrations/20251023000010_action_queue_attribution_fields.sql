-- Action Queue Attribution Fields
-- Task: DATA-002 (Action Queue Ranking Algorithm Optimization)
-- Date: 2025-10-23
-- Purpose: Add attribution tracking fields to enable ML-based ranking optimization

-- ============================================================================
-- Add Attribution Fields to action_queue
-- ============================================================================

-- Add action tracking key for GA4 attribution
ALTER TABLE action_queue 
ADD COLUMN IF NOT EXISTS action_key TEXT,
ADD COLUMN IF NOT EXISTS expected_revenue DECIMAL(12,2);

-- Add realized ROI fields (from GA4 attribution)
ALTER TABLE action_queue
ADD COLUMN IF NOT EXISTS realized_revenue_7d DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS realized_revenue_14d DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS realized_revenue_28d DECIMAL(12,2) DEFAULT 0;

-- Add conversion and performance metrics
ALTER TABLE action_queue
ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS last_attribution_check TIMESTAMPTZ;

-- Add historical performance tracking
ALTER TABLE action_queue
ADD COLUMN IF NOT EXISTS execution_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_realized_roi DECIMAL(12,2) DEFAULT 0;

-- Add ML-based ranking fields
ALTER TABLE action_queue
ADD COLUMN IF NOT EXISTS ml_score DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS ranking_version TEXT DEFAULT 'v1_basic';

-- ============================================================================
-- Create action_attribution Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS action_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL,
  action_key TEXT NOT NULL,
  
  -- Attribution window
  period_days INT NOT NULL CHECK (period_days IN (7, 14, 28)),
  
  -- GA4 Metrics
  sessions INT NOT NULL DEFAULT 0,
  pageviews INT NOT NULL DEFAULT 0,
  add_to_carts INT NOT NULL DEFAULT 0,
  purchases INT NOT NULL DEFAULT 0,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Calculated metrics
  conversion_rate DECIMAL(5,2),
  average_order_value DECIMAL(12,2),
  
  -- Timestamps
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_action_attribution_action 
    FOREIGN KEY (action_id) 
    REFERENCES action_queue(id) 
    ON DELETE CASCADE
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Index for action key lookups
CREATE INDEX IF NOT EXISTS idx_action_queue_action_key 
  ON action_queue(action_key) 
  WHERE action_key IS NOT NULL;

-- Index for realized revenue ranking
CREATE INDEX IF NOT EXISTS idx_action_queue_realized_revenue_28d 
  ON action_queue(realized_revenue_28d DESC NULLS LAST);

-- Index for ML score ranking
CREATE INDEX IF NOT EXISTS idx_action_queue_ml_score 
  ON action_queue(ml_score DESC NULLS LAST);

-- Index for attribution lookups
CREATE INDEX IF NOT EXISTS idx_action_attribution_action_id 
  ON action_attribution(action_id);

CREATE INDEX IF NOT EXISTS idx_action_attribution_action_key 
  ON action_attribution(action_key);

CREATE INDEX IF NOT EXISTS idx_action_attribution_period 
  ON action_attribution(period_days, recorded_at DESC);

-- ============================================================================
-- Update Trigger for action_attribution
-- ============================================================================

CREATE OR REPLACE FUNCTION update_action_attribution_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_action_attribution_created_at
  BEFORE INSERT ON action_attribution
  FOR EACH ROW
  EXECUTE FUNCTION update_action_attribution_timestamp();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN action_queue.action_key IS 'GA4 tracking key for attribution (e.g., campaign_123, seo_optimization_456)';
COMMENT ON COLUMN action_queue.expected_revenue IS 'Expected revenue from action (for ROI comparison)';
COMMENT ON COLUMN action_queue.realized_revenue_7d IS 'Actual revenue generated in 7-day window (from GA4)';
COMMENT ON COLUMN action_queue.realized_revenue_14d IS 'Actual revenue generated in 14-day window (from GA4)';
COMMENT ON COLUMN action_queue.realized_revenue_28d IS 'Actual revenue generated in 28-day window (from GA4)';
COMMENT ON COLUMN action_queue.conversion_rate IS 'Conversion rate from GA4 attribution';
COMMENT ON COLUMN action_queue.last_attribution_check IS 'Last time GA4 attribution was updated';
COMMENT ON COLUMN action_queue.execution_count IS 'Number of times this type of action has been executed';
COMMENT ON COLUMN action_queue.success_count IS 'Number of successful executions';
COMMENT ON COLUMN action_queue.avg_realized_roi IS 'Average realized ROI for this action type';
COMMENT ON COLUMN action_queue.ml_score IS 'ML-based ranking score (combines multiple factors)';
COMMENT ON COLUMN action_queue.ranking_version IS 'Version of ranking algorithm used (for A/B testing)';

COMMENT ON TABLE action_attribution IS 'Detailed attribution metrics from GA4 for action performance tracking';
COMMENT ON COLUMN action_attribution.action_id IS 'Reference to action_queue.id';
COMMENT ON COLUMN action_attribution.action_key IS 'GA4 tracking key';
COMMENT ON COLUMN action_attribution.period_days IS 'Attribution window: 7, 14, or 28 days';
COMMENT ON COLUMN action_attribution.sessions IS 'GA4 sessions attributed to this action';
COMMENT ON COLUMN action_attribution.pageviews IS 'GA4 pageviews attributed to this action';
COMMENT ON COLUMN action_attribution.add_to_carts IS 'GA4 add-to-cart events attributed to this action';
COMMENT ON COLUMN action_attribution.purchases IS 'GA4 purchase events attributed to this action';
COMMENT ON COLUMN action_attribution.revenue IS 'GA4 revenue attributed to this action';
COMMENT ON COLUMN action_attribution.conversion_rate IS 'Purchases / Sessions * 100';
COMMENT ON COLUMN action_attribution.average_order_value IS 'Revenue / Purchases';

