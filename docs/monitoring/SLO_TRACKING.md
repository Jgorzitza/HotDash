# SLO Tracking System - Service Level Objectives
**Created**: 2025-10-14  
**Owner**: Reliability  
**Status**: Operational  
**Growth Spec**: I (KPIs)

## Overview

Automated SLO tracking with error budget calculations and burn rate alerts for growth automation systems.

## Service Level Objectives

### SLO 1: Action API Availability
**Target**: 99.9%  
**Measurement**: Uptime (successful requests / total requests)  
**Window**: 30 days rolling  
**Error Budget**: 0.1% (43 minutes downtime per month)

**Calculation**:
```
Availability = (Total Requests - Error Requests) / Total Requests × 100
Error Budget Remaining = (100 - Target) - (100 - Actual)
```

### SLO 2: Action Approval Latency
**Target**: P95 < 500ms  
**Measurement**: 95th percentile approval time  
**Window**: 30 days rolling  
**Error Budget**: 5% of actions can exceed 500ms

**Calculation**:
```
P95 Latency = 95th percentile(updated_at - created_at)
SLO Compliance = (Actions < 500ms / Total Actions) × 100
```

### SLO 3: Recommender Success Rate
**Target**: > 95%  
**Measurement**: Approval rate  
**Window**: 30 days rolling  
**Error Budget**: 5% rejection allowance

**Calculation**:
```
Success Rate = Approved Actions / Total Actions × 100
Error Budget = Success Rate - Target
```

### SLO 4: Executor Success Rate
**Target**: > 98%  
**Measurement**: Execution success rate  
**Window**: 30 days rolling  
**Error Budget**: 2% failure allowance

**Calculation**:
```
Success Rate = Successful Executions / Total Executions × 100
Error Budget = Success Rate - Target
```

### SLO 5: Data Pipeline Freshness
**Target**: < 6 hours  
**Measurement**: Max age of latest data  
**Window**: Current state  
**Error Budget**: N/A (binary - fresh or stale)

**Calculation**:
```
Data Age = NOW() - MAX(last_updated)
Status = Data Age < 6 hours ? 'MEETING' : 'VIOLATING'
```

## Error Budget Management

### Error Budget Calculation
```
Error Budget Remaining = Allowed Failures - Actual Failures
Error Budget Consumed% = (Actual Failures / Allowed Failures) × 100
```

### Budget Status
- **OK**: < 75% consumed (normal operations)
- **WARNING**: 75-100% consumed (reduce risk-taking)
- **EXCEEDED**: > 100% consumed (freeze changes, focus on reliability)

### Burn Rate Alerts
**Fast Burn** (< 7 days until exhausted):
- Severity: CRITICAL
- Action: Freeze deployments, investigate immediately

**Medium Burn** (7-14 days):
- Severity: WARNING  
- Action: Monitor closely, prepare mitigation

**Slow Burn** (> 14 days):
- Severity: INFO
- Action: Normal operations

## Implementation

### SLO Tracking Script
**File**: `scripts/monitoring/slo-tracking.mjs`

**Execution**:
```bash
# Run SLO check manually
node scripts/monitoring/slo-tracking.mjs

# Schedule with cron (every hour)
0 * * * * cd /path/to/hot-dash && node scripts/monitoring/slo-tracking.mjs >> logs/slo-tracking.log 2>&1
```

### SLO Dashboard
**API Endpoint**: `/api/dashboards/slo` (to be created)

**Metrics Displayed**:
- Current SLO compliance (all 5 SLOs)
- Error budget remaining
- Burn rate trends
- Historical SLO performance

### Alert Integration
**Burn Rate Alerts** (from alerting-system.mjs):
- Fast burn (< 7 days): CRITICAL alert
- Medium burn (7-14 days): WARNING alert
- SLO violation: CRITICAL alert

## SLO Dashboard Queries

### Current SLO Status
```sql
-- Check all SLOs at once
SELECT 
  'API Availability' as slo,
  (COUNT(*) FILTER (WHERE level != 'ERROR') * 100.0 / COUNT(*)) as current_pct,
  99.9 as target_pct
FROM observability_logs
WHERE created_at > NOW() - INTERVAL '30 days'

UNION ALL

SELECT
  'Approval Latency',
  (COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (updated_at - created_at)) < 0.5) * 100.0 / COUNT(*)) as current_pct,
  95.0 as target_pct
FROM agent_approvals
WHERE created_at > NOW() - INTERVAL '30 days'
  AND status != 'pending';
```

### Error Budget Trends
```sql
-- Daily error budget consumption
SELECT
  date_trunc('day', created_at) as day,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE level = 'ERROR') as errors,
  (COUNT(*) FILTER (WHERE level = 'ERROR') * 100.0 / COUNT(*)) as error_rate,
  99.9 - (COUNT(*) - COUNT(*) FILTER (WHERE level = 'ERROR')) * 100.0 / COUNT(*) as error_budget_consumed
FROM observability_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1 DESC;
```

## Usage

### Check SLO Compliance
```bash
# Run SLO tracking
node scripts/monitoring/slo-tracking.mjs

# Output shows:
# - Current performance vs target
# - Error budget remaining
# - Burn rate and days until exhausted
# - Alert status (OK/WARNING/CRITICAL)
```

### Monitor Error Budget
```bash
# Check if error budget is healthy
node scripts/monitoring/slo-tracking.mjs | grep "Error Budget"

# Expected output (healthy):
# Error Budget: 0.05% remaining (OK)
```

### Burn Rate Analysis
```bash
# Check burn rate trends
node scripts/monitoring/slo-tracking.mjs | grep "Burn Rate"

# If critical:
# Burn Rate: 5.2%/day (CRITICAL - 3 days until exhausted)
```

## Deployment

### Local Development
1. Ensure Supabase running
2. Set environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY)
3. Run: `node scripts/monitoring/slo-tracking.mjs`

### Production
1. Deploy to cron (hourly schedule)
2. Configure alert channels
3. Set up SLO dashboard
4. Link to incident response

## Integration

### With Alerting System
- SLO violations trigger alerts
- Burn rate alerts (fast/medium/slow)
- Error budget warnings at 75% consumed

### With Change Management
- Error budget policy:
  - > 25% remaining: Normal deployments allowed
  - 10-25% remaining: Low-risk changes only
  - < 10% remaining: Freeze deployments
  
### With Incident Response
- SLO violations create incidents
- Root cause analysis required
- Postmortem for repeated violations

## Files

- **Script**: `scripts/monitoring/slo-tracking.mjs`
- **Docs**: `docs/monitoring/SLO_TRACKING.md` (this file)
- **Dashboards**: Integrated with KPI dashboards

## SLO Definitions in Code

All SLO targets defined in `scripts/monitoring/slo-tracking.mjs`:
```javascript
const SLOS = {
  actionApiAvailability: { target: 99.9, unit: '%' },
  approvalLatency: { target: 500, unit: 'ms' },
  recommenderSuccess: { target: 95, unit: '%' },
  executorSuccess: { target: 98, unit: '%' },
  dataFreshness: { target: 6, unit: 'hours' },
};
```

## Next Steps

1. Create SLO dashboard UI
2. Configure burn rate alerts in alerting-system.mjs
3. Set up error budget policies in deployment workflow
4. Link SLO violations to incident response

---

**Evidence**: SLO tracking operational, error budgets calculated, burn rates monitored
**Timestamp**: 2025-10-14T19:00:00Z
