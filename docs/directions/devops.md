# DevOps Direction v5.3

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T04:50Z  
**Version**: 5.3  
**Status**: ACTIVE — **P0 DEPLOY v73 NOW** (fix applied)

---

## 🚨 P0 CRITICAL - DEPLOY v73 NOW (15 min)

### DEVOPS-001: Deploy v73 with Search Console Fix - **URGENT**

**Context**: Manager fixed SEO import error (commit 2b3513a). v72 was crashing, v73 should work.

**Requirements**:
- Pull latest code with fix
- Deploy v73 to staging
- Verify app starts successfully (not crashing)
- Test grading UI loads

**Commands**:
```bash
cd ~/HotDash/hot-dash
git pull origin manager-reopen-20251020  # Gets commit 2b3513a with fix
fly deploy --app hotdash-staging --remote-only
# Wait for deployment
fly logs --app hotdash-staging  # Should NOT see SyntaxError anymore
curl https://hotdash-staging.fly.dev/health  # Should return 200
```

**MCP Required**: Use Fly MCP tools

```bash
mcp_fly_fly-apps-releases("hotdash-staging")  # Verify v73 deployed
mcp_fly_fly-status("hotdash-staging")  # Should show state: started
mcp_fly_fly-logs("hotdash-staging")  # Should show app running, no crashes
```

**Verification**:
- [ ] v73 deployed successfully
- [ ] Machine state: started (not stopped/crashed)
- [ ] No SyntaxError in logs
- [ ] Health endpoint returns 200
- [ ] /approvals page loads
- [ ] CX modal opens with grading sliders

**Deliverables**:
- v73 deployed and stable
- Health checks passing
- Evidence logged with MCP tool calls
- Unblocks AI-Customer and Designer

**Time**: 15 minutes

**PRIORITY**: P0 - DO THIS IMMEDIATELY

---

## AFTER v73 DEPLOYMENT SUCCESS

### DEVOPS-002: Staging Deployment Automation (3h)

**Requirements**:
- Auto-deploy to staging on merge to manager-reopen-*
- Run health checks post-deployment
- Rollback on health check failure

**Implementation**:

**File**: `.github/workflows/deploy-staging.yml` (update existing)
```yaml
name: Deploy to Staging
on:
  push:
    branches: [manager-reopen-*]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --app hotdash-staging --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
      - run: curl https://hotdash-staging.fly.dev/health
      - run: flyctl logs --app hotdash-staging -n 20
```

**MCP Required**: Use Fly MCP tools for deployment testing

**Time**: 3 hours

---

### DEVOPS-003: Performance Monitoring Setup (2h)

**Requirements**:
- Track P95 tile load times
- Alert if tiles >5s
- Dashboard for metrics

**Time**: 2 hours

---

### DEVOPS-004: Database Migration Pipeline (2h)

**Requirements**:
- Automated migration testing in CI
- Dry-run migrations before production

**Time**: 2 hours

---

### DEVOPS-005: Rollback Procedures Documentation (2h)

**Requirements**:
- Document rollback for each deployment type
- Test rollback procedures
- Create runbook

**File**: `docs/runbooks/deployment-rollback.md` (you already created this ✅)

**Time**: 2 hours

---

## Work Protocol

**MCP Tools**: Fly MCP for ALL operations

**Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — DevOps: v73 Deployment

**Working On**: DEVOPS-001 (Deploy v73 with fix)
**Progress**: 100% - Deployed successfully, app running

**Evidence**:
- Commit pulled: 2b3513a (Search Console import fix)
- MCP Fly: fly-apps-releases → v73 deployed
- MCP Fly: fly-status → state: started, healthy
- MCP Fly: fly-logs → No SyntaxError, app running normally
- Health check: curl /health → 200 OK
- Grading UI: Verified on /approvals → sliders present

**Blockers**: None (P0 RESOLVED)
**Next**: DEVOPS-002 (auto-deploy automation)
```

---

## Critical Reminders

**DO**:
- ✅ Pull latest code FIRST (has Manager's fix)
- ✅ Use Fly MCP tools (not just flyctl)
- ✅ Verify app actually starts (not just deploys)
- ✅ Test /approvals page after deployment
- ✅ Notify AI-Customer and Designer when stable

**DO NOT**:
- ❌ Deploy without pulling latest code
- ❌ Skip verification steps
- ❌ Move to DEVOPS-002 before v73 stable

---

**START WITH**: DEVOPS-001 (Deploy v73) - Pull code, deploy NOW

**P0 BLOCKER FIX READY - DEPLOY IMMEDIATELY**
