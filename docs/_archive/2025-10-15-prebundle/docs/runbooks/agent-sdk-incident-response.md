# Agent SDK Incident Response Runbook

**Created**: 2025-10-11  
**Owner**: Reliability Team  
**Status**: Ready for use  
**Last Updated**: 2025-10-11T20:39:00Z

## Overview

This runbook provides step-by-step procedures for responding to incidents affecting HotDash Agent SDK services (LlamaIndex MCP and Agent Service).

## Incident Severity Levels

### SEV-1: Critical (Immediate Response)

- **Definition**: Complete service outage or data loss risk
- **Examples**:
  - All machines down
  - Error rate > 50%
  - Data corruption detected
  - Security breach suspected
- **Response Time**: Immediate (< 5 minutes)
- **Escalation**: Manager + Engineer immediately

### SEV-2: Major (Urgent Response)

- **Definition**: Significant service degradation
- **Examples**:
  - Partial outage (some machines down)
  - Error rate 10-50%
  - P95 latency > 2000ms
  - Multiple OOM kills
- **Response Time**: < 15 minutes
- **Escalation**: Engineer within 15 minutes

### SEV-3: Minor (Standard Response)

- **Definition**: Service impaired but functional
- **Examples**:
  - Error rate 5-10%
  - P95 latency 1000-2000ms
  - Single OOM kill
  - Auto-scaling issues
- **Response Time**: < 30 minutes
- **Escalation**: Document and monitor

## Incident Response Process

### Phase 1: Detection and Assessment (< 5 minutes)

```bash
# 1. Verify incident is real (not false alarm)
~/.fly/bin/fly status -a hotdash-llamaindex-mcp
~/.fly/bin/fly status -a hotdash-agent-service

# 2. Check health endpoints
curl -sS -w "\nStatus: %{http_code}, Time: %{time_total}s\n" \
  "https://hotdash-llamaindex-mcp.fly.dev/health"
curl -sS -w "\nStatus: %{http_code}, Time: %{time_total}s\n" \
  "https://hotdash-agent-service.fly.dev/health"

# 3. Review recent logs
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp | tail -100
~/.fly/bin/fly logs -a hotdash-agent-service | tail -100

# 4. Check machine status
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp
~/.fly/bin/fly machine list -a hotdash-agent-service

# 5. Determine severity level (SEV-1, SEV-2, or SEV-3)
```

### Phase 2: Immediate Mitigation (< 10 minutes)

#### For SEV-1 (Critical)

```bash
# OPTION A: Execute rollback immediately
# See: docs/runbooks/agent-sdk-production-deployment.md#rollback-procedures

# OPTION B: Restart machines
~/.fly/bin/fly machine restart <machine-id> -a hotdash-llamaindex-mcp

# OPTION C: Scale to zero if causing cascading failures
~/.fly/bin/fly scale count 0 -a hotdash-llamaindex-mcp
# WARNING: This takes service offline - use as last resort

# Log action taken
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] SEV-1 INCIDENT - Agent SDK" >> feedback/reliability.md
echo "Severity: SEV-1 (Critical)" >> feedback/reliability.md
echo "Impact: <description>" >> feedback/reliability.md
echo "Action Taken: <rollback|restart|scale-to-zero>" >> feedback/reliability.md
```

#### For SEV-2 (Major)

```bash
# 1. Identify affected machines
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp

# 2. Restart problematic machines
~/.fly/bin/fly machine restart <machine-id> -a hotdash-llamaindex-mcp

# 3. Monitor recovery
sleep 30
~/.fly/bin/fly machine status <machine-id> -a hotdash-llamaindex-mcp

# 4. Check if issue resolved
curl -sS "https://hotdash-llamaindex-mcp.fly.dev/health"

# 5. If not resolved, escalate to SEV-1 procedures
```

#### For SEV-3 (Minor)

```bash
# 1. Document the issue
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] SEV-3 INCIDENT - Agent SDK" >> feedback/reliability.md

# 2. Monitor for escalation (30 minutes)
# If issue persists or worsens, escalate to SEV-2

# 3. Investigate root cause while service continues
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp > artifacts/reliability/incident-$(date +%Y%m%d-%H%M%S).log
```

### Phase 3: Investigation (Parallel with Mitigation)

