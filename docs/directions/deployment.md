---
epoch: 2025.10.E1
doc: docs/directions/deployment.md
owner: manager
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-10-20
---
# Deployment — Direction (Operator Control Center)

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- Credential Map: docs/ops/credential_index.md
- Manager Feedback: feedback/manager.md (check for latest assignments)

## 🎉 P0 COMPLETE: Shopify App Monitoring (2025-10-13)

**Status**: ✅ 10+ HOURS CONTINUOUS MONITORING COMPLETE
- All services healthy
- Zero outages detected
- Performance excellent
- CEO using app successfully

---

## 🚨 P1 ONGOING: Monitor New Deployments (2025-10-13)

**Status**: STANDBY - Monitor as new features deploy
**Timeline**: Continuous monitoring

### Task D1: Database Migration Monitoring (ACTIVE SOON)

**Trigger**: Data agent applies picker payment schema (est. 2025-10-14T02:00:00Z)

**When Migration Starts**:
1. Monitor Supabase for migration errors
2. Check RLS policy application
3. Verify table creation
4. Watch for performance impacts
5. Alert if any failures

**MCP Tools**:
- ✅ Supabase MCP: mcp_supabase_list_tables (verify success)
- ✅ Supabase MCP: mcp_supabase_get_advisors (check performance/security)

**Commands**:
```bash
# Monitor Supabase after migration
# Use Supabase MCP to verify:
# - picker_earnings table exists
# - picker_payments table exists  
# - picker_balances view exists
# - RLS enabled on all tables
```

**Timeline**: Monitor during migration + 1 hour after
**Evidence**: Migration logs, health verification

---

### Task D2: Chatwoot Configuration Monitoring (STANDBY)

**Trigger**: Chatwoot agent configures email (est. 2025-10-14T20:00:00Z)

**Monitor For**:
- No code deployments expected (config only)
- Chatwoot app health unchanged
- Email test flows (monitor logs)
- Widget performance (if added to storefront)

**MCP Tools**:
- ✅ Fly MCP: mcp_fly_fly-status (Chatwoot app health)
- ✅ Fly MCP: mcp_fly_fly-logs (error monitoring)

**Commands**:
```bash
# Monitor Chatwoot health
# mcp_fly_fly-status(app: "chatwoot-staging")
# mcp_fly_fly-logs(app: "chatwoot-staging")
# Check for SMTP/IMAP errors
```

**Timeline**: Spot checks during Chatwoot config
**Evidence**: Health logs

---

### Task D3: Engineer Feature Deployments (STANDBY)

**Trigger**: Engineer deploys new features (various timelines)

**Features to Monitor**:
1. Live chat widget (after Chatwoot) - Frontend only
2. SEO Pulse refinement - App deployment
3. Picker payment UI - App deployment + DB queries

**For Each Deployment**:
1. Monitor app health during deploy
2. Check for errors in logs
3. Verify health checks pass
4. Monitor response times
5. Alert if degradation

**MCP Tools**:
- ✅ Fly MCP: mcp_fly_fly-status (app status)
- ✅ Fly MCP: mcp_fly_fly-logs (error tracking)

**Example Monitoring**:
```bash
# Before deployment - baseline
# mcp_fly_fly-status(app: "hotdash-staging")
# Note current version

# During deployment - watch for issues
# mcp_fly_fly-logs(app: "hotdash-staging")
# Watch for startup errors

# After deployment - verify health
# mcp_fly_fly-status(app: "hotdash-staging")
# Verify new version running, health passing
```

**Timeline**: Per deployment (1 hour each)
**Evidence**: Deployment logs, health verification

---

## Current Monitoring Status

**Active Services** (continuous):
- hotdash-staging.fly.dev ✅
- hotdash-agent-service.fly.dev ✅
- hotdash-llamaindex-mcp.fly.dev ✅
- Chatwoot (on Fly) ✅
- Supabase ✅

**Upcoming Work** ⏳:
- D1: Database migrations (monitor ~tomorrow 2 AM)
- D2: Chatwoot config (spot check ~tomorrow 8 PM)
- D3: Feature deployments (3 over next 5 days)

---

## MCP Tools Requirements

**MANDATORY for all monitoring**:
- ✅ Fly MCP: mcp_fly_fly-status (health checks)
- ✅ Fly MCP: mcp_fly_fly-logs (error detection)
- ✅ Supabase MCP: mcp_supabase_list_tables (migration verification)
- ✅ Supabase MCP: mcp_supabase_get_advisors (post-migration health)

## Health Check Procedures

**Standard Checks** (run every 4 hours or when alerted):
```bash
# 1. All Fly apps
# mcp_fly_fly-status(app: "hotdash-staging")
# mcp_fly_fly-status(app: "hotdash-agent-service")  
# mcp_fly_fly-status(app: "hotdash-llamaindex-mcp")

# 2. Check for errors
# mcp_fly_fly-logs(app: "hotdash-staging")
# Look for: 500 errors, crashes, OOM

# 3. Response time spot check
curl -w "%{time_total}\n" https://hotdash-staging.fly.dev/health

# Target: <2s for health endpoint
```

**Escalation Threshold**:
- Any 500 errors: Immediate alert to Engineer
- Health check failures: Alert within 5 minutes
- Response time >5s: Alert within 15 minutes
- Service down: IMMEDIATE alert

---

## Evidence Gate

Log in feedback/deployment.md:
- Timestamp (YYYY-MM-DDTHH:MM:SSZ)
- Service monitored
- Health status
- Any issues detected
- Actions taken

## Coordination

- **Data**: Alerts before migrations
- **Engineer**: Alerts before deployments
- **Chatwoot**: Alerts when config changes made
- **Manager**: Monitors deployment schedule in standups


---

## 🚨 UPDATED PRIORITY (2025-10-13T23:33:00Z) — Manager Assignment

**Status**: Monitoring ongoing ✅  
**New Assignment**: Deployment Automation & Infrastructure Optimization

### P0: Deployment Automation (3-4 hours)

**Goal**: Automated deployment pipeline

**Tasks**:
1. **CI/CD Pipeline**
   - GitHub Actions for automated deploys
   - Automated testing before deploy
   - Automated rollback on failure
   - Deploy notifications

2. **Environment Management**
   - Staging environment setup
   - Production environment hardening
   - Environment parity verification

3. **Deployment Scripts**
   - One-command deploys
   - Health check automation
   - Smoke test automation

**Evidence**: CI/CD configuration, deployment scripts, test results

### P1: Infrastructure Monitoring (2-3 hours)

**Goal**: Comprehensive infrastructure visibility

**Tasks**:
1. Set up Fly.io metrics dashboard
2. Configure resource alerts
3. Monitor cost optimization opportunities
4. Document infrastructure runbooks

**Evidence**: Monitoring dashboard, alert rules

### P2: Disaster Recovery Planning (2 hours)

**Goal**: Prepare for worst-case scenarios

**Tasks**:
1. Backup procedures
2. Restore procedures
3. Failover testing
4. Incident response plan

**Evidence**: DR plan documentation

**Timeline**: Start with P0, report progress every 2 hours to feedback/deployment.md

---
