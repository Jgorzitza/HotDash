# Data Direction v6.3

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T03:58Z  
**Version**: 6.3  
**Status**: ACTIVE — Database Optimization + Phase 7-13 Prep

---

## Objective

**Optimize existing database + Plan schema for Phases 7-13**

---

## MANDATORY MCP USAGE

```bash
# PostgreSQL optimization patterns
mcp_context7_get-library-docs("/prisma/docs", "performance indexes query optimization")

# Supabase RLS and performance
mcp_context7_get-library-docs("/supabase/supabase", "database performance indexes RLS")
```

---

## ACTIVE TASKS (9h total)

### DATA-006: Index Optimization (2h) - START NOW

**Requirements**:
- Analyze slow queries from tile loaders
- Add indexes for performance
- Verify RLS policies don't block indexes

**Tables to Optimize**:
- `decision_log`: Index on `(user_id, created_at DESC)` for approvals tile
- `notifications`: Index on `(user_id, read, created_at DESC)` for notification center
- `user_preferences`: Index on `user_id` (unique)
- `sales_pulse_actions`: Index on `(created_at DESC)` for recent actions
- `inventory_actions`: Index on `(product_id, created_at DESC)`

**MCP Required**: Pull Prisma performance docs BEFORE creating indexes

**Implementation**:

**File**: `supabase/migrations/20251021000001_add_performance_indexes.sql` (new)
```sql
-- Add indexes for tile performance
CREATE INDEX idx_decision_log_user_created ON decision_log(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_sales_pulse_actions_created ON sales_pulse_actions(created_at DESC);
CREATE INDEX idx_inventory_actions_product_created ON inventory_actions(product_id, created_at DESC);

-- Verify RLS policies don't conflict
ANALYZE decision_log;
ANALYZE notifications;
```

**Deliverables**:
- Migration file with indexes
- `EXPLAIN ANALYZE` results showing performance improvement
- Document in feedback with before/after query times

**Time**: 2 hours

---

### DATA-007: Query Performance Analysis (2h)

**Requirements**:
- Identify slowest queries across all tiles
- Document query plans
- Recommend optimizations

**Approach**:
1. Enable Supabase slow query logging
2. Run all tile loaders and collect query times
3. Use `EXPLAIN ANALYZE` on slowest queries
4. Document findings

**Queries to Analyze**:
- Approvals queue count (`SELECT COUNT(*) FROM decision_log WHERE status = 'pending'`)
- Notification center unread (`SELECT * FROM notifications WHERE user_id = $1 AND read = false ORDER BY created_at DESC LIMIT 20`)
- Sales pulse recent actions
- Inventory risk calculation
- Idea pool suggestion fetch

**MCP Required**: Pull Supabase performance docs

**Deliverables**:
- Query performance report: `artifacts/data/query-performance-analysis-2025-10-21.md`
- Top 5 slowest queries identified
- Optimization recommendations (indexes, query rewrite, caching)

**Time**: 2 hours

---

### DATA-008: Phase 7-13 Schema Planning (3h)

**Requirements**:
- Design database schema for upcoming phases
- Growth tables (SEO, Ads, Social posts)
- Advanced features tables
- Document in spec format

**Phases to Plan For**:

**Phase 7-8 (Growth)**:
- `seo_audits` table: Daily SEO crawl results
- `seo_rankings` table: Keyword position tracking
- `ad_campaigns` table: Google Ads campaign data
- `ad_performance` table: Daily ROAS, CTR, conversions
- `social_posts` table: ✅ Already exists
- `social_analytics` table: Post performance metrics

**Phase 9 (Onboarding)**:
- `onboarding_progress` table: User step completion
- `feature_tours` table: Tour definitions

**Phase 10-13 (Advanced)**:
- `experiments` table: A/B test definitions
- `experiment_results` table: Variant performance
- `knowledge_base` table: Vector embeddings for search
- `ceo_briefings` table: Generated summaries

