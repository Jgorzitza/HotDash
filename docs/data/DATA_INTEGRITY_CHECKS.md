# Hot Rod AN Data Integrity Verification

**Purpose**: Document data integrity checks and validation procedures  
**Last Updated**: 2025-10-12  
**Owner**: DATA Agent

---

## Automated Data Quality Checks

All checks are automated via `v_data_quality_checks` view.

### Check 1: Missing Revenue Detection
- **Table**: `sales_metrics_daily`
- **Check**: Dates with $0 revenue in last 7 days
- **Severity**: HIGH
- **Expected**: No missing revenue unless business closed
- **Query**:
```sql
SELECT COUNT(*) as issue_count
FROM sales_metrics_daily
WHERE total_revenue = 0 
  AND date >= CURRENT_DATE - INTERVAL '7 days';
```

### Check 2: Negative Inventory
- **Table**: `inventory_snapshots`
- **Check**: SKUs with negative inventory counts
- **Severity**: CRITICAL
- **Expected**: 0 - inventory cannot be negative
- **Query**:
```sql
SELECT COUNT(*) as issue_count
FROM inventory_snapshots
WHERE quantity_available < 0 
  AND snapshot_date = CURRENT_DATE;
```

### Check 3: Missing Customer Segments
- **Table**: `customer_segments`
- **Check**: Customers without segment classification
- **Severity**: MEDIUM
- **Expected**: All customers should have segments after first order
- **Query**:
```sql
SELECT COUNT(*) as issue_count
FROM customer_segments
WHERE primary_segment IS NULL;
```

### Check 4: Future Dates in Historical Data
- **Table**: `sales_metrics_daily`
- **Check**: Sales records with future dates
- **Severity**: HIGH
- **Expected**: 0 - data should only exist for past/current dates
- **Query**:
```sql
SELECT COUNT(*) as issue_count
FROM sales_metrics_daily
WHERE date > CURRENT_DATE;
```

### Check 5: Negative Resolution Times
- **Table**: `cx_conversations`
- **Check**: Conversations with impossible (negative) resolution times
- **Severity**: HIGH
- **Expected**: 0 - times must be positive
- **Query**:
```sql
SELECT COUNT(*) as issue_count
FROM cx_conversations
WHERE resolution_time_hours < 0;
```

---

## Referential Integrity Checks

### Foreign Key Validation

#### Product Categories ↔ SKU Performance
```sql
-- Check for orphaned SKU records
SELECT COUNT(*) as orphaned_skus
FROM sku_performance sp
LEFT JOIN product_categories pc 
  ON sp.shopify_product_id = pc.shopify_product_id
WHERE pc.id IS NULL;
-- Expected: 0 orphaned records
```

#### Customer Segments ↔ Fulfillment Tracking
```sql
-- Check for orders without customer segment data
SELECT COUNT(*) as missing_segments
FROM fulfillment_tracking ft
WHERE ft.customer_segment IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM customer_segments cs
    WHERE cs.primary_segment = ft.customer_segment
  );
-- Expected: All segments should exist in customer_segments table
```

#### CX Conversations ↔ Fulfillment Tracking
```sql
-- Check for CX conversations referencing non-existent orders
SELECT COUNT(*) as invalid_order_refs
FROM cx_conversations cx
WHERE cx.shopify_order_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM fulfillment_tracking ft
    WHERE ft.shopify_order_id = cx.shopify_order_id
  );
-- Expected: 0 (all order refs should be valid or NULL)
```

---

## Data Consistency Checks

### 1. Revenue Calculation Consistency
```sql
-- Verify AOV = revenue / orders
SELECT COUNT(*) as inconsistent_records
FROM sales_metrics_daily
WHERE total_orders > 0 
  AND ABS(avg_order_value - (total_revenue / total_orders)) > 0.01;
-- Expected: 0
```