```bash
# 1. Capture diagnostic information
mkdir -p artifacts/reliability/incident-$(date +%Y%m%d-%H%M%S)
cd artifacts/reliability/incident-$(date +%Y%m%d-%H%M%S)

# 2. Save app status
~/.fly/bin/fly status -a hotdash-llamaindex-mcp > app-status.txt
~/.fly/bin/fly status -a hotdash-agent-service >> app-status.txt

# 3. Save machine details
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp > machines.txt
for machine in $(~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp -j | jq -r '.[].id'); do
  ~/.fly/bin/fly machine status "$machine" -a hotdash-llamaindex-mcp >> machines-detail.txt
done

# 4. Save recent logs
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp > logs-llamaindex.txt &
~/.fly/bin/fly logs -a hotdash-agent-service > logs-agent-service.txt &

# 5. Check resource utilization
# Look for: OOM kills, CPU throttling, disk space issues

# 6. Review recent deployments
~/.fly/bin/fly releases -a hotdash-llamaindex-mcp | head -10 > releases.txt

# 7. Check dependencies
# - Supabase connectivity
# - OpenAI API status
# - Network issues

echo "Diagnostic information saved to: $(pwd)"
cd ~/HotDash/hot-dash
```

### Phase 4: Communication

#### SEV-1 Communication (Immediate)

```
SUBJECT: [SEV-1] Agent SDK Production Outage

STATUS: <Investigating|Mitigating|Resolved>
START TIME: <timestamp>
IMPACT: <description of user impact>
AFFECTED: Agent SDK services (LlamaIndex MCP, Agent Service)
ACTION: <rollback initiated|restart in progress|investigating>
ETA: <estimated resolution time>
UPDATES: Every 15 minutes

Contact: Reliability Team
Incident ID: INC-<yyyymmdd-hhmmss>
```

#### SEV-2 Communication (Within 15 min)

```
SUBJECT: [SEV-2] Agent SDK Degraded Performance

STATUS: <Investigating|Mitigating|Monitoring>
START TIME: <timestamp>
IMPACT: <description>
AFFECTED: <specific services/features>
ACTION: <current mitigation steps>
ETA: <estimated resolution time>
UPDATES: Every 30 minutes
```

#### SEV-3 Communication (Within 30 min)

```
SUBJECT: [SEV-3] Agent SDK Minor Issue

STATUS: <Investigating|Monitoring>
START TIME: <timestamp>
IMPACT: <minimal impact description>
ACTION: <investigation ongoing|fix scheduled>
ETA: <resolution time>
```

### Phase 5: Resolution Verification (After Mitigation)

```bash
# 1. Wait for stabilization (minimum 10 minutes)
sleep 600

# 2. Verify health checks
for i in {1..5}; do
  echo "Health check $i/5..."
  curl -sS -w "\nStatus: %{http_code}, Time: %{time_total}s\n" \
    "https://hotdash-llamaindex-mcp.fly.dev/health"
  sleep 30
done

# 3. Check error rates
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp | grep -i error | wc -l
# Should be < 1% of total requests

# 4. Verify performance metrics
SYNTHETIC_CHECK_URL="https://hotdash-llamaindex-mcp.fly.dev/health" \
SYNTHETIC_CHECK_BUDGET_MS=500 \
node scripts/ci/synthetic-check.mjs

# 5. Confirm auto-scaling working
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp
# Machines should be in expected states

# 6. Check resource usage
~/.fly/bin/fly machine status <machine-id> -a hotdash-llamaindex-mcp
# Memory/CPU should be stable

# 7. Declare incident resolved
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] INCIDENT RESOLVED" >> feedback/reliability.md
echo "Duration: <start-time> to <end-time>" >> feedback/reliability.md
echo "Root Cause: <preliminary findings>" >> feedback/reliability.md
```

### Phase 6: Post-Incident Review (Within 24 hours)

1. **Create Incident Report**
   - Timeline of events
   - Root cause analysis
   - Impact assessment
   - Lessons learned
   - Action items

2. **Update Runbooks**
   - Add new troubleshooting steps
   - Update monitoring thresholds
   - Document new failure modes

3. **Implement Preventions**
   - Fix underlying issues
   - Add monitoring/alerts
   - Update deployment procedures

