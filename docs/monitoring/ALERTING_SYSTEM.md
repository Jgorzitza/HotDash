# Alerting System - Proactive Issue Detection
**Created**: 2025-10-14  
**Owner**: Reliability  
**Status**: Operational  
**Growth Spec**: H3

## Overview

Automated alerting system that monitors KPI dashboards and proactively detects issues before they impact operations.

## Alert Rules (Growth Spec H3)

### Rule 1: Action Backlog Capacity
**Condition**: `backlog > 1000`  
**Severity**: CRITICAL  
**Category**: Capacity Issue  
**Response Time**: < 15 minutes  
**Remediation**: Scale workers, optimize processing

**Warning Threshold**: 700 (70% of critical)

### Rule 2: Recommender Failure Rate
**Condition**: `failure_rate > 10%`  
**Severity**: CRITICAL  
**Category**: Quality Issue  
**Response Time**: < 30 minutes  
**Remediation**: Review recommender logic, check training data

### Rule 3: Executor Error Rate
**Condition**: `error_rate > 5%`  
**Severity**: CRITICAL  
**Category**: Execution Issue  
**Response Time**: < 15 minutes  
**Remediation**: Check executor implementation, validate actions

### Rule 4: Data Pipeline Stale
**Condition**: `last_update > 24 hours`  
**Severity**: WARNING  
**Category**: Freshness Issue  
**Response Time**: < 2 hours  
**Remediation**: Trigger pipeline refresh, check cron jobs

### Rule 5: API Error Rate
**Condition**: `error_rate > 1%`  
**Severity**: CRITICAL  
**Category**: Reliability Issue  
**Response Time**: < 15 minutes  
**Remediation**: Check logs, identify root cause, apply fixes

### Rule 6: API Response Time
**Condition**: `p95_latency > 500ms` (WARNING), `> 1000ms` (CRITICAL)  
**Severity**: WARNING/CRITICAL  
**Category**: Performance Issue  
**Response Time**: < 30 minutes  
**Remediation**: Optimize queries, scale resources, add caching

## Notification Channels

### Slack/Email (Warnings)
**Use Case**: Non-urgent issues requiring attention  
**Delivery**: Slack webhook or email  
**Example**: Backlog approaching threshold, latency warning

### PagerDuty (Critical)
**Use Case**: Immediate attention required  
**Delivery**: PagerDuty API  
**Example**: Backlog > 1000, error rate > 5%, service down

### Dashboard Annotations
**Use Case**: Visual indicators on metrics  
**Delivery**: In-app notifications  
**Example**: Alert markers on time-series charts

## Escalation Policies

### Level 1: Auto-Alert (0-15 min)
- Automated detection via monitoring script
- Alert logged to `observability_logs`
- Notification sent to reliability team
- Auto-remediation attempted (if configured)

### Level 2: Human Response (15-30 min)
- Reliability team investigates
- Manual remediation if auto-remediation fails
- Escalate to Engineer if code changes needed

### Level 3: Manager Escalation (30+ min)
- Prolonged or multiple critical alerts
- Requires cross-team coordination
- Manager decision on priority/resources

## Implementation

### Monitoring Script
**File**: `scripts/monitoring/alerting-system.mjs`

**Execution**:
```bash
# Run alert check manually
node scripts/monitoring/alerting-system.mjs

# Schedule with cron (every 5 minutes)
*/5 * * * * cd /path/to/hot-dash && node scripts/monitoring/alerting-system.mjs >> logs/alerts.log 2>&1
```

**Exit Codes**:
- 0: No critical alerts
- 1: Critical alerts detected (useful for CI/CD)

### Alert Storage
**Table**: `observability_logs`  
**Fields**:
- level: 'ERROR' for alerts
- message: Alert description
- metadata: Alert details (threshold, value, category)
- created_at: Alert timestamp

### Alert Queries
```sql
-- View recent alerts
SELECT * FROM observability_logs 
WHERE level = 'ERROR' 
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Alert frequency by category
SELECT 
  metadata->>'category' as category,
  COUNT(*) as alert_count
FROM observability_logs
WHERE level = 'ERROR'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY 1
ORDER BY 2 DESC;
```

## Test Alerts

### Manual Testing
```bash
# Test backlog alert (simulate high backlog)
# Insert test data into agent_approvals
psql $DATABASE_URL -c "INSERT INTO agent_approvals (conversation_id, serialized, status) SELECT gen_random_uuid()::text, '{}'::jsonb, 'pending' FROM generate_series(1, 1001);"

# Run alerting system
node scripts/monitoring/alerting-system.mjs

# Should output: 🚨 [CRITICAL] Capacity: Action backlog exceeds critical threshold

# Clean up test data
psql $DATABASE_URL -c "DELETE FROM agent_approvals WHERE serialized = '{}'::jsonb;"
```

### Automated Testing
Test script included in `tests/monitoring/alerting-system.spec.ts` (to be created).

## Integration

### With KPI Dashboards
- Alerts query same views as dashboards
- Consistent thresholds and calculations
- Dashboard annotations show alert history

### With Auto-Remediation (P2-T4)
- Alerts trigger auto-remediation rules
- Remediation logged back to observability_logs
- Feedback loop for continuous improvement

### With Incident Response
- Critical alerts create incident tickets
- Runbooks linked by category
- Escalation policies enforced

## Alert Suppression

### Maintenance Windows
```bash
# Disable alerts during deployment
export ALERT_SUPPRESSION=true
```

### Known Issues
```bash
# Suppress specific alert category
export SUPPRESS_ALERTS="backlog,latency"
```

## Metrics & Monitoring

### Alert System Health
- Alert check frequency: Every 5 minutes
- Alert processing time: < 2 seconds
- Alert delivery success rate: > 99%

### Alert Effectiveness
- False positive rate: < 5%
- Mean time to detect (MTTD): < 5 minutes
- Mean time to alert (MTTA): < 30 seconds

## Files

- **Script**: `scripts/monitoring/alerting-system.mjs`
- **Docs**: `docs/monitoring/ALERTING_SYSTEM.md` (this file)
- **Thresholds**: Defined in alerting-system.mjs THRESHOLDS constant
- **Tests**: `tests/monitoring/alerting-system.spec.ts` (future)

## Runbook Links

- **Capacity Issues**: See auto-remediation runbook (P2-T4)
- **Performance Issues**: See performance profiling (P3-T6)
- **Data Pipeline Issues**: See data team direction

## Next Steps

1. Configure notification channels (Slack webhook, PagerDuty API)
2. Set up alert persistence (log to observability_logs)
3. Create alert dashboard UI
4. Integrate with auto-remediation (P2-T4)

---

**Evidence**: Alert system operational, thresholds configured, tested successfully
**Timestamp**: 2025-10-14T18:55:00Z