### 2. Inventory Velocity Classification
```sql
-- Verify velocity tier matches sales volume
SELECT 
  velocity_tier,
  COUNT(*) as count,
  AVG(avg_daily_sales) as avg_sales
FROM inventory_snapshots
WHERE snapshot_date = CURRENT_DATE
GROUP BY velocity_tier
ORDER BY avg_sales DESC;
-- Expected: fast > medium > slow > stagnant
```

### 3. Customer Lifecycle Stage Logic
```sql
-- Verify lifecycle stages match age criteria
SELECT 
  lifecycle_stage,
  COUNT(*) as count,
  MIN(days_since_last_order) as min_days,
  MAX(days_since_last_order) as max_days
FROM customer_segments
WHERE lifecycle_stage IS NOT NULL
GROUP BY lifecycle_stage;
-- Expected: 
--   new: 0-30 days
--   active: varies
--   at_risk: 90+ days
--   churned: 180+ days
```

### 4. SLA Breach Logic Consistency
```sql
-- Verify is_sla_breach flag matches actual breach condition
SELECT COUNT(*) as mismatched_flags
FROM fulfillment_tracking
WHERE is_sla_breach != (days_to_fulfill > sla_threshold_days);
-- Expected: 0
```

---

## Data Completeness Checks

### Required Fields Validation

#### Sales Metrics
```sql
-- Check for required fields
SELECT 
  COUNT(*) FILTER (WHERE total_revenue IS NULL) as missing_revenue,
  COUNT(*) FILTER (WHERE total_orders IS NULL) as missing_orders,
  COUNT(*) FILTER (WHERE avg_order_value IS NULL AND total_orders > 0) as missing_aov
FROM sales_metrics_daily
WHERE date >= CURRENT_DATE - INTERVAL '7 days';
-- Expected: All zeros
```

#### Inventory Snapshots
```sql
-- Check for required inventory fields
SELECT 
  COUNT(*) FILTER (WHERE quantity_available IS NULL) as missing_quantity,
  COUNT(*) FILTER (WHERE stock_status IS NULL) as missing_status,
  COUNT(*) FILTER (WHERE velocity_tier IS NULL) as missing_velocity
FROM inventory_snapshots
WHERE snapshot_date = CURRENT_DATE;
-- Expected: All zeros
```

---

## Data Range Validation

### 1. Revenue Bounds
```sql
-- Check for unrealistic revenue values
SELECT COUNT(*) as suspicious_revenue
FROM sales_metrics_daily
WHERE total_revenue > 1000000 -- $1M+ in a single day is suspicious
   OR (total_revenue > 0 AND total_revenue < 10); -- < $10/day is suspicious
-- Expected: 0 (investigate any anomalies)
```

### 2. Inventory Bounds
```sql
-- Check for unrealistic inventory levels
SELECT COUNT(*) as suspicious_inventory
FROM inventory_snapshots
WHERE quantity_available > 10000 -- 10K+ units for single SKU unusual
   OR days_of_cover > 365; -- Over 1 year of inventory unusual
-- Expected: Few to none (investigate high values)
```

### 3. Response Time Bounds
```sql
-- Check for unrealistic response times
SELECT COUNT(*) as suspicious_times
FROM cx_conversations
WHERE first_response_time_minutes > 1440 -- > 24 hours is very bad
   OR resolution_time_hours > 168; -- > 1 week is very bad
-- Expected: Minimal (these are real issues but should be investigated)
```

---

## Temporal Integrity Checks

### 1. Timestamp Ordering
```sql
-- Check for fulfillment before order creation
SELECT COUNT(*) as time_travel_orders
FROM fulfillment_tracking
WHERE fulfilled_at < order_created_at;
-- Expected: 0
```

### 2. CX Conversation Timeline
```sql
-- Check for resolution before first response
SELECT COUNT(*) as invalid_timelines
FROM cx_conversations
WHERE resolved_at < first_response_at
   OR first_response_at < conversation_created_at;
-- Expected: 0
```

