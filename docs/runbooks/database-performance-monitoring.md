# Database Performance Monitoring
**Created**: 2025-10-21  
**Task**: DATA-016  
**Version**: 1.0

---

## Overview

This runbook provides SQL queries and procedures for monitoring HotDash database performance.

---

## Quick Monitoring Checks

### 1. Slow Query Detection (Top 20)

```sql
-- Enable pg_stat_statements first (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slowest queries by mean execution time
SELECT 
  calls,
  mean_exec_time AS avg_ms,
  max_exec_time AS max_ms,
  total_exec_time AS total_ms,
  query
FROM pg_stat_statements
WHERE mean_exec_time > 10.0  -- Queries averaging >10ms
  AND calls > 10  -- Called at least 10 times
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

### 2. Index Usage Statistics

```sql
-- Check which indexes are being used
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  CASE 
    WHEN idx_scan = 0 THEN '⚠️ UNUSED'
    WHEN idx_scan < 100 THEN '⚠️ LOW USAGE'
    ELSE '✅ ACTIVE'
  END AS status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

### 3. Table Scan Analysis

```sql
-- Check if tables are using indexes or sequential scans
SELECT
  relname AS table_name,
  seq_scan AS sequential_scans,
  seq_tup_read AS seq_rows_read,
  idx_scan AS index_scans,
  idx_tup_fetch AS idx_rows_fetched,
  CASE
    WHEN seq_scan > idx_scan THEN '⚠️ NEEDS INDEX'
    ELSE '✅ INDEXED'
  END AS index_health,
  n_live_tup AS live_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_scan DESC;
```

---

### 4. Cache Hit Ratio

```sql
-- Check database cache effectiveness (should be >90%)
SELECT 
  'index hit rate' AS metric,
  (sum(idx_blks_hit)) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0) AS ratio,
  CASE
    WHEN (sum(idx_blks_hit)) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0) > 0.90 THEN '✅ GOOD'
    WHEN (sum(idx_blks_hit)) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0) > 0.80 THEN '⚠️ WARNING'
    ELSE '❌ CRITICAL'
  END AS health
FROM pg_statio_user_indexes

UNION ALL

SELECT 
  'table hit rate' AS metric,
  sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) AS ratio,
  CASE
    WHEN sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) > 0.90 THEN '✅ GOOD'
    WHEN sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) > 0.80 THEN '⚠️ WARNING'
    ELSE '❌ CRITICAL'
  END AS health
FROM pg_statio_user_tables;
```

---

### 5. Table Bloat Check

```sql
-- Identify tables with potential bloat
SELECT 
  schemaname,
  tablename,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_ratio_pct,
  CASE
    WHEN n_dead_tup > n_live_tup * 0.2 THEN '⚠️ VACUUM NEEDED'
    ELSE '✅ HEALTHY'
  END AS bloat_status,
  last_autovacuum,
  last_vacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_live_tup > 0
ORDER BY dead_ratio_pct DESC NULLS LAST;
```

---

### 6. Connection Pool Status

```sql
-- Monitor active connections
SELECT 
  state,
  COUNT(*) AS connection_count,
  MAX(NOW() - state_change) AS max_age
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state
ORDER BY connection_count DESC;
```

---

## Tile-Specific Monitoring

### Notifications Tile

```sql
-- Check notification query performance
EXPLAIN ANALYZE
SELECT * FROM notifications 
WHERE user_id = 'test-user-uuid'::uuid 
  AND read_at IS NULL 
ORDER BY created_at DESC 
LIMIT 20;

-- Expected: Index Scan using idx_notifications_user_unread_created
-- Expected time: <10ms
```

---

### Inventory Tile

```sql
-- Check inventory action query performance
EXPLAIN ANALYZE
SELECT * FROM inventory_actions 
WHERE variant_id = 'test-variant-uuid'::uuid 
ORDER BY created_at DESC 
LIMIT 50;

-- Expected: Index Scan using idx_inventory_actions_variant_created
-- Expected time: <10ms
```

---

### Dashboard Facts Tile

```sql
-- Check dashboard fact query performance
EXPLAIN ANALYZE
SELECT * FROM dashboard_fact 
WHERE shop_domain = 'hotrodan.myshopify.com' 
  AND fact_type = 'revenue' 
ORDER BY created_at DESC 
LIMIT 5;

-- Expected: Index Scan using idx_dashboard_fact_shop_type_created
-- Expected time: <10ms
```

---

## Performance Baselines (After DATA-006 + DATA-015)

| Query Type | Before Optimization | After Optimization | Target |
|------------|-------------------|-------------------|--------|
| Notification unread | 50-100ms | 3-7ms | <10ms ✅ |
| Inventory by variant | 20-40ms | 2-5ms | <10ms ✅ |
| Dashboard facts | 15-30ms | 3-6ms | <10ms ✅ |
| Decision log | 25-50ms | 3-6ms | <10ms ✅ |
| RLS-filtered queries | 100-200ms | 30-70ms | <100ms ✅ |

