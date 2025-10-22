# Data Direction v8.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**

```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T16:05Z  
**Version**: 9.0  
**Status**: ✅ ALL v8.0 COMPLETE + BLOCKER-002 CLEARED — DATA-019 Ready

---

## ✅ PHASES 1-9 COMPLETE - VERIFIED

**All Previous Work Complete** (from feedback/data/2025-10-21.md):

- ✅ DATA-006: 9 performance indexes (migration ready)
- ✅ DATA-007: Query analysis (480+ lines, 5x-15x improvements)
- ✅ DATA-008: Phase 7-13 schema (11 tables for Growth, Onboarding, Advanced features)
- ✅ DATA-009: Backup/recovery runbook (800+ lines)
- ✅ DATA-011 through DATA-013: Phase 7-13 tables (11 tables implemented)
- ✅ DATA-014: Migration testing + rollback scripts
- ✅ DATA-015: RLS performance optimization (10 indexes)
- ✅ DATA-016: Query performance monitoring

**Total Output**: 14 migrations, 11 tables, 19 indexes, RLS policies, rollback scripts

**Blocked**: DATA-010 (apply indexes to staging) — awaiting Manager/DevOps with network access

---

## 🎯 NEW: Growth Engine Architecture (Effective 2025-10-21)

**Context**: Growth Engine Final Pack integrated into project (commit: 546bd0e)

### Security & Evidence Requirements (CI Merge Blockers)

1. **MCP Evidence JSONL** (code changes): `artifacts/data/<date>/mcp/<tool>.jsonl`
2. **Heartbeat NDJSON** (tasks >2h): `artifacts/data/<date>/heartbeat.ndjson` (15min max staleness)
3. **Dev MCP Ban**: NO Dev MCP imports in `app/` (production code only)
4. **PR Template**: Must include MCP Evidence + Heartbeat + Dev MCP Check sections

**See**: `.cursor/rules/10-growth-engine-pack.mdc` for full requirements

---

## 🚀 PHASE 10: Vendor Master + ALC Tables (8 hours) — P1 PRIORITY

**Objective**: Build database schema for Vendor Management and Average Landed Cost tracking

### Context

**Vendor Master** (CEO-confirmed):

- Centralized vendor database with reliability tracking
- **Reliability Score**: 0-100% = `(on_time_deliveries / total_deliveries) × 100`
- Multi-SKU support (same product, multiple vendors with different SKUs/costs)
- Usage: Operator sees "Premium Suppliers (92% reliable, 7d lead, $24.99/unit)" at PO creation

**Average Landed Cost** (CEO-confirmed with clarifications):

- **ALC Calculation** (includes existing inventory):

  ```
  New_ALC = ((Previous_ALC × On_Hand_Qty) + New_Receipt_Total) / (On_Hand_Qty + New_Receipt_Qty)

  New_Receipt_Total = Vendor_Invoice + Freight_Allocated + Duty_Allocated
  - Freight: Distributed BY WEIGHT (heavier items = more freight cost)
  - Duty: Distributed per piece by weight
  ```

- **Shopify Cost Sync**: System pushes new ALC to Shopify `inventoryItem.unitCost` via GraphQL

---

### DATA-017: Vendor Master Tables (3h)

**Migration**: `supabase/migrations/20251025000003_create_vendor_master.sql`

**Table 1: vendors**

```sql
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

-- Indexes
CREATE INDEX idx_vendors_active ON vendors(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_vendors_reliability ON vendors(reliability_score DESC) WHERE is_active = TRUE;
CREATE INDEX idx_vendors_lead_time ON vendors(lead_time_days ASC) WHERE is_active = TRUE;

-- Trigger to update updated_at
CREATE TRIGGER set_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**Table 2: vendor_product_mappings**

```sql
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

-- Indexes
CREATE INDEX idx_vpm_vendor ON vendor_product_mappings(vendor_id);
CREATE INDEX idx_vpm_product ON vendor_product_mappings(product_id);
CREATE INDEX idx_vpm_variant ON vendor_product_mappings(variant_id);
CREATE INDEX idx_vpm_preferred ON vendor_product_mappings(is_preferred) WHERE is_preferred = TRUE;

-- Trigger
CREATE TRIGGER set_vpm_updated_at
  BEFORE UPDATE ON vendor_product_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**RLS Policies**:

```sql
-- vendors table
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read vendors
CREATE POLICY "vendors_read_all"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only operators can insert/update vendors
CREATE POLICY "vendors_insert_operator"
  ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

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

-- vendor_product_mappings table
ALTER TABLE vendor_product_mappings ENABLE ROW LEVEL SECURITY;

-- Same policies as vendors
CREATE POLICY "vpm_read_all"
  ON vendor_product_mappings
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "vpm_insert_operator"
  ON vendor_product_mappings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "vpm_update_operator"
  ON vendor_product_mappings
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'operator')
  WITH CHECK (auth.jwt() ->> 'role' = 'operator');

