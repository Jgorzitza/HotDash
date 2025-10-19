# Migration Apply Plan

**Created**: 2025-10-19  
**Owner**: Data Agent  
**Status**: DRAFT - Requires Manager Approval  
**Version**: 1.0

## Overview

This document outlines the procedure for applying Supabase migrations to staging and production environments, including pre-flight checks, execution steps, verification, and rollback procedures.

## Current Migration State

**Local Migrations**: 11 files

- Date Range: 2025-10-11 to 2025-10-15
- Total Lines: 1,511 lines
- Naming Compliance: 82% (2 files missing time precision)

**Remote Migrations**: 67 applied

- Date Range: 2025-10-03 to 2025-10-14
- **CRITICAL**: 56+ migrations exist in remote but NOT in local repo

**Migration Drift**: ⚠️ **DETECTED**

- Local and remote databases are OUT OF SYNC
- **BLOCKER**: Cannot proceed with migration apply until drift resolved

## Prerequisites (MUST COMPLETE FIRST)

### P0: Resolve Migration Drift

**Issue**: Local migrations (11 files) don't match remote migrations (67 applied)

**Resolution Options**:

1. **Option A: Pull Remote Migrations to Local**

   ```bash
   supabase db remote commit
   ```

   - Creates local migration files from remote schema
   - Pros: Brings local in sync with remote
   - Cons: May lose local-only migrations if not careful

2. **Option B: Mark Remote as Reverted (Repair)**

   ```bash
   # For each remote-only migration
   supabase migration repair --status reverted <timestamp>
   ```

   - Pros: Keeps local migrations as source of truth
   - Cons: Requires manual repair for 56+ migrations

3. **Option C: Fresh Baseline (Recommended)**

   ```bash
   # Create new baseline from current remote schema
   supabase db pull --schema public
   ```

   - Creates fresh migration from remote state
   - Pros: Clean slate, no conflicts
   - Cons: Loses migration history

**Manager Decision Required**: Choose Option A, B, or C before proceeding

---

## Staging Migration Apply

### Pre-Flight Checklist

- [ ] **Migration Drift Resolved** (P0 prerequisite)
- [ ] Staging database backup verified (< 24 hours old)
- [ ] Staging maintenance window scheduled
- [ ] DevOps notified of apply window
- [ ] All migration files valid SQL (run `supabase db lint`)
- [ ] No migration conflicts detected
- [ ] Migration order verified (chronological by timestamp)
- [ ] Rollback script prepared and tested
- [ ] RLS tests passing locally
- [ ] Data integrity queries prepared

### Staging Apply Procedure

**Duration**: ~30 minutes  
**Downtime**: None expected (migrations run in transactions)

#### Step 1: Pre-Apply Verification (5 min)

```bash
# 1. Verify Supabase CLI version
supabase --version
# Expected: v2.48.3 or higher

# 2. List pending migrations
supabase migration list

# 3. Check staging database connection
psql $STAGING_DB_URL -c "SELECT version();"

# 4. Verify backup timestamp
psql $STAGING_DB_URL -c "SELECT pg_backup_start_time();"
```

#### Step 2: Apply Migrations (10 min)

```bash
# Navigate to project root
cd ~/HotDash/hot-dash

# Apply all pending migrations
supabase db push --db-url $STAGING_DB_URL

# Capture output
supabase db push --db-url $STAGING_DB_URL 2>&1 | tee artifacts/data/staging_migration_apply_$(date +%Y%m%d_%H%M%S).log
```

**Expected Output**:

- All migrations apply successfully
- No ERROR messages
- Final message: "Finished supabase db push"

#### Step 3: Verification (10 min)

```bash
# 1. Verify all migrations applied
supabase migration list --db-url $STAGING_DB_URL

# 2. Run RLS tests
DATABASE_URL=$STAGING_DB_URL ./scripts/test-rls.sh

# 3. Run data integrity queries
psql $STAGING_DB_URL -f docs/runbooks/data_integrity_checks.sql

# 4. Test dashboard RPC functions
psql $STAGING_DB_URL -c "SELECT get_revenue_metrics(NOW() - INTERVAL '7 days', NOW());"

# 5. Check for orphaned data
psql $STAGING_DB_URL -c "
  SELECT COUNT(*) as orphans
  FROM agent_approvals
  WHERE agent_id NOT IN (SELECT id FROM agents);
"
```

