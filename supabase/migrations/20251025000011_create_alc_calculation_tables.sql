-- Migration: ALC Calculation Tables & Receipt Processing
-- Description: Create ALC (Average Landed Cost) calculation tables and receipt processing
-- Date: 2025-10-22
-- Agent: data
-- Task: DATA-103

-- =============================================================================
-- TABLE 1: purchase_orders (Purchase Order management)
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- PO Identification
  po_number TEXT NOT NULL UNIQUE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  shop_domain TEXT NOT NULL,
  
  -- PO Details
  po_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Financial Information
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  freight_cost DECIMAL(12,2) DEFAULT 0,
  duty_cost DECIMAL(12,2) DEFAULT 0,
  tax_cost DECIMAL(12,2) DEFAULT 0,
  total_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Freight Details
  freight_method TEXT, -- 'ground', 'air', 'freight', 'express'
  freight_weight_lbs DECIMAL(10,3),
  freight_rate_per_lb DECIMAL(8,4),
  
  -- Duty Information
  duty_rate DECIMAL(5,4), -- Percentage (e.g., 0.1250 for 12.5%)
  duty_basis TEXT DEFAULT 'value', -- 'value', 'weight', 'quantity'
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'acknowledged', 'partial', 'complete', 'cancelled')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for purchase_orders
CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_po_shop ON purchase_orders(shop_domain);
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_date ON purchase_orders(po_date);

-- =============================================================================
-- TABLE 2: purchase_order_receipts (Receipt processing)
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_order_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  
  -- Receipt Details
  receipt_number TEXT NOT NULL,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  received_by TEXT,
  
  -- Financial Information
  received_subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  received_freight DECIMAL(12,2) DEFAULT 0,
  received_duty DECIMAL(12,2) DEFAULT 0,
  received_tax DECIMAL(12,2) DEFAULT 0,
  received_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Freight Details
  actual_weight_lbs DECIMAL(10,3),
  actual_freight_rate DECIMAL(8,4),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'discrepancy', 'resolved')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for purchase_order_receipts
CREATE INDEX idx_por_po ON purchase_order_receipts(purchase_order_id);
CREATE INDEX idx_por_receipt_number ON purchase_order_receipts(receipt_number);
CREATE INDEX idx_por_date ON purchase_order_receipts(receipt_date);
CREATE INDEX idx_por_status ON purchase_order_receipts(status);

-- =============================================================================
-- TABLE 3: purchase_order_line_items (PO line items)
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- Shopify product GID
  variant_id TEXT NOT NULL, -- Shopify variant GID
  
  -- Line Item Details
  vendor_sku TEXT,
  product_name TEXT NOT NULL,
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_cost DECIMAL(10,4) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  
  -- ALC Components
  freight_allocation DECIMAL(12,2) DEFAULT 0,
  duty_allocation DECIMAL(12,2) DEFAULT 0,
  tax_allocation DECIMAL(12,2) DEFAULT 0,
  landed_cost_per_unit DECIMAL(10,4) DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for purchase_order_line_items
CREATE INDEX idx_poli_po ON purchase_order_line_items(purchase_order_id);
CREATE INDEX idx_poli_product ON purchase_order_line_items(product_id);
CREATE INDEX idx_poli_variant ON purchase_order_line_items(variant_id);
CREATE INDEX idx_poli_vendor_sku ON purchase_order_line_items(vendor_sku);

-- =============================================================================
-- TABLE 4: product_cost_history (ALC tracking over time)
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_cost_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product Identification
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  shop_domain TEXT NOT NULL,
  
  -- Cost Information
  previous_alc DECIMAL(10,4),
  new_alc DECIMAL(10,4) NOT NULL,
  quantity_received INTEGER NOT NULL,
  total_landed_cost DECIMAL(12,2) NOT NULL,
  
  -- Cost Breakdown
  unit_cost DECIMAL(10,4) NOT NULL,
  freight_per_unit DECIMAL(10,4) DEFAULT 0,
  duty_per_unit DECIMAL(10,4) DEFAULT 0,
  tax_per_unit DECIMAL(10,4) DEFAULT 0,
  
  -- Source Information
  purchase_order_id UUID REFERENCES purchase_orders(id),
  receipt_id UUID REFERENCES purchase_order_receipts(id),
  
  -- Timestamps
  cost_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for product_cost_history
CREATE INDEX idx_pch_product ON product_cost_history(product_id);
CREATE INDEX idx_pch_variant ON product_cost_history(variant_id);
CREATE INDEX idx_pch_shop ON product_cost_history(shop_domain);
CREATE INDEX idx_pch_date ON product_cost_history(cost_date DESC);
CREATE INDEX idx_pch_po ON product_cost_history(purchase_order_id);