CREATE POLICY "vpm_no_delete"
  ON vendor_product_mappings
  FOR DELETE
  TO authenticated
  USING (FALSE);
```

**Prisma Schema Updates**:

```prisma
model Vendor {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name              String
  contactName       String?  @map("contact_name")
  contactEmail      String?  @map("contact_email")
  contactPhone      String?  @map("contact_phone")
  paymentTerms      String?  @map("payment_terms")
  leadTimeDays      Int      @default(14) @map("lead_time_days")
  shipMethod        String?  @map("ship_method")
  dropShip          Boolean  @default(false) @map("drop_ship")
  currency          String   @default("USD")
  reliabilityScore  Decimal? @map("reliability_score") @db.Decimal(5, 2)
  totalOrders       Int?     @default(0) @map("total_orders")
  onTimeDeliveries  Int?     @default(0) @map("on_time_deliveries")
  lateDeliveries    Int?     @default(0) @map("late_deliveries")
  isActive          Boolean  @default(true) @map("is_active")
  notes             String?
  createdAt         DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt         DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  productMappings VendorProductMapping[]
  purchaseOrders  PurchaseOrder[]

  @@map("vendors")
  @@schema("public")
}

model VendorProductMapping {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  vendorId           String   @map("vendor_id") @db.Uuid
  productId          String   @map("product_id")
  variantId          String   @map("variant_id")
  vendorSku          String   @map("vendor_sku")
  vendorProductName  String?  @map("vendor_product_name")
  costPerUnit        Decimal  @map("cost_per_unit") @db.Decimal(10, 2)
  minimumOrderQty    Int?     @default(1) @map("minimum_order_qty")
  isPreferred        Boolean  @default(false) @map("is_preferred")
  lastOrderedAt      DateTime? @map("last_ordered_at") @db.Timestamptz(6)
  notes              String?
  createdAt          DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt          DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)

  vendor Vendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@unique([vendorId, variantId])
  @@map("vendor_product_mappings")
  @@schema("public")
}
```

**Acceptance**:

- ✅ Migration file created with both tables
- ✅ All indexes defined
- ✅ RLS policies implemented (read all, insert/update operator, no deletes)
- ✅ Prisma schema updated
- ✅ Migration tested locally (Docker Postgres)
- ✅ No SQL syntax errors

**MCP Required**:

- Context7 → Prisma schema patterns, multi-table relations

---

### DATA-018: Purchase Order & Receipt Tables (3h)

**Migration**: `supabase/migrations/20251025000004_create_purchase_orders_receipts.sql`

**Table 1: purchase_orders**

```sql
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

-- Indexes
CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_dates ON purchase_orders(order_date DESC, expected_delivery_date ASC);
CREATE INDEX idx_po_number ON purchase_orders(po_number);

-- Trigger
CREATE TRIGGER set_po_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**Table 2: purchase_order_line_items**

```sql
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

-- Indexes
CREATE INDEX idx_po_line_po ON purchase_order_line_items(po_id);
CREATE INDEX idx_po_line_variant ON purchase_order_line_items(variant_id);

-- Trigger
CREATE TRIGGER set_po_line_updated_at
  BEFORE UPDATE ON purchase_order_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

**Table 3: purchase_order_receipts**

```sql
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

-- Indexes
CREATE INDEX idx_receipts_po ON purchase_order_receipts(po_id);
CREATE INDEX idx_receipts_line ON purchase_order_receipts(po_line_item_id);
CREATE INDEX idx_receipts_date ON purchase_order_receipts(receipt_date DESC);