#### Step 4: Smoke Tests (5 min)

```bash
# 1. Test read operations
psql $STAGING_DB_URL -c "SELECT COUNT(*) FROM product_categories;"
psql $STAGING_DB_URL -c "SELECT COUNT(*) FROM customer_segments;"

# 2. Test write operations (as service role)
psql $STAGING_DB_URL -c "
  INSERT INTO product_categories (shopify_product_id, category_l1, category_l2, avg_order_value, margin_pct, inventory_velocity)
  VALUES (99999, 'Test', 'Smoke Test', 100.00, 30.00, 'fast');
  DELETE FROM product_categories WHERE shopify_product_id = 99999;
"

# 3. Test RLS policies
psql $STAGING_DB_URL -c "
  SET app.current_project = 'occ';
  SELECT COUNT(*) FROM facts WHERE project = 'occ';
"
```

### Staging Success Criteria

- [ ] All migrations applied (0 errors)
- [ ] RLS tests passing (100%)
- [ ] Data integrity checks passing
- [ ] Dashboard RPC functions working
- [ ] Smoke tests passing
- [ ] No orphaned data detected
- [ ] Rollback script tested and ready

---

## Production Migration Apply

⚠️ **CRITICAL**: Only proceed if staging apply completed successfully with 0 errors

### Pre-Flight Checklist

- [ ] **Staging apply completed successfully** (P0 prerequisite)
- [ ] Production database backup verified (< 12 hours old)
- [ ] Production maintenance window scheduled (off-peak hours)
- [ ] Manager approval obtained (document approval timestamp)
- [ ] DevOps notified 24 hours in advance
- [ ] Rollback script tested on staging
- [ ] Rollback decision criteria defined
- [ ] Monitoring dashboards open (Supabase metrics)
- [ ] Incident response team on standby

### Production Apply Procedure

**Duration**: ~45 minutes  
**Downtime**: None expected (migrations run in transactions)  
**Window**: Off-peak hours (2 AM - 4 AM UTC recommended)

#### Step 1: Pre-Apply Verification (10 min)

```bash
# 1. Verify production backup
psql $PRODUCTION_DB_URL -c "SELECT pg_backup_start_time();"

# 2. Verify current migration state
supabase migration list --db-url $PRODUCTION_DB_URL

# 3. Check active connections
psql $PRODUCTION_DB_URL -c "
  SELECT COUNT(*) as active_connections
  FROM pg_stat_activity
  WHERE datname = current_database();
"

# 4. Check database size
psql $PRODUCTION_DB_URL -c "
  SELECT pg_size_pretty(pg_database_size(current_database()));
"

# 5. Verify no ongoing long-running queries
psql $PRODUCTION_DB_URL -c "
  SELECT pid, usename, query, state, now() - query_start as duration
  FROM pg_stat_activity
  WHERE state != 'idle' AND now() - query_start > INTERVAL '1 minute'
  ORDER BY duration DESC;
"
```

#### Step 2: Apply Migrations (15 min)

```bash
# Navigate to project root
cd ~/HotDash/hot-dash

# Apply migrations to production
supabase db push --db-url $PRODUCTION_DB_URL 2>&1 | tee artifacts/data/production_migration_apply_$(date +%Y%m%d_%H%M%S).log

# Monitor migration progress
tail -f artifacts/data/production_migration_apply_*.log
```

**Watch for**:

- ERROR messages (immediate rollback if any)
- NOTICE messages (review but generally OK)
- Migration timestamps (verify chronological order)
- Final success message

#### Step 3: Verification (15 min)

