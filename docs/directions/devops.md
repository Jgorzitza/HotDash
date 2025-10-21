# DevOps Direction v5.2

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T04:00Z  
**Version**: 5.2  
**Status**: ACTIVE — CI/CD Enhancements + Monitoring

---

## Objective

**Improve deployment automation, monitoring, and rollback procedures**

---

## MANDATORY MCP USAGE

```bash
# Fly.io deployment patterns
# Use mcp_fly MCP tools for all Fly operations

# GitHub Actions workflow patterns
mcp_context7_resolve-library-id("GitHub Actions")
mcp_context7_get-library-docs("/actions/actions", "workflow deployment")
```

---

## ACTIVE TASKS (9h total)

### DEVOPS-002: Staging Deployment Automation (3h) - START NOW

**Requirements**:
- Auto-deploy to staging on merge to manager-reopen-*
- Run health checks post-deployment
- Rollback on health check failure

**Implementation**:

**File**: `.github/workflows/deploy-staging.yml` (new)
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
      - run: curl https://hotdash-staging.fly.dev/health
      - run: flyctl logs --app hotdash-staging -n 20
```

**MCP Required**: Use Fly MCP tools for deployment testing

**Deliverables**:
- GitHub Actions workflow file
- Health check validation
- Rollback procedure documented
- Test deployment logged

**Time**: 3 hours

---

### DEVOPS-003: Performance Monitoring Setup (2h)

**Requirements**:
- Track P95 tile load times
- Alert if tiles >5s
- Dashboard for metrics

**Implementation**:
- Set up Fly.io metrics export
- Configure alerts (email or Slack)
- Create monitoring dashboard

**MCP Required**: Use Fly MCP tools for metrics setup

**Time**: 2 hours

---

### DEVOPS-004: Database Migration Pipeline (2h)

**Requirements**:
- Automated migration testing in CI
- Dry-run migrations before production
- Rollback migration generator

**Time**: 2 hours

---

### DEVOPS-005: Rollback Procedures Documentation (2h)

**Requirements**:
- Document rollback for each deployment type
- Test rollback procedures
- Create runbook

**File**: `docs/runbooks/deployment-rollback.md` (new)

**Time**: 2 hours

---

## Work Protocol

**MCP Tools**: Fly MCP for all operations

**Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — DevOps: Deployment Automation

**Working On**: DEVOPS-002 (staging auto-deploy)
**Progress**: 70% - Workflow created, testing deployment

**Evidence**:
- File: .github/workflows/deploy-staging.yml (42 lines)
- MCP Fly: Used fly-apps-releases to verify deployment
- Test deploy: Success, health check passed
- Rollback tested: Successful revert to v70

**Blockers**: None
**Next**: Add health check alerts, complete documentation
```

---

**START WITH**: DEVOPS-002 (Auto-deploy) - Use Fly MCP tools

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
