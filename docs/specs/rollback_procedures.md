# Rollback Procedures by Module

**Version**: 1.0
**Owner**: Manager + DevOps
**Last Updated**: 2025-10-19

## Quick Reference

| Module       | Rollback Time | Method                | Data Loss Risk         |
| ------------ | ------------- | --------------------- | ---------------------- |
| Frontend     | <5 min        | Redeploy previous     | None                   |
| Database     | <15 min       | Restore backup        | Depends on backup age  |
| Analytics    | <2 min        | Feature flag          | None (recomputes)      |
| Approvals    | <5 min        | Feature flag + revert | Pending approvals only |
| Integrations | <2 min        | Feature flags         | None (retries)         |

---

## Frontend Rollback

**Trigger**: UI broken, critical bug, performance issue

**Steps**:

1. Identify last known good deployment
2. Redeploy that version
3. Verify health endpoints
4. Test critical flows
5. Monitor for 30 minutes

**Command**:

```bash
# Redeploy previous version (platform-specific)
git checkout <previous-tag>
npm run build
# Deploy via CI/CD or manual
```

**Time**: <5 minutes
**Verification**: Dashboard loads, all tiles functional

---

## Database Rollback

**Trigger**: Migration failed, data corruption, performance degradation

**Steps**:

1. Stop application (prevent new writes)
2. Restore from latest backup (Supabase automated)
3. Verify data integrity
4. Restart application
5. Run smoke tests

**Command**:

```bash
# Via Supabase dashboard:
# Projects → Database → Backups → Restore
# Select timestamp before migration
```

**Time**: <15 minutes
**Data Loss**: Depends on backup age (Supabase: hourly backups)
**Verification**: Run RLS tests, data integrity queries

---

## Analytics Module Rollback

**Trigger**: Wrong metrics, GA4 errors, Shopify sync issues

**Steps**:

1. Disable real data: `ANALYTICS_REAL_DATA=false`
2. Clear cache
3. Restart application
4. Verify mocks working
5. Investigate issue

**Command**:

```bash
export ANALYTICS_REAL_DATA=false
# Restart app
```

**Time**: <2 minutes
**Data Loss**: None (metrics recompute)

---

## Approvals Module Rollback

**Trigger**: HITL flow broken, grading errors, action failures

**Steps**:

1. Disable actions: `APPROVALS_APPLY_ENABLED=false`
2. Mark pending approvals as "review_required"
3. Notify CEO of pending items
4. Fix issue
5. Re-enable

**Command**:

```bash
export APPROVALS_APPLY_ENABLED=false
# Update Supabase: UPDATE approvals SET status='review_required' WHERE status='pending'
```

**Time**: <5 minutes
**Data Loss**: Pending approvals need manual review

---

## Integrations Rollback

**Trigger**: Shopify errors, Chatwoot failures, Publer issues

**Steps (per integration)**:

1. Disable specific flag: `SHOPIFY_REAL_DATA=false`
2. Verify fallback to mocks
3. Clear integration queue
4. Fix issue
5. Re-enable

**Commands**:

```bash
export SHOPIFY_REAL_DATA=false
export CHATWOOT_LIVE=false
export PUBLER_LIVE=false
```

**Time**: <2 minutes per integration
**Data Loss**: None (retries when re-enabled)

---

## Full System Rollback

**Trigger**: Multiple failures, cascading errors, unknown root cause

**Steps**:

1. All feature flags → `false`
2. Redeploy previous version
3. Restore database if needed
4. Full system verification
5. Incident review

**Time**: <30 minutes
**Impact**: Full system downtime

---

**Emergency Command** (Copy-Paste Ready):

```bash
cd ~/HotDash/hot-dash
export ANALYTICS_REAL_DATA=false
export IDEA_POOL_LIVE=false
export SHOPIFY_REAL_DATA=false
export PUBLER_LIVE=false
export CHATWOOT_LIVE=false
export AI_CUSTOMER_DRAFT_ENABLED=false
# Restart application
# Verify: curl https://app.hotrodan.com/health
```

---

**Created**: 2025-10-19
**Status**: Ready for production rollback if needed
