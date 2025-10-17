# Agent SDK Production Deployment Runbook

**Created**: 2025-10-11  
**Owner**: Reliability + Deployment Teams  
**Status**: Pre-production (staging first)  
**Last Updated**: 2025-10-11T20:38:00Z

## Overview

This runbook covers the deployment process for HotDash Agent SDK services to production, including pre-flight checks, deployment steps, validation, and rollback procedures.

## Services Covered

1. **hotdash-llamaindex-mcp** - LlamaIndex MCP server for RAG
2. **hotdash-agent-service** - Agent service for approval queue management

## Pre-deployment Checklist

### Environment Verification

```bash
# Verify Fly.io authentication
~/.fly/bin/fly auth status

# Check current production apps
~/.fly/bin/fly apps list | grep hotdash

# Verify secrets are ready
# (Do not run in production without confirming with manager)
# ~/.fly/bin/fly secrets list -a hotdash-llamaindex-mcp-production
```

### Code Readiness

- [ ] All tests passing in CI/CD
- [ ] Engineer approval obtained
- [ ] Manager approval for production deployment
- [ ] Code reviewed and merged to main branch
- [ ] Version tagged (semantic versioning)
- [ ] Deployment notes prepared

### Infrastructure Readiness

- [ ] Monitoring runbook reviewed: `docs/runbooks/agent-sdk-monitoring.md`
- [ ] Incident response runbook reviewed: `docs/runbooks/agent-sdk-incident-response.md`
- [ ] Health check endpoints implemented
- [ ] Rollback procedure tested in staging
- [ ] Resource requirements documented

### Dependency Verification

- [ ] Supabase production accessible
- [ ] Required secrets available
- [ ] Network connectivity verified
- [ ] API rate limits confirmed

## Deployment Steps

### Phase 1: Staging Deployment (Required First)

```bash
# 1. Deploy to staging
cd ~/HotDash/hot-dash
git checkout main
git pull origin main

# 2. Verify fly.toml configuration
cat fly.staging.toml
# Confirm:
# - app name ends with -staging
# - auto_stop_machines = true
# - auto_start_machines = true
# - memory/CPU appropriate (start with 512MB, 1 vCPU)

# 3. Deploy to staging
~/.fly/bin/fly deploy -c fly.staging.toml

# 4. Wait for health checks
sleep 30

# 5. Verify deployment
~/.fly/bin/fly status -a hotdash-llamaindex-mcp-staging
~/.fly/bin/fly status -a hotdash-agent-service-staging

# 6. Test health endpoints
curl -sS "https://hotdash-llamaindex-mcp-staging.fly.dev/health"
curl -sS "https://hotdash-agent-service-staging.fly.dev/health"

# 7. Run smoke tests
scripts/ci/agent-sdk-smoke-test.sh staging

# 8. Monitor for 30 minutes minimum
# Check logs, latency, error rates
```

### Phase 2: Production Deployment (After Staging Validation)

**STOP**: Ensure staging has been stable for at least 30 minutes before proceeding.

```bash
# 1. Create deployment window notification
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] PRODUCTION DEPLOYMENT STARTED - Agent SDK" >> feedback/reliability.md

# 2. Verify production fly.toml
cat fly.production.toml
# Confirm:
# - app name is production (no -staging suffix)
# - min_machines_running configured appropriately
# - memory/CPU matches staging baseline
# - secrets reference production values

# 3. Deploy to production
~/.fly/bin/fly deploy -c fly.production.toml --strategy rolling

# 4. Monitor deployment progress
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp

# 5. Wait for health checks (2 minutes minimum)
sleep 120

# 6. Verify deployment
~/.fly/bin/fly status -a hotdash-llamaindex-mcp
~/.fly/bin/fly status -a hotdash-agent-service

# 7. Test health endpoints
curl -sS "https://hotdash-llamaindex-mcp.fly.dev/health"
curl -sS "https://hotdash-agent-service.fly.dev/health"

# 8. Run production smoke tests
scripts/ci/agent-sdk-smoke-test.sh production

# 9. Monitor critical metrics
# - Response time (should be < 500ms P95)
# - Error rate (should be < 1%)
# - Memory usage (should be stable)
# - Auto-scaling (verify working)
```

### Phase 3: Post-Deployment Validation (15 minutes minimum)

```bash
# 1. Monitor logs for errors
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp | grep -i error
~/.fly/bin/fly logs -a hotdash-agent-service | grep -i error

# 2. Test key user flows
# - MCP query execution
# - Approval queue processing
# - Auto-scaling behavior

# 3. Verify performance targets
# Run synthetic checks
SYNTHETIC_CHECK_URL="https://hotdash-llamaindex-mcp.fly.dev/health" \
SYNTHETIC_CHECK_BUDGET_MS=500 \
node scripts/ci/synthetic-check.mjs

# 4. Check resource utilization
~/.fly/bin/fly machine status <machine-id> -a hotdash-llamaindex-mcp
~/.fly/bin/fly machine status <machine-id> -a hotdash-agent-service

# 5. Document deployment success
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] PRODUCTION DEPLOYMENT COMPLETE - Agent SDK" >> feedback/reliability.md
echo "Version: <git-tag>" >> feedback/reliability.md
echo "Health: PASSING" >> feedback/reliability.md
echo "Latency: <P95-latency>ms" >> feedback/reliability.md
```

