-- Enable RLS on Inventory Tables
-- Priority: CRITICAL (multi-tenant data isolation)
-- Owner: inventory
-- Date: 2025-10-20
-- Ref: docs/specs/inventory_spec.md, docs/directions/inventory.md

-- ============================================================================
-- ENABLE RLS ON ALL INVENTORY TABLES
-- ============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE ROLES IF NOT EXISTS
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ai_readonly') THEN
    CREATE ROLE ai_readonly NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analytics_reader') THEN
    CREATE ROLE analytics_reader NOINHERIT;
  END IF;
END$$;

-- ============================================================================
-- PRODUCTS TABLE RLS POLICIES
-- ============================================================================

-- Service role has full access
CREATE POLICY products_service_role_all
  ON public.products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read products for their project
CREATE POLICY products_read_by_project
  ON public.products
  FOR SELECT
  TO authenticated, anon
  USING (
    project = COALESCE(
      current_setting('app.current_project', true),
      auth.jwt() ->> 'project'
    )
    OR auth.role() = 'service_role'
  );

-- AI readonly can read all products
CREATE POLICY products_read_ai_readonly
  ON public.products
  FOR SELECT
  TO ai_readonly, analytics_reader
  USING (true);

-- Authenticated users can insert products for their project
CREATE POLICY products_insert_by_project
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project = COALESCE(
      current_setting('app.current_project', true),
      auth.jwt() ->> 'project'
    )
    OR auth.role() = 'service_role'
  );

-- Authenticated users can update products for their project
CREATE POLICY products_update_by_project
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (
    project = COALESCE(
      current_setting('app.current_project', true),
      auth.jwt() ->> 'project'
    )
    OR auth.role() = 'service_role'
  );

-- ============================================================================
-- VARIANTS TABLE RLS POLICIES
-- ============================================================================

CREATE POLICY variants_service_role_all
  ON public.variants FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY variants_read_by_project
  ON public.variants FOR SELECT TO authenticated, anon
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY variants_read_ai_readonly
  ON public.variants FOR SELECT TO ai_readonly, analytics_reader USING (true);

CREATE POLICY variants_insert_by_project
  ON public.variants FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY variants_update_by_project
  ON public.variants FOR UPDATE TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

-- ============================================================================
-- INVENTORY_SNAPSHOTS TABLE RLS POLICIES
-- ============================================================================

CREATE POLICY inventory_snapshots_service_role_all
  ON public.inventory_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY inventory_snapshots_read_by_project
  ON public.inventory_snapshots FOR SELECT TO authenticated, anon
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY inventory_snapshots_read_ai_readonly
  ON public.inventory_snapshots FOR SELECT TO ai_readonly, analytics_reader USING (true);

CREATE POLICY inventory_snapshots_insert_by_project
  ON public.inventory_snapshots FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY inventory_snapshots_update_by_project
  ON public.inventory_snapshots FOR UPDATE TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

-- ============================================================================
-- VENDORS TABLE RLS POLICIES
-- ============================================================================

CREATE POLICY vendors_service_role_all
  ON public.vendors FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY vendors_read_by_project
  ON public.vendors FOR SELECT TO authenticated, anon
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY vendors_read_ai_readonly
  ON public.vendors FOR SELECT TO ai_readonly, analytics_reader USING (true);

CREATE POLICY vendors_insert_by_project
  ON public.vendors FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY vendors_update_by_project
  ON public.vendors FOR UPDATE TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

-- ============================================================================
-- PRODUCT_VENDORS TABLE RLS POLICIES
-- ============================================================================

CREATE POLICY product_vendors_service_role_all
  ON public.product_vendors FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY product_vendors_read_by_project
  ON public.product_vendors FOR SELECT TO authenticated, anon
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY product_vendors_read_ai_readonly
  ON public.product_vendors FOR SELECT TO ai_readonly, analytics_reader USING (true);

CREATE POLICY product_vendors_insert_by_project
  ON public.product_vendors FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY product_vendors_update_by_project
  ON public.product_vendors FOR UPDATE TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

-- ============================================================================
-- PURCHASE_ORDERS TABLE RLS POLICIES
-- ============================================================================

CREATE POLICY purchase_orders_service_role_all
  ON public.purchase_orders FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY purchase_orders_read_by_project
  ON public.purchase_orders FOR SELECT TO authenticated, anon
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY purchase_orders_read_ai_readonly
  ON public.purchase_orders FOR SELECT TO ai_readonly, analytics_reader USING (true);

CREATE POLICY purchase_orders_insert_by_project
  ON public.purchase_orders FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY purchase_orders_update_by_project
  ON public.purchase_orders FOR UPDATE TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

