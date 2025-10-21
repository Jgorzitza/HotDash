# Database Migration Pipeline

**Version**: 1.0  
**Last Updated**: 2025-10-21  
**Owner**: DevOps  
**Status**: ACTIVE

---

## Overview

Safe database migration workflow for HotDash, ensuring additive-only changes, automated testing, and rollback capabilities.

## Critical Rules

### 🚨 MANDATORY DATABASE SAFETY POLICY

**From**: `docs/RULES.md` "Database Safety" section

1. **NO automated migrations in deployment** ❌
   - fly.toml release_command = `npx prisma generate` ONLY
   - package.json setup = `npx prisma generate` ONLY
   - NO `prisma migrate deploy` in automation

2. **Schema changes require CEO approval** ✅
   - Data agent creates migration files
   - DevOps verifies migration safety (dry-run in CI)
   - Manager reviews and applies via Supabase console
   - DevOps verifies tables exist in database

3. **Migrations must be ADDITIVE ONLY** ✅
   - Add new tables: ✅ ALLOWED
   - Add new columns: ✅ ALLOWED  
   - Remove tables/columns: ❌ FORBIDDEN in production
   - Modify column types: ⚠️ Requires special approval

---

## Migration Workflow

### Phase 1: Creation (Data Agent)

**Data agent creates**:
```bash
cd /home/justin/HotDash/hot-dash
npx prisma migrate dev --name add_social_posts_table
```

**Output**:
- `prisma/migrations/YYYYMMDDHHMMSS_add_social_posts_table/migration.sql`
- Updated `prisma/schema.prisma`

**Commits**:
```bash
git add prisma/
git commit -m "feat(data): add social posts migration - DATA-XXX"
git push origin manager-reopen-YYYYMMDD
```

---

### Phase 2: Validation (DevOps - Automated)

**Trigger**: Pull request with migration files

**GitHub Actions**: `.github/workflows/migration-test.yml`

**Steps**:
1. **Validate Schema**: Check Prisma schema is valid
2. **Check Breaking Changes**: Detect removed models/fields (fails if found)
3. **Dry-Run**: Apply migration to test Postgres database
4. **Verify**: Confirm schema matches expected state
5. **Generate Rollback Guide**: Document how to undo migration

**Output**: GitHub Actions artifact with rollback instructions

---

### Phase 3: Review (Manager)

**Manager checks**:
1. ✅ CI passed (green checkmark on PR)
2. ✅ Migration is additive-only (no deletions)
3. ✅ Rollback guide generated
4. ✅ Aligned with project requirements

**Manager approves**: Comments "LGTM" or merges PR

---

### Phase 4: Application (Manager - Manual)

**⚠️ CRITICAL**: Manual execution only, never automated

**Method 1: Supabase Console (Recommended)**

1. Navigate to https://supabase.com/dashboard/project/<project-id>/sql
2. Copy SQL from `prisma/migrations/<timestamp>_<name>/migration.sql`
3. Paste into SQL editor
4. Review carefully
5. Execute
6. Verify: Check tables in Database → Tables view

**Method 2: psql (Alternative)**

```bash
# Get database URL from vault/occ/supabase/
SUPABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Connect
psql "$SUPABASE_URL"

# Apply migration SQL
\i prisma/migrations/<timestamp>_<name>/migration.sql

# Verify
\dt+ <table_name>

# Exit
\q
```

---

### Phase 5: Verification (DevOps)

**After Manager applies migration**:

```bash
# Method 1: Via Supabase console
# Dashboard → Database → Tables → Verify new tables exist

# Method 2: Via SQL query
```

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('social_posts', 'new_table_name');

-- Verify Row Level Security (RLS) enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'social_posts';

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'social_posts'
ORDER BY ordinal_position;
```

**Report in feedback**:
```md
## HH:MM - Migration Verified

**Migration**: <name>
**Tables**: social_posts (verified exists)
**RLS**: Enabled ✓
**Engineer Status**: Unblocked for Phase N implementation
```

---

## Rollback Procedures

### Scenario 1: Migration Not Yet Applied

**Action**: Simply don't apply the migration

**Cleanup**:
```bash
# Remove migration files
git rm -r prisma/migrations/<timestamp>_<name>/
git restore prisma/schema.prisma  # Revert schema changes
git commit -m "revert(data): remove problematic migration"
```

---

### Scenario 2: Migration Applied, Need to Revert

**⚠️ CRITICAL**: Coordinate with Manager and CEO before executing

**Step 1**: Identify changes made
```sql
-- View table structure
\d+ <table_name>
```

**Step 2**: Create rollback SQL
```sql
-- If added table:
DROP TABLE IF EXISTS <table_name>;

