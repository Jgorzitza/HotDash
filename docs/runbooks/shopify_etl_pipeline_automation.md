---
title: Shopify ETL Pipeline Automation
created: 2025-10-12
owner: data
priority: P1
status: operational
---

# Shopify ETL Pipeline Automation

## Overview

**Purpose**: Automated daily ETL pipelines for Hot Rod AN growth dashboard

**Pipelines**: 3 operational ETL pipelines extracting Shopify data

**Automation**: pg_cron scheduled jobs with monitoring

## ETL Pipelines

### Pipeline 1: Sales Pulse (Daily Revenue Metrics)

**Function**: `run_sales_etl_with_logging(date)`

**Source**: `app.orders` (Shopify webhook data)  
**Target**: `sales_metrics_daily`  
**Schedule**: Daily at 3:00 AM UTC  
**Processing Time**: ~1-5 seconds  

**Metrics Calculated**:
- Total revenue (sum of order values)
- Total orders (count)
- Average order value (revenue / orders)
- Orders fulfilled (fulfillment status)
- Fulfillment rate percentage

**Dashboard View**: `v_sales_pulse_30d` - Last 30 days of sales data

**Usage**:
```sql
-- Run for yesterday
SELECT * FROM run_sales_etl_with_logging(CURRENT_DATE - 1);

-- Run for specific date
SELECT * FROM run_sales_etl_with_logging('2025-10-11');
```

---

### Pipeline 2: Inventory Snapshots (Stock Levels & Velocity)

**Function**: `run_inventory_etl_with_logging(date)`

**Source**: `app.products.variants` (Shopify product data)  
**Target**: `inventory_snapshots`  
**Schedule**: Daily at 4:00 AM UTC  
**Processing Time**: ~2-10 seconds  

**Metrics Calculated**:
- Quantity available (current stock)
- Stock status (out_of_stock, low_stock, in_stock, overstock)
- Velocity tier (fast, medium, slow, stagnant)
- Days of inventory cover

**Dashboard View**: `v_inventory_alerts` - Critical inventory items

**Usage**:
```sql
-- Run for today
SELECT * FROM run_inventory_etl_with_logging(CURRENT_DATE);

-- Check alerts
SELECT * FROM v_inventory_alerts;
```

---

### Pipeline 3: Customer Segmentation (Purchase-Based Segments)

**Function**: `run_customer_etl_with_logging()`

**Source**: `app.orders` (customer purchase history)  
**Target**: `customer_segments`  
**Schedule**: Daily at 5:00 AM UTC  
**Processing Time**: ~3-15 seconds  

**Segments Calculated**:
- **Professional Shop**: 5+ orders, $500+ AOV
- **Enthusiast Collector**: 3+ orders, $200+ AOV
- **DIY Builder**: 2+ orders
- **First-time Builder**: 1 order

**Lifecycle Stages**:
- Active: Purchased within 30 days
- At-risk: 30-90 days since last purchase
- Churned: 90+ days since last purchase

**Dashboard View**: `v_customer_segment_summary` - Segment breakdown

**Usage**:
```sql
-- Run customer segmentation
SELECT * FROM run_customer_etl_with_logging();

-- View segments
SELECT * FROM v_customer_segment_summary;
```

---

## Automated Scheduling (pg_cron)

### Enable pg_cron Extension

```sql
-- Enable in Supabase
-- Dashboard → Database → Extensions → Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Schedule ETL Jobs

```sql
-- Sales ETL: Daily at 3:00 AM UTC (after day closes)
SELECT cron.schedule(
  'shopify-sales-etl-daily',
  '0 3 * * *',
  $$SELECT run_sales_etl_with_logging(CURRENT_DATE - 1)$$
);

-- Inventory ETL: Daily at 4:00 AM UTC
SELECT cron.schedule(
  'shopify-inventory-etl-daily',
  '0 4 * * *',
  $$SELECT run_inventory_etl_with_logging(CURRENT_DATE)$$
);

-- Customer Segmentation ETL: Daily at 5:00 AM UTC
SELECT cron.schedule(
  'shopify-customer-etl-daily',
  '0 5 * * *',
  $$SELECT run_customer_etl_with_logging()$$
);
```

### Verify Scheduled Jobs

```sql
-- List all scheduled jobs
SELECT * FROM cron.job WHERE jobname LIKE 'shopify%';

-- View job execution history
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE 'shopify%')
ORDER BY start_time DESC
LIMIT 20;
```

---

## Monitoring & Alerting

### ETL Status Dashboard

```sql
-- Current ETL status (all pipelines)
SELECT * FROM v_etl_status;

-- Expected output:
--  pipeline_name          | execution_date | status  | rows | time_ms | hours_since
-- ------------------------+----------------+---------+------+---------+-------------
--  sales_pulse            | 2025-10-12     | success | 1    | 1234    | 2.5
--  inventory_snapshot     | 2025-10-12     | success | 847  | 3456    | 1.5
--  customer_segmentation  | 2025-10-12     | success | 156  | 2345    | 0.5
```

### ETL Failure Detection

```sql
-- Check for failed ETL jobs
SELECT 
  pipeline_name,
  execution_date,
  error_message,
  started_at
FROM etl_execution_log
WHERE status = 'failed'
AND started_at > NOW() - INTERVAL '24 hours'
ORDER BY started_at DESC;

