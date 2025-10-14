# Auto-Remediation System
**Created**: 2025-10-14  
**Owner**: Reliability  
**Status**: Operational (Dry-Run Mode)  
**Priority**: P2-T4

## Overview

Automated incident response system that detects issues and applies safe remediation actions without manual intervention.

## Remediation Rules

### Rule 1: Scale Workers Up
**Condition**: `queue_depth > 10000`  
**Action**: Scale workers to 10  
**Safe**: Yes (non-destructive)  
**Max Retries**: 3  
**Use Case**: Handle backlog capacity issues

### Rule 2: Open Circuit Breaker
**Condition**: `error_rate > 10%`  
**Action**: Open circuit breaker for recommenders  
**Safe**: Yes (prevents cascading failures)  
**Max Retries**: 1  
**Use Case**: Stop error propagation

### Rule 3: Trigger Pipeline Refresh
**Condition**: `data_stale > 24h`  
**Action**: Refresh data pipeline  
**Safe**: Yes (data refresh only)  
**Max Retries**: 2  
**Use Case**: Fix stale data issues

### Rule 4: Restart Failed Service
**Condition**: `service_down`  
**Action**: Restart service via Fly MCP  
**Safe**: Yes (standard restart)  
**Max Retries**: 2  
**Use Case**: Recover from service failures

### Rule 5: Clear Cache
**Condition**: `cache_errors > 5%`  
**Action**: Clear application cache  
**Safe**: Yes (cache refresh)  
**Max Retries**: 1  
**Use Case**: Fix cache corruption

## Safety Guarantees

### Safe Actions Only
- ✅ Scale up (never down)
- ✅ Circuit breaker (fail-safe)
- ✅ Pipeline refresh (idempotent)
- ✅ Service restart (recoverable)
- ✅ Cache clear (non-destructive)

### Prohibited Actions
- ❌ Scale down (capacity reduction)
- ❌ Delete data (destructive)
- ❌ Reset database (data loss)
- ❌ Force operations (unsafe)

### Manual Approval Required
- Any destructive action
- Production deployments
- Data modifications
- Service terminations

## Audit Trail

### All Actions Logged
**Table**: `observability_logs`  
**Fields**:
- level: 'INFO'
- message: 'Auto-remediation executed: {rule_name}'
- metadata: { rule_id, condition, action, result, metrics }
- created_at: Timestamp

### Audit Queries
```sql
-- View remediation history
SELECT * FROM observability_logs
WHERE message LIKE '%Auto-remediation executed%'
ORDER BY created_at DESC
LIMIT 100;

-- Remediation frequency by rule
SELECT
  metadata->>'rule_id' as rule,
  COUNT(*) as executions,
  COUNT(*) FILTER (WHERE (metadata->>'result')::jsonb->>'success' = 'true') as successful
FROM observability_logs
WHERE message LIKE '%Auto-remediation%'
GROUP BY 1;
```

## Usage

### Dry-Run Mode (Default)
```bash
# Test without executing actions
node scripts/monitoring/auto-remediation.mjs

# Output shows what WOULD be done
```

### Live Mode (Production)
```bash
# Execute actual remediations
AUTO_REMEDIATION_DRY_RUN=false node scripts/monitoring/auto-remediation.mjs

# Use with caution - actions are executed
```

### Scheduled Execution
```bash
# Run every 5 minutes (dry-run)
*/5 * * * * cd /path/to/hot-dash && node scripts/monitoring/auto-remediation.mjs >> logs/auto-remediation.log 2>&1

# Production (live mode)
*/5 * * * * cd /path/to/hot-dash && AUTO_REMEDIATION_DRY_RUN=false node scripts/monitoring/auto-remediation.mjs >> logs/auto-remediation.log 2>&1
```

## Manual Override

### Disable Auto-Remediation
```bash
# Temporarily disable
export AUTO_REMEDIATION_ENABLED=false
```

### Override Specific Rule
```bash
# Disable specific rule
export AUTO_REMEDIATION_SKIP="scale_workers,circuit_breaker"
```

## Integration

### With Alerting System
1. Alert triggers → Auto-remediation check
2. Remediation attempted → Alert updated with result
3. Remediation fails → Escalate to human

### With SLO Tracking
1. SLO violation detected → Auto-remediation triggered
2. Remediation success → SLO recovery tracked
3. Error budget → Remediation priority adjusted

### With Incident Response
1. Auto-remediation logs incident
2. If remediation fails → Create incident ticket
3. Escalation policies enforced

## Files

- **Rules**: `app/services/auto-remediation/rules.server.ts`
- **Executor**: `app/services/auto-remediation/executor.server.ts`
- **Script**: `scripts/monitoring/auto-remediation.mjs`
- **Docs**: `docs/monitoring/AUTO_REMEDIATION.md` (this file)

## Testing

### Manual Test
```bash
# Insert test data to trigger backlog alert
psql $DATABASE_URL -c "INSERT INTO agent_approvals (conversation_id, serialized, status) SELECT gen_random_uuid()::text, '{}'::jsonb, 'pending' FROM generate_series(1, 10001);"

# Run auto-remediation
node scripts/monitoring/auto-remediation.mjs

# Should output: Condition met: queue_depth > 10000
# Action: Scale workers up

# Clean up
psql $DATABASE_URL -c "DELETE FROM agent_approvals WHERE serialized = '{}'::jsonb;"
```

## Metrics

### Remediation Effectiveness
- Success rate: Target > 95%
- Mean time to remediate (MTTR): Target < 5 minutes
- False positive rate: Target < 5%

### System Impact
- Reduced incidents requiring human intervention
- Faster recovery times
- Improved service availability

---

**Evidence**: System operational, dry-run tested, audit trail implemented
**Timestamp**: 2025-10-14T19:05:00Z
