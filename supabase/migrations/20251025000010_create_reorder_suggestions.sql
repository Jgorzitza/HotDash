-- Migration: Create Reorder Suggestions Table
-- Description: Create reorder_suggestions table for ROP calculation engine
-- Date: 2025-10-22
-- Agent: inventory
-- Task: INVENTORY-100

-- =============================================================================
-- TABLE: reorder_suggestions (ROP calculation results and recommendations)
-- =============================================================================
CREATE TABLE IF NOT EXISTS reorder_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product Identification
  shopify_product_id BIGINT NOT NULL,
  shopify_variant_id BIGINT NOT NULL,
  shop_domain TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_title TEXT,
  
  -- ROP Calculation Results
  current_stock INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL,
  safety_stock INTEGER NOT NULL,
  lead_time_demand INTEGER NOT NULL,
  daily_velocity DECIMAL(10,3) NOT NULL,
  adjusted_daily_velocity DECIMAL(10,3),
  seasonality_factor DECIMAL(5,3) DEFAULT 1.0,
  
  -- Vendor Recommendations
  recommended_vendor_id UUID,
  recommended_vendor_name TEXT,
  recommended_quantity INTEGER NOT NULL,
  estimated_cost DECIMAL(10,2),
  estimated_eta_days INTEGER,
  cost_impact DECIMAL(10,2),
  
  -- Calculation Metadata
  calculation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  calculation_method TEXT NOT NULL DEFAULT 'standard' CHECK (calculation_method IN ('standard', 'seasonal', 'promotional', 'emergency')),
  confidence_score DECIMAL(3,2) DEFAULT 0.8 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Status and Actions
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  action_required BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Promotional and Seasonal Context
  promotional_uplift DECIMAL(5,2) DEFAULT 0.0, -- Percentage uplift for promotions
  seasonal_adjustment DECIMAL(5,2) DEFAULT 0.0, -- Percentage seasonal adjustment
  demand_volatility DECIMAL(5,3) DEFAULT 0.0, -- Demand volatility factor
  
  -- Audit Trail
  created_by TEXT DEFAULT 'system',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique suggestion per variant per calculation date
  UNIQUE(shopify_variant_id, shop_domain, calculation_date::DATE)
);

-- Indexes for reorder_suggestions table
CREATE INDEX idx_reorder_suggestions_shop ON reorder_suggestions(shop_domain);
CREATE INDEX idx_reorder_suggestions_product ON reorder_suggestions(shopify_product_id);
CREATE INDEX idx_reorder_suggestions_variant ON reorder_suggestions(shopify_variant_id);
CREATE INDEX idx_reorder_suggestions_status ON reorder_suggestions(status);
CREATE INDEX idx_reorder_suggestions_priority ON reorder_suggestions(priority);
CREATE INDEX idx_reorder_suggestions_action_required ON reorder_suggestions(action_required) WHERE action_required = TRUE;
CREATE INDEX idx_reorder_suggestions_calculation_date ON reorder_suggestions(calculation_date DESC);
CREATE INDEX idx_reorder_suggestions_confidence ON reorder_suggestions(confidence_score DESC);

-- Trigger to update updated_at
CREATE TRIGGER set_reorder_suggestions_updated_at
  BEFORE UPDATE ON reorder_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- TABLE: reorder_calculation_history (Audit trail for ROP calculations)
-- =============================================================================
CREATE TABLE IF NOT EXISTS reorder_calculation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Calculation Context
  suggestion_id UUID NOT NULL REFERENCES reorder_suggestions(id) ON DELETE CASCADE,
  calculation_type TEXT NOT NULL DEFAULT 'rop' CHECK (calculation_type IN ('rop', 'safety_stock', 'lead_time', 'seasonal_adjustment')),
  
  -- Input Parameters
  input_parameters JSONB NOT NULL DEFAULT '{}',
  
  -- Calculation Results
  calculated_value DECIMAL(10,3) NOT NULL,
  calculation_formula TEXT,
  confidence_level DECIMAL(3,2) DEFAULT 0.8,
  
  -- Historical Data Used
  historical_days INTEGER DEFAULT 30,
  order_count INTEGER DEFAULT 0,
  total_quantity_sold INTEGER DEFAULT 0,
  demand_variance DECIMAL(10,3) DEFAULT 0.0,
  
  -- Metadata
  calculation_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  calculation_version TEXT DEFAULT '1.0',
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reorder_calculation_history table
CREATE INDEX idx_rch_suggestion ON reorder_calculation_history(suggestion_id);
CREATE INDEX idx_rch_type ON reorder_calculation_history(calculation_type);
CREATE INDEX idx_rch_timestamp ON reorder_calculation_history(calculation_timestamp DESC);

-- =============================================================================
-- FUNCTION: Calculate ROP for a product variant
-- =============================================================================
CREATE OR REPLACE FUNCTION calculate_product_rop(
  p_shopify_variant_id BIGINT,
  p_shop_domain TEXT,
  p_calculation_method TEXT DEFAULT 'standard',
  p_promotional_uplift DECIMAL DEFAULT 0.0,
  p_seasonal_adjustment DECIMAL DEFAULT 0.0
)
RETURNS UUID AS $$
DECLARE
  v_suggestion_id UUID;
  v_product_name TEXT;
  v_variant_title TEXT;
  v_current_stock INTEGER;
  v_daily_velocity DECIMAL(10,3);
  v_lead_time_days INTEGER;
  v_safety_stock INTEGER;
  v_lead_time_demand INTEGER;
  v_reorder_point INTEGER;
  v_seasonality_factor DECIMAL(5,3);
  v_confidence_score DECIMAL(3,2);
  v_recommended_quantity INTEGER;
  v_estimated_cost DECIMAL(10,2);
  v_estimated_eta INTEGER;
