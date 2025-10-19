# DevOps Direction

- **Owner:** DevOps Agent
- **Effective:** 2025-10-19
- **Version:** 4.0

## Manager Update (2025-10-19 16:50 UTC)

**Lint Status**: DEFERRED to v1.1 (P2 technical debt). Not blocking production.

**Production Status**: App deployed to Fly.io (`https://hotdash-staging.fly.dev`), version hot-dash-22 live ✅

**Your Mission**: Production hardening, monitoring, rollback procedures, deployment automation.

---

## Objective

Current Issue: #108

Ship production-ready CI/CD pipeline, Fly.io deployment automation, monitoring, and rollback procedures for HotDash on Fly.io.

## Tasks (18 Molecules - Production Deployment)

### Phase 1: CI/CD Hardening (5 molecules)

1. **DEV-001: GitHub Actions Optimization** (35 min)
   - Enable parallel test execution
   - Add build caching (npm cache, build artifacts)
   - Optimize workflow runtime (<10 min target)
   - Evidence: `.github/workflows/*.yml` updated, CI runtime logs

2. **DEV-002: Deploy Preview Environments** (45 min)
   - PR preview deployments on Fly.io (fly-preview-pr-{number})
   - Auto-cleanup after PR merge
   - Comment PR with preview URL
   - Evidence: Preview deployment working, PR comment automation

3. **DEV-003: Secrets Management Audit** (30 min)
   - Verify all secrets in GitHub Environments (production, staging)
   - Document: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, DATABASE_URL, SUPABASE_SERVICE_KEY
   - Rotate any exposed secrets
   - Evidence: Secrets audit report

4. **DEV-004: Build Artifacts & Versioning** (35 min)
   - Upload build artifacts to GitHub Actions
   - Tag releases with semantic versioning
   - Store rollback artifacts (previous 3 versions)
   - Evidence: Artifacts in GitHub Actions, version tags

5. **DEV-005: CI Status Checks** (25 min)
   - Make required: lint, test, build, security scan
   - Branch protection rules for main
   - Evidence: Branch protection screenshot

### Phase 2: Fly.io Production (6 molecules)

6. **DEV-006: Production fly.toml Configuration** (40 min)
   - Create `fly.production.toml` with proper scaling
   - Configure: health checks, auto-scaling, regions
   - Evidence: `fly.production.toml` created

7. **DEV-007: Database Connection Hardening** (35 min)
   - Use Supabase session pooler for IPv4
   - Connection pooling limits
   - Retry logic for transient failures
   - Evidence: Connection config, retry tests passing

8. **DEV-008: Fly.io Health Checks** (30 min)
   - Configure `/health` endpoint monitoring
   - Set grace period, interval, timeout
   - Test failover behavior
   - Evidence: Health check config, test results

9. **DEV-009: Auto-Scaling Configuration** (35 min)
   - Set min/max instances (2-10 machines)
   - CPU/memory triggers
   - Scale-to-zero for staging
   - Evidence: Scaling config, load test results

10. **DEV-010: Deployment Pipeline** (50 min)
    - GitHub Actions → Fly.io automated deployment
    - Staging deploy on PR merge to main
    - Production deploy on release tag
    - Evidence: Deployment workflow, successful deploy logs

11. **DEV-011: Zero-Downtime Deployment** (40 min)
    - Blue-green deployment strategy on Fly.io
    - Health check verification before traffic switch
    - Evidence: Deployment logs showing zero downtime

### Phase 3: Monitoring & Observability (4 molecules)

12. **DEV-012: Prometheus Metrics Export** (35 min)
    - Export app metrics to Fly.io metrics
    - Track: request rate, error rate, response time, tile load time
    - Evidence: Metrics dashboard screenshot

13. **DEV-013: Structured Logging** (30 min)
    - Centralized logging to Supabase edge function
    - Log levels, structured JSON format
    - Evidence: Log aggregation working

14. **DEV-014: Error Tracking & Alerting** (35 min)
    - Error rate alerts (>1% triggers notification)
    - Console error tracking
    - Evidence: Alert configuration, test alert

15. **DEV-015: Uptime Monitoring** (25 min)
    - External uptime checks (UptimeRobot or similar)
    - Monitor: /health endpoint every 5 min
    - Evidence: Uptime monitor configured

### Phase 4: Rollback & DR (3 molecules)

16. **DEV-016: One-Command Rollback** (40 min)
    - Script: `scripts/ops/rollback.sh <version>`
    - Uses Fly.io releases to rollback
    - Test rollback procedure
    - Evidence: Rollback script, successful rollback test

17. **DEV-017: Database Backup Verification** (35 min)
    - Verify Supabase automated daily backups
    - Document restore procedure
    - Test restore to staging
    - Evidence: Backup verification, restore test logs

18. **DEV-018: WORK COMPLETE** (15 min)
    - Final feedback entry
    - Production deployment runbook
    - Evidence: Complete feedback, runbook in `docs/runbooks/production_deploy.md`

## Constraints

- **Allowed Tools:** `fly`, `gh`, `bash`, `npm`, `curl`, Fly.io CLI
- **MCP Tools:** `mcp_fly_*` functions for Fly.io management
- **Allowed Paths:** `.github/workflows/**`, `docs/runbooks/**`, `scripts/ops/**`, `fly.*.toml`, `feedback/devops/2025-10-19.md`
- **Budget:** ≤60 min per molecule

## Definition of Done

- [ ] All 18 molecules executed with evidence
- [ ] CI/CD pipeline optimized (<10 min runtime)
- [ ] Fly.io production deployment automated
- [ ] Monitoring and alerting configured
- [ ] Rollback procedures tested
- [ ] Production deployment runbook complete
- [ ] Feedback entry complete

## Contract Test

- **Production Health:** `curl https://hotdash-staging.fly.dev/health` (200 OK after next deploy)
- **Deployment:** `fly status --app hot-dash` shows healthy machines
- **Evidence:** Successful deployment logs, health checks passing

## Risk & Rollback

- **Risk Level:** MEDIUM (deployment automation errors could cause downtime)
- **Rollback Plan:** Use `fly releases rollback` to revert to previous version
- **Monitoring:** Fly.io metrics, uptime checks, error rate alerts

## Links & References

- Production App: https://hotdash-staging.fly.dev
- Fly.io Dashboard: https://fly.io/apps/hot-dash (or similar)
- Feedback: `feedback/devops/2025-10-19.md`
- North Star: `docs/NORTH_STAR.md`

## Change Log

- 2025-10-19: Version 4.0 – Production deployment focus, lint deferred to v1.1
- 2025-10-19: Version 3.0 – Lint blocker clarified (assigned to Engineer)
- 2025-10-17: Version 2.0 – Production launch alignment
