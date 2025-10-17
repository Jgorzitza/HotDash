# Webhook Configuration Requirements for Engineer (Task 2 Spec)

**Date:** 2025-10-11T22:32:36Z  
**Purpose:** Document webhook endpoint requirements so Task 2 can proceed once endpoint is deployed  
**Status:** SPEC COMPLETE - Ready for Engineer Implementation

---

## 🎯 TASK 2 WORKAROUND (Per Manager Blocker Management)

Per manager direction: "For Task 2, create webhook spec document showing what you need from Engineer, then move on."

This document provides **complete specifications** for the webhook endpoint so Task 2 can be executed immediately once the endpoint is deployed.

---

## WEBHOOK ENDPOINT SPECIFICATIONS

### Required Endpoint

**URL:** `https://hotdash-agent-service.fly.dev/webhooks/chatwoot`  
**Method:** POST  
**Content-Type:** application/json  
**Authentication:** HMAC-SHA256 signature in `X-Chatwoot-Signature` header

---

### Webhook Configuration in Chatwoot

**When Engineer Confirms Deployment, Execute:**

1. **Log in to Chatwoot:**
   - URL: https://hotdash-chatwoot.fly.dev
   - Credentials: From `vault/occ/chatwoot/super_admin_staging.env`

2. **Navigate to Webhooks:**
   - Settings (gear icon) → Integrations → Webhooks

3. **Add Webhook:**

   ```
   Endpoint URL: https://hotdash-agent-service.fly.dev/webhooks/chatwoot
   Description: Agent SDK Message Processing
   Events to Subscribe:
     ✅ message_created (PRIMARY)
     ⚠️  conversation_created (OPTIONAL)
     ⚠️  conversation_status_changed (OPTIONAL for cleanup)

   Webhook Secret: [OBTAIN FROM ENGINEER]
   ```

4. **Test Webhook:**
   - Click "Test Webhook" button in Chatwoot
   - Verify endpoint receives payload
   - Check logs for successful processing
   - Confirm 200 OK response

5. **Verify Signature:**

   ```bash
   # Use our verification script
   npx ts-node --esm scripts/ops/verify-chatwoot-webhook.ts \
     --generate test-payload.json <webhook_secret>
   ```

6. **Document Results:**
   - Screenshot of webhook configuration
   - Test payload logs
   - Signature verification results
   - Save to: `artifacts/chatwoot/webhook-config-TIMESTAMP/`

---

### Engineer Deliverables Needed

**Before Task 2 Can Execute:**

1. ✅ Deploy webhook endpoint to Fly.io
2. ✅ Configure environment variables:
   - `CHATWOOT_WEBHOOK_SECRET`
   - `CHATWOOT_API_TOKEN`
   - `CHATWOOT_BASE_URL=https://hotdash-chatwoot.fly.dev`
3. ✅ Test endpoint responds to POST
4. ✅ Share webhook secret with Chatwoot agent
5. ✅ Confirm deployment status

**Webhook Handler Code:** Already provided in `supabase/functions/chatwoot-webhook/index.ts`  
**HMAC Verification:** Already provided in `scripts/ops/verify-chatwoot-webhook.ts`  
**Integration Guide:** Already in `docs/integrations/engineer-handoff-chatwoot.md`

---

### Expected Webhook Payload

```json
{
  "event": "message_created",
  "account": { "id": 1, "name": "HotDash" },
  "inbox": { "id": 1, "name": "customer.support@hotrodan.com" },
  "conversation": {
    "id": 123,
    "inbox_id": 1,
    "status": "open",
    "contact": {
      "name": "Customer Name",
      "email": "customer@example.com"
    }
  },
  "message": {
    "id": 456,
    "content": "Customer inquiry text",
    "message_type": 0,
    "sender": { "type": "contact" }
  }
}
```

---

### Success Criteria for Task 2

- [ ] Webhook configured in Chatwoot UI
- [ ] Test webhook delivery successful
- [ ] Signature verification working
- [ ] Payload parsed correctly
- [ ] Endpoint logs show successful processing
- [ ] Configuration screenshot captured
- [ ] Results logged in feedback/chatwoot.md

---

## TASK 2 READY STATE

**Chatwoot Side:** ✅ 100% Ready

- Super admin access confirmed
- Webhook UI navigation documented
- Configuration steps written
- Test procedures prepared
- Verification scripts ready

**Engineer Side:** ⏳ Pending

- Webhook endpoint deployment
- Environment variable configuration
- Webhook secret generation and sharing
- Deployment status confirmation

**Estimated Time to Complete Task 2:** 30 minutes (once engineer confirms deployment)

---

**Status:** Task 2 specification COMPLETE - Ready for execution once endpoint deployed  
**Next:** Proceed to Fifth Expansion tasks (AS-BK) per manager direction  
**Manager Guidance Followed:** Created spec document, moving on to other tasks ✅