COMMENT ON COLUMN purchase_order_receipts.allocated_freight IS 'Freight distributed by weight ratio across all items in PO';
COMMENT ON COLUMN purchase_order_receipts.allocated_duty IS 'Duty distributed by weight ratio across all items in PO';
```

**Table 4: product_cost_history**

```sql
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

-- Indexes
CREATE INDEX idx_cost_history_variant ON product_cost_history(variant_id, recorded_at DESC);
CREATE INDEX idx_cost_history_receipt ON product_cost_history(receipt_id);

COMMENT ON TABLE product_cost_history IS 'Audit trail for ALC changes with before/after snapshots';
```

**RLS Policies**: Same pattern as vendors (read all, insert/update operator, no deletes)

**Prisma Schema**: Add models for all 4 tables

**Acceptance**:

- ✅ Migration file created with 4 tables
- ✅ All indexes defined
- ✅ Foreign key relationships correct
- ✅ RLS policies implemented
- ✅ Prisma schema updated
- ✅ Comments added for clarity
- ✅ Migration tested locally

**MCP Required**:

- Context7 → Prisma foreign key relations, cascading deletes

---

### DATA-019: Dev Memory Protection (RLS) (1h)

**Migration**: `supabase/migrations/20251025000005_dev_memory_protection.sql`

**Objective**: Prevent accidental deletes/updates on `decision_log` table (append-only audit trail)

**RLS Policies**:

```sql
-- decision_log is append-only audit trail
-- Agents can INSERT, system/operator can SELECT, NO deletes/updates

-- Prevent deletes (NO ONE can delete)
CREATE POLICY "decision_log_no_delete"
  ON decision_log
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- Prevent updates (immutable audit)
CREATE POLICY "decision_log_no_update"
  ON decision_log
  FOR UPDATE
  TO authenticated
  USING (FALSE);

COMMENT ON POLICY "decision_log_no_delete" ON decision_log IS 'Append-only audit trail - prevents accidental deletions by agents';
COMMENT ON POLICY "decision_log_no_update" ON decision_log IS 'Immutable audit - prevents modification of historical records';
```

**Acceptance**:

- ✅ Migration file created
- ✅ Both policies applied (no_delete, no_update)
- ✅ Comments added
- ✅ Tested: Attempt to delete/update fails with RLS error

**MCP Required**: Context7 → Supabase RLS policy patterns

---

### DATA-020: Local Testing & Rollback Scripts (1h)

**Objective**: Test all 3 new migrations locally and create rollback scripts

**Process**:

1. **Local Test** (Docker Postgres):

   ```bash
   # Start local Postgres with pgvector
   docker run -d --name hotdash-test-db \
     -e POSTGRES_PASSWORD=test \
     -p 5433:5432 \
     ankane/pgvector

   # Apply migrations
   DATABASE_URL="postgresql://postgres:test@localhost:5433/postgres" \
     npx prisma migrate dev --name test_vendor_alc

   # Verify tables exist
   psql "postgresql://postgres:test@localhost:5433/postgres" \
     -c "\dt vendors vendor_product_mappings purchase_orders purchase_order_line_items purchase_order_receipts product_cost_history"

   # Verify indexes
   psql ... -c "\di idx_vendors_*"

   # Test RLS policies (try delete/update decision_log)
   ```

2. **Rollback Scripts**:
   Create `supabase/migrations/rollback_vendor_alc_and_dev_memory.sql`:

   ```sql
   -- Rollback DATA-019
   DROP POLICY IF EXISTS "decision_log_no_delete" ON decision_log;
   DROP POLICY IF EXISTS "decision_log_no_update" ON decision_log;

   -- Rollback DATA-018
   DROP TABLE IF EXISTS product_cost_history CASCADE;
   DROP TABLE IF EXISTS purchase_order_receipts CASCADE;
   DROP TABLE IF EXISTS purchase_order_line_items CASCADE;
   DROP TABLE IF EXISTS purchase_orders CASCADE;

   -- Rollback DATA-017
   DROP TABLE IF EXISTS vendor_product_mappings CASCADE;
   DROP TABLE IF EXISTS vendors CASCADE;
   ```

**Acceptance**:

- ✅ All 3 migrations applied to local Docker Postgres
- ✅ Tables and indexes created successfully
- ✅ RLS policies enforced (delete/update fails on decision_log)
- ✅ Rollback script tested (rolls back cleanly)
- ✅ No SQL errors

**MCP Required**: Context7 → Prisma migration testing

---

## 🔄 PHASE 11: Search Console Persistence Tables (3 hours) — P1 PRIORITY

**Objective**: Store Search Console API data for historical trend analysis

**Context**: Search Console API is already built (`app/lib/seo/search-console.ts`) but data NOT persisted (in-memory cache only, 5min TTL). No historical tracking possible.

---

### DATA-021: Search Console Metrics Tables (3h)

**Migration**: `supabase/migrations/20251025000006_create_search_console_metrics.sql`

**Table 1: seo_search_console_metrics**

```sql
CREATE TABLE IF NOT EXISTS seo_search_console_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Time period
  date DATE NOT NULL,
  period_days INTEGER NOT NULL DEFAULT 30, -- 7, 30, 90 day windows

  -- Core metrics
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr DECIMAL(5,4) NOT NULL DEFAULT 0, -- Click-through rate (0.1234 = 12.34%)
  position DECIMAL(5,2) NOT NULL DEFAULT 0, -- Average search position

  -- 7-day change (for trend detection)
  clicks_change_7d DECIMAL(6,2),
  impressions_change_7d DECIMAL(6,2),
  ctr_change_7d DECIMAL(6,2),
  position_change_7d DECIMAL(6,2),

  -- Index coverage
  indexed_pages INTEGER,
  total_pages INTEGER,
  coverage_pct DECIMAL(5,2),

  -- Metadata
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate daily records
  UNIQUE(date, period_days)
);

