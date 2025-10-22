# Support: Chatwoot Health Checks & SLA Monitoring

**Owner:** Support Agent  
**Last Updated:** 2025-10-19  
**Issue:** #74  
**Status:** Active

## Overview

This runbook documents the Chatwoot health check system, SLA monitoring configuration, webhook retry policies, and escalation procedures for the support pipeline.

## Health Check System

### Scripts

Two health check scripts are available:

1. **Node.js version** (recommended): `scripts/ops/check-chatwoot-health.mjs`
2. **Shell version** (backup): `scripts/ops/check-chatwoot-health.sh`

### Running Health Checks

```bash
# Via npm script (recommended)
npm run ops:check-chatwoot-health

# Direct execution
node scripts/ops/check-chatwoot-health.mjs
./scripts/ops/check-chatwoot-health.sh
```

### Health Check Endpoints

The scripts verify two critical endpoints:

1. **Platform Health**: `/rails/health`
   - Validates Chatwoot service availability
   - No authentication required
   - Expected: HTTP 200

2. **Authenticated API**: `/api/v1/profile`
   - Validates API access and authentication
   - Requires valid API token
   - Expected: HTTP 200 with account details

### Exit Codes

| Code | Meaning                   | Action                           |
| ---- | ------------------------- | -------------------------------- |
| 0    | All checks passed         | No action needed                 |
| 1    | Configuration missing     | Check environment variables      |
| 2    | Rails health check failed | Check Chatwoot service status    |
| 3    | Authenticated API failed  | Verify API token and permissions |
| 4    | All checks failed         | Escalate to on-call immediately  |

### Timeout Configuration

- **Per-endpoint timeout**: 10 seconds
- **Total check duration**: ~20 seconds maximum
- Timeouts are treated as failures

## Environment Configuration

### Required Variables

Create or update `.env` file with:

```bash
# Chatwoot Base Configuration
CHATWOOT_BASE_URL=https://your-chatwoot-instance.com
CHATWOOT_TOKEN=your-api-access-token
CHATWOOT_ACCOUNT_ID=your-account-id

# SLA Configuration
CHATWOOT_SLA_MINUTES=30  # Default: 30 minutes

# Embed Configuration (for widget)
CHATWOOT_EMBED_TOKEN=your-embed-token
```

### Configuration Validation

```bash
# Verify environment variables are set
env | grep CHATWOOT

# Test configuration
npm run ops:check-chatwoot-health
```

## SLA Monitoring

### SLA Threshold

- **Default**: 30 minutes (configurable via `CHATWOOT_SLA_MINUTES`)
- **Used by**: CX Escalations tile, approval queue prioritization
- **Config location**: `app/config/chatwoot.server.ts`

### SLA Breach Detection

Conversations are flagged as SLA breach when:

- First response time exceeds `CHATWOOT_SLA_MINUTES`
- Conversation is still in "open" status
- Customer has sent at least one message

### SLA Warning Levels

| Time Remaining | Priority | Action                  |
| -------------- | -------- | ----------------------- |
| > 15 minutes   | Normal   | Monitor in queue        |
| 5-15 minutes   | Warning  | Prepare response        |
| < 5 minutes    | Urgent   | Immediate attention     |
| Past SLA       | Breach   | Escalate + respond ASAP |

## Webhook System

### Webhook Endpoints

- **Chatwoot → HotDash**: `/api/webhooks/chatwoot`
- **Signature verification**: HMAC-SHA256
- **Retry policy**: Exponential backoff (1s, 2s, 4s, 8s)

### Webhook Event Types

Processed events:

- `message_created` (customer messages only)
- `conversation_status_changed` (open → resolved)

Ignored events:

- Agent messages
- Private notes
- Conversation assignments

### Integration Tests Status

**File**: `tests/integration/agent-sdk-webhook.spec.ts`

**Current Status**: ALL 24 tests marked as `.todo` (not implemented)

**Test Coverage Needed**:

1. Webhook signature verification (3 tests)
2. Event filtering (4 tests)
3. LlamaIndex knowledge retrieval (4 tests)
4. Agent SDK draft generation (4 tests)
5. Chatwoot private note creation (3 tests)
6. Approval queue insertion (4 tests)
7. End-to-end webhook flow (2 tests)

**Action Required**: Implement webhook integration tests per test plan

## Artifacts & Evidence

### Health Check Artifacts

Location: `artifacts/ops/chatwoot-health/`

Files generated:

- `health-check-{timestamp}.json` - Detailed health check results
- Includes: HTTP status, response times, error details, timestamps

### Support Evidence

Location: `artifacts/support/YYYY-MM-DD/`

Required evidence:

- `chatwoot-health.log` - Daily health check outputs
- Test results for webhook reliability
- SLA breach reports

## Outage Response

### Level 1: Health Check Failure (Exit Code 2 or 3)

**Symptoms**: Single endpoint failing, other endpoint healthy

**Actions**:

1. Re-run health check to confirm: `npm run ops:check-chatwoot-health`
2. Check Chatwoot service status page
3. Verify network connectivity
4. Review recent configuration changes
5. If persists > 5 minutes, escalate to Level 2

