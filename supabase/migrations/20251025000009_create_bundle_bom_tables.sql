-- Migration: Create Bundle BOM Tables & Virtual Stock
-- Description: Create bundle tables, BOM components, and virtual stock calculation
-- Date: 2025-10-22
-- Agent: data
-- Task: DATA-102

-- =============================================================================
-- TABLE 1: bundles (Shopify product variants that are bundles)
-- =============================================================================
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Shopify Integration
  shopify_product_id BIGINT NOT NULL,
  shopify_variant_id BIGINT NOT NULL,
  shop_domain TEXT NOT NULL,
  
  -- Bundle Configuration
  bundle_name TEXT NOT NULL,
  bundle_type TEXT NOT NULL DEFAULT 'fixed' CHECK (bundle_type IN ('fixed', 'parameterized')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Parameterized Bundle Fields (for color/length variants)
  parameter_config JSONB DEFAULT '{}', -- e.g., {"color": ["red", "blue"], "length": ["short", "long"]}
  parameter_rules JSONB DEFAULT '{}', -- e.g., {"red": {"length": ["short"]}, "blue": {"length": ["long"]}}
  
  -- Pricing & Inventory
  bundle_price DECIMAL(10,2),
  bundle_cost DECIMAL(10,2),
  virtual_stock_quantity INTEGER DEFAULT 0,
  last_stock_calculation TIMESTAMPTZ,
  
  -- Metadata
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique bundle per variant
  UNIQUE(shopify_variant_id, shop_domain)
);

-- Indexes for bundles table
CREATE INDEX idx_bundles_shop ON bundles(shop_domain);
CREATE INDEX idx_bundles_product ON bundles(shopify_product_id);
CREATE INDEX idx_bundles_variant ON bundles(shopify_variant_id);
CREATE INDEX idx_bundles_active ON bundles(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_bundles_type ON bundles(bundle_type);
CREATE INDEX idx_bundles_virtual_stock ON bundles(virtual_stock_quantity DESC) WHERE is_active = TRUE;

-- Trigger to update updated_at
CREATE TRIGGER set_bundles_updated_at
  BEFORE UPDATE ON bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- TABLE 2: bom_components (Bill of Materials components)
-- =============================================================================
CREATE TABLE IF NOT EXISTS bom_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  component_variant_id BIGINT NOT NULL, -- Shopify variant ID of component
  
  -- Component Configuration
  component_name TEXT NOT NULL,
  component_sku TEXT,
  quantity_required DECIMAL(10,3) NOT NULL DEFAULT 1.0,
  unit_of_measure TEXT DEFAULT 'each',
  
  -- Parameterized Bundle Logic
  parameter_conditions JSONB DEFAULT '{}', -- e.g., {"color": "red", "length": "short"}
  is_optional BOOLEAN NOT NULL DEFAULT FALSE,
  substitution_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Cost & Pricing
  component_cost DECIMAL(10,2),
  component_price DECIMAL(10,2),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate components
  UNIQUE(bundle_id, component_variant_id, parameter_conditions)
);

-- Indexes for bom_components table
CREATE INDEX idx_bom_bundle ON bom_components(bundle_id);
CREATE INDEX idx_bom_component ON bom_components(component_variant_id);
CREATE INDEX idx_bom_optional ON bom_components(is_optional) WHERE is_optional = TRUE;
CREATE INDEX idx_bom_substitution ON bom_components(substitution_allowed) WHERE substitution_allowed = TRUE;

-- Trigger to update updated_at
CREATE TRIGGER set_bom_components_updated_at
  BEFORE UPDATE ON bom_components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- TABLE 3: virtual_stock_calculations (Audit trail for stock calculations)
-- =============================================================================
CREATE TABLE IF NOT EXISTS virtual_stock_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Calculation Context
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  calculation_type TEXT NOT NULL DEFAULT 'realtime' CHECK (calculation_type IN ('realtime', 'nightly', 'manual')),
  
  -- Stock Data
  component_variant_id BIGINT NOT NULL,
  component_available_stock INTEGER NOT NULL DEFAULT 0,
  quantity_required DECIMAL(10,3) NOT NULL,
  virtual_stock_contribution INTEGER NOT NULL DEFAULT 0,
  
  -- Calculation Metadata
  calculation_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  calculation_parameters JSONB DEFAULT '{}',
  
  -- Audit Trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for virtual_stock_calculations table
