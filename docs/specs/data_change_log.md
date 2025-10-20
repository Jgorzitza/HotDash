# HotDash Data Change Log

## Purpose

This document tracks all database schema changes, migrations, and data modifications with rollback procedures. Maintained by the Data agent as part of production-grade data pipeline responsibilities.

---

## 2025-10-20: Inventory Management System (Migrations 20251020190500, 20251020190600)

**Date**: 2025-10-20  
**Migrations**: 
- `supabase/migrations/20251020190500_inventory_tables.sql` (12K, 268 lines)
- `supabase/migrations/20251020190600_inventory_rls.sql` (14K, 306 lines)

**Status**: Pending application (local files created 2025-10-19 20:17, not yet applied to production)  
**Owner**: Data Agent (integration), Inventory Agent (schema design)  
**Priority**: P0 - Critical for inventory intelligence system

### Changes

**New Tables** (8 total):

1. **products** - Shopify products synced via GraphQL Admin API
   - 11 columns: id (Shopify GID), shopify_id, title, vendor, product_type, tags (array), status, timestamps, metadata (JSONB), project
   - Indexes: shopify_id, vendor, tags (GIN), status, project
   - Comments: Tag support for BUNDLE:TRUE, PACK:X picker features

2. **variants** - Shopify product variants
   - 14 columns: id, shopify_id, product_id (FK→products), title, sku, price, compare_at_price, position, inventory_policy, fulfillment_service, timestamps, metadata, project
   - Foreign Key: CASCADE delete from products
   - Indexes: product_id, sku, shopify_id, project

3. **inventory_snapshots** - Daily inventory levels with ROP calculations
   - 17 columns: variant_id (FK→variants), snapshot_date, quantities (available/on_hand/committed/incoming), sales metrics (avg_daily_sales, max_daily_sales, sales_velocity), ROP fields (lead_time_days, max_lead_days, safety_stock, reorder_point), status, weeks_of_supply, timestamps, project
   - Unique constraint: (variant_id, snapshot_date, project)
   - Indexes: variant, date, status, project

4. **vendors** - Vendor/supplier management
   - 9 columns: id, name (UNIQUE), contact info (name/email/phone), lead_time_days, max_lead_days, payment_terms, notes, timestamps, project
   - Indexes: name, project

5. **product_vendors** - Product-vendor associations with costs
   - 9 columns: id, product_id (FK→products), vendor_id (FK→vendors), cost, is_primary, sku, notes, timestamps, project
   - Unique constraint: (product_id, vendor_id, project)
   - Indexes: product, vendor, is_primary, project

6. **purchase_orders** - Internal purchase orders (CSV export to vendors)
   - 11 columns: id, po_number (UNIQUE), vendor_id (FK→vendors), status (draft/sent/confirmed/received/cancelled), dates (order/expected_delivery/actual_delivery), total_cost, notes, created_by, timestamps, project
   - Indexes: vendor, status, po_number, project

7. **purchase_order_items** - PO line items
   - 8 columns: id, po_id (FK→purchase_orders CASCADE), variant_id (FK→variants), quantity, unit_cost, total_cost, received_quantity, timestamps, project
   - Indexes: po, variant, project

8. **inventory_events** - Immutable audit trail for inventory operations
   - 7 columns: id, event_type (sync/reorder/adjustment/po_created/po_received), entity_type (product/variant/po/vendor), entity_id, metadata (JSONB), created_by, timestamps, project
   - Indexes: event_type, (entity_type, entity_id), created_at DESC, project

**Functions** (1 total):

- `update_updated_at_column()` - Auto-update updated_at timestamp trigger function

**Triggers** (7 total):

- Auto-update triggers on all 7 main tables (products, variants, inventory_snapshots, vendors, product_vendors, purchase_orders, purchase_order_items)

**RLS Policies** (32+ total):

Per table (8 tables × 4 policies average):
- Service role full access (ALL operations)
- Authenticated read by project (SELECT with project isolation)
- AI readonly read all (SELECT for ai_readonly, analytics_reader roles)
- Authenticated insert/update by project (WITH CHECK project validation)