## Rollback Procedures

### When to Rollback

Execute rollback immediately if:

- Health checks failing for > 5 minutes
- Error rate > 5% for > 5 minutes
- P95 latency > 1000ms for > 10 minutes
- Any data corruption detected
- Critical security issue identified

### Rollback Steps (< 5 minutes)

```bash
# 1. Log rollback decision
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ROLLBACK INITIATED - Agent SDK" >> feedback/reliability.md
echo "Reason: <reason>" >> feedback/reliability.md

# 2. Get previous deployment version
~/.fly/bin/fly releases -a hotdash-llamaindex-mcp | head -5
# Note the previous stable version number

# 3. Rollback to previous version
~/.fly/bin/fly deploy --image <previous-image> -a hotdash-llamaindex-mcp
~/.fly/bin/fly deploy --image <previous-image> -a hotdash-agent-service

# OR if using Git tags:
git checkout <previous-stable-tag>
~/.fly/bin/fly deploy -c fly.production.toml

# 4. Verify rollback success
sleep 60
~/.fly/bin/fly status -a hotdash-llamaindex-mcp
curl -sS "https://hotdash-llamaindex-mcp.fly.dev/health"

# 5. Monitor for stability (10 minutes minimum)

# 6. Document rollback completion
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ROLLBACK COMPLETE - Agent SDK" >> feedback/reliability.md
echo "Rolled back to: <version>" >> feedback/reliability.md
echo "Status: <stable|investigating>" >> feedback/reliability.md

# 7. Create incident report
# See: docs/runbooks/agent-sdk-incident-response.md
```

### Alternative Rollback: Machine Restart

If rollback deployment fails, try machine restart:

```bash
# 1. List machines
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp

# 2. Restart problematic machines
~/.fly/bin/fly machine restart <machine-id> -a hotdash-llamaindex-mcp

# 3. Monitor restart
~/.fly/bin/fly machine status <machine-id> -a hotdash-llamaindex-mcp

# 4. Verify health after restart
curl -sS "https://hotdash-llamaindex-mcp.fly.dev/health"
```

### Emergency Rollback: Scale to Zero

If all else fails and service is causing issues:

```bash
# CAUTION: This takes the service offline
~/.fly/bin/fly scale count 0 -a hotdash-llamaindex-mcp

# Verify service is stopped
~/.fly/bin/fly status -a hotdash-llamaindex-mcp

# Document emergency action
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] EMERGENCY SCALE TO ZERO - Agent SDK" >> feedback/reliability.md
echo "Reason: <critical-issue>" >> feedback/reliability.md
echo "Action: Service taken offline, requires investigation" >> feedback/reliability.md

# Escalate immediately to manager + engineer
```

## Configuration Management

### Fly.toml Best Practices

```toml
# Example fly.toml for Agent SDK services

app = "hotdash-llamaindex-mcp"
primary_region = "ord"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[http_service.checks]
  interval = "15s"
  timeout = "10s"
  grace_period = "30s"
  method = "GET"
  path = "/health"

[vm]
  cpu_kind = "shared"
  cpus = 1
  memory = "512mb"  # Adjust based on monitoring

[[services.tcp_checks]]
  interval = "15s"
  timeout = "10s"
```

### Secret Management

**Required Secrets:**

- `DATABASE_URL` - Supabase connection string
- `OPENAI_API_KEY` - OpenAI API key
- Additional service-specific secrets as needed

**Setting Secrets:**

```bash
# Set via CLI (preferred for automation)
~/.fly/bin/fly secrets set DATABASE_URL="<value>" -a hotdash-llamaindex-mcp

# Or import from file
~/.fly/bin/fly secrets import -a hotdash-llamaindex-mcp < secrets.env

# Verify secrets are set (does not show values)
~/.fly/bin/fly secrets list -a hotdash-llamaindex-mcp
```

**Secret Rotation:**

- Schedule: Quarterly or on-demand for security events
- Process: Set new secret, deploy, verify, remove old secret
- Document rotation in `feedback/reliability.md`

## Resource Sizing Guidelines

### Initial Deployment (Conservative)

- **CPU**: 1 vCPU (shared)
- **Memory**: 512MB
- **Auto-scaling**: 0-2 machines
- **Rationale**: Start small, scale based on actual usage

### Scaling Triggers

Scale up CPU if:

- CPU usage consistently > 70%
- Request queue building up
- Response times degrading

