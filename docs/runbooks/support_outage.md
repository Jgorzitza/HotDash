# Support Outage Response Runbook

## Purpose

This runbook provides step-by-step procedures for handling support infrastructure outages, including Chatwoot downtime, webhook failures, and Agent SDK issues.

## Severity Levels

- **P0 Critical**: Complete support system down, customers cannot contact us
- **P1 High**: Partial outage, degraded service (e.g., AI responses offline but manual works)
- **P2 Medium**: Non-critical component failure (e.g., metrics not recording)

## 1. Chatwoot Down Procedure

### Detection

- Health check fails: `npm run ops:check-chatwoot-health` exits non-zero
- Dashboard shows "Chatwoot Offline"
- Customers report email/chat unavailable

### Immediate Response (5 minutes)

1. **Verify outage scope**:

   ```bash
   curl -I https://YOUR_CHATWOOT_URL/rails/health
   # Check status code (should be 200)
   ```

2. **Check Chatwoot status page** (if applicable)

3. **Enable fallback mode**:
   - Post notice in #support Slack channel
   - Direct customers to email fallback: support@hotrodan.com
   - Update status page if applicable

### Investigation (15 minutes)

1. **Check logs**:

   ```bash
   # Chatwoot container logs (if self-hosted)
   docker logs chatwoot-web --tail 100

   # Or check artifacts
   ls -lt artifacts/ops/chatwoot_health_*.json | head -5
   cat artifacts/ops/chatwoot_health_TIMESTAMP.json
   ```

2. **Verify connectivity**:

   ```bash
   ping chatwoot.domain.com
   nslookup chatwoot.domain.com
   ```

3. **Check dependent services**:
   - Database (PostgreSQL)
   - Redis
   - Email delivery (SMTP)
   - File storage (if applicable)

### Escalation

- **After 10 minutes**: Notify manager + CEO
- **After 30 minutes**: If self-hosted, contact infrastructure team
- **If SaaS**: Open support ticket with Chatwoot

### Recovery

1. **Service restored**:

   ```bash
   npm run ops:check-chatwoot-health
   # Should exit 0
   ```

2. **Verify webhook delivery**:
   - Send test message
   - Check `app/routes/api/webhooks.chatwoot.ts` logs
   - Verify Agent SDK receives webhook

3. **Check queue backlog**:
   - Review pending conversations
   - Prioritize by SLA breach risk
   - Assign to available agents

4. **Post-mortem** (within 24 hours):
   - Root cause analysis
   - Timeline documentation
   - Preventive measures

---

## 2. Webhook Failure Escalation

### Detection

- Dead letter queue entries in `dashboard_facts` table:
  ```sql
  SELECT * FROM dashboard_facts
  WHERE fact_type = 'support.webhook.dead_letter'
  ORDER BY recorded_at DESC
  LIMIT 10;
  ```
- Webhook retry metrics show 100% failure rate
- Agent SDK not receiving webhooks

### Immediate Response (3 minutes)

1. **Check Agent SDK status**:

   ```bash
   curl -I https://hotdash-agent-service.fly.dev/health
   # Should return 200
   ```

2. **Review recent webhook logs**:

   ```bash
   # From server logs or Fly.io
   fly logs -a hotdash-agent-service --tail 50
   ```

3. **Verify webhook signature** (if enabled):
   - Check `CHATWOOT_WEBHOOK_SECRET` environment variable
   - Compare with Chatwoot webhook configuration

### Investigation (10 minutes)

1. **Check retry metrics**:

   ```sql
   SELECT
     value->>'attempts' as attempts,
     value->>'success' as success,
     value->>'finalStatus' as final_status,
     COUNT(*) as count
   FROM dashboard_facts
   WHERE fact_type = 'support.webhook.retry'
     AND recorded_at > NOW() - INTERVAL '1 hour'
   GROUP BY value->>'attempts', value->>'success', value->>'finalStatus';
   ```