```bash
# 1. Verify all migrations applied
supabase migration list --db-url $PRODUCTION_DB_URL

# 2. Run RLS tests (READ-ONLY)
DATABASE_URL=$PRODUCTION_DB_URL psql -f supabase/rls_tests.sql

# 3. Test critical RPC functions
psql $PRODUCTION_DB_URL -c "SELECT get_revenue_metrics(NOW() - INTERVAL '7 days', NOW());"
psql $PRODUCTION_DB_URL -c "SELECT get_inventory_summary();"
psql $PRODUCTION_DB_URL -c "SELECT get_approvals_pending_count();"

# 4. Verify RLS policies active
psql $PRODUCTION_DB_URL -c "
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = true;
"

# 5. Check error rates
psql $PRODUCTION_DB_URL -c "
  SELECT COUNT(*) as error_count
  FROM observability_logs
  WHERE level = 'ERROR' AND created_at > NOW() - INTERVAL '5 minutes';
"
```

#### Step 4: Post-Apply Monitoring (5 min)

```bash
# 1. Monitor query performance
psql $PRODUCTION_DB_URL -c "
  SELECT query, mean_exec_time, calls
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;
"

# 2. Monitor connection counts
watch -n 5 "psql $PRODUCTION_DB_URL -c 'SELECT COUNT(*) FROM pg_stat_activity;'"

# 3. Check Supabase dashboard
# - Query performance (target: P95 < 500ms)
# - Error rates (target: < 0.5%)
# - Connection pool usage (target: < 80%)
```

### Production Success Criteria

- [ ] All migrations applied (0 errors)
- [ ] RLS tests passing
- [ ] Critical RPC functions working
- [ ] All RLS-enabled tables verified
- [ ] Error rate < 0.5% (per NORTH_STAR.md)
- [ ] Query P95 < 500ms
- [ ] Connection pool healthy (< 80% usage)
- [ ] No customer-facing errors reported

---

## Rollback Procedures

### When to Rollback

**Immediate Rollback Triggers**:

- ANY migration ERROR during apply
- RLS tests failing after apply
- Error rate > 1% for > 5 minutes
- Critical RPC function failures
- Data integrity check failures
- Customer-facing errors reported

### Staging Rollback

```bash
# Option 1: Revert to backup (fastest)
supabase db reset --db-url $STAGING_DB_URL

# Option 2: Manual migration revert
psql $STAGING_DB_URL -f scripts/rollback_migrations.sql
```

### Production Rollback

⚠️ **CRITICAL**: Production rollback requires Manager approval

**Option 1: Point-in-Time Recovery (Recommended)**

```bash
# 1. Stop accepting writes
psql $PRODUCTION_DB_URL -c "ALTER DATABASE hotdash SET default_transaction_read_only = on;"

# 2. Restore from backup (via Supabase dashboard)
# - Navigate to: Database > Backups
# - Select backup timestamp (before migration apply)
# - Click "Restore"

# 3. Verify restore
psql $PRODUCTION_DB_URL -c "SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 10;"

# 4. Re-enable writes
psql $PRODUCTION_DB_URL -c "ALTER DATABASE hotdash SET default_transaction_read_only = off;"
```

**Option 2: Migration Revert Script**

```bash
# Navigate to project root
cd ~/HotDash/hot-dash

# Run pre-tested rollback script
psql $PRODUCTION_DB_URL -f scripts/rollback_migrations_20251019.sql 2>&1 | tee artifacts/data/production_rollback_$(date +%Y%m%d_%H%M%S).log
```

### Rollback Verification

```bash
# 1. Verify schema state
supabase migration list --db-url $PRODUCTION_DB_URL

# 2. Run smoke tests
psql $PRODUCTION_DB_URL -c "SELECT COUNT(*) FROM product_categories;"

# 3. Verify no data loss
psql $PRODUCTION_DB_URL -c "SELECT COUNT(*) FROM customer_segments;"

# 4. Check application functionality
# - Test dashboard tiles
# - Test approval workflows
# - Test customer interactions
```

---

## Coordination & Communication

### DevOps Coordination Points

- [ ] Staging apply window scheduled (coordinate with DevOps D-007)
- [ ] Production apply window scheduled (24 hours notice)
- [ ] Backup verification completed (< 12 hours before apply)
- [ ] Rollback script tested and approved
- [ ] Monitoring dashboards configured