-- If added column:
ALTER TABLE <table_name> DROP COLUMN IF EXISTS <column_name>;

-- If added index:
DROP INDEX IF EXISTS <index_name>;
```

**Step 3**: Test in dev database first
```bash
# Use local Postgres or test Supabase project
psql "postgresql://localhost/hotdash_dev"
# Run rollback SQL
# Verify app still works
```

**Step 4**: Apply to production (Manager only)
```bash
# Manager executes via Supabase console
# DevOps verifies with queries
```

**Step 5**: Update Prisma schema
```bash
# Revert schema.prisma to match database
# Create new migration if needed
npx prisma db pull  # Generate schema from database
```

---

## Migration Safety Checklist

### Before Creating Migration

- [ ] Migration is additive-only (no deletions)
- [ ] Column names follow naming conventions (snake_case)
- [ ] Foreign keys properly defined
- [ ] Indexes on frequently queried columns
- [ ] RLS policies defined (if applicable)
- [ ] Default values for new columns (if applicable)

### Before Applying Migration

- [ ] CI tests passed (green checkmark)
- [ ] Dry-run successful in test database
- [ ] Rollback plan documented
- [ ] Manager approval obtained
- [ ] Backup verified (Supabase auto-backup enabled)

### After Applying Migration

- [ ] Tables exist (verified via SQL)
- [ ] RLS enabled (verified via SQL)
- [ ] App deployments working (no schema mismatch errors)
- [ ] Engineer unblocked for feature work
- [ ] Migration documented in feedback file

---

## Common Issues

### Issue: Migration Fails in CI

**Cause**: Syntax error or invalid constraint

**Resolution**:
1. Check error message in GitHub Actions logs
2. Fix SQL in migration file
3. Test locally: `npx prisma migrate dev`
4. Push fix, re-run CI

---

### Issue: Schema Mismatch After Migration

**Cause**: Prisma schema doesn't match database

**Resolution**:
```bash
# Pull current database schema
npx prisma db pull

# Compare with prisma/schema.prisma
git diff prisma/schema.prisma

# If different, regenerate client
npx prisma generate
```

---

### Issue: Need to Rollback Migration

**Cause**: Migration caused production issues

**Resolution**:
1. **IMMEDIATE**: Pause new deployments
2. **ASSESS**: Identify specific issue
3. **COORDINATE**: Manager + Data + DevOps + Engineer
4. **PLAN**: Create rollback SQL (see Rollback Procedures above)
5. **TEST**: Rollback in dev/staging first
6. **EXECUTE**: Manager applies to production
7. **VERIFY**: All apps working
8. **POST-MORTEM**: Document what went wrong

---

## Automated Migration Testing

### GitHub Actions Workflow

**File**: `.github/workflows/migration-test.yml`

**Triggers**:
- PR with changes to `prisma/migrations/**`
- PR with changes to `prisma/schema.prisma`
- Manual dispatch

**Jobs**:
1. **validate**: Check schema validity, detect breaking changes
2. **dry-run**: Apply to test Postgres, verify success
3. **summary**: Generate result summary with rollback guide

**Artifacts**:
- Migration rollback guide (retained 30 days)
- Test database schema dump
- Migration status report

---

## Migration Coordination Matrix

| Agent | Responsibility | File Location | Verification |
|-------|---------------|---------------|--------------|
| **Data** | Create migrations | `prisma/migrations/` | CI passes |
| **DevOps** | Verify safety | CI workflow | Green checkmark |
| **Manager** | Review & apply | Supabase console | SQL execution |
| **DevOps** | Verify applied | SQL queries | Tables exist |
| **Engineer** | Use new schema | App code | No errors |

---

## Production Migration Checklist

### Pre-Migration (24h before)

- [ ] Migration tested in staging
- [ ] Rollback plan documented
- [ ] Team notified of maintenance window
- [ ] Database backup verified
- [ ] Manager approval obtained

### During Migration (Manager executes)

- [ ] Maintenance mode enabled (if needed)
- [ ] Migration SQL reviewed one final time
- [ ] Execute via Supabase console
- [ ] Verify tables created
- [ ] Test app functionality
- [ ] Maintenance mode disabled

### Post-Migration (DevOps verifies)

- [ ] Tables verified via SQL queries
- [ ] App deployments successful
- [ ] No error spikes in logs
- [ ] Performance metrics normal
- [ ] Team notified of completion

---

## Related Documentation

- **Database Safety Policy**: `docs/RULES.md` (Database Safety section)
- **Migration Test Workflow**: `.github/workflows/migration-test.yml`
- **DevOps Directions**: `docs/directions/devops.md` (DEVOPS-002)
- **Prisma Documentation**: https://www.prisma.io/docs/guides/migrate

---

**🗄️ End of Runbook**