2. **Inspect DLQ entries**:

   ```sql
   SELECT
     value->'payload' as payload,
     value->>'attempts' as attempts,
     value->>'lastError' as error,
     metadata->>'timestamp' as timestamp
   FROM dashboard_facts
   WHERE fact_type = 'support.webhook.dead_letter'
   ORDER BY recorded_at DESC
   LIMIT 5;
   ```

3. **Test webhook endpoint manually**:
   ```bash
   curl -X POST https://hotdash-agent-service.fly.dev/webhooks/chatwoot \
     -H "Content-Type: application/json" \
     -H "X-Forwarded-From: hotdash-app" \
     -d '{"event": "message_created", "test": true}'
   ```

### Recovery

1. **Replay failed webhooks** (if needed):
   - Extract payloads from DLQ
   - Re-POST to Agent SDK endpoint after issue resolved
   - Verify successful processing

2. **Monitor webhook health** (30 minutes):
   ```bash
   # Watch retry metrics
   watch -n 10 "psql -c \"SELECT COUNT(*) FROM dashboard_facts WHERE fact_type = 'support.webhook.retry' AND recorded_at > NOW() - INTERVAL '5 minutes'\""
   ```

---

## 3. Fallback Manual Mode

When automation fails, switch to manual operation:

### Email-Only Mode

1. **Configure email forwarding**:
   - Disable Chatwoot webhook delivery
   - Forward support@ emails directly to team inbox
   - Use email client templates for common responses

2. **Manual tracking**:
   - Create spreadsheet: `Ticket ID | Customer | Issue | Status | Response Time`
   - Log all interactions
   - Track SLA manually

3. **Communication**:
   - Inform customers of slower response times
   - Set expectations: "We're experiencing technical issues, responses may be delayed"

### Restore Automation Checklist

- [ ] Chatwoot `/rails/health` returns 200
- [ ] Authenticated API probe succeeds
- [ ] Webhook test message delivered
- [ ] Agent SDK health check passes
- [ ] Manual test conversation completes end-to-end
- [ ] SLA monitoring re-enabled
- [ ] Team notified of restoration

---

## 4. Recovery Checklist

### Post-Outage Verification

- [ ] All health checks green for 15+ minutes
- [ ] No new DLQ entries
- [ ] Webhook retry success rate > 95%
- [ ] Test end-to-end flow:
  - Create test conversation in Chatwoot
  - Verify webhook delivery
  - Confirm AI draft appears in Chatwoot as private note
  - Approve and publish reply
  - Verify reply sent to customer
- [ ] Check queue backlog cleared
- [ ] Review SLA adherence for affected period

### Documentation

1. **Incident report**:
   - Start time
   - Detection method
   - Root cause
   - Resolution steps
   - Duration of impact
   - Affected conversations count
   - SLA breaches

2. **Preventive actions**:
   - Configuration changes
   - Monitoring improvements
   - Process updates
   - Runbook refinements

### Stakeholder Communication

- [ ] Notify manager/CEO of resolution
- [ ] Update status page
- [ ] Send internal incident summary
- [ ] Customer communication (if warranted)

---

## 5. Emergency Contacts

| Role                            | Contact | When to Escalate     |
| ------------------------------- | ------- | -------------------- |
| Support Lead                    | TBD     | P1+ after 10 min     |
| Engineering Manager             | TBD     | P0 immediately       |
| CEO                             | TBD     | P0 after 15 min      |
| Infrastructure (if self-hosted) | TBD     | Chatwoot server down |

---

## 6. Monitoring & Alerts

### Key Metrics to Watch

- Chatwoot health check status (every 5 minutes)
- Webhook delivery success rate (target: >98%)
- Dead letter queue size (alert if >5 entries/hour)
- Average response time (alert if >20 minutes)
- SLA breach count (alert if any)

### Alert Thresholds

- **P0**: Chatwoot health failed for 2 consecutive checks
- **P1**: Webhook success rate < 80% over 10 minutes
- **P2**: DLQ entries > 10 in 1 hour

---

## Revision History

- 2025-10-19: Initial version - Support outage procedures
