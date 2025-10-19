# Support - Chatwoot Webhooks + Health Reports

> Webhook reliability. Health monitoring. No dropped messages. Reports daily.

**Issue**: #111 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: app/services/support/**, app/routes/api.webhooks.**, tests/unit/support/\*\*

## Constraints

- MCP Tools: MANDATORY for framework patterns
  - `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
  - Direct Chatwoot API (no MCP for Chatwoot)
- Framework: React Router 7 (NOT Remix) - use loaders/actions for webhooks
- CLI Tools: Chatwoot API with token from vault
- Webhook reliability: 99.9% delivery success
- Retry policy: 3 attempts with exponential backoff
- Feature flag: CHATWOOT_LIVE controls mock vs real

## Definition of Done

- [ ] Chatwoot webhook endpoint operational
- [ ] Retry policy implemented and tested
- [ ] Health reports generated daily
- [ ] Support dashboard tile showing queue stats
- [ ] All webhook tests passing
- [ ] Evidence: Webhooks processing, health report

## Production Molecules

### SUP-001: Chatwoot Webhook Endpoint (35 min)

**File**: app/routes/api.webhooks.chatwoot.tsx
**MCP**: `mcp_context7_get-library-docs` (library: `/remix-run/react-router`, topic: "actions server-side")

**React Router 7 Action Pattern**:

```typescript
import type { Route } from "./+types/api.webhooks.chatwoot";

export async function action({ request }: Route.ActionArgs) {
  // Server-side webhook processing
  const payload = await request.json();
  await processWebhook(payload);
  return { received: true };
}
```

**Events**: message_created, conversation_status_changed
**Validation**: HMAC signature verification
**Evidence**: Webhook receiving events

### SUP-002: Webhook Retry Policy (30 min)

**File**: app/services/support/webhook-retry.ts
**Strategy**: Exponential backoff (1s, 2s, 4s)
**Max attempts**: 3
**Dead letter queue**: Log failures for manual review
**Evidence**: Retries working

### SUP-003: Message Processing Pipeline (35 min)

**File**: app/services/support/message-processor.ts
**Actions**: Parse message, extract intent, route to AI-Customer
**Coordinate**: AI-Customer agent for drafting
**Evidence**: Messages processed end-to-end

### SUP-004: Health Check Endpoint (25 min)

**File**: app/routes/api.support.health.ts
**Checks**: Chatwoot API accessible, webhook endpoint reachable, queue depth
**Cache**: 5 min TTL
**Evidence**: Health endpoint returning status

### SUP-005: Daily Health Reports (40 min)

**File**: scripts/support/daily-health-report.mjs
**Metrics**: Messages received, processed, failed, avg response time
**Schedule**: Daily 9am UTC
**Output**: reports/support/YYYY-MM-DD.md
**Evidence**: Report generated

### SUP-006: Support Dashboard Tile (30 min)

**File**: app/components/dashboard/SupportQueueTile.tsx
**Display**: Pending count, avg wait time, SLA status
**States**: Loading, error, data
**Evidence**: Tile rendering

### SUP-007: Webhook Signature Verification (25 min)

**File**: app/services/support/webhook-auth.ts
**Verify**: HMAC-SHA256 signature from Chatwoot
**Reject**: Invalid signatures (security)
**Evidence**: Only valid webhooks processed

### SUP-008: Queue Depth Monitoring (25 min)

**File**: app/services/support/queue-monitor.ts
**Alert**: If queue >50 pending
**Escalate**: Notify manager if >100
**Evidence**: Monitoring active

### SUP-009: Conversation Tagging (30 min)

**File**: app/services/chatwoot-tagger.ts
**Auto-tag**: Based on message content (urgent, billing, shipping)
**Evidence**: Tags applied correctly

### SUP-010: SLA Tracking (30 min)

**File**: app/lib/support/sla-tracker.ts
**SLA**: First response <15 min (during business hours)
**Report**: SLA compliance percentage
**Evidence**: SLA tracked

### SUP-011: Escalation Logic (25 min)

**File**: app/services/support/escalator.ts
**Triggers**: Angry language, VIP customer, SLA breach
**Action**: Flag for immediate human review
**Evidence**: Escalations working

### SUP-012: Contract Tests - Chatwoot (20 min)

**File**: tests/unit/support/chatwoot-webhook.spec.ts
**Verify**: Webhook payload shapes
**Evidence**: Contracts passing

### SUP-013: Documentation (20 min)

**File**: docs/runbooks/support_webhooks.md
**Include**: Webhook setup, retry policy, troubleshooting
**Evidence**: Docs complete

### SUP-014: Performance Monitoring (20 min)

**Monitor**: Webhook processing time, retry rates, failure rates
**Alert**: If processing >1s per message
**Evidence**: Monitoring active

### SUP-015: WORK COMPLETE Block (10 min)

**Update**: feedback/support/2025-10-19.md
**Include**: Webhooks operational, retries working, health reports daily
**Evidence**: Feedback entry

## Foreground Proof

1. api.webhooks.chatwoot.tsx endpoint
2. webhook-retry.ts implementation
3. message-processor.ts pipeline
4. api.support.health.ts endpoint
5. daily-health-report.mjs script
6. SupportQueueTile.tsx component
7. webhook-auth.ts signature verification
8. queue-monitor.ts alerts
9. chatwoot-tagger.ts logic
10. sla-tracker.ts implementation
11. escalator.ts logic
12. Contract tests passing
13. support_webhooks.md docs
14. Performance monitoring
15. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~6 hours
**SUCCESS**: 99.9% webhook reliability, health reports daily, no dropped messages