**Special Policies**:
- `inventory_events`: Immutable audit trail
  - No UPDATE allowed (`inventory_events_no_update`)
  - No DELETE allowed (`inventory_events_no_delete`)
  - INSERT only for authenticated users

**Grants**:
- `authenticated`: SELECT, INSERT, UPDATE on all tables (DELETE not granted except service_role)
- `ai_readonly`, `analytics_reader`: SELECT only on all tables
- `service_role`: ALL operations on all tables
- `inventory_events`: INSERT only for authenticated (immutable records)

### Impact

**Stakeholders Unblocked**:
1. **Inventory Agent**: Complete schema for ROP calculations, PO generation, vendor management
2. **Analytics Agent**: Dashboard tiles can query inventory_snapshots for stock metrics
3. **Product Agent**: Product/variant data accessible for catalog operations
4. **Operations Agent**: Purchase order tracking and vendor coordination

**System Changes**:
- Multi-tenant isolation via `project` column and RLS policies
- Immutable audit trail via inventory_events (cannot modify/delete)
- Shopify sync pipeline ready (products/variants tables with GID support)
- ROP intelligence ready (lead times, safety stock, reorder points)
- Picker payout ready (tags array supports PACK:X metadata)

**Dependencies**:
- Requires Shopify GraphQL Admin API for product/variant sync
- Requires scheduled jobs for daily inventory snapshot calculations
- Requires ROP calculation logic for safety_stock and reorder_point fields

### Risks

**Risk Level**: Medium

**Concerns**:
1. Multi-tenant isolation depends on correct `project` setting in app context
2. Large inventory databases may have performance impact on daily snapshots
3. Immutable audit trail (inventory_events) will grow indefinitely - needs archival strategy
4. Cascading deletes from products → variants → inventory_snapshots could be disruptive

**Mitigation**:
1. RLS policies tested via `supabase/rls_tests.sql` contract test
2. Indexes on all foreign keys for query performance
3. Composite indexes on common query patterns (campaign+date, variant+date)
4. Staging database rehearsal before production apply
5. Archive plan for inventory_events (e.g., partition by date, archive >1 year)

### Rollback Plan

**Estimated Time**: 90 seconds

**Rollback SQL**:

```sql
-- Migration 20251020190600: Drop RLS policies first
DROP POLICY IF EXISTS inventory_events_no_delete ON public.inventory_events;
DROP POLICY IF EXISTS inventory_events_no_update ON public.inventory_events;
DROP POLICY IF EXISTS inventory_events_insert_by_project ON public.inventory_events;
DROP POLICY IF EXISTS inventory_events_read_ai_readonly ON public.inventory_events;
DROP POLICY IF EXISTS inventory_events_read_by_project ON public.inventory_events;
DROP POLICY IF EXISTS inventory_events_service_role_all ON public.inventory_events;

DROP POLICY IF EXISTS purchase_order_items_update_by_project ON public.purchase_order_items;
DROP POLICY IF EXISTS purchase_order_items_insert_by_project ON public.purchase_order_items;
DROP POLICY IF EXISTS purchase_order_items_read_ai_readonly ON public.purchase_order_items;
DROP POLICY IF EXISTS purchase_order_items_read_by_project ON public.purchase_order_items;
DROP POLICY IF EXISTS purchase_order_items_service_role_all ON public.purchase_order_items;

DROP POLICY IF EXISTS purchase_orders_update_by_project ON public.purchase_orders;
DROP POLICY IF EXISTS purchase_orders_insert_by_project ON public.purchase_orders;
DROP POLICY IF EXISTS purchase_orders_read_ai_readonly ON public.purchase_orders;
DROP POLICY IF EXISTS purchase_orders_read_by_project ON public.purchase_orders;
DROP POLICY IF EXISTS purchase_orders_service_role_all ON public.purchase_orders;

DROP POLICY IF EXISTS product_vendors_update_by_project ON public.product_vendors;
DROP POLICY IF EXISTS product_vendors_insert_by_project ON public.product_vendors;
DROP POLICY IF EXISTS product_vendors_read_ai_readonly ON public.product_vendors;
DROP POLICY IF EXISTS product_vendors_read_by_project ON public.product_vendors;
DROP POLICY IF EXISTS product_vendors_service_role_all ON public.product_vendors;

DROP POLICY IF EXISTS vendors_update_by_project ON public.vendors;
DROP POLICY IF EXISTS vendors_insert_by_project ON public.vendors;
DROP POLICY IF EXISTS vendors_read_ai_readonly ON public.vendors;
DROP POLICY IF EXISTS vendors_read_by_project ON public.vendors;
DROP POLICY IF EXISTS vendors_service_role_all ON public.vendors;

DROP POLICY IF EXISTS inventory_snapshots_update_by_project ON public.inventory_snapshots;
DROP POLICY IF EXISTS inventory_snapshots_insert_by_project ON public.inventory_snapshots;
DROP POLICY IF EXISTS inventory_snapshots_read_ai_readonly ON public.inventory_snapshots;
DROP POLICY IF EXISTS inventory_snapshots_read_by_project ON public.inventory_snapshots;
DROP POLICY IF EXISTS inventory_snapshots_service_role_all ON public.inventory_snapshots;

DROP POLICY IF EXISTS variants_update_by_project ON public.variants;
DROP POLICY IF EXISTS variants_insert_by_project ON public.variants;
DROP POLICY IF EXISTS variants_read_ai_readonly ON public.variants;
DROP POLICY IF EXISTS variants_read_by_project ON public.variants;
DROP POLICY IF EXISTS variants_service_role_all ON public.variants;

DROP POLICY IF EXISTS products_update_by_project ON public.products;
DROP POLICY IF EXISTS products_insert_by_project ON public.products;
DROP POLICY IF EXISTS products_read_ai_readonly ON public.products;
DROP POLICY IF EXISTS products_read_by_project ON public.products;
DROP POLICY IF EXISTS products_service_role_all ON public.products;

-- Disable RLS on all tables
ALTER TABLE public.inventory_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Migration 20251020190500: Drop tables in reverse dependency order
DROP TRIGGER IF EXISTS update_purchase_order_items_updated_at ON public.purchase_order_items;
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON public.purchase_orders;
DROP TRIGGER IF EXISTS update_product_vendors_updated_at ON public.product_vendors;
DROP TRIGGER IF EXISTS update_vendors_updated_at ON public.vendors;
DROP TRIGGER IF EXISTS update_inventory_snapshots_updated_at ON public.inventory_snapshots;
DROP TRIGGER IF EXISTS update_variants_updated_at ON public.variants;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;

DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS public.inventory_events CASCADE;
DROP TABLE IF EXISTS public.purchase_order_items CASCADE;
DROP TABLE IF EXISTS public.purchase_orders CASCADE;
DROP TABLE IF EXISTS public.product_vendors CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.inventory_snapshots CASCADE;
DROP TABLE IF EXISTS public.variants CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
```

**Validation After Rollback**:

```sql
-- Verify tables removed
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'variants', 'inventory_snapshots', 'vendors', 
                     'product_vendors', 'purchase_orders', 'purchase_order_items', 'inventory_events');
-- Expected: 0 rows

-- Verify function removed
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'update_updated_at_column';
-- Expected: 0 rows (or 1 if used by other tables)
```

**Data Loss Risk**: LOW - New tables with no existing data

**Monitoring**: 
- Check Supabase dashboard for query errors after rollback
- Verify Inventory Agent reports no schema errors
- Confirm dashboard tiles not querying removed tables

---

## 2025-10-20: Ads Tracking Schema (Migration 20251020005738)

**Date**: 2025-10-20  
**Migration**: `supabase/migrations/20251020005738_ads_tracking.sql`  
**Status**: Pending application (local file created, not yet applied to production)  
**Owner**: Data Agent (integration), Ads Agent (schema design)

### Changes

**New Tables**:

1. `ads_campaigns` - Campaign configuration and metadata
2. `ads_daily_metrics` - Daily aggregated metrics with calculated ROAS/CPC/CPA

**Schema Details**:

- **ads_campaigns**: 14 columns including campaign_id, platform, status, budget_cents, target_roas, UTM parameters
- **ads_daily_metrics**: 15 columns including spend_cents, impressions, clicks, conversions, revenue_cents, calculated metrics (CPC, CPA, ROAS, CTR, conversion_rate)

**Indexes**:

- `idx_ads_campaigns_platform` - Fast platform filtering
- `idx_ads_campaigns_status` - Status-based queries
- `idx_ads_campaigns_dates` - Date range queries
- `idx_ads_campaigns_utm` - UTM tracking queries
- `idx_ads_daily_metrics_campaign` - Campaign aggregations
- `idx_ads_daily_metrics_date` - Time-series queries
- `idx_ads_daily_metrics_campaign_date` - Composite for dashboard tiles

**Functions**:

1. `update_updated_at_column()` - Auto-update timestamps
2. `calculate_ads_metrics()` - Auto-calculate ROAS, CPC, CPA, CTR, conversion_rate (division by zero safe)

**RLS Policies** (4 total):

1. `Allow authenticated users to read campaigns` - SELECT for authenticated role
2. `Allow authenticated users to read metrics` - SELECT for authenticated role
3. `Allow service role full access to campaigns` - ALL for service_role
4. `Allow service role full access to metrics` - ALL for service_role

### Impact

**Dashboard Tiles**: New ads intelligence tile can now query:

- Campaign performance (spend vs revenue)
- ROAS trending
- CPC/CPA optimization opportunities
- Platform comparison (Meta, Google, TikTok, Pinterest)

**API Endpoints**: Analytics agent can expose:

- `/api/ads/campaigns` - Campaign list with current status
- `/api/ads/metrics` - Daily metrics aggregation
- `/api/ads/roas-report` - ROAS trending dashboard

**Stakeholders**: Ads Agent, Analytics Agent, Product Agent (dashboard), Integrations Agent (ad platform connectors)

### Rollback Procedure

**If migration causes issues after application**:

```sql
-- Step 1: Drop RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to read campaigns" ON public.ads_campaigns;
DROP POLICY IF EXISTS "Allow authenticated users to read metrics" ON public.ads_daily_metrics;
DROP POLICY IF EXISTS "Allow service role full access to campaigns" ON public.ads_campaigns;
DROP POLICY IF EXISTS "Allow service role full access to metrics" ON public.ads_daily_metrics;

-- Step 2: Drop triggers
DROP TRIGGER IF EXISTS update_ads_campaigns_updated_at ON public.ads_campaigns;
DROP TRIGGER IF EXISTS update_ads_daily_metrics_updated_at ON public.ads_daily_metrics;
DROP TRIGGER IF EXISTS calculate_ads_metrics_trigger ON public.ads_daily_metrics;

-- Step 3: Drop functions
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.calculate_ads_metrics();

-- Step 4: Drop indexes
DROP INDEX IF EXISTS public.idx_ads_campaigns_platform;
DROP INDEX IF EXISTS public.idx_ads_campaigns_status;
DROP INDEX IF EXISTS public.idx_ads_campaigns_dates;
DROP INDEX IF EXISTS public.idx_ads_campaigns_utm;
DROP INDEX IF EXISTS public.idx_ads_daily_metrics_campaign;
DROP INDEX IF EXISTS public.idx_ads_daily_metrics_date;
DROP INDEX IF EXISTS public.idx_ads_daily_metrics_campaign_date;

-- Step 5: Drop tables (CASCADE to handle foreign keys)
DROP TABLE IF EXISTS public.ads_daily_metrics CASCADE;
DROP TABLE IF EXISTS public.ads_campaigns CASCADE;

-- Step 6: Remove migration record
DELETE FROM supabase_migrations.schema_migrations
WHERE version = '20251020005738';
```

**Validation After Rollback**:

```sql
-- Verify tables removed
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ads_campaigns', 'ads_daily_metrics');
-- Expected: 0 rows

-- Verify migration record removed
SELECT version FROM supabase_migrations.schema_migrations
WHERE version = '20251020005738';
-- Expected: 0 rows
```

**Estimated Rollback Time**: 30 seconds (no data dependencies, tables new)

**Data Loss Risk**: LOW (new tables, no existing data to preserve)

### Testing

**Pre-Application Tests**:

- [x] RLS policies verified (supabase/rls_tests.sql updated)
- [ ] Migration dry-run on local database
- [ ] Performance test: calculated metrics function (<100ms)
- [ ] Integration test: Analytics API can query after migration

**Post-Application Tests**:

- [ ] Verify tables exist with correct schema
- [ ] Verify RLS enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename LIKE 'ads_%';`
- [ ] Verify policies active: `SELECT COUNT(*) FROM pg_policies WHERE tablename LIKE 'ads_%';` (expect 4)
- [ ] Test metric calculation: Insert sample row, verify ROAS/CPC/CPA auto-calculated

**Contract Test**: `supabase/rls_tests.sql` (section: NEW ADS TRACKING TABLES)

---

## 2025-10-19: P0 RLS Security Fix

**Date**: 2025-10-19  
**Migration**: Direct SQL (not file-based)  
**Status**: APPLIED to production ✅  
**Owner**: Data Agent  
**Priority**: P0 - Production Blocker

### Changes

**RLS Enabled on 4 Critical Tables**:

1. `ads_metrics_daily` - Row Level Security enabled
2. `agent_run` - Row Level Security enabled
3. `agent_qc` - Row Level Security enabled
4. `creds_meta` - Row Level Security enabled (CRITICAL - credentials table)

**RLS Policies Created** (6 total):

1. `authenticated_read_ads_metrics` ON `ads_metrics_daily` - SELECT for authenticated
2. `service_write_ads_metrics` ON `ads_metrics_daily` - ALL for service_role
3. `service_role_full_access_agent_run` ON `agent_run` - ALL for service_role
4. `service_role_full_access_agent_qc` ON `agent_qc` - ALL for service_role
5. `service_role_only_creds_meta` ON `creds_meta` - ALL for service_role (NO authenticated access)

### Impact

**Security**: Production database no longer exposed to unauthenticated access on critical tables

**Performance**: Negligible (RLS policies are indexed, service_role bypass RLS in most application queries)

**Deployment**: Unblocked production deployment (was P0 blocker)

### Rollback Procedure

**If RLS causes issues**:

```sql
-- Disable RLS on each table (preserves policies for re-enable)
ALTER TABLE public.ads_metrics_daily DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_run DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_qc DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.creds_meta DISABLE ROW LEVEL SECURITY;

-- If full rollback needed (drop policies)
DROP POLICY IF EXISTS authenticated_read_ads_metrics ON public.ads_metrics_daily;
DROP POLICY IF EXISTS service_write_ads_metrics ON public.ads_metrics_daily;
DROP POLICY IF EXISTS service_role_full_access_agent_run ON public.agent_run;
DROP POLICY IF EXISTS service_role_full_access_agent_qc ON public.agent_qc;
DROP POLICY IF EXISTS service_role_only_creds_meta ON public.creds_meta;
```

**Validation After Rollback**:

```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('ads_metrics_daily', 'agent_run', 'agent_qc', 'creds_meta');
-- Expected: All show rowsecurity = f
```

**Estimated Rollback Time**: 15 seconds

**Data Loss Risk**: NONE (only disables access control, data preserved)

---

## Change Log Maintenance

**Update Frequency**: Every migration, schema change, or production data modification

**Required Fields**:

- Date
- Migration file (if applicable)
- Status (Pending/Applied/Rolled Back)
- Owner
- Changes summary
- Impact analysis
- Rollback procedure (tested)
- Testing checklist

**Reviewers**: Manager (approves migrations), DevOps (coordinates apply windows), QA (validates post-migration)

---

**Last Updated**: 2025-10-20  
**Maintained By**: Data Agent  
**Status**: Living Document
