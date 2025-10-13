---
epoch: 2025.10.E1
doc: docs/directions/data.md
owner: manager  
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-10-20
---
# Data — Direction (Operator Control Center)

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- Credential Map: docs/ops/credential_index.md
- Manager Feedback: feedback/manager.md (check for latest assignments)

## 🚨 P1 PRIORITY 1: Picker Payment System Database (2025-10-13)

**Assignment**: Design and implement database schema for picker payment tracking
**Timeline**: 8 hours (complete by 2025-10-14T02:00:00Z) 
**Evidence**: Log all work in feedback/data.md

### Context: Picker Payment System

**Goal**: Track and manage payments for warehouse pickers based on fulfilled orders

**Business Rules**:
- Pickers earn based on "pieces" picked (not just orders)
- Products have different piece counts via Shopify tags:
  - `BUNDLE:TRUE` - Product is a bundle (excluded from reorder calc)
  - `PACK:X` - Product counts as X pieces (e.g. PACK:3 = 3 pieces)
  - `DROPSHIP:YES` - No picker involvement (0 pieces)
  - No tag - Default to 1 piece

**Payment Tiers**:
- 1-4 pieces: $2.00 (200 cents)
- 5-10 pieces: $4.00 (400 cents)
- 11+ pieces: $7.00 (700 cents)

**Current Picker**: Sumesh (hotrodanllc@gmail.com)
**Credentials**: `vault/occ/zoho/sumesh_picker.env`

---

### Task 1A: Database Schema Design (4 hours)

**MCP TOOLS REQUIRED**:
- ✅ Supabase MCP: mcp_supabase_list_tables (verify existing schema)
- ✅ Supabase MCP: mcp_supabase_apply_migration (create new schema)

**Required Tables**:

**1. pickers table**:
```sql
CREATE TABLE pickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initial picker (source from vault/occ/zoho/sumesh_picker.env)
INSERT INTO pickers (name, email, active)
VALUES ('Sumesh', 'hotrodanllc@gmail.com', true);
```

**2. picker_earnings table**:
```sql
CREATE TABLE picker_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL, -- Shopify order ID
  picker_email TEXT NOT NULL REFERENCES pickers(email),
  total_pieces INTEGER NOT NULL,
  payout_cents INTEGER NOT NULL, -- in cents (200, 400, or 700)
  bracket TEXT NOT NULL, -- '1-4', '5-10', '11+'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(order_id, picker_email)
);

CREATE INDEX idx_picker_earnings_email ON picker_earnings(picker_email);
CREATE INDEX idx_picker_earnings_order ON picker_earnings(order_id);
CREATE INDEX idx_picker_earnings_date ON picker_earnings(created_at);
```

**3. picker_payments table**:
```sql
CREATE TABLE picker_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  picker_email TEXT NOT NULL REFERENCES pickers(email),
  amount_cents INTEGER NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_picker_payments_email ON picker_payments(picker_email);
CREATE INDEX idx_picker_payments_date ON picker_payments(paid_at);
```

**4. Update inventory_items table**:
```sql
-- Check if table exists first using Supabase MCP
-- mcp_supabase_list_tables(schemas: ["public"])

ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS picker_quantity INTEGER DEFAULT 1;

COMMENT ON COLUMN inventory_items.picker_quantity IS 
'Number of pieces this item counts as for picker payment calculation. Set from Shopify PACK:X tag, DROPSHIP:YES = 0, default = 1';
```

**5. Update orders table**:
```sql
-- Verify orders table exists
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS assigned_picker TEXT REFERENCES pickers(email),
ADD COLUMN IF NOT EXISTS pieces_count INTEGER,
ADD COLUMN IF NOT EXISTS picker_payout INTEGER; -- in cents

CREATE INDEX idx_orders_picker ON orders(assigned_picker);
CREATE INDEX idx_orders_fulfillment_picker ON orders(fulfillment_status, assigned_picker) 
  WHERE fulfillment_status = 'fulfilled';
```

**Success Criteria**:
- ✅ All 3 new tables created
- ✅ Sumesh initialized in pickers table  
- ✅ inventory_items updated with picker_quantity field
- ✅ orders table updated with picker fields
- ✅ All indexes created
- ✅ RLS policies planned (implement in Task 1B)

**Evidence Required**:
- Migration SQL file
- Supabase MCP output showing successful migration
- Table list showing new tables
- Timestamp

**Deadline**: 2025-10-13T22:00:00Z (4 hours from 18:00)

---

### Task 1B: Create Migrations & RLS Policies (2 hours)

**Migration File Name**: `20251013_picker_payments_schema.sql`

**RLS Policies Required**:

**pickers table**:
```sql
ALTER TABLE pickers ENABLE ROW LEVEL SECURITY;

-- Admin can view all pickers
CREATE POLICY "Admin full access to pickers"
  ON pickers FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Pickers can view only their own data
CREATE POLICY "Pickers view own data"
  ON pickers FOR SELECT
  USING (email = auth.jwt()->>'email');
```