-- Indexes
CREATE INDEX idx_seo_metrics_date ON seo_search_console_metrics(date DESC);
CREATE INDEX idx_seo_metrics_period ON seo_search_console_metrics(period_days, date DESC);
```

**Table 2: seo_search_queries**

```sql
CREATE TABLE IF NOT EXISTS seo_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Time period
  date DATE NOT NULL,
  period_days INTEGER NOT NULL DEFAULT 30,

  -- Query details
  query TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr DECIMAL(5,4) NOT NULL DEFAULT 0,
  position DECIMAL(5,2) NOT NULL DEFAULT 0,

  -- Ranking (1 = top query by clicks)
  rank INTEGER NOT NULL,

  -- Metadata
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate query records per day
  UNIQUE(date, period_days, query)
);

-- Indexes
CREATE INDEX idx_seo_queries_date ON seo_search_queries(date DESC);
CREATE INDEX idx_seo_queries_period ON seo_search_queries(period_days, date DESC);
CREATE INDEX idx_seo_queries_rank ON seo_search_queries(date DESC, rank ASC);
```

**Table 3: seo_landing_pages**

```sql
CREATE TABLE IF NOT EXISTS seo_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Time period
  date DATE NOT NULL,
  period_days INTEGER NOT NULL DEFAULT 30,

  -- Page details
  url TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr DECIMAL(5,4) NOT NULL DEFAULT 0,
  position DECIMAL(5,2) NOT NULL DEFAULT 0,

  -- 7-day trend
  clicks_change_7d DECIMAL(6,2),

  -- Ranking (1 = top page by clicks)
  rank INTEGER NOT NULL,

  -- Metadata
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate page records per day
  UNIQUE(date, period_days, url)
);

-- Indexes
CREATE INDEX idx_seo_landing_pages_date ON seo_landing_pages(date DESC);
CREATE INDEX idx_seo_landing_pages_period ON seo_landing_pages(period_days, date DESC);
CREATE INDEX idx_seo_landing_pages_rank ON seo_landing_pages(date DESC, rank ASC);
CREATE INDEX idx_seo_landing_pages_url ON seo_landing_pages(url, date DESC);
```

**RLS Policies**:

```sql
-- All tables: read all, insert service_role only, no deletes (historical data)
ALTER TABLE seo_search_console_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_landing_pages ENABLE ROW LEVEL SECURITY;

-- Read all
CREATE POLICY "seo_metrics_read_all"
  ON seo_search_console_metrics FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "seo_queries_read_all"
  ON seo_search_queries FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "seo_landing_pages_read_all"
  ON seo_landing_pages FOR SELECT TO authenticated USING (TRUE);

