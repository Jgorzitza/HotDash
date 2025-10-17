# Chatwoot Agent SDK Integration - Engineer Handoff

**Date:** 2025-10-11  
**Status:** Ready for Webhook Endpoint Deployment  
**Blocker:** Webhook endpoint needs to be deployed before configuration

---

## 🎯 What's Complete (Ready for Integration)

### 1. ✅ HMAC Signature Verification (Task 3)

**Location:** `scripts/ops/verify-chatwoot-webhook.ts`

**Integration Code for Engineer:**

```typescript
import { createHmac } from "crypto";

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;

  const hmac = createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  return signature === expectedSignature;
}

// Use in webhook handler:
const rawBody = await request.text();
const signature = request.headers.get("X-Chatwoot-Signature");
const isValid = verifyWebhookSignature(
  rawBody,
  signature,
  process.env.CHATWOOT_WEBHOOK_SECRET,
);

if (!isValid) {
  return new Response("Invalid signature", { status: 401 });
}
```

**Tested:** ✅ Working with test payloads

### 2. ✅ API Endpoint Verification (Task 4)

**Testing Script:** `scripts/ops/test-chatwoot-apis.sh`

**Verified Endpoints:**

- ✅ `GET /api/v1/accounts/1/conversations?status=open` - List open conversations
- ✅ `GET /api/v1/accounts/1/conversations` - List all conversations
- ✅ `GET /api/v1/accounts/1/labels` - List labels/tags

**Endpoints Requiring Conversation ID (documented for integration):**

- `GET /conversations/{id}/messages` - List conversation messages
- `POST /conversations/{id}/messages` - Create message (private note or public reply)
- `POST /conversations/{id}/assignments` - Assign agent to conversation
- `POST /conversations/{id}/labels` - Add labels to conversation

**API Response Formats:** Documented in `artifacts/chatwoot/api-tests-20251011T210544Z/`

### 3. ✅ Webhook Handler Skeleton (Previously Created)

**Location:** `supabase/functions/chatwoot-webhook/index.ts`

**Current State:**

- Signature verification: Implemented ✅
- Event filtering: Implemented ✅
- Observability logging: Implemented ✅
- LlamaIndex integration: TODO (needs port 8005)
- Agent SDK integration: TODO (needs port 8006)

---

## 🚧 What's Blocked (Needs Engineer Action)

### Task 2: Webhook Configuration

**Requirement:** Deploy webhook endpoint to Fly.io

**Expected Endpoint:** `https://hotdash-agent-service.fly.dev/webhooks/chatwoot`

**Once Deployed:**

1. Chatwoot agent will configure webhook in Chatwoot UI
2. Subscribe to `message_created` event
3. Test webhook delivery
4. Proceed with end-to-end testing

**Webhook Payload Format** (from Chatwoot):

```json
{
  "event": "message_created",
  "account": {
    "id": 1,
    "name": "HotDash"
  },
  "inbox": {
    "id": 1,
    "name": "customer.support@hotrodan.com"
  },
  "conversation": {
    "id": 123,
    "inbox_id": 1,
    "status": "open",
    "created_at": 1728676800,
    "contact": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": {
    "id": 456,
    "content": "Customer inquiry text",
    "message_type": 0,
    "created_at": 1728676800,
    "sender": {
      "type": "contact"
    }
  }
}
```

**Required Response:** HTTP 200 OK with `{"ok": true}`

### Task 5: End-to-End Testing

**Depends On:** Task 2 completion

**Test Plan Ready:**

1. Send test message through Chatwoot
2. Verify webhook delivered to Agent SDK
3. Verify private note created with agent draft
4. Test approval → public reply flow (staging only)
5. Document complete conversation lifecycle

---

## 📦 Integration Architecture

```
Customer Message (Email/Chat)
         ↓
    Chatwoot
         ↓ Webhook (HMAC verified)
    Agent Service (https://hotdash-agent-service.fly.dev)
         ↓
    /webhooks/chatwoot
         ↓ Query
    LlamaIndex (port 8005)
         ↓ Generate Draft
    Agent SDK (port 8006)
         ↓ Create Private Note
    Chatwoot API
         ↓ Insert Queue Entry
    agent_sdk_approval_queue (Supabase)
         ↓ Real-time Notification
    Operator Dashboard
```