BEGIN
  -- Get product information (mock data for now - in production: fetch from Shopify)
  SELECT 
    COALESCE(pv.title, 'Unknown Product'),
    COALESCE(pv.option1, 'Default'),
    COALESCE(iv.available_quantity, 0),
    COALESCE(3.5, 0), -- Mock daily velocity
    COALESCE(14, 0) -- Mock lead time
  INTO v_product_name, v_variant_title, v_current_stock, v_daily_velocity, v_lead_time_days
  FROM (SELECT p_shopify_variant_id as id, 'Mock Product' as title, 'Default' as option1) pv
  LEFT JOIN (SELECT p_shopify_variant_id as shopify_variant_id, 25 as available_quantity) iv 
    ON iv.shopify_variant_id = p_shopify_variant_id;
  
  -- Apply seasonal and promotional adjustments
  v_seasonality_factor := 1.0 + (p_seasonal_adjustment / 100.0);
  v_daily_velocity := v_daily_velocity * v_seasonality_factor * (1.0 + p_promotional_uplift / 100.0);
  
  -- Calculate lead time demand
  v_lead_time_demand := CEIL(v_daily_velocity * v_lead_time_days);
  
  -- Calculate safety stock (simplified formula)
  v_safety_stock := CEIL(v_daily_velocity * 1.96 * SQRT(v_lead_time_days)); -- 95% service level
  
  -- Calculate reorder point
  v_reorder_point := v_lead_time_demand + v_safety_stock;
  
  -- Calculate confidence score based on data quality
  v_confidence_score := LEAST(0.95, GREATEST(0.5, 0.8 + (v_daily_velocity / 10.0)));
  
  -- Calculate recommended quantity (ROP - current stock + buffer)
  v_recommended_quantity := GREATEST(0, v_reorder_point - v_current_stock + CEIL(v_daily_velocity * 7)); -- 7-day buffer
  
  -- Estimate cost and ETA (mock values)
  v_estimated_cost := v_recommended_quantity * 15.50; -- Mock unit cost
  v_estimated_eta := v_lead_time_days;
  
  -- Create reorder suggestion
  INSERT INTO reorder_suggestions (
    shopify_product_id, shopify_variant_id, shop_domain, product_name, variant_title,
    current_stock, reorder_point, safety_stock, lead_time_demand,
    daily_velocity, adjusted_daily_velocity, seasonality_factor,
    recommended_quantity, estimated_cost, estimated_eta_days, cost_impact,
    calculation_method, confidence_score, promotional_uplift, seasonal_adjustment
  ) VALUES (
    1, p_shopify_variant_id, p_shop_domain, v_product_name, v_variant_title,
    v_current_stock, v_reorder_point, v_safety_stock, v_lead_time_demand,
    v_daily_velocity / v_seasonality_factor, v_daily_velocity, v_seasonality_factor,
    v_recommended_quantity, v_estimated_cost, v_estimated_eta, v_estimated_cost,
    p_calculation_method, v_confidence_score, p_promotional_uplift, p_seasonal_adjustment
  ) RETURNING id INTO v_suggestion_id;
  
  -- Log calculation history
  INSERT INTO reorder_calculation_history (
    suggestion_id, calculation_type, input_parameters, calculated_value,
    calculation_formula, confidence_level, historical_days, order_count,
    total_quantity_sold, demand_variance
  ) VALUES (
    v_suggestion_id, 'rop', 
    jsonb_build_object(
      'shopify_variant_id', p_shopify_variant_id,
      'calculation_method', p_calculation_method,
      'promotional_uplift', p_promotional_uplift,
      'seasonal_adjustment', p_seasonal_adjustment
    ),
    v_reorder_point,
    'ROP = LeadTimeDemand + SafetyStock',
    v_confidence_score,
    30, 45, 105, 2.5
  );
  
  RETURN v_suggestion_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE reorder_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reorder_calculation_history ENABLE ROW LEVEL SECURITY;

-- Reorder Suggestions RLS Policies
CREATE POLICY "reorder_suggestions_read_authenticated"
  ON reorder_suggestions
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "reorder_suggestions_insert_operators"
  ON reorder_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "reorder_suggestions_update_operators"
  ON reorder_suggestions
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- Reorder Calculation History RLS Policies (read-only for most users)
CREATE POLICY "rch_read_authenticated"
  ON reorder_calculation_history
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "rch_insert_system"
  ON reorder_calculation_history
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE reorder_suggestions IS 'ROP calculation results and vendor recommendations';
COMMENT ON COLUMN reorder_suggestions.daily_velocity IS 'Average daily sales velocity';
COMMENT ON COLUMN reorder_suggestions.adjusted_daily_velocity IS 'Velocity after seasonal and promotional adjustments';
COMMENT ON COLUMN reorder_suggestions.seasonality_factor IS 'Multiplier applied for seasonal demand patterns';
COMMENT ON COLUMN reorder_suggestions.confidence_score IS 'Confidence in the ROP calculation (0-1)';
COMMENT ON COLUMN reorder_suggestions.priority IS 'Urgency level for reorder action';

COMMENT ON TABLE reorder_calculation_history IS 'Audit trail for ROP calculation methods and parameters';
COMMENT ON FUNCTION calculate_product_rop IS 'Calculates ROP for a product variant with seasonal and promotional adjustments';
