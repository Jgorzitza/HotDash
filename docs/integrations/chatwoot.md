# Chatwoot Integration

**Status:** Production Ready  
**Owner:** AI-Customer Agent  
**Last Updated:** 2025-10-19

## Overview

Chatwoot is Hot Rod AN's customer communication platform providing:
- **Email Support** (primary channel)
- **Website Live Chat** (embedded widget)
- **Twilio SMS** (future integration)

All customer interactions flow through the HITL (Human-In-The-Loop) approval system with AI-drafted responses as Private Notes that require human approval before becoming public replies.

## Architecture

```
Customer Message → Chatwoot → Webhook → Hot Dash API → Agent SDK → AI Draft (Private Note) → CEO Review → Approved Public Reply
```

### Components

1. **Chatwoot Instance**
   - Self-hosted or Chatwoot Cloud
   - Rails application providing `/rails/health` endpoint
   - REST API for programmatic access

2. **Webhook Receiver** (`app/routes/api.webhooks.chatwoot.tsx`)
   - Receives webhooks from Chatwoot
   - Verifies HMAC SHA-256 signatures
   - Forwards to Agent SDK service

3. **Agent SDK Service** (separate deployment)
   - OpenAI Agents SDK implementation
   - Triage, Order Support, and Product QA agents
   - Creates Private Notes with AI suggestions

4. **Escalation Action** (`app/routes/actions/chatwoot.escalate.ts`)
   - HITL approval UI
   - Captures grading metadata (tone/accuracy/policy)
   - Logs decisions to Supabase

## Environment Variables

Required environment variables for Chatwoot integration:

```bash
# Chatwoot API Configuration
CHATWOOT_BASE_URL=https://your-chatwoot-instance.com
CHATWOOT_TOKEN=your-api-access-token
CHATWOOT_API_TOKEN=your-api-access-token  # Alias for CHATWOOT_TOKEN
CHATWOOT_ACCOUNT_ID=1

# Webhook Security
CHATWOOT_WEBHOOK_SECRET=your-webhook-secret

# Optional
CHATWOOT_SLA_MINUTES=30  # Default: 30 minutes
CHATWOOT_EMBED_TOKEN=your-embed-token
```

### Obtaining Credentials

1. **API Access Token**
   - Log into Chatwoot Admin
   - Navigate to Settings → Integrations → API
   - Generate or copy your access token

2. **Account ID**
   - Found in URL: `https://chatwoot.com/app/accounts/{ACCOUNT_ID}/`
   - Or via API: `GET /api/v1/accounts` (returns list with IDs)

3. **Webhook Secret**
   - Navigate to Settings → Webhooks
   - Create webhook pointing to `https://your-app.com/api/webhooks/chatwoot`
   - Copy the generated secret

## Health Checks

### Automated Health Monitoring

Two complementary health check scripts verify Chatwoot availability:

#### 1. Node.js Script (Primary)

```bash
npm run ops:check-chatwoot-health
# or
./scripts/ops/check-chatwoot-health.mjs
```

**Exit Codes:**
- `0` - All checks pass (healthy)
- `1` - Configuration missing (env vars not set)
- `2` - Rails health endpoint failed
- `3` - Authenticated API access failed
- `4` - Both checks failed

#### 2. Shell Script (Alternative)

```bash
./scripts/ops/check-chatwoot-health.sh
```

Same exit codes and behavior as Node.js script, useful for CI/CD environments without Node.

### What Gets Checked

1. **Rails Platform Health** (`/rails/health`)
   - Verifies Chatwoot's Rails application is running
   - Expected response: HTTP 200 OK
   - Timeout: 10 seconds

2. **Authenticated API Access** (`/api/v1/profile`)
   - Verifies API token is valid
   - Tests authenticated request flow
   - Returns account ID and name
   - Timeout: 10 seconds

### Health Check Artifacts

Results are saved to `artifacts/ops/chatwoot-health/`:

```json
{
  "timestamp": "2025-10-19T20:00:00Z",
  "baseUrl": "https://chatwoot.hotrodan.com",
  "checks": [
    {
      "name": "rails_health",
      "status": "pass",
      "httpStatus": 200,
      "duration": "142ms"
    },
    {
      "name": "authenticated_api",
      "status": "pass",
      "httpStatus": 200,
      "duration": "238ms",
      "accountId": 1,
      "accountName": "Hot Rod AN"
    }
  ],
  "summary": {
    "total": 2,
    "passed": 2,
    "failed": 0
  }
}
```

### Integration with Startup Checklist

Health checks are part of the Manager Startup Checklist:

```bash
# In docs/runbooks/manager_startup_checklist.md
- [ ] Chatwoot API reachable (`npm run ops:check-chatwoot-health`)
```

Before approving any customer-facing work, verify:
1. Health checks passing (exit code 0)
2. Response times < 5 seconds
3. Artifact saved successfully

### Monitoring & Alerting

**Success Criteria (North Star):**
- Chatwoot `/rails/health` + authenticated probes pass **100%** during launch week
- Daily scripted health checks confirm availability before CX work

**Failure Response:**
1. Check artifact logs for error details
2. Verify environment variables are set correctly
3. Test Chatwoot instance directly in browser
4. Check network connectivity
5. Escalate to integrations agent if instance is down

## API Endpoints Used

### Profile Endpoint
```
GET /api/v1/profile
Headers:
  api_access_token: {YOUR_TOKEN}

Response (200):
{
  "id": 1,
  "name": "Agent Name",
  "email": "agent@example.com",
  "account_id": 1,
  ...
}
```

### Conversations Endpoint
```
GET /api/v1/accounts/{account_id}/conversations
Headers:
  api_access_token: {YOUR_TOKEN}

Response (200):
{
  "data": {
    "meta": { ... },
    "payload": [ ... conversations ... ]
  }
}
```

### Messages Endpoint
```
POST /api/v1/accounts/{account_id}/conversations/{conversation_id}/messages
Headers:
  api_access_token: {YOUR_TOKEN}
Content-Type: application/json

Body:
{
  "content": "Reply message",
  "message_type": "outgoing",
  "private": false
}
```

### Private Notes
```
POST /api/v1/accounts/{account_id}/conversations/{conversation_id}/messages
Body:
{
  "content": "AI-generated draft for review",
  "message_type": "outgoing",
  "private": true
}
```

## Webhook Events

Webhooks are received at `/api/webhooks/chatwoot` with signature verification.

### Event Types
- `conversation_created` - New conversation started
- `message_created` - New message in conversation
- `conversation_status_changed` - Status updated
- `conversation_assigned` - Agent assigned

### Signature Verification

Webhooks include `X-Chatwoot-Signature` header with HMAC SHA-256:

```javascript
const expectedSignature = createHmac("sha256", CHATWOOT_WEBHOOK_SECRET)
  .update(payload)
  .digest("hex");

if (signature !== expectedSignature) {
  // Reject webhook
}
```

**Security Note:** Signature verification is enforced in production (`NODE_ENV=production`).

## HITL Approval Flow

### 1. Message Receipt
- Webhook triggers on `message_created`
- Forwarded to Agent SDK service
- Agent analyzes conversation context

### 2. Draft Generation
- AI generates suggested reply
- Posted as **Private Note** (not visible to customer)
- Includes metadata:
  - Evidence (conversation context, data used)
  - Projected impact
  - Risk assessment
  - Rollback plan

### 3. Human Review
- CEO receives notification
- Reviews draft in approvals drawer
- Can edit, approve, or reject
- Provides 1-5 grades for:
  - **Tone** (brand voice alignment)
  - **Accuracy** (factual correctness)
  - **Policy** (policy compliance)

### 4. Send or Reject
- **Approve:** Private note content sent as public reply
- **Reject:** Agent learns from feedback
- All decisions logged to Supabase for training

### 5. Learning Loop
- Graded reviews stored in `approvals` table
- Human edits captured for supervised learning
- Weekly coordination with Support agent
- RAG index updated as KB articles change

## Testing

### Unit Tests
```bash
npm run test:unit -- tests/unit/chatwoot.action.spec.ts
npm run test:unit -- tests/unit/chatwoot.escalations.spec.ts
```

