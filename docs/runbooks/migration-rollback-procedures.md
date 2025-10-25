# Migration Rollback Procedures

**Created**: 2025-10-21  
**Task**: DATA-014  
**Version**: 1.0

---

## Overview

Safe procedures for rolling back database migrations in case of issues.

---

## Quick Rollback Guide

### Decision Tree

**Migration issue detected** →

- Single table issue? → **Selective rollback** (drop specific table)
- Multiple tables? → **Phase rollback** (drop phase tables)
- Complete failure? → **Full rollback** (all Phase 7-13)

---

## Rollback Methods

### Method 1: Full Rollback (All Phase 7-13)

**Use Case**: Complete rollback of all new tables

**Command**:

```bash
psql "$DATABASE_URL" -f supabase/migrations/rollback_all_phase_7_13.sql
```

**Time**: ~2-3 minutes

**What's Dropped**:

- 11 tables (seo_audits, seo_rankings, ad_campaigns, ad_performance, social_analytics, onboarding_progress, feature_tours, experiments, experiment_results, knowledge_base, ceo_briefings)
- 9 performance indexes (DATA-006)
- pgvector extension (optional)

**Verification**:

```sql
SELECT COUNT(*) FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('seo_audits', 'ceo_briefings');
-- Should return 0
```

---

### Method 2: Phase-Specific Rollback

**Phase 10-13 (Advanced) Only**:

```sql
DROP TABLE IF EXISTS ceo_briefings CASCADE;
DROP TABLE IF EXISTS knowledge_base CASCADE;
DROP TABLE IF EXISTS experiment_results CASCADE;
DROP TABLE IF EXISTS experiments CASCADE;
```

**Phase 9 (Onboarding) Only**:

```sql
DROP TABLE IF EXISTS feature_tours CASCADE;
DROP TABLE IF EXISTS onboarding_progress CASCADE;
```

**Phase 7-8 (Growth) Only**:

```sql
DROP TABLE IF EXISTS social_analytics CASCADE;
DROP TABLE IF EXISTS ad_performance CASCADE;
DROP TABLE IF EXISTS ad_campaigns CASCADE;
DROP TABLE IF EXISTS seo_rankings CASCADE;
DROP TABLE IF EXISTS seo_audits CASCADE;
```

---

### Method 3: Selective Table Rollback

**Single Table**:

```sql
-- Check dependencies first
SELECT
  conname,
  conrelid::regclass AS table_name,
  confrelid::regclass AS references_table
FROM pg_constraint
WHERE confrelid = 'table_name'::regclass;

-- If no dependencies, drop
DROP TABLE IF EXISTS table_name CASCADE;
```

---

## Safety Checklist

**Before Rollback**:

- [ ] Backup database (pg_dump)
- [ ] Get Manager/CEO approval (production)
- [ ] Test in staging first
- [ ] Document reason for rollback
- [ ] Notify stakeholders

**During Rollback**:

- [ ] Use transaction (BEGIN ... COMMIT)
- [ ] Monitor for errors
- [ ] Verify CASCADE won't drop unintended tables

**After Rollback**:

- [ ] Verify tables dropped
- [ ] Update Prisma schema (remove models)
- [ ] Run `npx prisma generate`
- [ ] Test application still works
- [ ] Document in feedback

---

## Rollback + Prisma Schema Update

**After rolling back tables, update Prisma**:

1. **Remove models from schema**:
   - Delete Phase 7-8 models (SeoAudit, SeoRanking, AdCampaign, AdPerformance, SocialAnalytics)
   - Delete Phase 9 models (OnboardingProgress, FeatureTour)
   - Delete Phase 10-13 models (Experiment, ExperimentResult, KnowledgeBase, CeoBriefing)

2. **Regenerate Prisma Client**:

   ```bash
   npx prisma generate
   ```

3. **Validate schema**:
   ```bash
   npx prisma validate
   ```

---

## Testing Rollback (Staging)

**Test Procedure**:

1. Apply forward migrations to staging
2. Insert test data
3. Run rollback script
4. Verify:
   - Tables dropped
   - No orphaned data
   - Application still functional

---

## Emergency Rollback (Production)

**If production migration fails**:

1. **Immediate**: Stop application (prevent data corruption)
2. **Backup**: Take snapshot before rollback
3. **Rollback**: Apply rollback script in transaction
4. **Verify**: Run verification queries
5. **Restart**: Bring application back online
6. **Post-mortem**: Document issue, fix migration, retest

**Time Target**: <15 minutes for emergency rollback

---

**Status**: ✅ READY  
**Owner**: Data + DevOps  
**Review**: Quarterly
