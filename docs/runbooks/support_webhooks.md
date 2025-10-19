# Support Webhooks Runbook

## Purpose

- Ensure Chatwoot webhooks are accepted, verified, and forwarded to the Agent SDK safely.
- Provide operators with the retry policy, monitoring, and troubleshooting procedures for the pipeline.

---

## Architecture

### Components

```
Chatwoot → HotDash App (/api/webhooks/chatwoot) → Agent SDK (/webhooks/chatwoot)
                ↓                                          ↓
          Retry Logic                              AI Processing
          Dead Letter Queue                        Draft Generation
          Metrics Recording
```

### Data Flow

1. **Chatwoot sends webhook** when message created/updated
2. **HotDash receives** at `/api/webhooks/chatwoot`
3. **Signature verification** (if `CHATWOOT_WEBHOOK_SECRET` set)
4. **Forward to Agent SDK** with retry logic
5. **Agent SDK processes** and generates AI draft
6. **Draft posted** as Chatwoot private note
7. **Metrics recorded** for monitoring

### Key Files

- `app/routes/api/webhooks.chatwoot.ts` - Webhook receiver endpoint
- `app/services/support/webhook.server.ts` - Retry logic & DLQ
- `app/services/support/chatwoot-client.ts` - Chatwoot API client
- `tests/integration/support.webhook.spec.ts` - Integration tests

---

## Retry Policy

### Configuration

- **Endpoint**: `POST /api/webhooks/chatwoot` forwards to `${AGENT_SDK_URL}/webhooks/chatwoot`
- **Default Agent SDK URL**: `https://hotdash-agent-service.fly.dev`
- **Max Attempts**: 3 (configurable via `CHATWOOT_WEBHOOK_MAX_ATTEMPTS`)
- **Base Delay**: 200ms (configurable via `CHATWOOT_WEBHOOK_BASE_DELAY_MS`)
- **Backoff Factor**: 2x (configurable via `CHATWOOT_WEBHOOK_BACKOFF_FACTOR`)

### Retry Behavior

| Attempt     | Delay Before | Cumulative Time |
| ----------- | ------------ | --------------- |
| 1 (initial) | 0ms          | 0ms             |
| 2 (retry 1) | 200ms        | 200ms           |
| 3 (retry 2) | 400ms        | 600ms           |

### Retryable Conditions

✅ **Will Retry:**

- HTTP 500, 502, 503, 504 (server errors)
- HTTP 429 (rate limiting)
- Network errors (timeout, connection refused)
- DNS resolution failures

❌ **Will NOT Retry:**

- HTTP 400, 401, 403, 404, 422 (client errors)
- HTTP 200-299 (success)
- Invalid configuration errors

### Failure Handling

After exhausting all retries:

1. **Metrics recorded** (`support.webhook.retry`, `success: false`)
2. **Dead Letter Queue** entry created (`support.webhook.dead_letter`)
3. **ServiceError thrown** with `retryable: true`
4. **HTTP 500 returned** to Chatwoot

---

## Metrics & Monitoring

### Recorded Metrics

All metrics stored in `dashboard_facts` table:

#### 1. Retry Metrics

```sql
SELECT
  value->>'attempts' as attempts,
  value->>'success' as success,
  value->>'durationMs' as duration_ms,
  value->>'finalStatus' as status
FROM dashboard_facts
WHERE fact_type = 'support.webhook.retry'
ORDER BY recorded_at DESC
LIMIT 10;
```

#### 2. Dead Letter Queue

```sql
SELECT
  value->'payload' as original_payload,
  value->>'attempts' as attempts,
  value->>'lastError' as error,
  metadata->>'timestamp' as failed_at
FROM dashboard_facts
WHERE fact_type = 'support.webhook.dead_letter'
ORDER BY recorded_at DESC;
```

### Health Checks

Run automated health check:

```bash
npm run ops:check-chatwoot-health
```

Expected output:

```
Chatwoot health check OK → artifacts/ops/chatwoot_health_TIMESTAMP.json
  /rails/health: OK (200)
  authenticated API: OK (200)
```

### Alert Thresholds

- **Critical**: Success rate < 80% over 15 minutes
- **Warning**: DLQ entries > 5 in 1 hour
- **Info**: Average attempts > 1.5

---

## Verification Steps

### 1. Environment Configuration

```bash
# Required environment variables
CHATWOOT_BASE_URL=https://your-chatwoot.com
CHATWOOT_API_KEY=your-api-key
CHATWOOT_ACCOUNT_ID=1
AGENT_SDK_URL=https://hotdash-agent-service.fly.dev

# Optional
CHATWOOT_WEBHOOK_SECRET=your-secret
CHATWOOT_WEBHOOK_MAX_ATTEMPTS=3
CHATWOOT_WEBHOOK_BASE_DELAY_MS=200
```

### 2. Manual Webhook Test

```bash
# Send test webhook
curl -X POST http://localhost:8788/api/webhooks/chatwoot \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-From: chatwoot-test" \
  -d '{
    "event": "message_created",
    "id": 12345,
    "content": "Test message",
    "message_type": 0,
    "conversation": {"id": 1}
  }'
```

Expected response: HTTP 200

### 3. Check Logs

Look for successful forwarding:

```
[support.webhook] Forwarding Chatwoot webhook { attempt: 1, agentEndpoint: '...' }
[support.webhook] Webhook forwarded successfully { duration: 145, attempts: 1 }
```

### 4. Verify Metrics

```sql
-- Check recent webhook activity
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN value->>'success' = 'true' THEN 1 ELSE 0 END) as successful,
  AVG((value->>'attempts')::int) as avg_attempts
FROM dashboard_facts
WHERE fact_type = 'support.webhook.retry'
  AND recorded_at > NOW() - INTERVAL '1 hour';
```