## Common Failure Scenarios

### Scenario 1: All Machines Down

**Symptoms:**

- Health checks failing
- 502/503 errors
- No machines in "started" state

**Diagnosis:**

```bash
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp
# Check STATE column
```

**Resolution:**

```bash
# Option A: Restart machines
~/.fly/bin/fly machine start <machine-id> -a hotdash-llamaindex-mcp

# Option B: Deploy fresh machines
~/.fly/bin/fly deploy -c fly.production.toml -a hotdash-llamaindex-mcp

# Option C: Rollback to previous version
# See: docs/runbooks/agent-sdk-production-deployment.md#rollback-steps
```

**Root Causes:**

- Bad deployment
- Configuration error
- Resource exhaustion
- Fly.io platform issue

### Scenario 2: High Error Rate

**Symptoms:**

- Error rate > 5%
- Logs showing exceptions
- User complaints

**Diagnosis:**

```bash
# Check recent logs for error patterns
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp | grep -i error | tail -50

# Check for specific error types
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp | grep -E "(timeout|exception|failed)"
```

**Resolution:**

```bash
# 1. Identify error pattern
# 2. Check dependencies (Supabase, OpenAI)
# 3. Review recent code changes
# 4. Rollback if errors started after deployment

# If dependency issue:
# - Check Supabase status
# - Verify API keys/secrets
# - Test network connectivity

# If code issue:
# - Rollback to previous version
# - Fix code and redeploy to staging
# - Validate before production
```

**Root Causes:**

- Dependency failure
- Code bug
- Invalid configuration
- Rate limiting

### Scenario 3: High Latency

**Symptoms:**

- P95 latency > 1000ms
- Slow responses
- Timeouts

**Diagnosis:**

```bash
# Check response times
time curl -sS "https://hotdash-llamaindex-mcp.fly.dev/health"

# Check resource usage
~/.fly/bin/fly machine status <machine-id> -a hotdash-llamaindex-mcp
# Look for high CPU or memory

# Check for slow operations in logs
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp | grep -i "slow"
```

**Resolution:**

```bash
# Option A: Scale up resources
~/.fly/bin/fly machine update <machine-id> --memory 1024 -a hotdash-llamaindex-mcp

# Option B: Scale machine count
# Update fly.toml min_machines_running, redeploy

# Option C: Optimize code/queries
# Requires engineering investigation
```

**Root Causes:**

- Insufficient resources
- Slow database queries
- Inefficient code
- Cold start issues

### Scenario 4: OOM (Out of Memory) Kills

**Symptoms:**

- Machine exit_code=137, oom_killed=true
- Machines frequently restarting
- Memory usage at 100%

**Diagnosis:**

```bash
# Check for OOM in logs
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp | grep -i "oom"

# Check machine events
~/.fly/bin/fly machine status <machine-id> -a hotdash-llamaindex-mcp
# Look in Event Logs section
```

**Resolution:**

```bash
# IMMEDIATE: Scale up memory
~/.fly/bin/fly machine update <machine-id> --memory 1024 -a hotdash-llamaindex-mcp

# Verify fix
sleep 60
~/.fly/bin/fly machine status <machine-id> -a hotdash-llamaindex-mcp
# Check memory usage percentage

# Long-term: Investigate memory leak
# - Profile application
# - Review recent code changes
# - Check for resource cleanup issues
```

**Root Causes:**

- Insufficient memory allocation
- Memory leak
- Large data processing
- Inefficient caching

### Scenario 5: Auto-scaling Not Working

**Symptoms:**

- Machines not stopping when idle
- Machines not starting on request
- Unexpected resource costs

**Diagnosis:**

```bash
# Check fly.toml configuration
cat fly.production.toml | grep -A 5 "auto_stop_machines"

# Verify machine states
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp

# Check recent deployments
~/.fly/bin/fly releases -a hotdash-llamaindex-mcp | head -5
```

**Resolution:**

```bash
# 1. Verify fly.toml settings
# auto_stop_machines = true
# auto_start_machines = true

# 2. Redeploy with correct configuration
~/.fly/bin/fly deploy -c fly.production.toml -a hotdash-llamaindex-mcp

# 3. Test auto-scaling
# Wait 5 minutes, check machine stopped
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp

# Make request, verify auto-start
curl -sS "https://hotdash-llamaindex-mcp.fly.dev/health"
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp
```