CREATE INDEX idx_vsc_bundle ON virtual_stock_calculations(bundle_id);
CREATE INDEX idx_vsc_shop ON virtual_stock_calculations(shop_domain);
CREATE INDEX idx_vsc_type ON virtual_stock_calculations(calculation_type);
CREATE INDEX idx_vsc_timestamp ON virtual_stock_calculations(calculation_timestamp DESC);

-- =============================================================================
-- VIRTUAL STOCK CALCULATION FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION calculate_bundle_virtual_stock(
  p_bundle_id UUID,
  p_shop_domain TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_bundle RECORD;
  v_component RECORD;
  v_min_stock INTEGER := 999999;
  v_component_stock INTEGER;
  v_available_bundles INTEGER;
BEGIN
  -- Get bundle information
  SELECT * INTO v_bundle 
  FROM bundles 
  WHERE id = p_bundle_id 
    AND (p_shop_domain IS NULL OR shop_domain = p_shop_domain);
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate virtual stock based on component availability
  FOR v_component IN 
    SELECT bc.*, 
           COALESCE(iv.available_quantity, 0) as component_stock
    FROM bom_components bc
    LEFT JOIN inventory_variants iv ON iv.shopify_variant_id = bc.component_variant_id 
      AND iv.shop_domain = v_bundle.shop_domain
    WHERE bc.bundle_id = p_bundle_id
      AND bc.is_optional = FALSE
  LOOP
    -- Calculate how many bundles can be made from this component
    v_available_bundles := FLOOR(v_component.component_stock / v_component.quantity_required);
    
    -- Take the minimum (bottleneck component)
    v_min_stock := LEAST(v_min_stock, v_available_bundles);
  END LOOP;
  
  -- Handle case where no components found
  IF v_min_stock = 999999 THEN
    v_min_stock := 0;
  END IF;
  
  -- Update bundle virtual stock
  UPDATE bundles 
  SET virtual_stock_quantity = v_min_stock,
      last_stock_calculation = NOW()
  WHERE id = p_bundle_id;
  
  -- Log the calculation
  INSERT INTO virtual_stock_calculations (
    bundle_id, shop_domain, calculation_type,
    component_variant_id, component_available_stock,
    quantity_required, virtual_stock_contribution
  )
  SELECT 
    p_bundle_id, v_bundle.shop_domain, 'realtime',
    bc.component_variant_id, COALESCE(iv.available_quantity, 0),
    bc.quantity_required, FLOOR(COALESCE(iv.available_quantity, 0) / bc.quantity_required)
  FROM bom_components bc
  LEFT JOIN inventory_variants iv ON iv.shopify_variant_id = bc.component_variant_id 
    AND iv.shop_domain = v_bundle.shop_domain
  WHERE bc.bundle_id = p_bundle_id;
  
  RETURN v_min_stock;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- NIGHTLY RECONCILIATION JOB SCHEMA
-- =============================================================================
CREATE TABLE IF NOT EXISTS reconciliation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Job Configuration
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'virtual_stock' CHECK (job_type IN ('virtual_stock', 'inventory_sync', 'bundle_validation')),
  shop_domain TEXT,
  
  -- Execution Details
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Results
  bundles_processed INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  warnings_count INTEGER DEFAULT 0,
  
  -- Metadata
  job_parameters JSONB DEFAULT '{}',
  error_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reconciliation_jobs table
CREATE INDEX idx_reconciliation_jobs_type ON reconciliation_jobs(job_type);
CREATE INDEX idx_reconciliation_jobs_status ON reconciliation_jobs(status);
CREATE INDEX idx_reconciliation_jobs_shop ON reconciliation_jobs(shop_domain);
CREATE INDEX idx_reconciliation_jobs_created ON reconciliation_jobs(created_at DESC);

-- =============================================================================
-- NIGHTLY RECONCILIATION FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION run_nightly_virtual_stock_reconciliation(
  p_shop_domain TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_job_id UUID;
  v_bundle RECORD;
  v_processed INTEGER := 0;
  v_errors INTEGER := 0;
  v_start_time TIMESTAMPTZ := NOW();
BEGIN
  -- Create reconciliation job record
  INSERT INTO reconciliation_jobs (job_name, job_type, shop_domain, status, started_at)
  VALUES (
    'Nightly Virtual Stock Reconciliation',
    'virtual_stock',
    p_shop_domain,
    'running',
    v_start_time
  )
  RETURNING id INTO v_job_id;
  
  -- Process all active bundles
  FOR v_bundle IN 
    SELECT id, shop_domain, bundle_name
    FROM bundles 
    WHERE is_active = TRUE 
      AND (p_shop_domain IS NULL OR shop_domain = p_shop_domain)
  LOOP
    BEGIN
      -- Calculate virtual stock for this bundle
      PERFORM calculate_bundle_virtual_stock(v_bundle.id, v_bundle.shop_domain);
      v_processed := v_processed + 1;
      
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
      -- Log error but continue processing
      RAISE WARNING 'Error processing bundle %: %', v_bundle.id, SQLERRM;
    END;
  END LOOP;
  
  -- Update job completion
  UPDATE reconciliation_jobs 
  SET 
    status = CASE WHEN v_errors = 0 THEN 'completed' ELSE 'failed' END,
    completed_at = NOW(),
    duration_seconds = EXTRACT(EPOCH FROM (NOW() - v_start_time))::INTEGER,
    bundles_processed = v_processed,
    errors_count = v_errors
  WHERE id = v_job_id;
  
  RETURN v_job_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_stock_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_jobs ENABLE ROW LEVEL SECURITY;

-- Bundles RLS Policies
CREATE POLICY "bundles_read_authenticated"
  ON bundles
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "bundles_insert_operators"
  ON bundles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "bundles_update_operators"
  ON bundles
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- BOM Components RLS Policies
CREATE POLICY "bom_components_read_authenticated"
  ON bom_components
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "bom_components_insert_operators"
  ON bom_components
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "bom_components_update_operators"
  ON bom_components
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- Virtual Stock Calculations RLS Policies (read-only for most users)
CREATE POLICY "vsc_read_authenticated"
  ON virtual_stock_calculations
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "vsc_insert_system"
  ON virtual_stock_calculations
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- Reconciliation Jobs RLS Policies
CREATE POLICY "reconciliation_jobs_read_operators"
  ON reconciliation_jobs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('operator', 'admin'));

CREATE POLICY "reconciliation_jobs_insert_system"
  ON reconciliation_jobs
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE bundles IS 'Shopify product variants configured as bundles with BOM components';
COMMENT ON COLUMN bundles.bundle_type IS 'fixed: same components always, parameterized: components vary by parameters';
COMMENT ON COLUMN bundles.parameter_config IS 'Configuration for parameterized bundles (color, length, etc.)';
COMMENT ON COLUMN bundles.virtual_stock_quantity IS 'Calculated available quantity based on component stock';

COMMENT ON TABLE bom_components IS 'Bill of Materials components for bundles';
COMMENT ON COLUMN bom_components.parameter_conditions IS 'Conditions for when this component is included (parameterized bundles)';
COMMENT ON COLUMN bom_components.is_optional IS 'Whether this component is optional for the bundle';

COMMENT ON TABLE virtual_stock_calculations IS 'Audit trail for virtual stock calculations';
COMMENT ON TABLE reconciliation_jobs IS 'Nightly reconciliation job execution log';

COMMENT ON FUNCTION calculate_bundle_virtual_stock IS 'Calculates virtual stock for a bundle based on component availability';
COMMENT ON FUNCTION run_nightly_virtual_stock_reconciliation IS 'Runs nightly reconciliation for all bundles virtual stock';