-- Insert service_role only (automated jobs)
CREATE POLICY "seo_metrics_insert_service"
  ON seo_search_console_metrics FOR INSERT TO service_role WITH CHECK (TRUE);

CREATE POLICY "seo_queries_insert_service"
  ON seo_search_queries FOR INSERT TO service_role WITH CHECK (TRUE);

CREATE POLICY "seo_landing_pages_insert_service"
  ON seo_landing_pages FOR INSERT TO service_role WITH CHECK (TRUE);

-- No deletes (historical data)
CREATE POLICY "seo_metrics_no_delete"
  ON seo_search_console_metrics FOR DELETE TO authenticated USING (FALSE);

CREATE POLICY "seo_queries_no_delete"
  ON seo_search_queries FOR DELETE TO authenticated USING (FALSE);

CREATE POLICY "seo_landing_pages_no_delete"
  ON seo_landing_pages FOR DELETE TO authenticated USING (FALSE);
```

**Prisma Schema**:

```prisma
model SeoSearchConsoleMetrics {
  id                   String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  date                 DateTime  @db.Date
  periodDays           Int       @default(30) @map("period_days")
  clicks               Int       @default(0)
  impressions          Int       @default(0)
  ctr                  Decimal   @default(0) @db.Decimal(5, 4)
  position             Decimal   @default(0) @db.Decimal(5, 2)
  clicksChange7d       Decimal?  @map("clicks_change_7d") @db.Decimal(6, 2)
  impressionsChange7d  Decimal?  @map("impressions_change_7d") @db.Decimal(6, 2)
  ctrChange7d          Decimal?  @map("ctr_change_7d") @db.Decimal(6, 2)
  positionChange7d     Decimal?  @map("position_change_7d") @db.Decimal(6, 2)
  indexedPages         Int?      @map("indexed_pages")
  totalPages           Int?      @map("total_pages")
  coveragePct          Decimal?  @map("coverage_pct") @db.Decimal(5, 2)
  fetchedAt            DateTime  @default(now()) @map("fetched_at") @db.Timestamptz(6)
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  @@unique([date, periodDays])
  @@map("seo_search_console_metrics")
  @@schema("public")
}

model SeoSearchQuery {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  date        DateTime  @db.Date
  periodDays  Int       @default(30) @map("period_days")
  query       String
  clicks      Int       @default(0)
  impressions Int       @default(0)
  ctr         Decimal   @default(0) @db.Decimal(5, 4)
  position    Decimal   @default(0) @db.Decimal(5, 2)
  rank        Int
  fetchedAt   DateTime  @default(now()) @map("fetched_at") @db.Timestamptz(6)
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  @@unique([date, periodDays, query])
  @@map("seo_search_queries")
  @@schema("public")
}