**picker_earnings table**:
```sql
ALTER TABLE picker_earnings ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to earnings"
  ON picker_earnings FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Pickers view own earnings
CREATE POLICY "Pickers view own earnings"
  ON picker_earnings FOR SELECT
  USING (picker_email = auth.jwt()->>'email');
```

**picker_payments table**:
```sql
ALTER TABLE picker_payments ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to payments"
  ON picker_payments FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Pickers view own payments
CREATE POLICY "Pickers view own payments"
  ON picker_payments FOR SELECT
  USING (picker_email = auth.jwt()->>'email');
```

**Test Locally**:
```bash
cd ~/HotDash/hot-dash
supabase start
supabase db reset
# Apply migration
# Verify tables created
# Test RLS with test users
```

**Success Criteria**:
- ✅ Migration file created
- ✅ RLS enabled on all picker tables
- ✅ Policies tested locally
- ✅ No SQL errors

**Evidence Required**:
- Migration file path
- Local test output
- RLS policy verification
- Timestamp

**Deadline**: 2025-10-14T00:00:00Z (2 hours after Task 1A)

---

### Task 1C: Create Database Views (2 hours)

**Views Required**:

**1. picker_balances view**:
```sql
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
```

**2. unassigned_fulfilled_orders view**:
```sql
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
```

**3. picker_order_history view**:
```sql
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
```

**4. picker_payment_summary view** (for packer-facing app):
```sql
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
```

**Performance Testing**:
```bash
# Test view query performance
EXPLAIN ANALYZE SELECT * FROM picker_balances;
EXPLAIN ANALYZE SELECT * FROM unassigned_fulfilled_orders LIMIT 20;
EXPLAIN ANALYZE SELECT * FROM picker_order_history WHERE picker_email = 'hotrodanllc@gmail.com';

# Target: All queries < 100ms
```

**Success Criteria**:
- ✅ All 4 views created
- ✅ Views return correct data
- ✅ Performance < 100ms per view
- ✅ Comments added for documentation

**Evidence Required**:
- View definitions
- Sample query output
- Performance test results
- Timestamp

**Deadline**: 2025-10-14T02:00:00Z (2 hours after Task 1B)

---

## 🚨 P1 PRIORITY 2: SEO Pulse WoW Calculation (2025-10-13)

**Assignment**: Implement week-over-week delta calculation for SEO traffic monitoring
**Timeline**: 4 hours (start after Priority 1 complete)
**Evidence**: Log all work in feedback/data.md

**Dependencies**: Product team threshold decisions (wait for their spec)

### Context

**Current Problem**:
- SEO Pulse tile shows Google Analytics landing page data
- `wowDelta` hardcoded to `0` (no actual calculation)
- Cannot identify traffic anomalies

**Goal**: 
- Calculate actual week-over-week percentage change
- Identify pages with significant traffic drops (>20% or per Product spec)
- Filter tile to show only anomalies

**File Locations**:
- Current code: `app/services/ga/directClient.ts:102`
- Anomaly logic: `app/services/ga/ingest.ts:58`
- GA credentials: `vault/occ/google/analytics-service-account.json`

---

### Task 2A: Fetch Previous Week Data (2 hours)

**Wait For**: Product team anomaly threshold spec (should be ready by 2025-10-14T18:00:00Z)

**Current Code** (`app/services/ga/directClient.ts`):
```typescript
// Line 102 - NEEDS FIXING
wowDelta: 0, // Hardcoded - needs implementation
```

**Required Implementation**:
```typescript
export async function getTopLandingPages(limit: number = 100) {
  // Current week data (already implemented)
  const currentWeekData = await fetchAnalyticsData({
    dateRanges: [{
      startDate: '7daysAgo',
      endDate: 'today',
      name: 'currentWeek'
    }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'sessions' }],
    limit
  });

  // NEW: Previous week data
  const previousWeekData = await fetchAnalyticsData({
    dateRanges: [{
      startDate: '14daysAgo',
      endDate: '8daysAgo',
      name: 'previousWeek'
    }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'sessions' }],
    limit
  });

  // NEW: Calculate WoW delta
  return calculateWoWDelta(currentWeekData, previousWeekData);
}

function calculateWoWDelta(current: AnalyticsData, previous: AnalyticsData) {
  const previousMap = new Map(
    previous.rows.map(row => [row.dimensionValues[0].value, parseInt(row.metricValues[0].value)])
  );

  return current.rows.map(row => {
    const pagePath = row.dimensionValues[0].value;
    const currentSessions = parseInt(row.metricValues[0].value);
    const previousSessions = previousMap.get(pagePath) || 0;

    const wowDelta = previousSessions > 0
      ? ((currentSessions - previousSessions) / previousSessions) * 100
      : 0;

    return {
      pagePath,
      sessions: currentSessions,
      wowDelta: parseFloat(wowDelta.toFixed(1))
    };
  });
}
```

**Testing**:
```bash
# Test with real Hot Rod AN data
# Verify calculations match GA dashboard
# Check edge cases (new pages, pages with 0 previous traffic)
```

