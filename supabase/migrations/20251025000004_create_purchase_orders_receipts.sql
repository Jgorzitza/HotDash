-- Migration: DATA-018 Purchase Order & Receipt Tables
-- Description: Create purchase_orders, purchase_order_line_items, purchase_order_receipts, product_cost_history tables for ALC tracking
-- Date: 2025-10-21
-- Agent: data
-- Related: Phase 10 - Vendor Master + ALC

-- =============================================================================
-- TABLE 1: purchase_orders
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- PO Details
  po_number TEXT NOT NULL UNIQUE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  
  -- Order Details
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE NOT NULL,
  actual_delivery_date DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'ordered', 'partial', 'received', 'cancelled'
  
  -- Costs
  subtotal DECIMAL(10,2),
  freight_cost DECIMAL(10,2),
  duty_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  
  -- Delivery Tracking
  on_time BOOLEAN, -- TRUE if actual_delivery_date <= expected_delivery_date
  days_late INTEGER, -- Calculated: actual_delivery_date - expected_delivery_date (if late)
  
  -- Metadata
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for purchase_orders table
CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_dates ON purchase_orders(order_date DESC, expected_delivery_date ASC);
CREATE INDEX idx_po_number ON purchase_orders(po_number);

-- Trigger to update updated_at
CREATE TRIGGER set_po_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- TABLE 2: purchase_order_line_items
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  
  -- Product Details
  variant_id TEXT NOT NULL,
  vendor_sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  
  -- Quantities
  ordered_qty INTEGER NOT NULL,
  received_qty INTEGER NOT NULL DEFAULT 0,
  
  -- Costs (per unit)
  cost_per_unit DECIMAL(10,2) NOT NULL,
  
  -- Weight (for freight/duty distribution)
  weight_per_unit DECIMAL(10,4), -- kg
  
  -- Line Total
  line_total DECIMAL(10,2), -- ordered_qty × cost_per_unit
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for purchase_order_line_items table
CREATE INDEX idx_po_line_po ON purchase_order_line_items(po_id);
CREATE INDEX idx_po_line_variant ON purchase_order_line_items(variant_id);

-- Trigger to update updated_at
CREATE TRIGGER set_po_line_updated_at
  BEFORE UPDATE ON purchase_order_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- TABLE 3: purchase_order_receipts
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_order_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  po_line_item_id UUID NOT NULL REFERENCES purchase_order_line_items(id) ON DELETE CASCADE,
  
  -- Receipt Details
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  qty_received INTEGER NOT NULL,
  
  -- Costs (for ALC calculation)
  vendor_invoice_amount DECIMAL(10,2) NOT NULL, -- Item cost from vendor invoice
  allocated_freight DECIMAL(10,2) DEFAULT 0, -- Freight distributed by weight
  allocated_duty DECIMAL(10,2) DEFAULT 0, -- Duty distributed by weight
  total_receipt_cost DECIMAL(10,2) NOT NULL, -- vendor_invoice + freight + duty
  
  -- Per-Unit Cost
  cost_per_unit DECIMAL(10,2) NOT NULL, -- total_receipt_cost / qty_received
  
  -- Metadata
  received_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for purchase_order_receipts table
CREATE INDEX idx_receipts_po ON purchase_order_receipts(po_id);
CREATE INDEX idx_receipts_line ON purchase_order_receipts(po_line_item_id);
CREATE INDEX idx_receipts_date ON purchase_order_receipts(receipt_date DESC);

-- Comments for ALC calculation fields
COMMENT ON COLUMN purchase_order_receipts.allocated_freight IS 'Freight distributed by weight ratio across all items in PO';
COMMENT ON COLUMN purchase_order_receipts.allocated_duty IS 'Duty distributed by weight ratio across all items in PO';
COMMENT ON COLUMN purchase_order_receipts.cost_per_unit IS 'Fully-loaded cost per unit = (vendor_invoice + freight + duty) / qty_received';

-- =============================================================================
-- TABLE 4: product_cost_history
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_cost_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product
  variant_id TEXT NOT NULL,
  
  -- Cost Snapshot
  previous_alc DECIMAL(10,2), -- ALC before this receipt
  new_alc DECIMAL(10,2) NOT NULL, -- ALC after this receipt
  previous_on_hand INTEGER, -- On-hand qty before receipt
  new_on_hand INTEGER NOT NULL, -- On-hand qty after receipt
  
  -- Receipt Reference
  receipt_id UUID REFERENCES purchase_order_receipts(id),
  receipt_qty INTEGER NOT NULL,
  receipt_cost_per_unit DECIMAL(10,2) NOT NULL,
  
  -- Metadata
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for product_cost_history table
CREATE INDEX idx_cost_history_variant ON product_cost_history(variant_id, recorded_at DESC);
CREATE INDEX idx_cost_history_receipt ON product_cost_history(receipt_id);

-- Comments for documentation
COMMENT ON TABLE product_cost_history IS 'Audit trail for ALC changes with before/after snapshots';
COMMENT ON COLUMN product_cost_history.new_alc IS 'Calculated: ((previous_alc × previous_on_hand) + (receipt_cost_per_unit × receipt_qty)) / new_on_hand';

-- =============================================================================
-- RLS POLICIES: purchase_orders
-- =============================================================================
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read purchase orders
CREATE POLICY "po_read_all"
  ON purchase_orders
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only operators can insert purchase orders
CREATE POLICY "po_insert_operator"
  ON purchase_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- Only operators can update purchase orders
CREATE POLICY "po_update_operator"
  ON purchase_orders
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

-- No deletes (data integrity)
CREATE POLICY "po_no_delete"
  ON purchase_orders
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- RLS POLICIES: purchase_order_line_items
-- =============================================================================
ALTER TABLE purchase_order_line_items ENABLE ROW LEVEL SECURITY;

-- Same policies as purchase_orders
CREATE POLICY "po_line_read_all"
  ON purchase_order_line_items
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "po_line_insert_operator"
  ON purchase_order_line_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "po_line_update_operator"
  ON purchase_order_line_items
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "po_line_no_delete"
  ON purchase_order_line_items
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- RLS POLICIES: purchase_order_receipts
-- =============================================================================
ALTER TABLE purchase_order_receipts ENABLE ROW LEVEL SECURITY;

-- Same policies as purchase_orders
CREATE POLICY "receipts_read_all"
  ON purchase_order_receipts
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "receipts_insert_operator"
  ON purchase_order_receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "receipts_update_operator"
  ON purchase_order_receipts
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "receipts_no_delete"
  ON purchase_order_receipts
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- RLS POLICIES: product_cost_history
-- =============================================================================
ALTER TABLE product_cost_history ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read cost history
CREATE POLICY "cost_history_read_all"
  ON product_cost_history
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only system can insert cost history (automated via triggers/functions)
CREATE POLICY "cost_history_insert_system"
  ON product_cost_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('operator', 'system'));

-- No updates (append-only audit trail)
CREATE POLICY "cost_history_no_update"
  ON product_cost_history
  FOR UPDATE
  TO authenticated
  USING (FALSE);

-- No deletes (permanent audit trail)
CREATE POLICY "cost_history_no_delete"
  ON product_cost_history
  FOR DELETE
  TO authenticated
  USING (FALSE);