model SeoLandingPage {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  date            DateTime  @db.Date
  periodDays      Int       @default(30) @map("period_days")
  url             String
  clicks          Int       @default(0)
  impressions     Int       @default(0)
  ctr             Decimal   @default(0) @db.Decimal(5, 4)
  position        Decimal   @default(0) @db.Decimal(5, 2)
  clicksChange7d  Decimal?  @map("clicks_change_7d") @db.Decimal(6, 2)
  rank            Int
  fetchedAt       DateTime  @default(now()) @map("fetched_at") @db.Timestamptz(6)
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  @@unique([date, periodDays, url])
  @@map("seo_landing_pages")
  @@schema("public")
}
```

**Acceptance**:

- ✅ Migration file created with 3 tables
- ✅ All indexes defined (date, period, rank, url)
- ✅ RLS policies implemented (read all, insert service_role, no deletes)
- ✅ Prisma schema updated with 3 models
- ✅ Migration tested locally
- ✅ No SQL errors

**MCP Required**:

- Context7 → Prisma schema for analytics tables

---

## 📋 Acceptance Criteria (All Tasks)

### Phase 10: Vendor Master + ALC (8h)

- ✅ DATA-017: Vendor Master tables (2 tables, indexes, RLS, Prisma)
- ✅ DATA-018: PO & Receipt tables (4 tables, indexes, RLS, Prisma)
- ✅ DATA-019: Dev Memory Protection (RLS policies on decision_log)
- ✅ DATA-020: Local testing + rollback scripts

### Phase 11: Search Console Persistence (3h)

- ✅ DATA-021: Search Console Metrics tables (3 tables, indexes, RLS, Prisma)
- ✅ All migrations tested locally (Docker Postgres)
- ✅ Rollback scripts created for all new migrations
- ✅ Prisma schema updated (8 new models total)
- ✅ No SQL syntax errors
- ✅ RLS policies enforced correctly

---

## 🔧 Tools & Resources

### MCP Tools (MANDATORY)

1. **Context7 MCP**: For all schema work
   - Prisma schema patterns
   - Prisma foreign key relations
   - Prisma migration testing
   - Supabase RLS policy patterns

2. **Web Search**: LAST RESORT ONLY if Context7 doesn't have
   - Example: "Supabase RLS prevent deletes pattern"

### Evidence Requirements (CI Merge Blockers)

1. **MCP Evidence JSONL**: `artifacts/data/<date>/mcp/vendor-alc-schema.jsonl` and `mcp/search-console-schema.jsonl`
2. **Heartbeat NDJSON**: `artifacts/data/<date>/heartbeat.ndjson` (append every 15min)
3. **Dev MCP Check**: Verify NO Dev MCP imports in migrations (not applicable)
4. **PR Template**: Fill out all sections

### Testing

- **Docker Postgres**: Test locally before applying to staging
- **Rollback Scripts**: Test rollback for every forward migration
- **RLS Testing**: Verify policies work (attempt to delete/update fails)

---

## 🎯 Execution Order

**START NOW** - No idle time:

1. **DATA-017**: Vendor Master Tables (3h) → START IMMEDIATELY
   - Pull Context7: Prisma multi-table relations
   - Create migration file
   - Write vendors + vendor_product_mappings tables
   - Add indexes, RLS policies
   - Update Prisma schema

2. **DATA-018**: PO & Receipt Tables (3h)
   - Pull Context7: Prisma foreign keys, cascading deletes
   - Create migration file
   - Write 4 tables (purchase_orders, line_items, receipts, cost_history)
   - Add indexes, RLS policies
   - Update Prisma schema

3. **DATA-019**: Dev Memory Protection (1h)
   - Pull Context7: Supabase RLS prevent deletes
   - Create migration file
   - Add no_delete + no_update policies to decision_log
   - Test policies

4. **DATA-020**: Local Testing & Rollback (1h)
   - Start Docker Postgres
   - Apply all 3 migrations
   - Verify tables, indexes, RLS
   - Create + test rollback scripts

5. **DATA-021**: Search Console Tables (3h)
   - Pull Context7: Prisma analytics table patterns
   - Create migration file
   - Write 3 tables (metrics, queries, landing_pages)
   - Add indexes, RLS policies
   - Update Prisma schema
   - Test locally

**Total**: 11 hours (Phase 10: 8h, Phase 11: 3h)

**Expected Output**:

- 4 new migration files
- 8 new Prisma models
- 6 new tables (Vendor Master + ALC)
- 3 new tables (Search Console)
- 2 RLS policies (decision_log protection)
- Rollback scripts for all migrations
- All tested locally in Docker Postgres

---

## 🚨 Critical Reminders

1. **NO IDLE**: Start DATA-017 immediately after reading this direction
2. **MCP FIRST**: Pull Context7 docs BEFORE every migration
3. **Evidence JSONL**: Create `artifacts/data/2025-10-21/mcp/` and log every MCP call
4. **Heartbeat**: Tasks >2h, append to `artifacts/data/2025-10-21/heartbeat.ndjson` every 15min
5. **Local Test**: ALWAYS test in Docker Postgres before applying to staging
6. **RLS**: Verify policies work (attempt unauthorized actions should fail)
7. **Rollback**: Create and test rollback scripts for EVERY forward migration
8. **Feedback**: Update `feedback/data/2025-10-21.md` every 2 hours with progress

**Questions or blockers?** → Escalate immediately in feedback with details

**Let's build! 🗄️**

---

## ✅ ALL v8.0 TASKS COMPLETE + BLOCKER-002 CLEARED (2025-10-21)

**Completed**: DATA-006-016 (all schema, indexes, RLS work)  
**Evidence**: 7 migrations created, all applied by Manager via pooler  
**Latest**: 2025-10-21T17:35Z

**BLOCKER-002**: ✅ CLEARED by Manager (all 8 migrations applied + 100% DB protection added)

---

## 📊 MANDATORY: Progress Reporting (Database Feedback)

**Report progress via `logDecision()` every 2 hours minimum OR at task milestones.**

### Basic Usage

```typescript
import { logDecision } from "~/services/decisions.server";

