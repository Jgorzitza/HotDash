# Support Pipeline - Production Deploy Checklist

## Pre-Deploy Verification

### 1. Environment Configuration

- [ ] `CHATWOOT_BASE_URL` configured and accessible
- [ ] `CHATWOOT_API_KEY` set with correct permissions
- [ ] `CHATWOOT_ACCOUNT_ID` matches production account
- [ ] `AGENT_SDK_URL` points to production Agent SDK
- [ ] `CHATWOOT_WEBHOOK_SECRET` synced with Chatwoot (optional but recommended)
- [ ] Database connection string (`DATABASE_URL`) verified
- [ ] All environment variables set in deployment environment (Fly.io secrets)

**Verify**:

```bash
# Check env vars (without exposing secrets)
fly secrets list -a hotdash-app | grep -E 'CHATWOOT|AGENT_SDK'
```

---

### 2. Chatwoot Health Verification

- [ ] Chatwoot `/rails/health` endpoint returns 200
- [ ] Authenticated API access works (test with API key)
- [ ] Health check script passes

**Verify**:

```bash
npm run ops:check-chatwoot-health
# Expected: "Chatwoot health check OK"
# Exit code: 0
```

---

### 3. Agent SDK Health

- [ ] Agent SDK health endpoint accessible
- [ ] Agent SDK can receive test webhooks
- [ ] Agent SDK version compatible with current integration

**Verify**:

```bash
curl -I https://hotdash-agent-service.fly.dev/health
# Expected: HTTP 200

# Test webhook endpoint
curl -X POST https://hotdash-agent-service.fly.dev/webhooks/chatwoot \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-From: deploy-test" \
  -d '{"event": "test", "test": true}'
# Expected: HTTP 200 or 202
```

---

### 4. Database Schema

- [ ] `dashboard_facts` table exists
- [ ] `customer_grades` table exists (if grading enabled)
- [ ] Indexes created for performance:
  - `dashboard_facts(fact_type, recorded_at)`
  - `customer_grades(created_at)`

**Verify**:

```sql
-- Check tables exist
\dt dashboard_facts customer_grades

-- Check indexes
\di dashboard_facts_*
\di customer_grades_*
```

---

### 5. Code Quality

- [ ] All unit tests passing (`npm run test:unit`)
- [ ] All integration tests passing (`npm run test:integration`)
- [ ] Support webhook tests passing (16+ tests)
- [ ] No linter errors (`npm run lint`)
- [ ] Code formatted (`npm run fmt`)
- [ ] Security scan clean (`npm run scan`)

**Verify**:

```bash
npm run test:unit
npm run lint
npm run scan
npx vitest run tests/integration/support.webhook.spec.ts
```

---

## Deploy Steps

### 1. Build & Deploy Application

```bash
# Build application
npm run build

# Deploy to production
fly deploy -a hotdash-app

# Wait for deployment to complete
fly status -a hotdash-app
```

---

### 2. Configure Webhook Endpoints

- [ ] Update Chatwoot webhook URL: `https://YOUR_DOMAIN/api/webhooks/chatwoot`
- [ ] Enable webhook events:
  - `message_created`
  - `conversation_status_changed`
  - `conversation_resolved`
- [ ] Set webhook secret (if using signature verification)
- [ ] Activate webhook

**Steps in Chatwoot**:

1. Navigate to Settings → Integrations → Webhooks
2. Create new webhook or update existing
3. URL: `https://hotdash.yourdomain.com/api/webhooks/chatwoot`
4. Events: Select `message_created`, `conversation_status_changed`
5. Secret: Copy from environment variable
6. Save and activate

---

### 3. Verify Webhook Delivery

- [ ] Send test message in Chatwoot
- [ ] Check HotDash logs for webhook received
- [ ] Verify webhook forwarded to Agent SDK
- [ ] Confirm metrics recorded in database

**Verify**:

```bash
# Watch logs
fly logs -a hotdash-app --tail

# Send test message in Chatwoot, look for:
# [support.webhook] Forwarding Chatwoot webhook
# [support.webhook] Webhook forwarded successfully

# Check metrics
psql $DATABASE_URL -c "SELECT COUNT(*) FROM dashboard_facts WHERE fact_type = 'support.webhook.retry' AND recorded_at > NOW() - INTERVAL '5 minutes';"
```

---

### 4. Monitor Initial Traffic

- [ ] Monitor webhook success rate (target: >95%)
- [ ] Check for DLQ entries (should be 0)
- [ ] Verify average response time (<500ms)
- [ ] Confirm no errors in logs

**Monitor for 15 minutes**:

```sql
-- Success rate
SELECT
  ROUND(100.0 * SUM(CASE WHEN value->>'success' = 'true' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate,
  COUNT(*) as total,
  AVG((value->>'durationMs')::numeric) as avg_duration_ms
FROM dashboard_facts
WHERE fact_type = 'support.webhook.retry'
  AND recorded_at > NOW() - INTERVAL '15 minutes';

-- Check for DLQ entries
SELECT COUNT(*) as dlq_count
FROM dashboard_facts
WHERE fact_type = 'support.webhook.dead_letter'
  AND recorded_at > NOW() - INTERVAL '15 minutes';
```