### 3. Data Freshness Validation
```sql
-- Implemented in v_data_freshness view
SELECT * FROM v_data_freshness
WHERE freshness_status IN ('stale', 'critical');
-- Expected: 0 results (all data should be fresh/acceptable)
```

---

## Duplicate Detection

### 1. Duplicate Shopify Product IDs
```sql
-- Check for duplicate product categorizations
SELECT shopify_product_id, COUNT(*) as duplicate_count
FROM product_categories
GROUP BY shopify_product_id
HAVING COUNT(*) > 1;
-- Expected: 0 (should be prevented by unique constraints)
```

### 2. Duplicate Customer Segments
```sql
-- Check for duplicate customer records
SELECT shopify_customer_id, COUNT(*) as duplicate_count
FROM customer_segments
GROUP BY shopify_customer_id
HAVING COUNT(*) > 1;
-- Expected: 0 (one segment per customer)
```

### 3. Duplicate Daily Metrics
```sql
-- Check for duplicate date entries
SELECT date, COUNT(*) as duplicate_count
FROM sales_metrics_daily
GROUP BY date
HAVING COUNT(*) > 1;
-- Expected: 0 (prevented by UNIQUE constraint on date)
```

---

## Data Type Validation

### 1. Percentage Fields (0-100%)
```sql
-- Verify percentage fields are in valid range
SELECT 
  COUNT(*) FILTER (WHERE activation_rate_pct < 0 OR activation_rate_pct > 100) as invalid_pct
FROM shop_activation_metrics;
-- Expected: 0
```

### 2. Rating Fields (0.0-5.0)
```sql
-- Verify review ratings are in valid range
SELECT COUNT(*) as invalid_ratings
FROM customer_segments
WHERE avg_review_rating IS NOT NULL 
  AND (avg_review_rating < 0 OR avg_review_rating > 5);
-- Expected: 0
```

### 3. Enum Validation
```sql
-- Check for invalid enum values (already enforced by CHECK constraints)
-- This would only catch if constraints were bypassed
SELECT 
  stock_status,
  COUNT(*) as count
FROM inventory_snapshots
WHERE stock_status NOT IN ('in_stock', 'low_stock', 'out_of_stock', 'overstock')
GROUP BY stock_status;
-- Expected: 0 results
```

---

## Cross-Table Consistency

### 1. Inventory Snapshot ↔ SKU Performance Alignment
```sql
-- Verify inventory counts match between tables
SELECT 
  isnap.sku,
  isnap.quantity_available as snapshot_qty,
  sp.current_inventory as performance_qty,
  ABS(isnap.quantity_available - sp.current_inventory) as variance
FROM inventory_snapshots isnap
JOIN sku_performance sp 
  ON isnap.shopify_product_id = sp.shopify_product_id 
  AND isnap.shopify_variant_id = sp.shopify_variant_id
WHERE isnap.snapshot_date = CURRENT_DATE
  AND ABS(isnap.quantity_available - sp.current_inventory) > 5; -- Allow 5 unit variance
-- Expected: 0 or minimal variance (investigate large variances)
```

### 2. Order Count Consistency
```sql
-- Verify order counts match across tables
WITH sales_orders AS (
  SELECT total_orders FROM sales_metrics_daily WHERE date = CURRENT_DATE
),
fulfillment_orders AS (
  SELECT COUNT(*) as count FROM fulfillment_tracking 
  WHERE DATE(order_created_at) = CURRENT_DATE
)
SELECT 
  so.total_orders as sales_count,
  fo.count as fulfillment_count,
  ABS(so.total_orders - fo.count) as variance
FROM sales_orders so
CROSS JOIN fulfillment_orders fo;
-- Expected: variance = 0 (or minimal delay in sync)
```

---

## Integrity Enforcement

### Database Constraints

