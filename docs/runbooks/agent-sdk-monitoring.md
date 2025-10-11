# Agent SDK Infrastructure Monitoring Runbook

**Created**: 2025-10-11  
**Owner**: Reliability Team  
**Status**: Pre-deployment (services pending)  
**Last Updated**: 2025-10-11T20:37:00Z

## Overview

This runbook covers monitoring and observability for HotDash Agent SDK infrastructure services deployed on Fly.io.

## Services to Monitor

### 1. hotdash-llamaindex-mcp
- **Purpose**: LlamaIndex MCP server for RAG capabilities
- **Expected Deployment**: TBD (engineer deploying)
- **Target Latency**: P95 < 500ms for MCP queries
- **Auto-scaling**: Expected to use auto-stop/auto-start

### 2. hotdash-agent-service  
- **Purpose**: Agent service for approval queue management
- **Expected Deployment**: TBD (engineer deploying)
- **Target Response Time**: < 30s for approval queue
- **Auto-scaling**: Expected to use auto-stop/auto-start

## Monitoring Checklist

### Daily Health Checks

```bash
# Check app status
~/.fly/bin/fly apps list | grep -E "(llamaindex|agent-service)"

# Check app health
~/.fly/bin/fly status -a hotdash-llamaindex-mcp
~/.fly/bin/fly status -a hotdash-agent-service

# Check machine status and resource usage
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp
~/.fly/bin/fly machine list -a hotdash-agent-service
```

### Performance Monitoring

**MCP Query Latency** (Target: P95 < 500ms)
```bash
# Test MCP endpoint response time
time curl -sS "https://hotdash-llamaindex-mcp.fly.dev/health"

# Check recent logs for slow queries
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp | grep -E "(slow|timeout|error)"
```

**Approval Queue Response Time** (Target: < 30s)
```bash
# Test agent service endpoint
time curl -sS "https://hotdash-agent-service.fly.dev/health"

# Monitor queue processing times
~/.fly/bin/fly logs -a hotdash-agent-service | grep -E "(queue|approval|latency)"
```

### Resource Utilization

**Memory Usage Monitoring:**
```bash
# Get detailed machine status (includes memory usage)
~/.fly/bin/fly machine status <machine-id> -a hotdash-llamaindex-mcp
~/.fly/bin/fly machine status <machine-id> -a hotdash-agent-service

# Check for OOM kills in logs
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp | grep -i "oom"
~/.fly/bin/fly logs -a hotdash-agent-service | grep -i "oom"
```

**Auto-scaling Verification:**
```bash
# Verify machines stop when idle
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp
# Check STATE column: should show "stopped" when idle, "started" when active

# Verify auto-start on request
curl -sS "https://hotdash-llamaindex-mcp.fly.dev/health"
# Then immediately check machine state
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp
# Should show "starting" or "started"
```

## Performance Targets

| Metric | Target | Warning Threshold | Critical Threshold |
|--------|--------|-------------------|-------------------|
| MCP Query Latency (P95) | < 500ms | > 500ms | > 1000ms |
| Approval Queue Response | < 30s | > 30s | > 60s |
| Memory Usage | < 70% | > 70% | > 85% |
| Error Rate | < 1% | > 1% | > 5% |
| Auto-start Time | < 10s | > 10s | > 20s |

## Alert Configuration

### Critical Alerts (Immediate Action Required)

1. **Service Down**
   - Condition: HTTP 5xx errors > 5% for 5 minutes
   - Action: Check logs, restart machines if needed
   - Escalation: Manager + Engineer after 15 minutes

2. **High Latency**
   - Condition: P95 > 1000ms for 10 minutes
   - Action: Check resource usage, scale up if needed
   - Escalation: Engineer after 30 minutes

3. **OOM Kills**
   - Condition: Any OOM kill event
   - Action: Immediately scale memory up
   - Escalation: Document in incident report

### Warning Alerts (Monitor Closely)

1. **Elevated Latency**
   - Condition: P95 > 500ms for 15 minutes
   - Action: Monitor trends, prepare to scale

2. **High Memory Usage**
   - Condition: Memory > 70% for 20 minutes
   - Action: Monitor for growth, plan memory increase

3. **Slow Auto-start**
   - Condition: Auto-start taking > 10s consistently
   - Action: Investigate cold start performance

## Monitoring Commands Reference