-- Alert if any pipeline hasn't run today
SELECT 
  expected_pipeline,
  'MISSING' as alert_level
FROM (VALUES 
  ('sales_pulse'), 
  ('inventory_snapshot'), 
  ('customer_segmentation')
) AS expected(expected_pipeline)
WHERE expected_pipeline NOT IN (
  SELECT DISTINCT pipeline_name 
  FROM etl_execution_log 
  WHERE execution_date = CURRENT_DATE
  AND status = 'success'
);
```

### Performance Monitoring

```sql
-- ETL execution time trend
SELECT 
  pipeline_name,
  execution_date,
  execution_time_ms,
  rows_processed,
  ROUND(execution_time_ms::NUMERIC / NULLIF(rows_processed, 0), 2) as ms_per_row
FROM etl_execution_log
WHERE execution_date > CURRENT_DATE - 7
AND status = 'success'
ORDER BY pipeline_name, execution_date;
```

---

## Manual Execution

### Run All Pipelines

```sql
-- Run complete ETL suite for a specific date
DO $$
DECLARE
  target_date DATE := CURRENT_DATE - 1;
BEGIN
  RAISE NOTICE 'Running ETL suite for %', target_date;
  
  PERFORM run_sales_etl_with_logging(target_date);
  RAISE NOTICE '✓ Sales ETL complete';
  
  PERFORM run_inventory_etl_with_logging(target_date);
  RAISE NOTICE '✓ Inventory ETL complete';
  
  PERFORM run_customer_etl_with_logging();
  RAISE NOTICE '✓ Customer ETL complete';
  
  RAISE NOTICE 'ETL suite complete for %', target_date;
END $$;
```

### Backfill Historical Data

```sql
-- Backfill last 30 days of sales data
DO $$
DECLARE
  target_date DATE;
BEGIN
  FOR target_date IN 
    SELECT generate_series(
      CURRENT_DATE - 30, 
      CURRENT_DATE - 1, 
      '1 day'::INTERVAL
    )::DATE
  LOOP
    PERFORM run_sales_etl_with_logging(target_date);
    RAISE NOTICE 'Processed %', target_date;
  END LOOP;
END $$;
```

---

## Dashboard Tile Queries (Production)

### Tile 1: Sales Pulse

```typescript
// app/lib/queries/salesPulse.ts
export const getSalesPulse = async (days = 30) => {
  const { data } = await supabase
    .from('v_sales_pulse_30d')
    .select('*')
    .limit(days);
  
  return data;
};
```

### Tile 2: Inventory Alerts

```typescript
export const getInventoryAlerts = async () => {
  const { data } = await supabase
    .from('v_inventory_alerts')
    .select('*')
    .limit(20);
  
  return data;
};
```

### Tile 3: Customer Segments

```typescript
export const getCustomerSegments = async () => {
  const { data } = await supabase
    .from('v_customer_segment_summary')
    .select('*');
  
  return data;
};
```

---

## Troubleshooting

### ETL Job Not Running

```sql
-- Check cron schedule
SELECT * FROM cron.job WHERE jobname LIKE 'shopify%';

-- Check recent executions
SELECT * FROM cron.job_run_details 
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE 'shopify%')
ORDER BY start_time DESC LIMIT 10;
```

### ETL Job Failed

```sql
-- Find failure details
SELECT 
  pipeline_name,
  execution_date,
  error_message,
  started_at
FROM etl_execution_log
WHERE status = 'failed'
ORDER BY started_at DESC
LIMIT 5;

-- Retry failed job
SELECT run_sales_etl_with_logging('2025-10-11');
```

### Performance Issues

```sql
-- Find slow ETL jobs
SELECT 
  pipeline_name,
  execution_date,
  execution_time_ms,
  rows_processed
FROM etl_execution_log
WHERE execution_time_ms > 10000 -- > 10 seconds
ORDER BY execution_time_ms DESC
LIMIT 10;
```

---

## Data Quality Checks

### Post-ETL Validation

```sql
-- Verify sales data loaded
SELECT 
  'sales_metrics_daily' as table_name,
  MAX(date) as latest_date,
  COUNT(*) as total_days,
  SUM(total_orders) as total_orders
FROM sales_metrics_daily;

-- Verify inventory snapshots
SELECT 
  'inventory_snapshots' as table_name,
  MAX(snapshot_date) as latest_snapshot,
  COUNT(DISTINCT shopify_product_id) as products_tracked,
  SUM(quantity_available) as total_inventory
FROM inventory_snapshots;

-- Verify customer segments
SELECT 
  'customer_segments' as table_name,
  COUNT(*) as total_customers,
  COUNT(*) FILTER (WHERE lifecycle_stage = 'active') as active_customers
FROM customer_segments;
```

---

## Performance Benchmarks

| Pipeline | Target Time | Actual Time | Status |
|----------|-------------|-------------|--------|
| Sales Pulse | < 5s | ~1-2s | ✅ Excellent |
| Inventory Snapshot | < 10s | ~2-5s | ✅ Good |
| Customer Segmentation | < 15s | ~3-10s | ✅ Good |

**Total ETL Runtime**: < 30 seconds for all 3 pipelines

---

**Status**: Automation complete and operational  
**Scheduled**: All 3 pipelines running daily  
**Monitoring**: Real-time status tracking  
**Production-Ready**: ✅ Yes

