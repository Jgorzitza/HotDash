# Hot Rod AN Launch Data Validation

**Version**: 1.0  
**Created**: 2025-10-12  
**Owner**: DATA Agent

---

## 🚀 Pre-Launch Checklist

### 1. Schema Validation ✅

- [ ] All 10 Hot Rod AN tables created
- [ ] All 40+ views created
- [ ] All 4 functions created
- [ ] All 30+ indexes created
- [ ] All 20 RLS policies active

**Verification Query**:
```sql
-- Count of Hot Rod AN tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'product_categories', 'customer_segments', 'sales_metrics_daily',
  'sku_performance', 'inventory_snapshots', 'fulfillment_tracking',
  'cx_conversations', 'shop_activation_metrics', 'operator_sla_resolution',
  'ceo_time_savings'
);
-- Expected: 10
```

---

### 2. RLS Security Validation ✅

**Test**: Verify all Hot Rod AN tables have RLS enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'product_categories', 'customer_segments', 'sales_metrics_daily',
  'sku_performance', 'inventory_snapshots', 'fulfillment_tracking',
  'cx_conversations', 'shop_activation_metrics', 'operator_sla_resolution',
  'ceo_time_savings'
)
AND rowsecurity = false;
-- Expected: 0 rows (all should have RLS = true)
```

---

### 3. Data Quality Validation

**Run**: Data quality checks before launch

```sql
-- Should return 0 critical issues
SELECT * FROM v_data_quality_comprehensive 
WHERE severity = 'CRITICAL';
```

**Acceptable Results**:
- 0 CRITICAL issues ✅
- <5 HIGH issues (acceptable if documented)
- Any MEDIUM/LOW issues (acceptable)

---

### 4. Performance Validation

**Test**: Query performance targets (<200ms)

```sql
-- Test dashboard tile queries
EXPLAIN ANALYZE SELECT * FROM v_sales_pulse_current;
EXPLAIN ANALYZE SELECT * FROM v_inventory_alerts;
EXPLAIN ANALYZE SELECT * FROM v_cx_escalations;
EXPLAIN ANALYZE SELECT * FROM v_fulfillment_issues;
EXPLAIN ANALYZE SELECT * FROM v_ops_aggregate_metrics;
```

**Target**: All queries complete in <200ms

---

### 5. Data Freshness Validation

**Test**: Verify data is not stale

```sql
SELECT * FROM v_data_freshness_monitoring 
WHERE freshness_status = 'STALE';
-- Expected: 0 rows (or only non-critical tables)
```

---

### 6. Sample Data Validation

**Pre-Launch Data Requirements**:

- [ ] At least 30 days of `sales_metrics_daily` data
- [ ] At least 100 SKUs in `inventory_snapshots`
- [ ] At least 50 customers in `customer_segments`
- [ ] At least 10 conversations in `cx_conversations`
- [ ] At least 7 days of `operator_sla_resolution`

**Validation Queries**:
```sql
-- Sales data
SELECT COUNT(DISTINCT date) as days_of_data 
FROM sales_metrics_daily;
-- Expected: >=30

-- Inventory coverage
SELECT COUNT(DISTINCT sku) as unique_skus 
FROM inventory_snapshots;
-- Expected: >=100

-- Customer segments
SELECT COUNT(*) as customer_count 
FROM customer_segments;
-- Expected: >=50
```

---

### 7. Integration Validation

**ETL Pipelines Ready**:
- [ ] Shopify → sales_metrics_daily (automated)
- [ ] Shopify → inventory_snapshots (automated)
- [ ] Shopify → fulfillment_tracking (webhook)
- [ ] Chatwoot → cx_conversations (webhook)
- [ ] Manual → ceo_time_savings (manual entry)

---

### 8. Dashboard API Validation

**Test**: All 5 tiles return data

```bash
# Sales Pulse
curl https://api.hotrodan.com/dashboard/sales-pulse

# Inventory Heatmap
curl https://api.hotrodan.com/dashboard/inventory-alerts

# Fulfillment Health
curl https://api.hotrodan.com/dashboard/fulfillment-issues

# CX Escalations
curl https://api.hotrodan.com/dashboard/cx-escalations

# Ops Metrics
curl https://api.hotrodan.com/dashboard/ops-metrics
```

**Expected**: All return 200 status with valid JSON

---

### 9. Audit Trail Validation

**Test**: Decision logging functional

```sql
-- Verify audit trail capturing decisions
SELECT COUNT(*) FROM "DecisionLog" 
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days';
-- Expected: >0 (active decision logging)
```

---

### 10. Security Validation

**Run**: Security advisor scan

```bash
# Via Supabase MCP
supabase db lint --level error
```

**Acceptable**: Only warnings for SECURITY DEFINER views (intentional)

---

## 🎯 Go/No-Go Criteria

### GO Criteria (Must Have ALL)

✅ All tables created with RLS enabled  
✅ All views queryable  
✅ All dashboard tiles return data in <1 second  
✅ 0 CRITICAL data quality issues  
✅ Security advisor: No high-risk vulnerabilities  
✅ Sample data loaded (30 days minimum)  
✅ ETL pipelines operational  
✅ Audit trail capturing decisions

### NO-GO Criteria (Any ONE is blocking)

🚫 Any table missing RLS  
🚫 CRITICAL data quality issues  
🚫 Dashboard load time >3 seconds  
🚫 Security vulnerabilities (high/critical)  
🚫 Less than 7 days of data  
🚫 ETL pipelines failing

---

## 📋 Post-Launch Monitoring

**Day 1-7 Monitoring**:
- Run data quality checks every 6 hours
- Monitor cache hit rates
- Track query performance
- Monitor ETL pipeline health

**Weekly Monitoring**:
- Review data quality dashboard
- Check data freshness
- Verify backup strategy
- Review operator analytics

---

**End of Launch Validation Guide**