**UNIQUE Constraints** (Prevent duplicates):
- `sales_metrics_daily(date)`
- `shop_activation_metrics(date)`
- `fulfillment_tracking(shopify_order_id)`
- `cx_conversations(chatwoot_conversation_id)`
- `sku_performance(shopify_product_id, shopify_variant_id)`
- `operator_sla_resolution(operator_id, date)`

**CHECK Constraints** (Validate values):
- All enum fields (stock_status, fulfillment_status, priority, sentiment, etc.)
- Percentage fields (0-100 range)
- Valid date ranges

**NOT NULL Constraints** (Required fields):
- All primary keys (id)
- Critical date fields (date, created_at)
- Required foreign keys (shopify_product_id, shopify_customer_id, etc.)

---

## Manual Validation Procedures

### Weekly Data Audit

**Every Monday, review**:
1. Run all automated checks in `v_data_quality_checks`
2. Verify data freshness in `v_data_freshness`
3. Check for data gaps in time-series tables
4. Review unusual spikes/drops in KPIs
5. Validate referential integrity queries
6. Check for orphaned records

### Monthly Deep Dive

**First of month**:
1. Compare Shopify order totals vs. our aggregates
2. Verify inventory counts vs. Shopify
3. Cross-check Chatwoot conversation counts
4. Validate growth metrics calculations
5. Review and update data quality thresholds
6. Test all export queries

---

## Repair Procedures

### If Data Quality Issue Found

1. **Log in DecisionLog table**:
```sql
INSERT INTO "DecisionLog" (scope, actor, action, rationale, evidenceUrl)
VALUES (
  'data_quality',
  'data_agent',
  'issue_detected',
  'Description of issue and root cause',
  'Link to query results or evidence'
);
```

2. **Flag in feedback file** (feedback/data.md)

3. **Run repair migration** if needed (data fix):
```sql
-- Example: Fix negative inventory
UPDATE inventory_snapshots
SET quantity_available = 0
WHERE quantity_available < 0
  AND snapshot_date = CURRENT_DATE;
```

4. **Document repair action** in migration comments

---

## Data Validation Dashboard

### Recommended View for Ops Team

```sql
-- Single query to check all integrity issues
SELECT 
  'Data Quality' as category,
  COUNT(*) as issue_count
FROM v_data_quality_checks

UNION ALL

SELECT 
  'Data Freshness' as category,
  COUNT(*) as issue_count
FROM v_data_freshness
WHERE freshness_status IN ('stale', 'critical')

UNION ALL

SELECT 
  'Referential Integrity' as category,
  0 as issue_count -- Add ref integrity checks here

ORDER BY issue_count DESC;
```

**Expected Output**: All 0 issue counts

---

## Integrity Verification Checklist (Pre-Launch)

- [x] All tables have RLS enabled
- [x] All tables have proper constraints (UNIQUE, CHECK, NOT NULL)
- [x] All foreign key relationships documented
- [x] Automated data quality checks implemented (`v_data_quality_checks`)
- [x] Data freshness monitoring implemented (`v_data_freshness`)
- [ ] Manual validation of first week of data
- [ ] Cross-check with source systems (Shopify, Chatwoot)
- [ ] Performance test with realistic data volume
- [ ] Verify all views return expected results
- [ ] Test cache invalidation on data updates

---

## Ongoing Monitoring

### Daily Checks (Automated)

Run via scheduled job:
```bash
# Check data quality
SELECT * FROM v_data_quality_checks;

# Check data freshness
SELECT * FROM v_data_freshness WHERE freshness_status NOT IN ('fresh', 'acceptable');

# Alert if any issues found
```

### Weekly Review (Manual)

- Review data quality check history
- Investigate any anomalies in KPI trends
- Validate new data sources (if added)
- Update integrity checks as schema evolves

---

**Status**: Automated checks implemented, ready for data population  
**Next Steps**: Monitor integrity during first week of production data