-- ============================================================================
-- PURCHASE_ORDER_ITEMS TABLE RLS POLICIES
-- ============================================================================

CREATE POLICY purchase_order_items_service_role_all
  ON public.purchase_order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY purchase_order_items_read_by_project
  ON public.purchase_order_items FOR SELECT TO authenticated, anon
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY purchase_order_items_read_ai_readonly
  ON public.purchase_order_items FOR SELECT TO ai_readonly, analytics_reader USING (true);

CREATE POLICY purchase_order_items_insert_by_project
  ON public.purchase_order_items FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY purchase_order_items_update_by_project
  ON public.purchase_order_items FOR UPDATE TO authenticated
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

-- ============================================================================
-- INVENTORY_EVENTS TABLE RLS POLICIES (Immutable Audit Trail)
-- ============================================================================

CREATE POLICY inventory_events_service_role_all
  ON public.inventory_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY inventory_events_read_by_project
  ON public.inventory_events FOR SELECT TO authenticated, anon
  USING (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

CREATE POLICY inventory_events_read_ai_readonly
  ON public.inventory_events FOR SELECT TO ai_readonly, analytics_reader USING (true);

CREATE POLICY inventory_events_insert_by_project
  ON public.inventory_events FOR INSERT TO authenticated
  WITH CHECK (project = COALESCE(current_setting('app.current_project', true), auth.jwt() ->> 'project') OR auth.role() = 'service_role');

-- Prevent updates (events are immutable)
CREATE POLICY inventory_events_no_update
  ON public.inventory_events FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

-- Prevent deletes (events are immutable audit records)
CREATE POLICY inventory_events_no_delete
  ON public.inventory_events FOR DELETE TO authenticated USING (false);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Products
GRANT SELECT, INSERT, UPDATE ON public.products TO authenticated;
GRANT SELECT ON public.products TO ai_readonly, analytics_reader;
GRANT ALL ON public.products TO service_role;

-- Variants
GRANT SELECT, INSERT, UPDATE ON public.variants TO authenticated;
GRANT SELECT ON public.variants TO ai_readonly, analytics_reader;
GRANT ALL ON public.variants TO service_role;

-- Inventory Snapshots
GRANT SELECT, INSERT, UPDATE ON public.inventory_snapshots TO authenticated;
GRANT SELECT ON public.inventory_snapshots TO ai_readonly, analytics_reader;
GRANT ALL ON public.inventory_snapshots TO service_role;

-- Vendors
GRANT SELECT, INSERT, UPDATE ON public.vendors TO authenticated;
GRANT SELECT ON public.vendors TO ai_readonly, analytics_reader;
GRANT ALL ON public.vendors TO service_role;

-- Product Vendors
GRANT SELECT, INSERT, UPDATE ON public.product_vendors TO authenticated;
GRANT SELECT ON public.product_vendors TO ai_readonly, analytics_reader;
GRANT ALL ON public.product_vendors TO service_role;

-- Purchase Orders
GRANT SELECT, INSERT, UPDATE ON public.purchase_orders TO authenticated;
GRANT SELECT ON public.purchase_orders TO ai_readonly, analytics_reader;
GRANT ALL ON public.purchase_orders TO service_role;

-- Purchase Order Items
GRANT SELECT, INSERT, UPDATE ON public.purchase_order_items TO authenticated;
GRANT SELECT ON public.purchase_order_items TO ai_readonly, analytics_reader;
GRANT ALL ON public.purchase_order_items TO service_role;

-- Inventory Events (insert only for authenticated, full for service_role)
GRANT SELECT, INSERT ON public.inventory_events TO authenticated;
GRANT SELECT ON public.inventory_events TO ai_readonly, analytics_reader;
GRANT ALL ON public.inventory_events TO service_role;

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE public.products IS 'Shopify products with RLS enabled (project isolation)';
COMMENT ON TABLE public.variants IS 'Shopify product variants with RLS enabled (project isolation)';
COMMENT ON TABLE public.inventory_snapshots IS 'Inventory snapshots with RLS enabled (project isolation)';
COMMENT ON TABLE public.vendors IS 'Vendor management with RLS enabled (project isolation)';
COMMENT ON TABLE public.product_vendors IS 'Product-vendor associations with RLS enabled (project isolation)';
COMMENT ON TABLE public.purchase_orders IS 'Purchase orders with RLS enabled (project isolation)';
COMMENT ON TABLE public.purchase_order_items IS 'Purchase order items with RLS enabled (project isolation)';
COMMENT ON TABLE public.inventory_events IS 'Immutable audit trail with RLS enabled (project isolation)';


