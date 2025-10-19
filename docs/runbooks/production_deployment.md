# Production Deployment Runbook

**Version**: 1.0
**Last Updated**: 2025-10-19
**Owner**: Manager + DevOps

## Pre-Deployment Checklist

### Code Quality Gates

- [ ] Build: PASSING (`npm run build` exit code 0)
- [ ] Unit tests: 100% passing (`npm run test:unit`)
- [ ] Integration tests: 100% passing
- [ ] E2E tests: 100% passing (`npm run test:e2e`)
- [ ] Accessibility: <5 serious violations (`npm run test:a11y`)
- [ ] Lint: 0 errors, 0 warnings (`npm run lint`)
- [ ] Format: All files formatted (`npm run fmt`)
- [ ] Security: 0 secrets detected (`npm run scan`)

### Database Readiness

- [ ] Staging migrations: Applied successfully
- [ ] RLS tests: All passing
- [ ] Data integrity: Verified
- [ ] Production backup: Verified exists
- [ ] Migration dry-run: Completed on staging

### Infrastructure Readiness

- [ ] GitHub Actions: All workflows green
- [ ] Staging environment: Deployed and validated
- [ ] Health endpoints: All returning 200
- [ ] Monitoring: Configured and alerting
- [ ] Secrets: All in GitHub Secrets/Vault (none in code)

### Feature Completeness

- [ ] Dashboard: All 8 tiles functional
- [ ] Approvals: HITL flow working
- [ ] Idea Pool: 5 suggestions (1 wildcard)
- [ ] Analytics: Real data flowing
- [ ] Inventory: ROP calculations working
- [ ] CX: Chatwoot integrated
- [ ] Feature flags: All documented with defaults

### Documentation Completeness

- [ ] All runbooks: Updated
- [ ] All specs: Complete
- [ ] Rollback procedures: Documented
- [ ] Monitoring guides: Complete
- [ ] Troubleshooting guides: Ready

---

## Deployment Steps

### Phase 1: Final Validation (30 min)

1. Run full test suite: `npm run test:ci`
2. Run security scan: `npm run scan`
3. Verify staging health: `curl https://staging.hotrodan.com/health`
4. Review Product Go/No-Go report
5. CEO approval required

### Phase 2: Database Migration (60 min)

1. Verify production backup exists (Supabase automated)
2. Run migration: `supabase db push --db-url $PRODUCTION_DB_URL`
3. Verify migration success
4. Run smoke tests against production database
5. Monitor for errors (first 15 minutes)

### Phase 3: Application Deployment (45 min)

1. Build production bundle: `npm run build`
2. Deploy to production environment
3. Verify deployment success
4. Check health endpoints: `/health`, `/api/health`
5. Verify Shopify Admin embedding works

### Phase 4: Verification (30 min)

1. Run production smoke tests (automated)
2. Manual verification:
   - Dashboard loads <3s
   - All 8 tiles showing data
   - Approvals drawer opens
   - Create test approval
   - Verify HITL flow works
3. Monitor error rates (target <0.5%)
4. Check performance metrics

### Phase 5: Monitoring (30 min)

1. Verify all monitors active
2. Verify alerts delivering
3. Check initial metrics baseline
4. Document any anomalies
5. Set up on-call rotation

---

## Rollback Procedure

### If Issues Found Within First Hour

**Trigger Conditions**:

- Error rate >5%
- P95 latency >10s
- Critical feature broken
- Data integrity issues

**Rollback Steps**:

1. Revert application deployment (restore previous version)
2. If database migrated: Restore from backup (Supabase UI)
3. Verify rollback successful
4. Notify team + CEO
5. Document issues for post-mortem

**Rollback Time**: <15 minutes

### If Issues Found After First Hour

**Assess severity**:

- P0: Immediate rollback
- P1: Hotfix if <30 min, otherwise rollback
- P2: Schedule fix, monitor

---

## Post-Deployment

### First 24 Hours

- [ ] Monitor error rates every hour
- [ ] Check performance metrics every 2 hours
- [ ] Review user feedback (if any)
- [ ] Document any issues
- [ ] Prepare post-launch report

### First Week

- [ ] Daily metrics review
- [ ] Weekly retrospective
- [ ] Update runbooks with learnings
- [ ] Plan next features

---

## Emergency Contacts

- CEO: Justin
- Manager Agent: This system
- DevOps: See feedback/devops/
- On-call: TBD

---

**Status**: Ready for production deployment
**Last Rehearsal**: TBD (staging dry-run)
**Production Deploy Date**: TBD (CEO approval required)