### Integration Tests
```bash
npm run test:e2e -- tests/integration/chatwoot.api.spec.ts
```

### Playwright E2E Tests
```bash
npm run test:e2e -- tests/playwright/modals.spec.ts
```

Tests cover:
- Modal flows (CX escalations)
- Approve/reject flows
- Keyboard accessibility
- Responsive behavior
- External call stubbing (Supabase edge logger)

## Troubleshooting

### Health Check Failures

**Symptom:** `npm run ops:check-chatwoot-health` exits with non-zero code

**Diagnosis:**
1. Check artifact in `artifacts/ops/chatwoot-health/`
2. Identify which check failed (rails_health or authenticated_api)
3. Review error message and HTTP status

**Common Issues:**

| Error | Cause | Solution |
|-------|-------|----------|
| Exit code 1 | Missing env vars | Set CHATWOOT_BASE_URL and CHATWOOT_API_TOKEN |
| Exit code 2 | Rails health failed | Check Chatwoot instance status, verify URL |
| Exit code 3 | API auth failed | Verify API token is valid, check account access |
| HTTP 401 | Invalid token | Regenerate token in Chatwoot admin |
| HTTP 404 | Wrong URL | Verify CHATWOOT_BASE_URL includes protocol (https://) |
| Timeout | Network/performance | Check network connectivity, increase timeout if needed |

### Webhook Issues

**Symptom:** Webhooks not received or rejected

**Diagnosis:**
1. Check webhook configuration in Chatwoot admin
2. Verify `X-Chatwoot-Signature` header present
3. Check logs for signature verification failures

**Solutions:**
- Ensure CHATWOOT_WEBHOOK_SECRET matches Chatwoot config
- Verify webhook URL is accessible from Chatwoot instance
- Check firewall/network rules allow Chatwoot IP
- In development, signature verification is skipped (`NODE_ENV !== "production"`)

### Agent SDK Integration

**Symptom:** Private notes not appearing

**Diagnosis:**
1. Check Agent SDK service is running: `https://hotdash-agent-service.fly.dev/health`
2. Verify webhook forwarding to Agent SDK
3. Check Agent SDK logs for errors

**Solutions:**
- Verify AGENT_SDK_URL environment variable
- Ensure Agent SDK deployment is healthy
- Check webhook payload structure matches expected format

## Security Considerations

1. **API Token Storage**
   - Never commit tokens to git
   - Use GitHub Secrets for CI/CD
   - Store in secure vault for local development

2. **Webhook Signature Verification**
   - Always verify `X-Chatwoot-Signature` in production
   - Use constant-time comparison to prevent timing attacks
   - Rotate webhook secrets periodically

3. **HITL Enforcement**
   - AI never sends replies directly to customers
   - All customer-facing messages require human approval
   - Private notes are not visible to customers

4. **Data Handling**
   - Customer conversation data is sensitive PII
   - Follow data retention policies
   - Implement proper access controls
   - Audit trail for all approvals/rejections

## Performance & SLA

**Response Time Targets:**
- Health check: < 5 seconds per check
- Webhook processing: < 1 second
- Private note creation: < 3 seconds
- Approval action: < 2 seconds

**Availability Targets (North Star):**
- Health checks: 100% pass rate during launch week
- Uptime: ≥ 99.9% (30-day rolling window)

**Customer SLA:**
- Business hours review: ≤ 15 minutes for CX
- Same day response for inventory/growth
- Median approval time: ≤ 15 minutes

## References

- **North Star:** `docs/NORTH_STAR.md` (Section: Customer Ops)
- **Operating Model:** `docs/OPERATING_MODEL.md` (Section: CX)
- **Webhook Receiver:** `app/routes/api.webhooks.chatwoot.tsx`
- **Escalation Action:** `app/routes/actions/chatwoot.escalate.ts`
- **Health Check Utils:** `app/utils/health-check.server.ts`
- **Agent SDK:** `apps/agent-service/src/agents/index.ts`
- **Agent Direction:** `docs/directions/ai-customer.md`

## Change Log

- **2025-10-19:** Initial documentation with health check procedures
- **2025-10-17:** Production alignment, health checks automated
- **2025-10-15:** OpenAI Agents SDK integration