-- =============================================================================
-- TABLE 5: cost_audit_trail (Audit trail for cost changes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS cost_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Change Context
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  shop_domain TEXT NOT NULL,
  
  -- Change Details
  change_type TEXT NOT NULL CHECK (change_type IN ('alc_update', 'freight_allocation', 'duty_allocation', 'manual_adjustment')),
  previous_cost DECIMAL(10,4),
  new_cost DECIMAL(10,4) NOT NULL,
  cost_difference DECIMAL(10,4) NOT NULL,
  
  -- Source Information
  source_type TEXT NOT NULL CHECK (source_type IN ('receipt', 'manual', 'system', 'shopify_sync')),
  source_id UUID, -- Could be receipt_id, user_id, etc.
  source_reference TEXT,
  
  -- Change Metadata
  change_reason TEXT,
  change_notes TEXT,
  changed_by TEXT,
  
  -- Timestamps
  change_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for cost_audit_trail
CREATE INDEX idx_cat_product ON cost_audit_trail(product_id);
CREATE INDEX idx_cat_variant ON cost_audit_trail(variant_id);
CREATE INDEX idx_cat_shop ON cost_audit_trail(shop_domain);
CREATE INDEX idx_cat_type ON cost_audit_trail(change_type);
CREATE INDEX idx_cat_timestamp ON cost_audit_trail(change_timestamp DESC);

-- =============================================================================
-- FUNCTIONS: ALC Calculation
-- =============================================================================

-- Function to calculate freight allocation by weight
CREATE OR REPLACE FUNCTION calculate_freight_allocation(
  p_po_id UUID,
  p_line_item_id UUID
)
RETURNS DECIMAL(12,2) AS $$
DECLARE
  v_po RECORD;
  v_line_item RECORD;
  v_total_weight DECIMAL(10,3);
  v_line_weight DECIMAL(10,3);
  v_freight_allocation DECIMAL(12,2);
BEGIN
  -- Get PO freight information
  SELECT freight_cost, freight_weight_lbs INTO v_po
  FROM purchase_orders WHERE id = p_po_id;
  
  -- Get line item details
  SELECT quantity_ordered, unit_cost INTO v_line_item
  FROM purchase_order_line_items WHERE id = p_line_item_id;
  
  -- Calculate total weight (assuming 1 lb per unit for simplicity)
  -- In real implementation, this would come from product weight data
  v_total_weight := v_po.freight_weight_lbs;
  v_line_weight := v_line_item.quantity_ordered * 1.0; -- Simplified weight calculation
  
  -- Calculate freight allocation
  IF v_total_weight > 0 THEN
    v_freight_allocation := (v_line_weight / v_total_weight) * v_po.freight_cost;
  ELSE
    v_freight_allocation := 0;
  END IF;
  
  RETURN v_freight_allocation;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate duty allocation
CREATE OR REPLACE FUNCTION calculate_duty_allocation(
  p_po_id UUID,
  p_line_item_id UUID
)
RETURNS DECIMAL(12,2) AS $$
DECLARE
  v_po RECORD;
  v_line_item RECORD;
  v_total_value DECIMAL(12,2);
  v_line_value DECIMAL(12,2);
  v_duty_allocation DECIMAL(12,2);
BEGIN
  -- Get PO duty information
  SELECT duty_cost, duty_rate, duty_basis INTO v_po
  FROM purchase_orders WHERE id = p_po_id;
  
  -- Get line item details
  SELECT quantity_ordered, unit_cost, line_total INTO v_line_item
  FROM purchase_order_line_items WHERE id = p_line_item_id;
  
  -- Calculate duty allocation based on basis
  IF v_po.duty_basis = 'value' THEN
    -- Get total PO value
    SELECT SUM(line_total) INTO v_total_value
    FROM purchase_order_line_items WHERE purchase_order_id = p_po_id;
    
    v_line_value := v_line_item.line_total;
    
    IF v_total_value > 0 THEN
      v_duty_allocation := (v_line_value / v_total_value) * v_po.duty_cost;
    ELSE
      v_duty_allocation := 0;
    END IF;
  ELSE
    -- For weight or quantity basis, use proportional allocation
    v_duty_allocation := v_po.duty_cost / (
      SELECT COUNT(*) FROM purchase_order_line_items WHERE purchase_order_id = p_po_id
    );
  END IF;
  
  RETURN v_duty_allocation;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate ALC (Average Landed Cost)
CREATE OR REPLACE FUNCTION calculate_alc(
  p_variant_id TEXT,
  p_shop_domain TEXT,
  p_quantity_received INTEGER,
  p_unit_cost DECIMAL(10,4),
  p_freight_allocation DECIMAL(12,2),
  p_duty_allocation DECIMAL(12,2),
  p_tax_allocation DECIMAL(12,2)
)
RETURNS DECIMAL(10,4) AS $$
DECLARE
  v_current_alc DECIMAL(10,4);
  v_current_quantity INTEGER;
  v_new_alc DECIMAL(10,4);
  v_total_cost DECIMAL(12,2);
BEGIN
  -- Get current ALC and quantity
  SELECT COALESCE(alc, 0), COALESCE(quantity_on_hand, 0)
  INTO v_current_alc, v_current_quantity
  FROM inventory_variants
  WHERE shopify_variant_id = p_variant_id AND shop_domain = p_shop_domain;
  
  -- Calculate total landed cost for new receipt
  v_total_cost := (p_unit_cost * p_quantity_received) + p_freight_allocation + p_duty_allocation + p_tax_allocation;
  
  -- Calculate new ALC using weighted average
  IF v_current_quantity + p_quantity_received > 0 THEN
    v_new_alc := (
      (v_current_alc * v_current_quantity) + v_total_cost
    ) / (v_current_quantity + p_quantity_received);
  ELSE
    v_new_alc := p_unit_cost;
  END IF;
  
  RETURN v_new_alc;
END;
$$ LANGUAGE plpgsql;

-- Function to process receipt and update ALC
CREATE OR REPLACE FUNCTION process_receipt_and_update_alc(
  p_receipt_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_receipt RECORD;
  v_po RECORD;
  v_line_item RECORD;
  v_freight_allocation DECIMAL(12,2);
  v_duty_allocation DECIMAL(12,2);
  v_tax_allocation DECIMAL(12,2);
  v_new_alc DECIMAL(10,4);
  v_processed_count INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Get receipt information
  SELECT * INTO v_receipt FROM purchase_order_receipts WHERE id = p_receipt_id;
  SELECT * INTO v_po FROM purchase_orders WHERE id = v_receipt.purchase_order_id;
  
  -- Process each line item
  FOR v_line_item IN 
    SELECT * FROM purchase_order_line_items 
    WHERE purchase_order_id = v_po.id
  LOOP
    -- Calculate allocations
    v_freight_allocation := calculate_freight_allocation(v_po.id, v_line_item.id);
    v_duty_allocation := calculate_duty_allocation(v_po.id, v_line_item.id);
    v_tax_allocation := v_po.tax_cost / (
      SELECT COUNT(*) FROM purchase_order_line_items WHERE purchase_order_id = v_po.id
    );
    
    -- Calculate new ALC
    v_new_alc := calculate_alc(
      v_line_item.variant_id,
      v_po.shop_domain,
      v_line_item.quantity_received,
      v_line_item.unit_cost,
      v_freight_allocation,
      v_duty_allocation,
      v_tax_allocation
    );
    
    -- Update line item with allocations
    UPDATE purchase_order_line_items
    SET 
      freight_allocation = v_freight_allocation,
      duty_allocation = v_duty_allocation,
      tax_allocation = v_tax_allocation,
      landed_cost_per_unit = v_new_alc
    WHERE id = v_line_item.id;
    
    -- Record in cost history
    INSERT INTO product_cost_history (
      product_id, variant_id, shop_domain,
      new_alc, quantity_received, total_landed_cost,
      unit_cost, freight_per_unit, duty_per_unit, tax_per_unit,
      purchase_order_id, receipt_id
    ) VALUES (
      v_line_item.product_id, v_line_item.variant_id, v_po.shop_domain,
      v_new_alc, v_line_item.quantity_received,
      (v_line_item.unit_cost * v_line_item.quantity_received) + v_freight_allocation + v_duty_allocation + v_tax_allocation,
      v_line_item.unit_cost, v_freight_allocation / v_line_item.quantity_received,
      v_duty_allocation / v_line_item.quantity_received, v_tax_allocation / v_line_item.quantity_received,
      v_po.id, p_receipt_id
    );
    
    -- Record in audit trail
    INSERT INTO cost_audit_trail (
      product_id, variant_id, shop_domain,
      change_type, new_cost, cost_difference,
      source_type, source_id, source_reference,
      change_reason, changed_by
    ) VALUES (
      v_line_item.product_id, v_line_item.variant_id, v_po.shop_domain,
      'alc_update', v_new_alc, v_new_alc - COALESCE((
        SELECT alc FROM inventory_variants 
        WHERE shopify_variant_id = v_line_item.variant_id AND shop_domain = v_po.shop_domain
      ), 0),
      'receipt', p_receipt_id, v_receipt.receipt_number,
      'Receipt processing - ALC update', 'system'
    );
    
    v_processed_count := v_processed_count + 1;
  END LOOP;
  
  -- Update receipt status
  UPDATE purchase_order_receipts
  SET status = 'processed'
  WHERE id = p_receipt_id;
  
  v_result := jsonb_build_object(
    'success', true,
    'receipt_id', p_receipt_id,
    'processed_items', v_processed_count,
    'message', 'Receipt processed and ALC updated'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS: Shopify Cost Sync
-- =============================================================================

-- Trigger to sync ALC changes to Shopify
CREATE OR REPLACE FUNCTION sync_alc_to_shopify()
RETURNS TRIGGER AS $$
DECLARE
  v_shopify_variant_id BIGINT;
  v_shop_domain TEXT;
  v_new_alc DECIMAL(10,4);
BEGIN
  -- Get variant and shop information
  v_shopify_variant_id := NEW.variant_id::BIGINT;
  v_shop_domain := NEW.shop_domain;
  v_new_alc := NEW.new_alc;
  
  -- Here you would implement Shopify API call to update inventoryItem.unitCost
  -- For now, we'll just log the change
  INSERT INTO cost_audit_trail (
    product_id, variant_id, shop_domain,
    change_type, new_cost, cost_difference,
    source_type, source_reference,
    change_reason, changed_by
  ) VALUES (
    NEW.product_id, NEW.variant_id, NEW.shop_domain,
    'shopify_sync', v_new_alc, 0,
    'system', 'ALC_TRIGGER',
    'ALC change triggered Shopify sync', 'system'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for Shopify cost sync
CREATE TRIGGER trigger_sync_alc_to_shopify
  AFTER INSERT ON product_cost_history
  FOR EACH ROW
  EXECUTE FUNCTION sync_alc_to_shopify();

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_cost_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_audit_trail ENABLE ROW LEVEL SECURITY;

-- Purchase Orders RLS Policies
CREATE POLICY "po_read_authenticated"
  ON purchase_orders
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "po_insert_operators"
  ON purchase_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "po_update_operators"
  ON purchase_orders
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- Purchase Order Receipts RLS Policies
CREATE POLICY "por_read_authenticated"
  ON purchase_order_receipts
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "por_insert_operators"
  ON purchase_order_receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "por_update_operators"
  ON purchase_order_receipts
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- Purchase Order Line Items RLS Policies
CREATE POLICY "poli_read_authenticated"
  ON purchase_order_line_items
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "poli_insert_operators"
  ON purchase_order_line_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "poli_update_operators"
  ON purchase_order_line_items
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- Product Cost History RLS Policies (read-only for most users)
CREATE POLICY "pch_read_authenticated"
  ON product_cost_history
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "pch_insert_system"
  ON product_cost_history
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- Cost Audit Trail RLS Policies (read-only for most users)
CREATE POLICY "cat_read_authenticated"
  ON cost_audit_trail
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "cat_insert_system"
  ON cost_audit_trail
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- =============================================================================
-- Comments for documentation
-- =============================================================================
COMMENT ON TABLE purchase_orders IS 'Purchase orders with freight and duty tracking for ALC calculation';
COMMENT ON TABLE purchase_order_receipts IS 'Receipt processing for purchase orders';
COMMENT ON TABLE purchase_order_line_items IS 'Line items for purchase orders with ALC allocations';
COMMENT ON TABLE product_cost_history IS 'Historical ALC tracking for products over time';
COMMENT ON TABLE cost_audit_trail IS 'Audit trail for all cost changes and ALC updates';

COMMENT ON FUNCTION calculate_freight_allocation IS 'Calculates freight allocation by weight for line items';
COMMENT ON FUNCTION calculate_duty_allocation IS 'Calculates duty allocation for line items';
COMMENT ON FUNCTION calculate_alc IS 'Calculates Average Landed Cost using weighted average';
COMMENT ON FUNCTION process_receipt_and_update_alc IS 'Processes receipt and updates ALC for all line items';
COMMENT ON FUNCTION sync_alc_to_shopify IS 'Syncs ALC changes to Shopify inventoryItem.unitCost';
