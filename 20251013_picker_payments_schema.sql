-- Migration: 20251013_picker_payments_schema.sql
-- Description: Create database schema for picker payment tracking system

-- Create pickers table
CREATE TABLE IF NOT EXISTS pickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial picker (source from vault/occ/zoho/sumesh_picker.env)
INSERT INTO pickers (name, email, active)
VALUES ('Sumesh', 'hotrodanllc@gmail.com', true)
ON CONFLICT (email) DO NOTHING;

-- Create picker_earnings table
CREATE TABLE IF NOT EXISTS picker_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL, -- Shopify order ID
  picker_email TEXT NOT NULL REFERENCES pickers(email),
  total_pieces INTEGER NOT NULL,
  payout_cents INTEGER NOT NULL, -- in cents (200, 400, or 700)
  bracket TEXT NOT NULL, -- '1-4', '5-10', '11+'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(order_id, picker_email)
);

-- Create indexes for picker_earnings
CREATE INDEX IF NOT EXISTS idx_picker_earnings_email ON picker_earnings(picker_email);
CREATE INDEX IF NOT EXISTS idx_picker_earnings_order ON picker_earnings(order_id);
CREATE INDEX IF NOT EXISTS idx_picker_earnings_date ON picker_earnings(created_at);

-- Create picker_payments table
CREATE TABLE IF NOT EXISTS picker_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  picker_email TEXT NOT NULL REFERENCES pickers(email),
  amount_cents INTEGER NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for picker_payments
CREATE INDEX IF NOT EXISTS idx_picker_payments_email ON picker_payments(picker_email);
CREATE INDEX IF NOT EXISTS idx_picker_payments_date ON picker_payments(paid_at);

-- Update inventory_items table (check if table exists first)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
    ALTER TABLE inventory_items
    ADD COLUMN IF NOT EXISTS picker_quantity INTEGER DEFAULT 1;

    COMMENT ON COLUMN inventory_items.picker_quantity IS
    'Number of pieces this item counts as for picker payment calculation. Set from Shopify PACK:X tag, DROPSHIP:YES = 0, default = 1';
  END IF;
END $$;

-- Update orders table
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS assigned_picker TEXT REFERENCES pickers(email),
    ADD COLUMN IF NOT EXISTS pieces_count INTEGER,
    ADD COLUMN IF NOT EXISTS picker_payout INTEGER; -- in cents

    CREATE INDEX IF NOT EXISTS idx_orders_picker ON orders(assigned_picker);
    CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_picker ON orders(fulfillment_status, assigned_picker)
      WHERE fulfillment_status = 'fulfilled';
  END IF;
END $$;

-- Create database views

-- 1. picker_balances view
CREATE OR REPLACE VIEW picker_balances AS
SELECT
  p.id,
  p.name,
  p.email,
  p.active,
  COALESCE(SUM(pe.payout_cents), 0) as total_earnings_cents,
  COALESCE(SUM(pp.amount_cents), 0) as total_paid_cents,
  COALESCE(SUM(pe.payout_cents), 0) - COALESCE(SUM(pp.amount_cents), 0) as balance_cents,
  COUNT(DISTINCT pe.order_id) as orders_fulfilled,
  MAX(pe.created_at) as last_earning_date,
  MAX(pp.paid_at) as last_payment_date
FROM pickers p
LEFT JOIN picker_earnings pe ON p.email = pe.picker_email
LEFT JOIN picker_payments pp ON p.email = pp.picker_email
GROUP BY p.id, p.name, p.email, p.active;

COMMENT ON VIEW picker_balances IS
'Summary of each picker''s earnings, payments, and outstanding balance';

-- 2. unassigned_fulfilled_orders view
CREATE OR REPLACE VIEW unassigned_fulfilled_orders AS
SELECT
  o.id,
  o.shopify_order_id,
  o.fulfilled_at,
  o.total_price,
  COUNT(ol.id) as line_item_count,
  SUM(ol.quantity) as total_items
FROM orders o
LEFT JOIN order_line_items ol ON o.id = ol.order_id
WHERE o.fulfillment_status = 'fulfilled'
  AND o.assigned_picker IS NULL
GROUP BY o.id, o.shopify_order_id, o.fulfilled_at, o.total_price
ORDER BY o.fulfilled_at DESC;

COMMENT ON VIEW unassigned_fulfilled_orders IS
'Fulfilled orders awaiting picker assignment for payment calculation';

-- 3. picker_order_history view
CREATE OR REPLACE VIEW picker_order_history AS
SELECT
  pe.picker_email,
  p.name as picker_name,
  o.shopify_order_id,
  o.fulfilled_at,
  pe.total_pieces,
  pe.bracket,
  pe.payout_cents,
  pe.created_at as earning_recorded_at
FROM picker_earnings pe
JOIN pickers p ON pe.picker_email = p.email
JOIN orders o ON pe.order_id = o.shopify_order_id
ORDER BY pe.created_at DESC;

COMMENT ON VIEW picker_order_history IS
'Complete history of picker earnings by order';

-- 4. picker_payment_summary view (for packer-facing app)
CREATE OR REPLACE VIEW picker_payment_summary AS
SELECT
  pp.picker_email,
  p.name as picker_name,
  pp.paid_at,
  pp.amount_cents,
  pp.notes,
  pp.created_at
FROM picker_payments pp
JOIN pickers p ON pp.picker_email = p.email
ORDER BY pp.paid_at DESC;

COMMENT ON VIEW picker_payment_summary IS
'Payment history for picker-facing app dashboard';
