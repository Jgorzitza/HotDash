-- Migration: Complete Vendor Master Tables & RLS
-- Description: Add vendor_skus table, reliability score triggers, and test data
-- Date: 2025-10-22
-- Agent: data
-- Task: DATA-101

-- =============================================================================
-- TABLE 3: vendor_skus (up to 3 SKUs per product per vendor)
-- =============================================================================
CREATE TABLE IF NOT EXISTS vendor_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- Shopify product GID
  
  -- SKU Details (up to 3 per product per vendor)
  sku_1 TEXT,
  sku_2 TEXT,
  sku_3 TEXT,
  
  -- SKU Descriptions
  sku_1_description TEXT,
  sku_2_description TEXT,
  sku_3_description TEXT,
  
  -- SKU Costs
  sku_1_cost DECIMAL(10,2),
  sku_2_cost DECIMAL(10,2),
  sku_3_cost DECIMAL(10,2),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure only one record per vendor-product combination
  UNIQUE(vendor_id, product_id)
);

-- Indexes for vendor_skus table
CREATE INDEX idx_vendor_skus_vendor ON vendor_skus(vendor_id);
CREATE INDEX idx_vendor_skus_product ON vendor_skus(product_id);
CREATE INDEX idx_vendor_skus_sku1 ON vendor_skus(sku_1) WHERE sku_1 IS NOT NULL;
CREATE INDEX idx_vendor_skus_sku2 ON vendor_skus(sku_2) WHERE sku_2 IS NOT NULL;
CREATE INDEX idx_vendor_skus_sku3 ON vendor_skus(sku_3) WHERE sku_3 IS NOT NULL;

-- Trigger to update updated_at
CREATE TRIGGER set_vendor_skus_updated_at
  BEFORE UPDATE ON vendor_skus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RELIABILITY SCORE CALCULATION FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION calculate_vendor_reliability_score(vendor_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_orders_count INTEGER;
  on_time_count INTEGER;
  calculated_score DECIMAL(5,2);
BEGIN
  -- Get total orders and on-time deliveries for this vendor
  SELECT 
    COALESCE(total_orders, 0),
    COALESCE(on_time_deliveries, 0)
  INTO total_orders_count, on_time_count
  FROM vendors 
  WHERE id = vendor_uuid;
  
  -- Calculate reliability score (on-time percentage)
  IF total_orders_count > 0 THEN
    calculated_score := ROUND((on_time_count::DECIMAL / total_orders_count::DECIMAL) * 100, 2);
  ELSE
    calculated_score := 0;
  END IF;
  
  -- Ensure score is between 0 and 100
  calculated_score := GREATEST(0, LEAST(100, calculated_score));
  
  RETURN calculated_score;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGER: Auto-update reliability score when orders change
-- =============================================================================
CREATE OR REPLACE FUNCTION update_vendor_reliability_score()
RETURNS TRIGGER AS $$
DECLARE
  new_score DECIMAL(5,2);
BEGIN
  -- Calculate new reliability score
  new_score := calculate_vendor_reliability_score(NEW.id);
  
  -- Update the reliability_score column
  UPDATE vendors 
  SET reliability_score = new_score
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating reliability scores
CREATE TRIGGER trigger_update_reliability_score
  AFTER UPDATE OF total_orders, on_time_deliveries, late_deliveries
  ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_reliability_score();

-- =============================================================================
-- RLS POLICIES: vendor_skus
-- =============================================================================
ALTER TABLE vendor_skus ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read vendor SKUs
CREATE POLICY "vendor_skus_read_all"
  ON vendor_skus
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only operators can insert vendor SKUs
CREATE POLICY "vendor_skus_insert_operator"
  ON vendor_skus
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- Only operators can update vendor SKUs
CREATE POLICY "vendor_skus_update_operator"
  ON vendor_skus
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- No deletes (data integrity)
CREATE POLICY "vendor_skus_no_delete"
  ON vendor_skus
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- TEST DATA: 3-5 vendors with sample data
-- =============================================================================
INSERT INTO vendors (name, contact_name, contact_email, contact_phone, payment_terms, lead_time_days, ship_method, drop_ship, currency, total_orders, on_time_deliveries, late_deliveries, is_active, notes) VALUES
('Auto Parts Direct', 'John Smith', 'john@autopartsdirect.com', '555-0101', 'Net 30', 7, 'Ground', false, 'USD', 150, 142, 8, true, 'Primary supplier for engine components'),
('Speed Demon Racing', 'Mike Johnson', 'mike@speeddemon.com', '555-0102', 'Net 15', 5, 'Air', true, 'USD', 89, 85, 4, true, 'High-performance parts specialist'),
('Classic Car Supply', 'Sarah Wilson', 'sarah@classiccarsupply.com', '555-0103', 'Net 45', 14, 'Freight', false, 'USD', 67, 60, 7, true, 'Vintage and restoration parts'),
('Budget Auto Parts', 'Tom Brown', 'tom@budgetautoparts.com', '555-0104', 'Net 30', 10, 'Ground', false, 'USD', 45, 38, 7, true, 'Economy parts supplier'),
('Pro Racing Supply', 'Lisa Davis', 'lisa@proracing.com', '555-0105', 'Net 15', 3, 'Air', true, 'USD', 23, 22, 1, true, 'Professional racing components');

-- Update reliability scores for test data
UPDATE vendors SET reliability_score = calculate_vendor_reliability_score(id);

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE vendor_skus IS 'Vendor-specific SKU mappings (up to 3 SKUs per product per vendor)';
COMMENT ON COLUMN vendor_skus.sku_1 IS 'Primary vendor SKU for this product';
COMMENT ON COLUMN vendor_skus.sku_2 IS 'Secondary vendor SKU for this product';
COMMENT ON COLUMN vendor_skus.sku_3 IS 'Tertiary vendor SKU for this product';
COMMENT ON FUNCTION calculate_vendor_reliability_score IS 'Calculates vendor reliability score based on on-time delivery percentage';
COMMENT ON FUNCTION update_vendor_reliability_score IS 'Trigger function to auto-update reliability scores when order data changes';