**Root Causes:**

- Incorrect fly.toml configuration
- Health check keeping machines alive
- Active connections preventing stop

## Escalation Procedures

### Level 1: Reliability Team (Self-Service)

**Responsibilities:**

- Initial detection and assessment
- Execute standard mitigation (restart, rollback)
- Monitor and document

**Authority:**

- Can restart machines
- Can execute rollback
- Cannot modify code or architecture

**Escalate When:**

- Issue persists after standard mitigation
- Root cause requires code changes
- SEV-1 incident
- Unsure of best action

### Level 2: Engineer + Reliability

**Responsibilities:**

- Code-level debugging
- Configuration changes
- Architecture review
- Hot fixes (if safe)

**Authority:**

- Can modify code
- Can change configuration
- Can deploy fixes

**Escalate When:**

- Issue requires architectural changes
- Multiple services affected
- Decision needed on major impact

### Level 3: Manager + Engineer + Reliability

**Responsibilities:**

- Strategic decisions
- Cross-team coordination
- Customer communication
- Resource allocation

**Authority:**

- Final decision making
- Can authorize emergency changes
- Can adjust priorities

## Contact Information

### On-Call Rotation

- **Reliability**: See `docs/ops/oncall-schedule.md`
- **Engineer**: See `docs/ops/oncall-schedule.md`
- **Manager**: Always escalate for SEV-1

### Emergency Contacts

- Slack: #incidents (for SEV-1/SEV-2)
- Email: Use for SEV-3 or updates

## Tools and Resources

### Monitoring

- Fly.io Dashboard: https://fly.io/dashboard
- Supabase Dashboard: https://app.supabase.com
- Logs: `~/.fly/bin/fly logs -a <app>`

### Documentation

- Production Deployment: `docs/runbooks/agent-sdk-production-deployment.md`
- Monitoring: `docs/runbooks/agent-sdk-monitoring.md`
- Fly.io Guide: `docs/dev/fly-shopify.md`

### Scripts

- Health Check: `scripts/ops/agent-sdk-health-check.sh`
- Log Monitoring: `scripts/ops/agent-sdk-logs.sh`
- Synthetic Check: `scripts/ci/synthetic-check.mjs`

## Incident Report Template

```markdown
# Incident Report: [Title]

**Incident ID**: INC-<yyyymmdd-hhmmss>
**Severity**: SEV-1/SEV-2/SEV-3
**Date**: <yyyy-mm-dd>
**Duration**: <start-time> to <end-time>
**Reporter**: <name>

## Summary

Brief description of the incident.

## Timeline

| Time  | Event              |
| ----- | ------------------ |
| HH:MM | Incident detected  |
| HH:MM | Mitigation started |
| HH:MM | Issue resolved     |

## Impact

- **Users Affected**: <number/percentage>
- **Services Down**: <list>
- **Duration**: <X minutes>

## Root Cause

Detailed explanation of what went wrong.

## Resolution

What actions were taken to resolve the issue.

## Preventive Actions

1. Action item 1 (Owner: X, Due: date)
2. Action item 2 (Owner: Y, Due: date)

## Lessons Learned

- What went well
- What could be improved
- What we learned

## Appendix

- Links to logs
- Diagnostic artifacts
- Related incidents
```

## Testing and Drills

### Monthly Incident Response Drill

Execute a simulated incident to test procedures:

```bash
# 1. Choose scenario (e.g., "All machines down")
# 2. Execute scenario in staging
# 3. Follow runbook procedures
# 4. Time response
# 5. Document findings
# 6. Update runbook with learnings
```

### Runbook Validation Checklist

- [ ] All commands tested in staging
- [ ] Escalation contacts verified
- [ ] Rollback procedure tested
- [ ] Communication templates reviewed
- [ ] Tools and access verified

## Changelog

| Date       | Change           | Author            |
| ---------- | ---------------- | ----------------- |
| 2025-10-11 | Initial creation | Reliability Agent |

## Next Steps

1. ⏳ Test incident procedures in staging
2. ⏳ Set up monitoring alerts
3. ⏳ Schedule monthly drill
4. ⏳ Brief team on procedures