### Manager Approval Points

- [ ] Migration drift resolution strategy approved
- [ ] Staging apply results reviewed and approved
- [ ] Production apply window approved
- [ ] Rollback decision criteria approved

### Post-Apply Communication

**Staging Success**:

- Update `feedback/data/2025-10-19.md` with apply results
- Notify Manager via feedback entry
- Share apply logs in `artifacts/data/`

**Production Success**:

- Update `feedback/data/2025-10-19.md` with apply results
- Notify Manager immediately
- Share metrics dashboard screenshots
- Document any issues encountered

**Rollback Required**:

- Notify Manager immediately (CRITICAL)
- Document rollback reason and steps taken
- Share rollback logs
- Schedule post-mortem review

---

## Monitoring Queries

```sql
-- Query 1: Migration apply progress
SELECT version, name, applied_at
FROM schema_migrations
ORDER BY version DESC
LIMIT 20;

-- Query 2: Error rate (last 15 minutes)
SELECT
  DATE_TRUNC('minute', created_at) as minute,
  COUNT(*) as error_count
FROM observability_logs
WHERE level = 'ERROR' AND created_at > NOW() - INTERVAL '15 minutes'
GROUP BY minute
ORDER BY minute DESC;

-- Query 3: Query performance (P95)
SELECT
  query,
  calls,
  mean_exec_time,
  stddev_exec_time
FROM pg_stat_statements
WHERE calls > 10
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Query 4: Connection pool usage
SELECT
  COUNT(*) as active_connections,
  COUNT(*) FILTER (WHERE state = 'active') as active_queries,
  COUNT(*) FILTER (WHERE state = 'idle') as idle_connections
FROM pg_stat_activity
WHERE datname = current_database();

-- Query 5: Table sizes (monitor growth)
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC
LIMIT 10;
```

---

## Known Issues & Mitigations

### Issue 1: Migration Drift

**Status**: CRITICAL BLOCKER  
**Impact**: Cannot apply local migrations until resolved  
**Mitigation**: Manager must approve resolution strategy (see Prerequisites P0)

### Issue 2: Missing Tables

**Tables**: `facts`, `decision_sync_event_logs`, `observability_logs`  
**Impact**: RLS tests for these tables will fail  
**Mitigation**: Create missing table migrations OR accept remote schema as-is

### Issue 3: Naming Convention

**Files**: `20251015_dashboard_rpc_functions.sql`, `20251015_dashboard_tile_queries.sql`  
**Impact**: Missing time precision in migration names  
**Mitigation**: Rename files to include HHMMSS timestamp OR accept as-is

---

## Success Metrics

Per NORTH_STAR.md:

- **Error Rate**: < 0.5% for nightly rollups
- **Query Performance**: P95 < 3s for tile load, < 500ms for RPC functions
- **Uptime**: ≥ 99.9% over 30 days

**Post-Migration Targets**:

- All migrations applied: 0 errors
- RLS test pass rate: 100%
- Data integrity: 0 orphaned records
- Query P95: < 500ms
- Error rate: < 0.5%

---

## Appendix

### Files Referenced

- Migration files: `supabase/migrations/*.sql`
- RLS tests: `supabase/rls_tests.sql`
- RLS test runner: `scripts/test-rls.sh`
- Seed data: `supabase/seeds/*.sql`
- Rollback scripts: `scripts/rollback_migrations_*.sql` (to be created)

### Related Documentation

- Migration audit: `feedback/data/2025-10-19.md` (DA-002)
- RLS policy review: `feedback/data/2025-10-19.md` (DA-003)
- RLS test scenarios: `docs/runbooks/rls_test_scenarios.md`
- Data integrity checks: `docs/runbooks/data_integrity_checks.md` (to be created)

### Revision History

| Version | Date       | Changes                      | Author     |
| ------- | ---------- | ---------------------------- | ---------- |
| 1.0     | 2025-10-19 | Initial migration apply plan | Data Agent |

---

**STATUS**: DRAFT - Awaiting Manager approval on migration drift resolution strategy

Last Updated: 2025-10-19T09:46:00Z
