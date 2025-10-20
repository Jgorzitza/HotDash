-- Inventory Management Tables
-- Priority: P0 (Inventory Intelligence System)
-- Owner: inventory
-- Date: 2025-10-20
-- Ref: docs/specs/inventory_spec.md, docs/directions/inventory.md

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
-- Stores Shopify product data (synced via GraphQL Admin API)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY, -- Shopify product ID (gid://shopify/Product/...)
  shopify_id BIGINT NOT NULL UNIQUE, -- Numeric product ID for convenience
  title TEXT NOT NULL,
  vendor TEXT,
  product_type TEXT,
  tags TEXT[], -- Array of tags (for BUNDLE:TRUE, etc.)
  status TEXT NOT NULL DEFAULT 'active', -- active, archived, draft
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shopify_created_at TIMESTAMPTZ,
  shopify_updated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}', -- Additional Shopify metafields
  project TEXT NOT NULL DEFAULT 'occ' -- Project namespace for RLS
);

CREATE INDEX idx_products_shopify_id ON public.products(shopify_id);
CREATE INDEX idx_products_vendor ON public.products(vendor);
CREATE INDEX idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_project ON public.products(project);

COMMENT ON TABLE public.products IS 'Shopify products synced via GraphQL Admin API';
COMMENT ON COLUMN public.products.tags IS 'Shopify tags array (e.g., BUNDLE:TRUE, PACK:X)';
COMMENT ON COLUMN public.products.metadata IS 'Additional Shopify metafields as JSONB';

-- ============================================================================
-- VARIANTS TABLE
-- ============================================================================
-- Stores Shopify product variants
CREATE TABLE IF NOT EXISTS public.variants (
  id TEXT PRIMARY KEY, -- Shopify variant ID (gid://shopify/ProductVariant/...)
  shopify_id BIGINT NOT NULL UNIQUE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sku TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  position INTEGER NOT NULL DEFAULT 1,
  inventory_policy TEXT DEFAULT 'deny', -- deny, continue
  fulfillment_service TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shopify_created_at TIMESTAMPTZ,
  shopify_updated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ'
);

CREATE INDEX idx_variants_product_id ON public.variants(product_id);
CREATE INDEX idx_variants_sku ON public.variants(sku);
CREATE INDEX idx_variants_shopify_id ON public.variants(shopify_id);
CREATE INDEX idx_variants_project ON public.variants(project);

COMMENT ON TABLE public.variants IS 'Shopify product variants';
COMMENT ON COLUMN public.variants.sku IS 'Stock Keeping Unit identifier';

-- ============================================================================
-- INVENTORY_SNAPSHOTS TABLE
-- ============================================================================
-- Stores inventory levels and calculated metrics
CREATE TABLE IF NOT EXISTS public.inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id TEXT NOT NULL REFERENCES public.variants(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  on_hand_quantity INTEGER NOT NULL DEFAULT 0,
  committed_quantity INTEGER NOT NULL DEFAULT 0,
  incoming_quantity INTEGER NOT NULL DEFAULT 0,
  
  -- Sales metrics
  avg_daily_sales NUMERIC(10,2),
  max_daily_sales NUMERIC(10,2),
  sales_velocity TEXT, -- high, medium, low, dormant
  
  -- ROP calculations
  lead_time_days INTEGER DEFAULT 7,
  max_lead_days INTEGER DEFAULT 10,
  safety_stock INTEGER,
  reorder_point INTEGER,
  
  -- Inventory status
  status TEXT NOT NULL DEFAULT 'in_stock', -- in_stock, low_stock, out_of_stock, urgent_reorder
  weeks_of_supply NUMERIC(5,2),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ',
  
  UNIQUE(variant_id, snapshot_date, project)
);

CREATE INDEX idx_inventory_snapshots_variant ON public.inventory_snapshots(variant_id);
CREATE INDEX idx_inventory_snapshots_date ON public.inventory_snapshots(snapshot_date);
CREATE INDEX idx_inventory_snapshots_status ON public.inventory_snapshots(status);
CREATE INDEX idx_inventory_snapshots_project ON public.inventory_snapshots(project);

COMMENT ON TABLE public.inventory_snapshots IS 'Daily inventory snapshots with calculated ROP and status';
COMMENT ON COLUMN public.inventory_snapshots.reorder_point IS 'Calculated ROP = avg_daily_sales * lead_time + safety_stock';
COMMENT ON COLUMN public.inventory_snapshots.safety_stock IS 'Calculated safety stock buffer';

-- ============================================================================
-- VENDORS TABLE
-- ============================================================================
-- Stores vendor/supplier information
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  lead_time_days INTEGER NOT NULL DEFAULT 7,
  max_lead_days INTEGER NOT NULL DEFAULT 10,
  payment_terms TEXT, -- Net 30, Net 60, etc.
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ'
);