// When starting a task
await logDecision({
  scope: "build",
  actor: "data",
  taskId: "{TASK-ID}", // Task ID from this direction file
  status: "in_progress", // pending | in_progress | completed | blocked | cancelled
  progressPct: 0, // 0-100 percentage
  action: "task_started",
  rationale: "Starting {task description}",
  evidenceUrl: "docs/directions/data.md",
  durationEstimate: 4.0, // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: "build",
  actor: "data",
  taskId: "{TASK-ID}",
  status: "in_progress",
  progressPct: 50, // Update progress
  action: "task_progress",
  rationale: "Component implemented, writing tests",
  evidenceUrl: "artifacts/data/2025-10-22/{task}.md",
  durationActual: 2.0, // Hours spent so far
  nextAction: "Complete integration tests",
});

// When completed
await logDecision({
  scope: "build",
  actor: "data",
  taskId: "{TASK-ID}",
  status: "completed", // CRITICAL for manager queries
  progressPct: 100,
  action: "task_completed",
  rationale: "{Task name} complete, {X}/{X} tests passing",
  evidenceUrl: "artifacts/data/2025-10-22/{task}-complete.md",
  durationEstimate: 4.0,
  durationActual: 3.5, // Compare estimate vs actual
  nextAction: "Starting {NEXT-TASK-ID}",
});
```

### When Blocked (CRITICAL)

**Manager queries blocked tasks FIRST during consolidation**:

```typescript
await logDecision({
  scope: "build",
  actor: "data",
  taskId: "{TASK-ID}",
  status: "blocked", // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: "Waiting for {dependency} to complete",
  blockedBy: "{DEPENDENCY-TASK-ID}", // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: "task_blocked",
  rationale: "Cannot proceed because {reason}",
  evidenceUrl: "feedback/data/2025-10-22.md",
});
```

### Manager Visibility

Manager runs these scripts to see your work instantly:

- `query-blocked-tasks.ts` - Shows if you're blocked and why
- `query-agent-status.ts` - Shows your current task and progress
- `query-completed-today.ts` - Shows your completed work

**This is why structured logging is MANDATORY** - Manager can see status across all 17 agents in <10 seconds.

### Daily Shutdown (with Self-Grading)

**At end of day, log shutdown with self-assessment**:

```typescript
import { calculateSelfGradeAverage } from "~/services/decisions.server";

const grades = {
  progress: 5, // 1-5: Progress vs DoD
  evidence: 4, // 1-5: Evidence quality
  alignment: 5, // 1-5: Followed North Star/Rules
  toolDiscipline: 5, // 1-5: MCP-first, no guessing
  communication: 4, // 1-5: Clear updates, timely blockers
};

await logDecision({
  scope: "build",
  actor: "data",
  action: "shutdown",
  status: "in_progress", // or 'completed' if all tasks done
  progressPct: 75, // Overall daily progress
  rationale: "Daily shutdown - {X} tasks completed, {Y} in progress",
  durationActual: 6.5, // Total hours today
  payload: {
    dailySummary: "{TASK-A} complete, {TASK-B} at 75%",
    selfGrade: {
      ...grades,
      average: calculateSelfGradeAverage(grades),
    },
    retrospective: {
      didWell: ["Used MCP first", "Good test coverage"],
      toChange: ["Ask questions earlier"],
      toStop: "Making assumptions",
    },
    tasksCompleted: ["{TASK-ID-A}", "{TASK-ID-B}"],
    hoursWorked: 6.5,
  },
});
```

### Markdown Backup (Optional)

You can still write to `feedback/data/2025-10-22.md` for detailed notes, but database is the primary method.

---

## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from "~/services/decisions.server";
await logDecision({
  scope: "build",
  actor: "data",
  action: "migration_applied",
  rationale: "DATA-019: Dev memory RLS protection verified via testing",
  evidenceUrl: "artifacts/data/2025-10-21/rls-protection-tests.md",
});
```

**Protection**: decision_log now has RLS + triggers (100% append-only). Call logDecision at every task completion.
