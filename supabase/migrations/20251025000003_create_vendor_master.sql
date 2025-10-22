-- Migration: DATA-017 Vendor Master Tables
-- Description: Create vendors and vendor_product_mappings tables for vendor management
-- Date: 2025-10-21
-- Agent: data
-- Related: Phase 10 - Vendor Master + ALC

-- =============================================================================
-- TABLE 1: vendors
-- =============================================================================
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Terms & Logistics
  payment_terms TEXT, -- "Net 30", "Net 60", etc.
  lead_time_days INTEGER NOT NULL DEFAULT 14,
  ship_method TEXT, -- "Ground", "Air", "Freight"
  drop_ship BOOLEAN NOT NULL DEFAULT FALSE,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Reliability Tracking
  reliability_score DECIMAL(5,2) DEFAULT 0, -- 0-100% (on-time delivery rate)
  total_orders INTEGER DEFAULT 0,
  on_time_deliveries INTEGER DEFAULT 0,
  late_deliveries INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for vendors table
CREATE INDEX idx_vendors_active ON vendors(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_vendors_reliability ON vendors(reliability_score DESC) WHERE is_active = TRUE;
CREATE INDEX idx_vendors_lead_time ON vendors(lead_time_days ASC) WHERE is_active = TRUE;

-- Trigger to update updated_at
CREATE TRIGGER set_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- TABLE 2: vendor_product_mappings
-- =============================================================================
CREATE TABLE IF NOT EXISTS vendor_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- Shopify product GID
  variant_id TEXT NOT NULL, -- Shopify variant GID
  
  -- Vendor-Specific Details
  vendor_sku TEXT NOT NULL,
  vendor_product_name TEXT,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  minimum_order_qty INTEGER DEFAULT 1,
  
  -- Preferences
  is_preferred BOOLEAN NOT NULL DEFAULT FALSE,
  last_ordered_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate mappings
  UNIQUE(vendor_id, variant_id)
);

-- Indexes for vendor_product_mappings table
CREATE INDEX idx_vpm_vendor ON vendor_product_mappings(vendor_id);
CREATE INDEX idx_vpm_product ON vendor_product_mappings(product_id);
CREATE INDEX idx_vpm_variant ON vendor_product_mappings(variant_id);
CREATE INDEX idx_vpm_preferred ON vendor_product_mappings(is_preferred) WHERE is_preferred = TRUE;

-- Trigger to update updated_at
CREATE TRIGGER set_vpm_updated_at
  BEFORE UPDATE ON vendor_product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RLS POLICIES: vendors
-- =============================================================================
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read vendors
CREATE POLICY "vendors_read_all"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only operators can insert vendors
CREATE POLICY "vendors_insert_operator"
  ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- Only operators can update vendors
CREATE POLICY "vendors_update_operator"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- No deletes (soft delete with is_active = FALSE)
CREATE POLICY "vendors_no_delete"
  ON vendors
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- RLS POLICIES: vendor_product_mappings
-- =============================================================================
ALTER TABLE vendor_product_mappings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read mappings
CREATE POLICY "vpm_read_all"
  ON vendor_product_mappings
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only operators can insert mappings
CREATE POLICY "vpm_insert_operator"
  ON vendor_product_mappings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- Only operators can update mappings
CREATE POLICY "vpm_update_operator"
  ON vendor_product_mappings
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- No deletes (data integrity)
CREATE POLICY "vpm_no_delete"
  ON vendor_product_mappings
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE vendors IS 'Centralized vendor database with reliability tracking and logistics info';
COMMENT ON COLUMN vendors.reliability_score IS 'Percentage: (on_time_deliveries / total_orders) × 100';
COMMENT ON COLUMN vendors.lead_time_days IS 'Expected days from PO to delivery';

COMMENT ON TABLE vendor_product_mappings IS 'Links Shopify products/variants to vendors with pricing and SKU mapping';
COMMENT ON COLUMN vendor_product_mappings.is_preferred IS 'Preferred vendor for this product (used in PO suggestions)';
COMMENT ON CONSTRAINT vendor_product_mappings_vendor_id_variant_id_key ON vendor_product_mappings IS 'Ensures each variant has unique mapping per vendor';