### Health Check Script
```bash
#!/bin/bash
# Save as: scripts/ops/agent-sdk-health-check.sh

echo "=== Agent SDK Health Check - $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="

# Check if services exist
echo -e "\n1. Service Status:"
~/.fly/bin/fly apps list | grep -E "(llamaindex|agent-service)" || echo "No Agent SDK services found"

# Check each service if it exists
if ~/.fly/bin/fly apps list | grep -q "hotdash-llamaindex-mcp"; then
  echo -e "\n2. LlamaIndex MCP Status:"
  ~/.fly/bin/fly status -a hotdash-llamaindex-mcp
  
  echo -e "\n3. LlamaIndex MCP Health:"
  curl -sS -w "\nStatus: %{http_code}, Time: %{time_total}s\n" "https://hotdash-llamaindex-mcp.fly.dev/health" || echo "Health check failed"
fi

if ~/.fly/bin/fly apps list | grep -q "hotdash-agent-service"; then
  echo -e "\n4. Agent Service Status:"
  ~/.fly/bin/fly status -a hotdash-agent-service
  
  echo -e "\n5. Agent Service Health:"
  curl -sS -w "\nStatus: %{http_code}, Time: %{time_total}s\n" "https://hotdash-agent-service.fly.dev/health" || echo "Health check failed"
fi

echo -e "\n=== Health Check Complete ==="
```

### Log Monitoring Script
```bash
#!/bin/bash
# Save as: scripts/ops/agent-sdk-logs.sh

SERVICE=${1:-hotdash-llamaindex-mcp}
echo "Monitoring logs for: $SERVICE"
~/.fly/bin/fly logs -a "$SERVICE"
```

## Troubleshooting

### Service Not Starting
1. Check machine status: `~/.fly/bin/fly machine list -a <app>`
2. Review recent logs: `~/.fly/bin/fly logs -a <app>`
3. Verify secrets are set: `~/.fly/bin/fly secrets list -a <app>`
4. Check fly.toml configuration
5. Restart machine: `~/.fly/bin/fly machine restart <machine-id> -a <app>`

### High Latency
1. Check machine resources: `~/.fly/bin/fly machine status <machine-id> -a <app>`
2. Review logs for slow operations
3. Consider scaling CPU/memory
4. Check network connectivity to dependencies (Supabase, etc.)

### Memory Issues
1. Check current memory allocation
2. Review logs for memory-related errors
3. Scale up: `~/.fly/bin/fly machine update <machine-id> --memory <MB> -a <app>`
4. Document new baseline in this runbook

### Auto-scaling Not Working
1. Verify fly.toml has auto_stop_machines and auto_start_machines configured
2. Check machine state: `~/.fly/bin/fly machine list -a <app>`
3. Test with manual request and observe state change
4. Review deployment logs for configuration errors

## Evidence and Logging

All monitoring activities should be logged to `feedback/reliability.md` with:
- Timestamp (ISO 8601)
- Command executed
- Result summary
- Any issues or anomalies
- Actions taken

Example:
```
[2025-10-11T20:37:00Z] Agent SDK Monitoring Check
$ ~/.fly/bin/fly status -a hotdash-llamaindex-mcp
Result: Service healthy, 1 machine running, memory: 512MB (45% used)
Latency: P95 342ms (under 500ms target ✅)
Action: None required
```

## Integration with CI/CD

### Pre-deployment Checks
- [ ] Verify health check endpoints exist
- [ ] Confirm auto-scaling configuration
- [ ] Set up monitoring baseline
- [ ] Test rollback procedure

### Post-deployment Validation
- [ ] Health checks passing within 2 minutes
- [ ] Auto-scaling working as expected
- [ ] Latency within targets
- [ ] No errors in logs
- [ ] Memory usage stable

## Escalation Procedures

### Level 1: Reliability Team (Immediate)
- Monitor alerts and logs
- Attempt standard troubleshooting
- Execute rollback if needed
- Document incident

### Level 2: Engineer + Reliability (< 15 minutes for critical)
- Code-level debugging
- Configuration changes
- Architecture review
- Hot fixes if safe

### Level 3: Manager + Engineer + Reliability (< 30 minutes for critical)
- Major architectural issues
- Multi-service failures
- Production incident coordination
- Emergency decision making

## Regular Maintenance

### Daily
- Health check both services
- Review logs for errors
- Check latency metrics
- Verify auto-scaling

### Weekly  
- Resource utilization trend analysis
- Performance baseline review
- Update thresholds if needed
- Test incident response procedures

### Monthly
- Full incident response drill
- Review and update runbooks
- Capacity planning review
- Cost optimization analysis

## References

- Production Deployment Runbook: `docs/runbooks/agent-sdk-production-deployment.md`
- Incident Response Runbook: `docs/runbooks/agent-sdk-incident-response.md`
- Fly.io Best Practices: `docs/dev/fly-shopify.md`
- Manager Direction: `docs/directions/reliability.md`

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-10-11 | Initial creation (pre-deployment) | Reliability Agent |

## Next Steps

1. ⏳ Wait for engineer to deploy services
2. ⏳ Execute initial health checks
3. ⏳ Establish performance baselines
4. ⏳ Set up automated monitoring
5. ⏳ Test alert procedures