**Success Criteria**:
- ✅ Previous week data fetched successfully
- ✅ WoW delta calculated correctly
- ✅ Edge cases handled (new pages, zero traffic)
- ✅ Performance acceptable (<3s total)

**Evidence Required**:
- Code changes
- Test output with real data
- Sample calculations verified against GA dashboard
- Timestamp

**Deadline**: 2025-10-16T10:00:00Z (wait for Product spec first)

---

### Task 2B: Filter to Anomalies Only (2 hours)

**Wait For**: Product threshold decision

**Update Anomaly Logic** (`app/services/ga/ingest.ts:58`):
```typescript
// Current
isAnomaly: session.wowDelta <= -0.2  // -20% threshold

// May need to update based on Product decision
// Options: -20%, -30%, or configurable threshold
```

**Filter Logic**:
```typescript
export async function getSEOAnomalies(threshold: number = -20) {
  const allPages = await getTopLandingPages(100);
  
  // Filter to only anomalies
  const anomalies = allPages.filter(page => 
    page.wowDelta <= threshold / 100
  );

  // Sort by biggest drop first
  return anomalies
    .sort((a, b) => a.wowDelta - b.wowDelta)
    .slice(0, 10); // Top 10 worst performers
}
```

**Update Tile Query** to use filtered data:
```typescript
// In tile loader
const seoData = await getSEOAnomalies(-20); // or threshold from Product spec
```

**Testing**:
```bash
# Test with various thresholds
# Verify only anomalies returned
# Check sorting (worst first)
# Test empty state (no anomalies)
```

**Success Criteria**:
- ✅ Anomaly filtering works
- ✅ Threshold configurable
- ✅ Top 10 worst performers shown
- ✅ Empty state handled

**Evidence Required**:
- Code changes
- Test results with different thresholds
- Screenshot of filtered data
- Timestamp

**Deadline**: 2025-10-16T12:00:00Z (2h after Task 2A)

---

## MCP Tools Required

**For Picker Payments**:
- ✅ Supabase MCP: mcp_supabase_list_tables
- ✅ Supabase MCP: mcp_supabase_apply_migration
- ✅ Supabase MCP: mcp_supabase_get_advisors (performance check)

**For SEO WoW Calculation**:
- ❌ No MCP needed (direct GA API already configured)
- ℹ️ GA credentials in vault, not MCP-based

## Evidence Gate

Every task must log in feedback/data.md:
- Timestamp (YYYY-MM-DDTHH:MM:SSZ format)
- Task completed
- Migration file path or code changes
- Test results
- Performance metrics
- Issues encountered
- Next steps

## Blockers to Escalate

If ANY task blocked >2 hours:
1. Document in feedback/data.md
2. Note attempts made (minimum 2)
3. Escalate to Manager
4. Include error messages/logs

## Coordination

- **Integrations**: Waiting on Priority 1 complete to start historical order import
- **Product**: Need anomaly threshold decision for Priority 2
- **Engineer**: Will consume views and WoW data after implementation
- **Manager**: Monitoring progress in daily standups


---

## 🚨 UPDATED PRIORITY (2025-10-13T22:46:00Z) — Manager Assignment

**Status**: Priority 1 & 2 complete ✅ (3.5 hours ahead of schedule!)  
**New Assignment**: Analytics & Monitoring Enhancement

### P0: Real-Time Analytics Dashboard (3-4 hours)

**Goal**: Create operator-focused analytics dashboard

**Tasks**:
1. **Design Analytics Schema**
   - Define key metrics (orders, revenue, customer activity)
   - Create aggregation tables for performance
   - Implement materialized views

2. **Build Analytics Queries**
   - Daily/weekly/monthly summaries
   - Trend analysis queries
   - Anomaly detection queries

3. **Optimize Query Performance**
   - Add appropriate indexes
   - Implement query caching
   - Test with production-scale data

4. **Create Dashboard API**
   - Expose analytics via API endpoints
   - Add real-time updates (if needed)
   - Document API usage

**Evidence**: Schema files, query performance benchmarks, API documentation

### P1: Data Quality Monitoring (2-3 hours)

**Goal**: Automated data quality checks

**Tasks**:
1. **Implement Data Validation**
   - Check for null/missing values
   - Validate data types
   - Check referential integrity

2. **Create Quality Metrics**
   - Completeness score
   - Accuracy score
   - Timeliness score

3. **Build Alerting System**
   - Alert on quality threshold violations
   - Daily quality reports
   - Integration with monitoring

**Evidence**: Validation rules, quality dashboard, alert configuration

### P2: ETL Pipeline Optimization (2-3 hours)

**Goal**: Improve data pipeline efficiency

**Tasks**:
1. Profile current ETL performance
2. Optimize slow transformations
3. Implement incremental updates
4. Add pipeline monitoring

**Evidence**: Performance improvements, monitoring dashboard

**Timeline**: Start with P0, report progress every 2 hours to feedback/data.md

**Coordination**:
- Designer: Dashboard UI design
- Product: Analytics requirements
- Reliability: Monitoring integration
- Manager: Report completion for next assignment

---