---

## Automated Monitoring Setup

### Daily Performance Report

```sql
-- Run daily to track performance trends
WITH slow_queries AS (
  SELECT 
    calls,
    mean_exec_time,
    query
  FROM pg_stat_statements
  WHERE mean_exec_time > 50  -- >50ms threshold
    AND calls > 10
  ORDER BY mean_exec_time DESC
  LIMIT 10
),
table_stats AS (
  SELECT 
    tablename,
    n_live_tup,
    n_dead_tup,
    last_autovacuum
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND n_dead_tup > n_live_tup * 0.2
)
SELECT * FROM slow_queries
UNION ALL
SELECT * FROM table_stats;
```

---

### Weekly Health Check

```bash
#!/bin/bash
# File: scripts/data/weekly-db-health-check.sh

export DATABASE_URL="your-database-url"

echo "=== Weekly Database Health Check ==="
echo "Date: $(date)"
echo ""

# 1. Slow queries
echo "1. Slow Queries (>50ms):"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as slow_query_count FROM pg_stat_statements WHERE mean_exec_time > 50 AND calls > 10;"

# 2. Index usage
echo "2. Unused Indexes:"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as unused_indexes FROM pg_stat_user_indexes WHERE idx_scan = 0 AND schemaname = 'public';"

# 3. Cache hit rate
echo "3. Cache Hit Rate:"
psql "$DATABASE_URL" -c "SELECT 'index' as type, ROUND((sum(idx_blks_hit)) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0)::numeric, 4) as hit_rate FROM pg_statio_user_indexes;"

# 4. Table bloat
echo "4. Tables Needing Vacuum:"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as bloated_tables FROM pg_stat_user_tables WHERE n_dead_tup > n_live_tup * 0.2 AND schemaname = 'public';"

echo ""
echo "=== Health Check Complete ==="
```

---

## Alert Thresholds

### Critical (Immediate Action)
- Cache hit rate < 80%
- Query mean time > 1000ms (1 second)
- Table bloat > 50%
- Connection pool > 80% capacity

### Warning (Monitor Closely)
- Cache hit rate < 90%
- Query mean time > 100ms
- Table bloat > 20%
- Unused indexes > 10

### Healthy
- Cache hit rate > 95%
- Query mean time < 50ms
- Table bloat < 10%
- All indexes actively used

---

## Troubleshooting Common Issues

### Issue: Slow Queries After Migration

**Diagnosis**:
```sql
-- Check if indexes are being used
EXPLAIN ANALYZE <your_slow_query>;
```

**Solution**: Verify indexes exist and are appropriate for query pattern

---

### Issue: High Table Bloat

**Diagnosis**:
```sql
SELECT * FROM pg_stat_user_tables WHERE n_dead_tup > n_live_tup * 0.2;
```

**Solution**:
```sql
VACUUM ANALYZE table_name;
```

---

### Issue: Low Cache Hit Rate

**Diagnosis**: Check `shared_buffers` setting

**Solution**: Increase shared_buffers (requires DevOps/Supabase support)

---

## Monitoring Dashboard Queries

### Performance Summary (Single Query)

```sql
SELECT 
  'Slow Queries' AS metric,
  COUNT(*) AS value,
  '>50ms avg' AS threshold
FROM pg_stat_statements 
WHERE mean_exec_time > 50 AND calls > 10

UNION ALL

SELECT 
  'Unused Indexes',
  COUNT(*),
  '0 scans'
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 AND schemaname = 'public'

UNION ALL

SELECT 
  'Tables Needing Vacuum',
  COUNT(*),
  '>20% dead rows'
FROM pg_stat_user_tables 
WHERE n_dead_tup > n_live_tup * 0.2 AND schemaname = 'public'

UNION ALL

SELECT 
  'Active Connections',
  COUNT(*),
  'current'
FROM pg_stat_activity
WHERE datname = current_database() AND state = 'active';
```

---

## Integration with Application

### Example: Performance Logging in App

```typescript
// app/lib/db-monitor.ts
import { prisma } from '~/lib/db.server';

export async function logSlowQuery(query: string, duration: number) {
  if (duration > 50) {  // Log if >50ms
    console.warn(`[SLOW QUERY] ${duration}ms`, {
      query: query.substring(0, 200),
      duration,
      timestamp: new Date().toISOString()
    });
    
    // Optionally store in monitoring table
    await prisma.$executeRaw`
      INSERT INTO observability_logs (
        severity, message, metadata, created_at
      ) VALUES (
        'warning',
        'Slow database query detected',
        ${JSON.stringify({ query, duration })},
        NOW()
      )`;
  }
}
```

---

## Document Status

**Status**: ✅ COMPLETE  
**Created**: 2025-10-21  
**Owner**: Data + DevOps  
**Review**: Monthly


