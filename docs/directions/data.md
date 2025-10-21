# Data Direction v7.0

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T22:00Z  
**Version**: 7.0  
**Status**: ACTIVE — Phase 7-13 Schema Implementation

---

## ✅ DATA-006 THROUGH 009 COMPLETE
- ✅ DATA-006: 9 performance indexes (migration ready)
- ✅ DATA-007: Query analysis (480+ lines, 5x-15x improvements)
- ✅ DATA-008: Phase 7-13 schema (11 tables, 1,100+ lines)
- ✅ DATA-009: Backup/recovery runbook (800+ lines)
**Efficiency**: 3x faster (3h vs 9h estimated)

---

## ACTIVE TASKS (12h total)

### DATA-010: Apply DATA-006 Indexes to Staging (1h) - START NOW
Apply migration 20251021000001_add_performance_indexes.sql
- Coordinate with DevOps for Supabase access
- Verify all 9 indexes created
- Run ANALYZE on tables
- Measure query performance improvements
**MCP**: Supabase migration API docs

### DATA-011: Phase 7-8 Growth Analytics Tables (4h)
Create 5 tables for Growth analytics
- seo_audits, seo_rankings, ad_campaigns, ad_performance, social_analytics
- Migration files with indexes
- RLS policies for all tables
- Prisma schema updates
**MCP**: Prisma migrations, Supabase RLS

### DATA-012: Phase 9 Onboarding Tables (2h)
Create 2 tables for Onboarding
- onboarding_progress, feature_tours
- Unique indexes, RLS policies
**MCP**: Prisma schema patterns

### DATA-013: Phase 10-13 Advanced Tables (3h)
Create 4 tables for Advanced features
- experiments, experiment_results, knowledge_base (pgvector), ceo_briefings
- Enable pgvector extension
- IVFFlat index for embeddings
**MCP**: Prisma, Supabase pgvector

### DATA-014: Migration Testing + Rollback Scripts (2h)
Create rollback migrations for all forward migrations
- Test locally in Docker Postgres
- Migration application runbook
**MCP**: Prisma rollback patterns

### DATA-015: RLS Performance Optimization (1h)
Optimize RLS policies with cached auth.uid()
- Add indexes on RLS columns
- Test with EXPLAIN ANALYZE
**MCP**: Supabase RLS performance

### DATA-016: Query Performance Monitoring (2h)
Create performance monitoring queries
- Slow query logging setup
- Performance dashboard queries
**MCP**: Supabase performance monitoring

**START NOW**: Pull Prisma + Supabase docs, then apply DATA-006 indexes
