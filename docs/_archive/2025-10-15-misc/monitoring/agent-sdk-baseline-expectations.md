# Agent SDK Baseline Expectations & Monitoring Queries

**Created**: 2025-10-12T04:24:30Z  
**Owner**: Reliability Team  
**Purpose**: Document expected baselines for Agent SDK services post-fix  
**Status**: Prepared (awaiting agent-service fix deployment)

## Overview

This document defines expected performance baselines and monitoring queries for the Agent SDK services once both are fully operational.

## Service Baseline Expectations

### hotdash-llamaindex-mcp (Operational ✅)

**Performance Targets**:

- **Cold Start**: < 10s (Current: 2.2s ✅)
- **Warm Requests**: < 500ms P95
- **Error Rate**: < 1%
- **Availability**: > 99% (auto-scaling)

**Resource Expectations**:

- **Memory**: 512MB baseline (monitor for growth)
- **Memory Warning**: > 70% (358MB)
- **Memory Critical**: > 85% (435MB)
- **CPU**: < 70% under normal load

**Tool-Specific Expectations**:

**query_support** (RAG queries):

- **P95 Latency**: < 500ms
- **P99 Latency**: < 1000ms
- **Error Rate**: < 1%
- **Typical Usage**: Multiple queries per approval session

**refresh_index** (Index updates):

- **Duration**: < 30s (acceptable for background task)
- **Frequency**: On-demand or scheduled
- **Error Rate**: < 5%

**insight_report** (Report generation):

- **Duration**: < 10s
- **Error Rate**: < 1%
- **Typical Usage**: Periodic summary generation

### hotdash-agent-service (Awaiting Fix)

**Performance Targets** (Post-Fix):

- **Cold Start**: < 10s
- **Approval Queue Response**: < 30s
- **Approval Processing**: < 5s per action
- **Error Rate**: < 1%
- **Availability**: > 99%

**Resource Expectations**:

- **Memory**: 1024MB baseline (monitor for growth)
- **Memory Warning**: > 70% (716MB)
- **Memory Critical**: > 85% (870MB)
- **CPU**: < 70% under normal load

**Workflow Expectations**:

- **Queue Check**: < 1s
- **Decision Submission**: < 5s
- **Status Update**: < 2s
- **End-to-End Approval**: < 30s total

## Monitoring Queries

### Health Check Queries

**Daily Automated Check**:

```bash
# Run every hour via cron or monitoring system
./scripts/ops/agent-sdk-health-check.sh

# Expected output:
# ✓ hotdash-llamaindex-mcp: 200 OK
# ✓ hotdash-agent-service: 200 OK (after fix)
# Exit code: 0
```

**Manual Health Verification**:

```bash
# LlamaIndex MCP
curl -sS "https://hotdash-llamaindex-mcp.fly.dev/health"
# Expected: {"status":"ok","service":"llamaindex-rag-mcp","version":"1.0.0",...}

# Agent Service (post-fix)
curl -sS "https://hotdash-agent-service.fly.dev/health"
# Expected: {"status":"ok","service":"agent-service","version":"1.0.0",...}
```

### Performance Monitoring Queries

**Latency Tracking**:

```bash
# Measure response time
time curl -sS "https://hotdash-llamaindex-mcp.fly.dev/health"

# Expected: 0.2-0.5s for warm requests, 2-10s for cold start
# Alert if: > 1s for warm requests, > 10s for cold start
```

**Auto-scaling Verification**:

```bash
# Check machine states
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp
~/.fly/bin/fly machine list -a hotdash-agent-service

# Expected when idle: STATE = stopped
# Expected when active: STATE = started or starting

# Test auto-start
# 1. Verify machines stopped
# 2. Make request
# 3. Check machines started
```

### Resource Utilization Queries

**Memory Usage**:

```bash
# Get detailed machine status
~/.fly/bin/fly machine status <machine-id> -a hotdash-llamaindex-mcp

# Check Memory line in VM section
# Baseline: 512MB for LlamaIndex, 1024MB for Agent Service
# Alert if approaching limits
```

**Error Rate Monitoring**:

```bash
# Check logs for errors (last 100 lines)
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp | tail -100 | grep -i error

# Expected: 0 errors under normal operation
# Alert if: > 1% error rate
```

### Functional Monitoring Queries

**LlamaIndex MCP Tool Testing** (Post-Fix):

```bash
# Test query_support tool (requires MCP client)
# Expected: Successful RAG query response within 500ms

# Test refresh_index tool
# Expected: Index refresh completes within 30s

# Test insight_report tool
# Expected: Report generated within 10s
```

**Agent Service Tool Testing** (Post-Fix):

```bash
# Test approval queue
# Expected: Queue status returned within 1s

# Test approval submission
# Expected: Approval processed within 5s

# Test end-to-end workflow
# Expected: Complete approval cycle within 30s
```

## Baseline Establishment Protocol

### Phase 1: Initial Verification (Post-Fix)

**Immediately after engineer fix**:

1. **Health Checks** (5 minutes):

```bash
# Run health checks every 30 seconds for 5 minutes
for i in {1..10}; do
  echo "Check $i/10 at $(date)"
  ./scripts/ops/agent-sdk-health-check.sh
  sleep 30
done

# Expected: All checks pass (200 OK)
# Alert if: Any check fails
```

2. **Resource Baseline** (15 minutes):

```bash
# Monitor machine status every 5 minutes
for i in {1..3}; do
  echo "Resource check $i/3 at $(date)"
  ~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp
  ~/.fly/bin/fly machine list -a hotdash-agent-service
  sleep 300
done

# Expected: Machines start/stop appropriately
# Document: Memory usage patterns
```

3. **Error Rate Baseline** (30 minutes):

```bash
# Monitor logs for errors
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp > llamaindex-baseline.log &
~/.fly/bin/fly logs -a hotdash-agent-service > agent-service-baseline.log &

# Wait 30 minutes
sleep 1800

# Analyze for errors
grep -i error llamaindex-baseline.log | wc -l
grep -i error agent-service-baseline.log | wc -l

# Expected: 0 errors
# Alert if: > 0 errors
```

### Phase 2: Usage Baseline (24 hours)

**After services proven stable**:

1. **Latency Patterns**:

```bash
# Run synthetic checks every 15 minutes for 24 hours
# Collect P50, P95, P99 latencies
# Document time-of-day patterns
# Identify warm vs cold start frequency
```

2. **Resource Usage Patterns**:

```bash
# Monitor memory/CPU every hour
# Document peak usage times
# Identify scaling triggers
# Assess if 512MB/1024MB sufficient
```

3. **Error Patterns**:

```bash
# Monitor error logs continuously
# Categorize error types
# Calculate error rates
# Identify common failure modes
```

### Phase 3: Load Testing (Week 1)

**Simulate realistic usage**:

1. **MCP Query Load**:

```bash
# Simulate multiple concurrent RAG queries
# Measure latency under load
# Document resource usage
# Identify scaling needs
```

2. **Approval Queue Load**:

```bash
# Simulate multiple concurrent approvals
# Measure queue processing time
# Document resource usage
# Identify bottlenecks
```

## Baseline Documentation Template

### Service: [llamaindex-mcp | agent-service]

**Date**: YYYY-MM-DD  
**Duration**: 24 hours  
**Load**: [light | normal | heavy]

**Performance**:

- P50 Latency: XXXms
- P95 Latency: XXXms
- P99 Latency: XXXms
- Error Rate: X.XX%
- Availability: XX.XX%

**Resources**:

- Memory P95: XXX MB (XX% of allocation)
- Memory P99: XXX MB
- CPU P95: XX%
- CPU P99: XX%

**Auto-scaling**:

- Stop frequency: X times per hour
- Start frequency: X times per hour
- Avg start time: X.XXs

**Errors**:

- Total errors: X
- Error categories: [list]
- Common failures: [list]

**Recommendations**:

- [Keep current | Scale up | Scale down | Adjust thresholds]

## Alert Thresholds (Post-Baseline)

Will be refined after 24-hour baseline establishment:

### Current Thresholds (Estimated)

**LlamaIndex MCP**:

- **Critical**: P95 > 1000ms, error rate > 5%, service down
- **Warning**: P95 > 500ms, error rate > 1%, memory > 70%