---

## 🔧 Engineer Action Items

### Immediate (Unblock Chatwoot Agent)

1. **Deploy Webhook Endpoint**
   - Deploy `supabase/functions/chatwoot-webhook/` to Fly.io
   - URL: `https://hotdash-agent-service.fly.dev/webhooks/chatwoot`
   - Environment variables:
     - `CHATWOOT_WEBHOOK_SECRET` (generate and share with Chatwoot agent)
     - `CHATWOOT_API_TOKEN` (from vault)
     - `CHATWOOT_BASE_URL=https://hotdash-chatwoot.fly.dev`
2. **Confirm Deployment**
   - Test endpoint responds to POST requests
   - Share deployment status with @chatwoot agent

### Next Sprint (Week 2)

1. **LlamaIndex Service (port 8005)**
   - Deploy knowledge base query service
   - Integrate with webhook handler
   - Test semantic search

2. **Agent SDK Service (port 8006)**
   - Deploy draft generation service
   - Integrate OpenAI for response drafting
   - Test confidence scoring

3. **Approval Queue Database**
   - Deploy migrations for `agent_sdk_approval_queue`
   - Set up RLS policies
   - Test queue insertion

---

## 📊 Current Sprint Status

| Task                 | Owner        | Status         | Progress               |
| -------------------- | ------------ | -------------- | ---------------------- |
| 1. Agent SDK Plan    | Chatwoot     | ✅ Complete    | 100%                   |
| 2. Webhook Config    | Chatwoot     | ⏳ Blocked     | 0% (needs @engineer)   |
| 3. HMAC Verification | Chatwoot     | ✅ Complete    | 100%                   |
| 4. API Testing       | Chatwoot     | ✅ Complete    | 100%                   |
| 5. E2E Testing       | Chatwoot     | ⏳ Blocked     | 0% (depends on #2)     |
|                      |              |                |                        |
| **Deploy Webhook**   | **Engineer** | **⏳ Pending** | **Blocks tasks 2 & 5** |
| Deploy LlamaIndex    | Engineer     | 📋 Planned     | Week 2                 |
| Deploy Agent SDK     | Engineer     | 📋 Planned     | Week 2                 |
| Deploy Migrations    | Engineer     | 📋 Planned     | Week 2                 |

**Overall Progress:** 60% (3/5 Chatwoot tasks complete)  
**Critical Path:** Webhook deployment unblocks 40% remaining work

---

## 🔗 Reference Documents

- **Webhook Implementation:** `supabase/functions/chatwoot-webhook/index.ts`
- **Webhook Documentation:** `supabase/functions/chatwoot-webhook/README.md`
- **Test Payloads:** `docs/integrations/webhook_payload_examples.md`
- **API Testing Guide:** `docs/integrations/conversation_flow_testing.md`
- **Integration Plan:** `docs/integrations/agent_sdk_integration_plan.md`
- **Audit Report:** `feedback/chatwoot.md`

---

## 💬 Communication

**Slack/Coordination:**

- Tag @engineer when webhook endpoint is live
- Tag @chatwoot to proceed with configuration
- Tag @reliability for worker scaling (512MB → 1024MB)

**Next Check-in:** Once webhook deployed (estimated: 2-4 hours)

---

## ✅ Success Criteria

**For Webhook Deployment:**

- [ ] Endpoint responds to POST requests
- [ ] HMAC signature verification working
- [ ] Environment variables configured
- [ ] Webhook secret shared with Chatwoot agent
- [ ] Test payload accepted and logged

**For Integration Testing (after deployment):**

- [ ] Chatwoot webhook configured
- [ ] Test message triggers webhook
- [ ] Private note created in Chatwoot
- [ ] Queue entry created in Supabase
- [ ] End-to-end flow documented

---

**Status:** ✅ Ready for Engineer - All Chatwoot-side work complete, awaiting webhook deployment

**Last Updated:** 2025-10-11T21:05:44Z  
**Contact:** Chatwoot Agent (via feedback/chatwoot.md)