---

## Post-Deploy Verification

### 1. End-to-End Test

- [ ] Create test conversation in Chatwoot
- [ ] Send test message from "customer"
- [ ] Verify webhook triggers
- [ ] Confirm AI draft generated (if applicable)
- [ ] Check draft appears in Chatwoot as private note
- [ ] Verify metrics recorded

**Manual Test**:

1. Open Chatwoot inbox
2. Create new conversation
3. Send message as customer
4. Wait 5-10 seconds
5. Check for private note from AI agent
6. Verify no errors in logs

---

### 2. Monitoring Setup

- [ ] Webhook success rate dashboard active
- [ ] DLQ alerts configured
- [ ] Health check cron job scheduled
- [ ] Weekly health report scheduled
- [ ] Escalation procedures documented

**Health Check Cron**:

```bash
# Add to crontab or CI/CD
# Run every 5 minutes
*/5 * * * * cd /path/to/hotdash && npm run ops:check-chatwoot-health >> /var/log/chatwoot-health.log 2>&1
```

**Weekly Report Cron**:

```bash
# Run every Monday at 9 AM
0 9 * * 1 cd /path/to/hotdash && node scripts/support/weekly-health.mjs >> /var/log/support-health.log 2>&1
```

---

### 3. Performance Baseline

- [ ] Record baseline metrics:
  - Webhook success rate: **\_**%
  - Average response time: **\_**ms
  - Requests per minute: **\_**
  - DLQ entries per day: **\_**

**Capture Baseline**:

```sql
-- Save as baseline for comparison
CREATE TABLE IF NOT EXISTS support_baseline (
  captured_at timestamp DEFAULT NOW(),
  success_rate numeric,
  avg_response_ms numeric,
  requests_per_minute numeric,
  daily_dlq_count integer
);

INSERT INTO support_baseline (success_rate, avg_response_ms, requests_per_minute, daily_dlq_count)
SELECT
  ROUND(100.0 * SUM(CASE WHEN value->>'success' = 'true' THEN 1 ELSE 0 END) / COUNT(*), 2),
  ROUND(AVG((value->>'durationMs')::numeric), 0),
  ROUND(COUNT(*) / 60.0, 2),
  (SELECT COUNT(*) FROM dashboard_facts WHERE fact_type = 'support.webhook.dead_letter' AND recorded_at > NOW() - INTERVAL '24 hours')
FROM dashboard_facts
WHERE fact_type = 'support.webhook.retry'
  AND recorded_at > NOW() - INTERVAL '1 hour';
```

---

### 4. Documentation Update

- [ ] Update runbook with production URLs
- [ ] Document any deployment-specific configurations
- [ ] Record baseline metrics
- [ ] Update incident escalation contacts
- [ ] Share deployment summary with team

---

## Rollback Plan

If issues detected:

### Immediate Actions

1. **Disable Chatwoot webhook**:
   - Deactivate in Chatwoot settings
   - Stops new webhook traffic

2. **Check recent DLQ entries**:

   ```sql
   SELECT * FROM dashboard_facts
   WHERE fact_type = 'support.webhook.dead_letter'
   ORDER BY recorded_at DESC
   LIMIT 10;
   ```

3. **Review error patterns**:
   ```sql
   SELECT
     value->>'lastError' as error,
     COUNT(*) as occurrences
   FROM dashboard_facts
   WHERE fact_type = 'support.webhook.dead_letter'
     AND recorded_at > NOW() - INTERVAL '1 hour'
   GROUP BY value->>'lastError';
   ```

### Rollback Deployment

```bash
# Rollback to previous version
fly releases -a hotdash-app
# Note the previous version number
fly releases rollback v<previous_version> -a hotdash-app

# Verify rollback
fly status -a hotdash-app
```

### Post-Rollback

- [ ] Re-enable Chatwoot webhook to previous URL (if different)
- [ ] Verify webhook delivery working
- [ ] Document issues encountered
- [ ] Create post-mortem
- [ ] Fix issues before next deploy

---

## Success Criteria

Deploy is successful when:

- ✅ Webhook success rate > 95% for 30 minutes
- ✅ Zero DLQ entries
- ✅ Average response time < 500ms
- ✅ End-to-end test passes
- ✅ No errors in logs for 30 minutes
- ✅ Health checks passing
- ✅ Monitoring dashboards active

---

## Support Contacts

| Issue            | Contact                         | Response Time |
| ---------------- | ------------------------------- | ------------- |
| Webhook failures | Engineering                     | 15 minutes    |
| Chatwoot down    | Infrastructure/Chatwoot Support | 30 minutes    |
| Agent SDK issues | AI Team                         | 15 minutes    |
| Database issues  | DevOps                          | 10 minutes    |

---

## Revision History

- 2025-10-19: Initial production deploy checklist
