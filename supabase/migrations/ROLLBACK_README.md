# Migration Rollback Scripts
**Created**: 2025-10-21  
**Task**: DATA-014  
**Purpose**: Rollback procedures for all Phase 7-13 migrations

---

## Overview

This directory contains rollback scripts for safely reverting database migrations.

### Rollback Order

**CRITICAL**: Rollback migrations must be applied in **REVERSE order** due to foreign key dependencies.

**Correct Rollback Order**:
1. `rollback_20251024000004_drop_ceo_briefings.sql` (no dependencies)
2. `rollback_20251024000003_drop_knowledge_base.sql` (no dependencies)
3. `rollback_20251024000002_drop_experiment_results.sql` (FK to experiments)
4. `rollback_20251024000001_drop_experiments.sql` (no dependencies after results dropped)
5. `rollback_20251023000002_drop_feature_tours.sql` (no dependencies)
6. `rollback_20251023000001_drop_onboarding_progress.sql` (no dependencies)
7. `rollback_20251022000005_drop_social_analytics.sql` (FK to social_posts)
8. `rollback_20251022000004_drop_ad_performance.sql` (FK to ad_campaigns)
9. `rollback_20251022000003_drop_ad_campaigns.sql` (no dependencies after performance dropped)
10. `rollback_20251022000002_drop_seo_rankings.sql` (no dependencies)
11. `rollback_20251022000001_drop_seo_audits.sql` (no dependencies)
12. `rollback_20251021000001_drop_performance_indexes.sql` (indexes only)

---

## Usage

### Single Rollback (Careful!)
```bash
psql "$DATABASE_URL" -f supabase/migrations/rollback_<migration_name>.sql
```

### Full Rollback (All Phase 7-13 tables)
```bash
# Apply in correct order (reverse of creation)
for file in rollback_20251024000004 rollback_20251024000003 rollback_20251024000002 rollback_20251024000001 rollback_20251023000002 rollback_20251023000001 rollback_20251022000005 rollback_20251022000004 rollback_20251022000003 rollback_20251022000002 rollback_20251022000001 rollback_20251021000001; do
  psql "$DATABASE_URL" -f "supabase/migrations/${file}_*.sql"
done
```

### Verify Rollback
```sql
-- Check tables no longer exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
  'seo_audits', 'seo_rankings', 'ad_campaigns', 'ad_performance', 'social_analytics',
  'onboarding_progress', 'feature_tours', 
  'experiments', 'experiment_results', 'knowledge_base', 'ceo_briefings'
);
-- Should return 0 rows

-- Check pgvector extension (if fully rolling back)
SELECT * FROM pg_extension WHERE extname = 'vector';
-- Should exist only if other tables use it
```

---

## Safety Checklist

**Before Rollback**:
- [ ] Backup current database state
- [ ] Verify no production data will be lost
- [ ] Get Manager/CEO approval for production rollback
- [ ] Test rollback in staging first
- [ ] Document reason for rollback

**After Rollback**:
- [ ] Verify tables dropped
- [ ] Check dependent tables still exist
- [ ] Update Prisma schema (remove models)
- [ ] Run `npx prisma generate` to update client
- [ ] Document rollback in feedback

---

## Rollback Scripts Location

All rollback scripts are in: `supabase/migrations/rollback_*.sql`