**MCP Required**: Pull Prisma schema design docs

**Deliverables**:
- Schema spec: `docs/specs/database-schema-phase-7-13.md` (new)
- ERD diagram (text format or Mermaid)
- Migration file stubs (empty, just structure)
- RLS policy notes for each table

**Time**: 3 hours

---

### DATA-009: Backup & Recovery Testing (2h)

**Requirements**:
- Verify Supabase Point-in-Time Recovery (PITR) working
- Test backup restore to staging
- Document recovery procedures

**Testing Steps**:
1. Take manual Supabase backup
2. Restore to test database
3. Verify all tables intact
4. Test RLS policies still work
5. Document recovery time

**MCP Required**: Pull Supabase backup docs

**Deliverables**:
- Recovery runbook: `docs/runbooks/database-recovery.md` (new)
- Test restore evidence (timestamps, table counts)
- RTO (Recovery Time Objective) documented
- RPO (Recovery Point Objective) documented

**Time**: 2 hours

---

## Work Protocol

**1. MCP Tools** (MANDATORY):
```bash
mcp_context7_get-library-docs("/prisma/docs", "indexes performance optimization")
mcp_context7_get-library-docs("/supabase/supabase", "backup recovery PITR RLS")
```

**2. Coordinate with**:
- **Engineer**: Share query performance findings
- **DevOps**: Coordinate backup testing
- **Manager**: Get approval before applying migrations

**3. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Data: Index Optimization

**Working On**: DATA-006 (Adding performance indexes)
**Progress**: 60% - Created migration, testing indexes

**Evidence**:
- Migration file: supabase/migrations/20251021000001_add_performance_indexes.sql (45 lines)
- MCP: Pulled Prisma performance docs - learned composite index patterns
- Query improvement: decision_log query 342ms → 28ms (12x faster)
- EXPLAIN ANALYZE results: Index scan replacing Seq scan

**Blockers**: None
**Next**: Complete remaining indexes, document all improvements
```

---

## Definition of Done

**DATA-006**:
- [ ] Migration file with 5+ indexes created
- [ ] MCP Prisma docs pulled and logged
- [ ] Query performance improved (evidence with timings)
- [ ] Indexes don't conflict with RLS
- [ ] Ready for Manager to apply

**DATA-007**:
- [ ] Query performance report complete
- [ ] Top 5 slowest queries identified
- [ ] Optimization recommendations provided
- [ ] Shared with Engineer

**DATA-008**:
- [ ] Phase 7-13 schema spec complete
- [ ] All tables documented
- [ ] RLS policies planned
- [ ] ERD included

**DATA-009**:
- [ ] Backup restore tested successfully
- [ ] Recovery runbook documented
- [ ] RTO/RPO calculated
- [ ] Evidence logged

---

## Critical Reminders

**DO**:
- ✅ Pull MCP docs BEFORE creating migrations
- ✅ Test all indexes with EXPLAIN ANALYZE
- ✅ Verify RLS policies work with new indexes
- ✅ Document query performance improvements
- ✅ Get Manager approval before applying migrations

**DO NOT**:
- ❌ Add indexes without MCP evidence
- ❌ Skip RLS verification
- ❌ Apply migrations without Manager approval
- ❌ Delete or modify existing data
- ❌ Use `--accept-data-loss` flag

---

## Timeline

**Hours 1-2**: DATA-006 (Indexes) - START NOW  
**Hours 3-4**: DATA-007 (Query analysis)  
**Hours 5-7**: DATA-008 (Phase 7-13 planning)  
**Hours 8-9**: DATA-009 (Backup testing)

**Total**: 9 hours work

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md`  
**Task Assignments**: `feedback/manager/TASK_ASSIGNMENTS_2025-10-21.md`  
**Feedback**: `feedback/data/2025-10-21.md`  
**Schema**: `prisma/schema.prisma`

---

**START WITH**: DATA-006 (Index optimization) - Pull Prisma docs NOW

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
