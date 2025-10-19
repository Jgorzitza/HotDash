# DevOps - Staging → Production Deploy

> Deploy staging. Validate. Deploy production. Monitor. Zero downtime.

**Issue**: #108 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: .github/**, scripts/**, docs/runbooks/\*\*

## Constraints

- MCP Tools: `mcp_context7_get-library-docs` for React Router 7 deployment patterns (library: `/remix-run/react-router`)
- Framework: React Router 7 (NOT Remix) - build output is react-router, not remix
- CLI Tools: `fly`, `supabase`, `gh` (all authenticated)
- No MCP credential dependencies
- Zero downtime deployment
- Rollback tested before production
- All secrets in GitHub Secrets or Fly.io secrets

## Definition of Done

- [ ] CI: All checks green
- [ ] Staging: Deployed and validated
- [ ] Production: Deployed with health checks passing
- [ ] Monitoring: Active and alerting
- [ ] Rollback: Tested and documented
- [ ] Evidence: Deployment logs, health checks

## Production Molecules

### DEVOPS-001: CI Full Green Verification (20 min)

**Command**: `gh run list --limit 10`
**Check**: Latest run on main branch shows all checks passing
**Fix**: Any failing workflows
**Evidence**: CI dashboard screenshot, all green

### DEVOPS-002: Staging Deploy - Fly.io (45 min)

**App**: hotdash-staging
**Commands**:

```bash
fly apps list | grep staging
fly deploy --app hotdash-staging --config fly.staging.toml
fly status --app hotdash-staging
```

**Verify**: Health check responds
**Evidence**: Deployment log, `fly status` output

### DEVOPS-003: Staging Database - Supabase (40 min)

**Coordinate with Data agent**: Ensure migrations applied
**Commands**:

```bash
supabase db push --db-url $STAGING_DB_URL
```

**Verify**: All tables exist, RLS active
**Evidence**: Migration log, table list

### DEVOPS-004: Staging Validation - Smoke Tests (30 min)

**Run QA smoke tests against staging**:

```bash
STAGING_URL=https://staging.hotrodan.com npm run test:smoke
```

**Checks**:

- /health returns 200
- Dashboard loads
- Shopify Admin embedding works
  **Evidence**: Test output, all passing

### DEVOPS-005: Monitoring Setup - Fly.io Metrics (25 min)

**Configure**:

- Health checks every 30s
- CPU/Memory alerts
- Error rate monitoring
  **Command**: `fly checks list --app hotdash-staging`
  **Evidence**: Monitoring active, alerts configured

### DEVOPS-006: Production Deploy Plan Review (20 min)

**Review**: docs/runbooks/production_deploy.md
**Verify**:

- Pre-flight checklist complete
- Rollback procedure tested
- Database backup confirmed
- Communication plan ready
  **Evidence**: Checklist signed off

### DEVOPS-007: Production Database Migration (60 min)

**CRITICAL**: Coordinate with Data agent, backup first
**Commands**:

```bash
# Backup
supabase db dump --db-url $PRODUCTION_DB_URL > backup-$(date +%Y%m%d).sql

# Apply migrations
supabase db push --db-url $PRODUCTION_DB_URL

# Verify
psql $PRODUCTION_DB_URL -c "\dt"
```

**Evidence**: Backup file, migration log, verification

### DEVOPS-008: Production Deploy - Fly.io (45 min)

**App**: hotdash-app
**Commands**:

```bash
fly deploy --app hotdash-app --strategy rolling
fly status --app hotdash-app
```

**Verify**: Health checks passing, no downtime
**Evidence**: Deployment log, zero errors

### DEVOPS-009: Production Health Verification (15 min)

**Checks**:

```bash
curl https://app.hotrodan.com/health
curl https://app.hotrodan.com/api/ads/health
curl https://app.hotrodan.com/api/analytics/health
```

**Expected**: All 200 OK
**Evidence**: Health check responses

### DEVOPS-010: Feature Flags Verification - Production (20 min)

**Check**: All flags default to `false` in production
**Command**: Check Fly.io secrets

```bash
fly secrets list --app hotdash-app | grep FLAG
```

**Verify**: ANALYTICS_REAL_DATA=false, etc.
**Evidence**: Secrets list, all safe

### DEVOPS-011: Production Smoke Tests (30 min)

**Run**: docs/runbooks/production_smoke_tests.md
**Execute**:

1. Open Shopify Admin
2. Navigate to app
3. Verify dashboard loads
4. Check all tiles show data (mocked)
5. No console errors
   **Evidence**: Screenshot, video, all passing

### DEVOPS-012: Monitoring Active - First Hour (60 min)

**Monitor**:

- Error rate <0.1%
- Response time P95 <3s
- No crashes
- No database connection issues
  **Tool**: Fly.io metrics dashboard
  **Evidence**: Metrics screenshot, all healthy

### DEVOPS-013: Rollback Procedure Testing (30 min)

**Document**: docs/specs/rollback_procedures.md
**Test**: Rollback to previous version on staging
**Commands**:

```bash
fly releases --app hotdash-staging
fly releases rollback --app hotdash-staging
```

**Evidence**: Rollback successful, app still works

### DEVOPS-014: Post-Deploy Documentation (25 min)

**Update**:

- docs/runbooks/production_deploy.md (actual timings)
- reports/deploys/2025-10-19.md (deployment report)
  **Include**: What worked, what didn't, improvements
  **Evidence**: Documents updated

### DEVOPS-015: WORK COMPLETE Block (10 min)

**Update**: feedback/devops/2025-10-19.md
**Include**:

- Staging deployed and validated
- Production deployed successfully
- Monitoring active
- Rollback tested
- Next: 24-hour monitoring period

## Foreground Proof

1. CI green: Screenshot
2. Staging deployed: Fly.io status
3. Staging DB: Migration log
4. Staging smoke tests: Pass output
5. Monitoring: Screenshot
6. Production plan: Signed checklist
7. Production DB backup: File path
8. Production deploy: Fly.io log
9. Health checks: All 200 responses
10. Feature flags: All false
11. Production smoke: Video
12. Metrics (1 hour): Dashboard screenshot
13. Rollback test: Success log
14. Docs updated: Commit SHA
15. WORK COMPLETE: Feedback entry

## Deployment Commands Cheat Sheet

```bash
# Staging
fly deploy --app hotdash-staging --config fly.staging.toml

# Production
fly deploy --app hotdash-app --strategy rolling

# Health check
curl https://app.hotrodan.com/health

# View logs
fly logs --app hotdash-app

# Rollback
fly releases rollback --app hotdash-app

# Database migration
supabase db push --db-url $PRODUCTION_DB_URL

# Secrets management
fly secrets set KEY=value --app hotdash-app
fly secrets list --app hotdash-app
```

## Rollback

If production deploy fails:

1. Immediate: `fly releases rollback --app hotdash-app`
2. Database: Restore from backup
3. Notify: Manager + CEO
4. Post-mortem: Document failure in reports/incidents/

**TOTAL ESTIMATE**: ~7 hours
**SUCCESS**: Production live, monitoring active, rollback tested, zero incidents