Scale up Memory if:

- Memory usage > 70%
- OOM kills occurring
- Garbage collection frequent

Scale machine count if:

- Consistent traffic requiring > 1 machine
- Geographic distribution needed
- High availability required

### Scaling Commands

```bash
# Scale memory
~/.fly/bin/fly machine update <machine-id> --memory 1024 -a hotdash-llamaindex-mcp

# Scale CPUs
~/.fly/bin/fly machine update <machine-id> --cpus 2 -a hotdash-llamaindex-mcp

# Scale machine count (update fly.toml min_machines_running)
# Then redeploy
~/.fly/bin/fly deploy -c fly.production.toml
```

## Monitoring During Deployment

### Critical Metrics to Watch

1. **Health Check Status**
   - Should pass within 30 seconds of deployment
   - If failing > 2 minutes, investigate immediately

2. **Error Rate**
   - Baseline: < 1%
   - Warning: > 1%
   - Critical: > 5%

3. **Response Time**
   - Target: P95 < 500ms
   - Warning: P95 > 500ms
   - Critical: P95 > 1000ms

4. **Memory Usage**
   - Normal: < 70%
   - Warning: 70-85%
   - Critical: > 85%

5. **Auto-scaling**
   - Should stop within 5 minutes of idle
   - Should start within 10 seconds of request

### Monitoring Commands

```bash
# Real-time log monitoring (run in separate terminal)
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp

# Health check loop (run during deployment window)
while true; do
  echo "[$(date +%H:%M:%S)] Health check..."
  curl -sS -w "Status: %{http_code}, Time: %{time_total}s\n" \
    "https://hotdash-llamaindex-mcp.fly.dev/health"
  sleep 10
done

# Resource monitoring loop
while true; do
  echo "[$(date +%H:%M:%S)] Resource check..."
  ~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp
  sleep 30
done
```

## Communication Protocol

### Pre-Deployment

1. Notify team in Slack/chat: "Agent SDK production deployment starting in 15 minutes"
2. Confirm manager approval obtained
3. Verify engineer is available for support

### During Deployment

1. Post status updates every 5 minutes
2. Report any issues immediately
3. Maintain deployment log in `feedback/reliability.md`

### Post-Deployment

1. Announce completion: "Agent SDK production deployment complete, monitoring"
2. Share key metrics (latency, error rate, resource usage)
3. Document lessons learned

### Rollback Communication

1. **IMMEDIATE**: "Rolling back Agent SDK production deployment - <reason>"
2. Update every 2 minutes during rollback
3. Confirm when stable: "Rollback complete, system stable"

## Documentation Requirements

After every deployment, update:

1. **feedback/reliability.md**
   - Deployment timestamp
   - Version deployed
   - Key metrics observed
   - Any issues and resolutions

2. **This Runbook**
   - New learnings
   - Configuration changes
   - Resource sizing updates
   - Timeline adjustments

3. **Monitoring Runbook** (`agent-sdk-monitoring.md`)
   - New baseline metrics
   - Updated thresholds
   - New alert rules

## Deployment Schedule

### Recommended Windows

- **Staging**: Anytime during business hours
- **Production**: Tuesday-Thursday, 10am-2pm Central Time
- **Avoid**: Fridays, weekends, holidays, end of month

### Deployment Freeze Periods

- During active incidents
- Major company events
- Holiday periods
- End of quarter (last week)

## Success Criteria

A deployment is considered successful when:

- ✅ Health checks passing for 15 minutes
- ✅ Error rate < 1%
- ✅ P95 latency < 500ms
- ✅ Memory usage stable
- ✅ Auto-scaling working correctly
- ✅ No critical logs/errors
- ✅ Rollback tested in staging

## Escalation

### During Deployment Issues

1. **Reliability Team** (immediate): Execute rollback if needed
2. **Engineer** (within 5 minutes): Code-level support
3. **Manager** (within 15 minutes): Decision making for prolonged issues

### After Failed Deployment

1. Create incident report
2. Root cause analysis with engineer
3. Update runbooks with learnings
4. Schedule retry after fixes validated in staging

## References

- Monitoring Runbook: `docs/runbooks/agent-sdk-monitoring.md`
- Incident Response: `docs/runbooks/agent-sdk-incident-response.md`
- Fly.io Guide: `docs/dev/fly-shopify.md`
- Manager Direction: `docs/directions/reliability.md`
- Deployment Direction: `docs/directions/deployment.md`

## Changelog

| Date       | Change                            | Author            |
| ---------- | --------------------------------- | ----------------- |
| 2025-10-11 | Initial creation (pre-production) | Reliability Agent |

## Next Steps Before Production

1. ⏳ Complete staging deployment and validation
2. ⏳ Execute staging rollback test
3. ⏳ Obtain manager approval for production
4. ⏳ Schedule production deployment window
5. ⏳ Brief team on deployment plan