---

## Troubleshooting

### Issue: Webhooks Not Received

**Symptoms**: No webhook logs in HotDash

**Diagnosis**:

1. Check Chatwoot webhook configuration:
   - URL: `https://your-hotdash.com/api/webhooks/chatwoot`
   - Events: `message_created`, `conversation_status_changed`
   - Active: ✓
2. Verify network connectivity from Chatwoot to HotDash
3. Check firewall rules

**Resolution**:

- Update webhook URL in Chatwoot settings
- Test with `curl` from Chatwoot server
- Review load balancer/proxy logs

### Issue: High Retry Rate

**Symptoms**: `avg_attempts > 1.5` consistently

**Diagnosis**:

```sql
-- Check failure reasons
SELECT
  value->>'finalStatus' as status,
  COUNT(*) as count
FROM dashboard_facts
WHERE fact_type = 'support.webhook.retry'
  AND value->>'success' = 'false'
  AND recorded_at > NOW() - INTERVAL '1 hour'
GROUP BY value->>'finalStatus';
```

**Resolution**:

- If 503 errors: Agent SDK may be overloaded or down
  - Check Agent SDK health: `curl https://hotdash-agent-service.fly.dev/health`
  - Review Agent SDK logs: `fly logs -a hotdash-agent-service`
- If 429 errors: Rate limiting triggered
  - Reduce webhook frequency
  - Increase Agent SDK capacity
- If network errors: DNS/connectivity issues
  - Test: `ping hotdash-agent-service.fly.dev`
  - Check DNS resolution

### Issue: Dead Letter Queue Growing

**Symptoms**: DLQ entries increasing

**Diagnosis**:

```sql
-- Recent DLQ entries
SELECT
  value->>'lastError' as error,
  COUNT(*) as occurrences
FROM dashboard_facts
WHERE fact_type = 'support.webhook.dead_letter'
  AND recorded_at > NOW() - INTERVAL '24 hours'
GROUP BY value->>'lastError'
ORDER BY occurrences DESC;
```

**Resolution**:

1. Identify root cause from `lastError`
2. Fix underlying issue (Agent SDK, network, config)
3. Replay failed webhooks:
   ```sql
   -- Extract failed payloads
   SELECT value->'payload' FROM dashboard_facts
   WHERE fact_type = 'support.webhook.dead_letter'
   ORDER BY recorded_at DESC;
   ```
4. Manually POST to Agent SDK after fix verified

### Issue: Signature Verification Failing

**Symptoms**: 401 responses, "Invalid signature" errors

**Diagnosis**:

- Verify `CHATWOOT_WEBHOOK_SECRET` matches Chatwoot configuration
- Check webhook payload format

**Resolution**:

```bash
# Re-sync webhook secret
# 1. Get secret from Chatwoot settings
# 2. Update HotDash environment
fly secrets set CHATWOOT_WEBHOOK_SECRET=your-secret -a hotdash-app

# 3. Restart app
fly apps restart hotdash-app
```

---

## Monitoring & Alerts

### Dashboard Queries

**Success Rate (Last Hour)**:

```sql
SELECT
  ROUND(
    100.0 * SUM(CASE WHEN value->>'success' = 'true' THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) as success_rate_pct
FROM dashboard_facts
WHERE fact_type = 'support.webhook.retry'
  AND recorded_at > NOW() - INTERVAL '1 hour';
```

**Average Response Time**:

```sql
SELECT
  ROUND(AVG((value->>'durationMs')::numeric), 0) as avg_ms
FROM dashboard_facts
WHERE fact_type = 'support.webhook.retry'
  AND value->>'success' = 'true'
  AND recorded_at > NOW() - INTERVAL '1 hour';
```

**DLQ Size (Last 24h)**:

```sql
SELECT COUNT(*) as dlq_entries
FROM dashboard_facts
WHERE fact_type = 'support.webhook.dead_letter'
  AND recorded_at > NOW() - INTERVAL '24 hours';
```

### Alerts Setup

Create alerts in monitoring system:

- **P0**: Webhook success rate < 50% for 10 minutes
- **P1**: Webhook success rate < 80% for 15 minutes
- **P2**: DLQ entries > 10 in 1 hour
- **Info**: Agent SDK response time > 2 seconds

---

## Escalation

### When to Escalate

- DLQ entries > 20 in 1 hour
- Success rate < 70% for > 30 minutes
- Agent SDK down for > 5 minutes
- Customer replies stalled > 30 minutes

### Escalation Steps

1. **Gather evidence**:
   - Recent DLQ entries
   - Error patterns from metrics
   - Agent SDK health status
   - Chatwoot health check results

2. **Create incident**:
   - File in `reports/manager/ESCALATION.md`
   - Include timestamp, error logs, attempted fixes
   - Tag: `support`, `webhook`, `p0/p1/p2`

3. **Notify stakeholders**:
   - Engineering Manager (P1+)
   - AI-Customer lane (if draft generation affected)
   - CEO (P0 only)

4. **Follow runbook**: `docs/runbooks/support_outage.md`

---

## References

- Architecture: `docs/NORTH_STAR.md` - Support pipeline section
- Outage Response: `docs/runbooks/support_outage.md`
- Agent SDK: `https://github.com/hotrodan/hotdash-agent-service`
- Chatwoot API: `https://www.chatwoot.com/docs/product/channels/api/webhooks`

---

## Revision History

- 2025-10-19: Complete documentation with architecture, troubleshooting, monitoring
- Initial: Retry policy and basic verification