**Agent Service** (Post-Fix):

- **Critical**: Approval queue > 60s, error rate > 5%, service down
- **Warning**: Approval queue > 30s, error rate > 1%, memory > 70%

### Threshold Adjustment Process

After collecting 24-hour baseline:

1. Review actual P95/P99 metrics
2. Set warning threshold at 2x baseline P95
3. Set critical threshold at 3x baseline P95
4. Document in docs/runbooks/agent-sdk-monitoring.md
5. Configure alerts in monitoring system

## Monitoring Query Schedule

### Automated (Via Cron)

```bash
# Health checks every 15 minutes
*/15 * * * * cd /home/justin/HotDash/hot-dash && ./scripts/ops/agent-sdk-health-check.sh >> logs/agent-sdk-health.log 2>&1

# Resource checks every hour
0 * * * * cd /home/justin/HotDash/hot-dash && ~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp >> logs/llamaindex-resources.log 2>&1
0 * * * * cd /home/justin/HotDash/hot-dash && ~/.fly/bin/fly machine list -a hotdash-agent-service >> logs/agent-service-resources.log 2>&1
```

### Manual (Daily)

```bash
# Morning check (9am)
./scripts/ops/agent-sdk-health-check.sh
./scripts/ops/agent-sdk-logs.sh all errors

# Evening check (5pm)
./scripts/ops/agent-sdk-health-check.sh
# Review day's metrics
```

### Weekly Review

```bash
# Monday morning: Review weekly trends
# Analyze logs from past 7 days
# Update thresholds if needed
# Document in feedback/reliability.md
```

## Expected Metrics After Fix

### LlamaIndex MCP (Already Operational)

**Day 1** (Light usage):

- Calls: < 100
- P95 Latency: 300-500ms
- Error Rate: < 0.5%
- Memory: 30-50% (154-256MB)

**Week 1** (Ramping up):

- Calls: 100-1000
- P95 Latency: 400-600ms
- Error Rate: < 1%
- Memory: 50-70% (256-358MB)

### Agent Service (Post-Fix)

**Day 1** (Light usage):

- Approvals: < 50
- Queue Response: < 10s
- Error Rate: < 1%
- Memory: 30-50% (307-512MB)

**Week 1** (Ramping up):

- Approvals: 50-500
- Queue Response: < 20s
- Error Rate: < 1%
- Memory: 50-70% (512-716MB)

## Post-Baseline Actions

### If Baselines Are Good

1. ✅ Document in feedback/reliability.md
2. ✅ Update monitoring runbook with actual thresholds
3. ✅ Set up automated alerts
4. ✅ Continue regular monitoring

### If Baselines Show Issues

1. Analyze root cause (code, resources, configuration)
2. Coordinate with engineer on fixes
3. Implement improvements
4. Re-baseline after fixes
5. Document in incident report

## References

- Health Check Script: `scripts/ops/agent-sdk-health-check.sh`
- Log Monitoring Script: `scripts/ops/agent-sdk-logs.sh`
- Monitoring Runbook: `docs/runbooks/agent-sdk-monitoring.md`
- Deployment Status: `reports/reliability/2025-10-12-agent-sdk-deployment-status.md`
- Manager Direction: `docs/directions/reliability.md`

## Next Steps

### Immediate (Awaiting Engineer Fix)

- ⏳ Monitor for agent-service fix deployment
- ⏳ Re-run health checks after deployment
- ⏳ Verify 200 OK from both services

### Post-Fix (Day 1)

- Run Phase 1 baseline establishment (30 min)
- Document initial metrics
- Verify auto-scaling works for both services
- Set up initial monitoring alerts

### Week 1

- Run Phase 2 baseline establishment (24 hours)
- Analyze usage patterns
- Refine alert thresholds
- Document operational baselines

### Ongoing

- Daily health checks
- Weekly trend analysis
- Monthly capacity review
- Quarterly baseline refresh

---

**Status**: Prepared and ready for post-fix baseline establishment  
**Waiting On**: Engineer fix for agent-service Zod schema error  
**Ready**: To execute monitoring protocol immediately after fix