CREATE INDEX idx_vendors_name ON public.vendors(name);
CREATE INDEX idx_vendors_project ON public.vendors(project);

COMMENT ON TABLE public.vendors IS 'Vendor/supplier management';

-- ============================================================================
-- PRODUCT_VENDORS TABLE
-- ============================================================================
-- Associates products with vendors and costs
CREATE TABLE IF NOT EXISTS public.product_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  cost NUMERIC(10,2) NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sku TEXT, -- Vendor's SKU for this product
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ',
  
  UNIQUE(product_id, vendor_id, project)
);

CREATE INDEX idx_product_vendors_product ON public.product_vendors(product_id);
CREATE INDEX idx_product_vendors_vendor ON public.product_vendors(vendor_id);
CREATE INDEX idx_product_vendors_primary ON public.product_vendors(is_primary);
CREATE INDEX idx_product_vendors_project ON public.product_vendors(project);

COMMENT ON TABLE public.product_vendors IS 'Product-vendor associations with costs';

-- ============================================================================
-- PURCHASE_ORDERS TABLE
-- ============================================================================
-- Internal purchase orders (CSV export to vendors)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT NOT NULL UNIQUE, -- Generated PO number
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, confirmed, received, cancelled
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  total_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by TEXT, -- User who created PO
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ'
);

CREATE INDEX idx_purchase_orders_vendor ON public.purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_purchase_orders_po_number ON public.purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_project ON public.purchase_orders(project);

COMMENT ON TABLE public.purchase_orders IS 'Internal purchase orders for vendor ordering';

-- ============================================================================
-- PURCHASE_ORDER_ITEMS TABLE
-- ============================================================================
-- Line items for purchase orders
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL REFERENCES public.variants(id),
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(12,2) NOT NULL,
  received_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ'
);

CREATE INDEX idx_po_items_po ON public.purchase_order_items(po_id);
CREATE INDEX idx_po_items_variant ON public.purchase_order_items(variant_id);
CREATE INDEX idx_po_items_project ON public.purchase_order_items(project);

COMMENT ON TABLE public.purchase_order_items IS 'Line items for purchase orders';

-- ============================================================================
-- INVENTORY_EVENTS TABLE
-- ============================================================================
-- Audit trail for inventory operations
CREATE TABLE IF NOT EXISTS public.inventory_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- sync, reorder, adjustment, po_created, po_received
  entity_type TEXT NOT NULL, -- product, variant, po, vendor
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_by TEXT, -- User or system
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project TEXT NOT NULL DEFAULT 'occ'
);

CREATE INDEX idx_inventory_events_type ON public.inventory_events(event_type);
CREATE INDEX idx_inventory_events_entity ON public.inventory_events(entity_type, entity_id);
CREATE INDEX idx_inventory_events_created ON public.inventory_events(created_at DESC);
CREATE INDEX idx_inventory_events_project ON public.inventory_events(project);

COMMENT ON TABLE public.inventory_events IS 'Audit trail for all inventory operations';

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all tables
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON public.variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_snapshots_updated_at BEFORE UPDATE ON public.inventory_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_vendors_updated_at BEFORE UPDATE ON public.product_vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_order_items_updated_at BEFORE UPDATE ON public.purchase_order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


