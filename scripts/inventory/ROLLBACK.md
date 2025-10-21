# Inventory Automation Scripts - Rollback Guide

## Overview

This document provides rollback procedures for inventory automation scripts.

## Scripts

### 1. generate-purchase-orders.ts

**Purpose**: Generates purchase orders for items below ROP

**Actions**:

- Queries inventory_snapshots for items needing reorder
- Creates draft purchase_orders records
- Generates CSV files for vendor ordering

**Rollback**:

```sql
-- Delete draft POs created by script (replace timestamp with script run time)
DELETE FROM purchase_orders
WHERE status = 'draft'
  AND created_at > '2025-10-20 19:00:00'
  AND created_by = 'script:generate-purchase-orders';

-- Delete associated PO items
DELETE FROM purchase_order_items
WHERE po_id IN (
  SELECT id FROM purchase_orders
  WHERE status = 'draft'
    AND created_at > '2025-10-20 19:00:00'
    AND created_by = 'script:generate-purchase-orders'
);
```

**File Cleanup**:

```bash
# Delete generated CSV files
rm -f exports/purchase_orders/PO-*.csv
```

**Safety**:

- Script uses `--dry-run` mode by default for preview
- Only creates draft PO records (not sent to vendors)
- No external API calls or inventory modifications
- All changes are database-only and reversible

---

### 2. sync-shopify-inventory.ts (Future)

**Purpose**: Sync Shopify inventory levels to local database

**Actions**:

- Queries Shopify Admin GraphQL API for inventory levels
- Updates inventory_snapshots table
- Logs sync events to inventory_events

**Rollback**:

```sql
-- Revert to previous snapshot (if needed)
-- This assumes you have a backup snapshot before the sync
TRUNCATE inventory_snapshots;

-- Restore from backup (example - adjust path as needed)
COPY inventory_snapshots FROM '/path/to/backup/inventory_snapshots_backup.csv' CSV HEADER;

-- Or restore specific date's snapshots
DELETE FROM inventory_snapshots WHERE snapshot_date = '2025-10-20';
INSERT INTO inventory_snapshots SELECT * FROM inventory_snapshots_archive WHERE snapshot_date = '2025-10-19';
```

**Safety**:

- Script is read-only for Shopify (no mutations)
- Creates inventory_events audit trail
- Takes snapshot before sync
- Can be run multiple times safely (idempotent)

---

## General Rollback Principles

### Database Changes

1. **Always use transactions** for multi-step operations
2. **Create backups** before running scripts in production
3. **Log all operations** to inventory_events for audit trail
4. **Use draft status** for records that need review before execution

### File Operations

1. **Store CSVs in dated directories** (e.g., `exports/2025-10-20/`)
2. **Keep generated files for 30 days** before cleanup
3. **Version control** for script changes

### External API Calls

1. **Read-only by default** - no mutations without HITL approval
2. **Rate limit protection** - respect API limits
3. **Idempotent operations** - safe to retry

---

## Emergency Rollback Checklist

If a script causes issues:

- [ ] **Stop the script immediately** (if still running)
- [ ] **Document the issue** - timestamp, error messages, affected records
- [ ] **Check audit trail** - query `inventory_events` for script operations
- [ ] **Identify affected records** - use timestamps and created_by field
- [ ] **Execute rollback SQL** - delete/restore as needed
- [ ] **Verify data integrity** - run validation queries
- [ ] **Update feedback file** - document incident and resolution
- [ ] **Escalate to Manager** - if data corruption or customer impact

---

## Validation Queries

After rollback, verify data integrity:

```sql
-- Check for orphaned PO items
SELECT * FROM purchase_order_items poi
LEFT JOIN purchase_orders po ON poi.po_id = po.id
WHERE po.id IS NULL;

-- Check for negative inventory
SELECT * FROM inventory_snapshots
WHERE available_quantity < 0 OR on_hand_quantity < 0;

-- Check for missing ROP calculations
SELECT * FROM inventory_snapshots
WHERE reorder_point IS NULL AND avg_daily_sales > 0;

-- Check audit trail consistency
SELECT event_type, COUNT(*) as count, MAX(created_at) as latest
FROM inventory_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY latest DESC;
```

---

## Prevention

### Pre-Execution Checklist

- [ ] Review script code for destructive operations
- [ ] Run with `--dry-run` flag first
- [ ] Verify database backup is recent (< 24 hours)
- [ ] Check Supabase connection string (dev vs prod)
- [ ] Confirm HITL approval if touching customer-facing data
- [ ] Update feedback file before execution

### Monitoring

- [ ] Watch for error logs during execution
- [ ] Monitor database row counts
- [ ] Check API rate limits
- [ ] Verify CSV output matches expected format
- [ ] Validate audit trail entries

---

## Support

If you need help with rollback:

1. Check this document first
2. Review `feedback/inventory/YYYY-MM-DD.md` for context
3. Escalate to Manager with evidence (SQL queries, error logs)
4. Document resolution for future reference