**Timeline**: Resolve within 15 minutes

### Level 2: Complete Service Failure (Exit Code 4)

**Symptoms**: Both endpoints failing, all health checks return errors

**Actions**:

1. **Immediate**: Post in `#incidents` Slack channel
2. Run diagnostics:
   ```bash
   curl -I $CHATWOOT_BASE_URL/rails/health
   curl -H "api_access_token: $CHATWOOT_TOKEN" $CHATWOOT_BASE_URL/api/v1/profile
   ```
3. Check Chatwoot logs/metrics
4. Escalate to Reliability On-Call
5. Enable fallback: Direct operator email monitoring
6. Post status update every 15 minutes

**Timeline**: Page on-call immediately

### Level 3: Webhook Processing Failure

**Symptoms**: Webhooks timing out, approval queue not updating

**Actions**:

1. Check webhook endpoint health: `/api/webhooks/chatwoot`
2. Review LlamaIndex middleware status
3. Check Agent SDK service connectivity
4. Verify Supabase approval queue writes
5. Check webhook retry queue depth
6. Escalate if retry queue > 50 items

**Timeline**: Resolve within 30 minutes

## Escalation Contacts

| Role                | Contact                       | Escalation Trigger                            |
| ------------------- | ----------------------------- | --------------------------------------------- |
| Support Lead        | Morgan Patel                  | SLA breaches, policy questions                |
| Operations Manager  | Riley Chen                    | Cross-functional blockers, fulfillment issues |
| Reliability On-Call | Slack #incidents              | Service outages, critical errors              |
| Support Desk        | customer.support@hotrodan.com | Access issues, credential problems            |

### Escalation Template

```
**Subject**: Chatwoot Health Check Failure - [Level X]

**Status**: [ONGOING/RESOLVED]
**Started**: [Timestamp]
**Duration**: [Minutes]
**Exit Code**: [0-4]
**Affected**: [Endpoints/Services]

**Symptoms**:
- [Description]

**Actions Taken**:
1. [Action 1]
2. [Action 2]

**Current Status**: [What's happening now]

**Next Steps**: [What's being attempted]

**Impact**: [Customer-facing impact if any]
```

## Maintenance Windows

### Scheduled Maintenance

- **Frequency**: Monthly (2nd Tuesday, 02:00-04:00 UTC)
- **Notification**: 72 hours advance notice
- **During maintenance**:
  - Health checks may return 503 (expected)
  - Webhook queue accumulates (processes after maintenance)
  - Operators notified via dashboard banner

### Post-Maintenance Checklist

1. Run full health check suite
2. Verify webhook processing resumed
3. Check approval queue backlog
4. Confirm SLA monitoring active
5. Document any configuration changes

## Monitoring & Alerts

### Automated Monitoring

- Health check runs every 15 minutes (via cron)
- Results stored in `artifacts/ops/chatwoot-health/`
- Failures trigger Slack alerts (#incidents)

### Key Metrics

Monitor these in dashboard:

- Health check success rate (target: 99.9%)
- Average response time per endpoint (target: < 500ms)
- Webhook processing latency (target: < 3s)
- SLA breach rate (target: < 5%)
- Approval queue depth (alert if > 25)

## Troubleshooting

### Common Issues

**Issue**: `CHATWOOT_BASE_URL environment variable not set`  
**Solution**: Add required variables to `.env` file

**Issue**: `Authenticated API: Failed with HTTP 401`  
**Solution**: Token expired or invalid, rotate in secrets manager

**Issue**: `Connection timeout after 10000ms`  
**Solution**: Check network, Chatwoot service status, firewall rules

**Issue**: Webhook tests all skipped (`.todo`)  
**Solution**: Implement integration tests per test plan in `tests/integration/agent-sdk-webhook.spec.ts`

### Debug Commands

```bash
# Test Chatwoot connectivity
curl -v $CHATWOOT_BASE_URL/rails/health

# Test authenticated access
curl -H "api_access_token: $CHATWOOT_TOKEN" \
     $CHATWOOT_BASE_URL/api/v1/profile | jq

# Check webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/chatwoot \
     -H "Content-Type: application/json" \
     -d '{"event":"message_created"}'

# View recent health check results
ls -lh artifacts/ops/chatwoot-health/ | tail -5

# Run integration tests
npx vitest run tests/integration/agent-sdk-webhook.spec.ts
```

## Related Documentation

- North Star: `docs/NORTH_STAR.md` - Vision and principles
- Operating Model: `docs/OPERATING_MODEL.md` - Process and pipeline
- Specs: `docs/specs/hitl/customer-replies.md` - HITL approval flow
- Direction: `docs/directions/support.md` - Current support tasks
- Issue: GitHub #74 - Chatwoot health checks & SLA gating

## Change Log

- **2025-10-19**: Initial runbook created (Support Agent)
  - Documented health check scripts and procedures
  - Added SLA configuration and monitoring guidelines
  - Defined outage response levels and escalation paths
  - Noted webhook test implementation gap
