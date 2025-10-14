---
epoch: 2025.10.E1
doc: docs/runbooks/infrastructure_operations.md
owner: deployment
created: 2025-10-14
last_updated: 2025-10-14T02:57:00Z
---

# Infrastructure Operations Runbook

## Purpose
Comprehensive operational procedures for managing HotDash infrastructure on Fly.io.

## Table of Contents
1. [Daily Operations](#daily-operations)
2. [Deployment Procedures](#deployment-procedures)
3. [Incident Response](#incident-response)
4. [Scaling Operations](#scaling-operations)
5. [Cost Management](#cost-management)
6. [Monitoring & Alerts](#monitoring--alerts)

---

## Daily Operations

### Morning Health Check
**Frequency**: Daily, 9 AM
**Duration**: 5 minutes

```bash
# Run comprehensive health check
bash scripts/monitoring/fly-metrics-dashboard.sh

# Review overnight alerts
fly logs --app hotdash-staging | grep -i error | tail -50

# Verify all services healthy
curl https://hotdash-staging.fly.dev/health
curl https://hotdash-agent-service.fly.dev/health
curl https://hotdash-llamaindex-mcp.fly.dev/health
```

### Weekly Cost Review
**Frequency**: Weekly, Friday
**Duration**: 15 minutes

```bash
# Generate cost optimization report
bash scripts/monitoring/cost-optimization-report.sh

# Review Fly.io dashboard
# https://fly.io/dashboard/personal/billing

# Check for unused resources
fly volumes list --app hotdash-staging
fly machines list --app hotdash-staging
```

---

## Deployment Procedures

### Standard Deployment (Staging)

**Prerequisites**:
- All tests passing
- Code review approved
- Branch merged to main

**Procedure**:
```bash
# 1. One-command deploy (recommended)
bash scripts/deploy/one-command-deploy.sh staging

# OR manual steps:
# 2. Verify environment parity
bash scripts/deploy/verify-environment-parity.sh

# 3. Run tests
npm run test:unit
npm run test:e2e

# 4. Deploy
bash scripts/deploy/staging-deploy.sh

# 5. Verify deployment
bash scripts/deploy/automated-smoke-test.sh staging
```

**Rollback** (if needed):
```bash
# GitHub Actions
# Go to: https://github.com/Jgorzitza/HotDash/actions/workflows/rollback-deployment.yml
# Click "Run workflow"
# Environment: staging
# Reason: [describe issue]

# OR manual
bash scripts/deploy/rollback-staging.sh
```

### Production Deployment

**Prerequisites**:
- Staging deployment successful
- Go-live checklist complete
- Manager approval obtained
- Reliability approval obtained
- Off-hours deployment window (if critical)

**Procedure**:
```bash
# 1. Create release tag
git tag -a v$(date +%Y.%m.%d)a -m "Production release $(date +%Y-%m-%d)"
git push origin v$(date +%Y.%m.%d)a

# 2. Trigger production deployment via GitHub Actions
# Go to: https://github.com/Jgorzitza/HotDash/actions/workflows/deploy-production.yml
# Provide:
#   - Release tag: v2025.10.14a
#   - Checklist URL: [link to completed checklist]
#   - Reason: [deployment reason]
#   - Manager approver: [name]
#   - Reliability approver: [name]

# 3. Monitor deployment
fly logs --app hotdash-production

# 4. Verify production
bash scripts/deploy/automated-smoke-test.sh production https://your-production-url.fly.dev
```

**Post-Deployment**:
- Monitor for 15 minutes
- Check error rates
- Verify critical user journeys
- Update status page
- Notify stakeholders

---

## Incident Response

### Severity Levels

**P0 - Critical** (Response: Immediate)
- Production down
- Data loss
- Security breach
- Revenue impact

**P1 - High** (Response: <30 min)
- Staging down
- Performance degradation
- Feature broken
- Integration failure

**P2 - Medium** (Response: <2 hours)
- Non-critical bug
- Monitoring alert
- Cost spike

### Incident Response Procedure

**1. Identify & Assess** (2 min)
```bash
# Check service status
fly status --app hotdash-production

# Check logs for errors
fly logs --app hotdash-production | grep -i error

# Check metrics
bash scripts/monitoring/fly-metrics-dashboard.sh
```

**2. Contain & Mitigate** (5-10 min)
```bash
# If deployment-related, immediate rollback
bash scripts/deploy/rollback-production.sh

# If traffic spike, scale up
fly scale count 3 --app hotdash-production

# If memory leak, restart
fly apps restart hotdash-production
```

**3. Communicate** (5 min)
- Update status page
- Notify stakeholders
- Create incident Slack thread
- Log in feedback/deployment.md

**4. Investigate Root Cause** (Post-incident)
- Review logs
- Analyze metrics
- Document findings
- Create post-mortem

---

## Scaling Operations

### Vertical Scaling (VM Size)

**Check current size**:
```bash
fly status --app hotdash-staging
```

**Scale up** (more CPU/memory):
```bash
# Shared CPU options: shared-cpu-1x, shared-cpu-2x, shared-cpu-4x, shared-cpu-8x
fly scale vm shared-cpu-2x --app hotdash-staging

# Dedicated CPU options: performance-1x, performance-2x, performance-4x, performance-8x
fly scale vm performance-1x --app hotdash-production
```

**Scale down**:
```bash
fly scale vm shared-cpu-1x --app hotdash-staging
```

### Horizontal Scaling (Machine Count)

**Scale up** (more machines):
```bash
fly scale count 3 --app hotdash-production
```

**Scale down**:
```bash
fly scale count 1 --app hotdash-staging
```

**Auto-scaling** (recommended for background services):
```bash
# Set min/max machines
fly autoscale set min=0 max=3 --app hotdash-agent-service

# Enable auto-stop (stops when idle)
fly scale count 1 --max-per-region 1 --app hotdash-llamaindex-mcp
```

---

## Cost Management

### Enable Auto-Stop (Background Services)

**Agent Service**:
```bash
fly scale count 1 --max-per-region 1 --app hotdash-agent-service
fly autoscale set min=0 max=1 --app hotdash-agent-service
```

**LlamaIndex MCP**:
```bash
fly scale count 1 --max-per-region 1 --app hotdash-llamaindex-mcp
fly autoscale set min=0 max=1 --app hotdash-llamaindex-mcp
```

### Volume Management

**List volumes**:
```bash
fly volumes list --app hotdash-staging
```

**Delete unused volume**:
```bash
fly volumes delete <volume-id> --app hotdash-staging
```

**Extend volume** (if needed):
```bash
fly volumes extend <volume-id> --size 10 --app hotdash-staging
```

### Cost Monitoring

**Monthly Report**:
```bash
bash scripts/monitoring/cost-optimization-report.sh
```

**Review Billing**:
- https://fly.io/dashboard/personal/billing
- https://supabase.com/dashboard/project/_/settings/billing

---

## Monitoring & Alerts

### Manual Health Checks

**All apps**:
```bash
bash scripts/monitoring/fly-metrics-dashboard.sh
```

**Single app**:
```bash
fly status --app hotdash-staging
fly logs --app hotdash-staging
```

**Database**:
```bash
# Supabase health
curl https://your-project.supabase.co/rest/v1/

# Check RLS policies
# Visit: https://supabase.com/dashboard/project/_/auth/policies
```

### Automated Monitoring

**GitHub Actions** (runs every 15 min):
- `.github/workflows/infrastructure-monitoring.yml`
- Creates alerts on failures
- Uploads metrics artifacts

**Alert Configuration**:
```bash
bash scripts/monitoring/configure-alerts.sh
```

### Alert Response

**CPU High** (>80%):
1. Check logs for errors
2. Review traffic patterns
3. Scale up if sustained
4. Investigate performance issues

**Memory High** (>85%):
1. Check for memory leaks
2. Review connection pooling
3. Restart if necessary
4. Scale up if sustained

**Response Time Slow** (>2s):
1. Check database query performance
2. Review N+1 queries
3. Check external API latency
4. Consider caching

**Health Check Failure**:
1. Immediate investigation
2. Check application logs
3. Verify dependencies (Supabase, Shopify)
4. Rollback if deployment-related

---

## Quick Reference

### Essential Commands

```bash
# Status check
fly status --app <app>

# Logs (last 100 lines)
fly logs --app <app>

# SSH into machine
fly ssh console --app <app>

# Restart app
fly apps restart <app>

# Scale machines
fly scale count <N> --app <app>

# List all apps
fly apps list

# Deploy
bash scripts/deploy/one-command-deploy.sh {staging|production}

# Rollback
bash scripts/deploy/rollback-{staging|production}.sh

# Health check
bash scripts/monitoring/fly-metrics-dashboard.sh

# Cost report
bash scripts/monitoring/cost-optimization-report.sh
```

### Important URLs

- **Fly.io Dashboard**: https://fly.io/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Actions**: https://github.com/Jgorzitza/HotDash/actions
- **Staging App**: https://hotdash-staging.fly.dev
- **Agent Service**: https://hotdash-agent-service.fly.dev
- **LlamaIndex MCP**: https://hotdash-llamaindex-mcp.fly.dev
- **Chatwoot**: https://hotdash-chatwoot.fly.dev

---

**Last Updated**: 2025-10-14T02:57:00Z  
**Next Review**: 2025-11-14  
**Owner**: Deployment Agent

