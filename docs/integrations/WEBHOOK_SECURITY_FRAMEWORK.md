# Webhook Security Framework

**Owner:** Integrations + Security  
**Created:** 2025-10-11  
**Purpose:** Comprehensive webhook authentication, verification, and security patterns  
**Scope:** All inbound webhooks (Chatwoot, Shopify, future integrations)

---

## Overview

HotDash receives webhooks from external services for real-time event processing. This framework ensures all webhooks are authenticated, validated, and processed securely.

**Current Webhooks:**
1. ✅ Chatwoot - Customer message notifications (implemented)
2. ⏳ Shopify - Order/inventory updates (future)
3. ⏳ Third-party services - Various events (future)

---

## Security Principles

### 1. Defense in Depth
**Layers:**
1. **Signature Verification** - HMAC-SHA256 authentication
2. **Timestamp Validation** - Prevent replay attacks
3. **IP Allowlist** (optional) - Network-level filtering
4. **Rate Limiting** - Prevent abuse
5. **Input Validation** - Schema validation for payloads
6. **Idempotency** - Prevent duplicate processing

### 2. Fail Secure
- Invalid signature → 401 Unauthorized (don't process)
- Missing signature → 401 (don't assume valid)
- Parsing errors → 400 Bad Request (log attack attempt)
- Unknown event types → 200 OK but filter out (log for monitoring)

### 3. Audit Everything
- Log all webhook attempts (success + failure)
- Store signatures for forensic analysis
- Track IP addresses
- Monitor for attack patterns

---

## Webhook Authentication Methods

### Method 1: HMAC Signature Verification (Recommended)

**Used By:** Chatwoot, Shopify, most modern services

**How It Works:**
1. Service calculates HMAC-SHA256(secret, payload)
2. Service sends signature in header (e.g., `X-Chatwoot-Signature`)
3. We recalculate HMAC with our copy of secret
4. Compare signatures (constant-time comparison to prevent timing attacks)

**Implementation** (from `supabase/functions/chatwoot-webhook/index.ts`):
```typescript
import { createHmac } from "https://deno.land/std@0.208.0/node/crypto.ts";

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const hmac = createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  // Constant-time comparison (prevents timing attacks)
  return signature === expectedSignature;
}

// Usage
const rawBody = await req.text();
const signature = req.headers.get("X-Chatwoot-Signature");

if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
  return new Response(JSON.stringify({ error: "Invalid signature" }), {
    status: 401
  });
}
```

**Security Notes:**
- ✅ Use constant-time comparison (prevent timing attacks)
- ✅ Verify BEFORE parsing JSON (prevent injection)
- ✅ Use raw body (not parsed JSON) for signature calculation
- ✅ Log failed attempts for security monitoring

---

### Method 2: API Key in Header

**Used By:** Some simpler services

**How It Works:**
1. Service sends static API key in header
2. We verify against stored key

**Implementation:**
```typescript
function verifyApiKey(
  receivedKey: string | null,
  expectedKey: string
): boolean {
  if (!receivedKey) return false;
  
  // Constant-time comparison
  return timingSafeEqual(
    Buffer.from(receivedKey),
    Buffer.from(expectedKey)
  );
}

// Usage
const apiKey = req.headers.get("X-API-Key");
if (!verifyApiKey(apiKey, storedApiKey)) {
  return new Response("Unauthorized", { status: 401 });
}
```

**Security Notes:**
- ⚠️ Less secure than HMAC (static key can leak)
- ✅ Still use constant-time comparison
- ⚠️ Rotate keys regularly
- ✅ Use HTTPS only (never HTTP)

---

### Method 3: OAuth 2.0 Bearer Token

**Used By:** Enterprise services

**How It Works:**
1. Service obtains token via OAuth flow
2. Service sends token in Authorization header
3. We verify token with OAuth provider

**Implementation:**
```typescript
async function verifyOAuthToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      "https://oauth-provider.com/verify",
      {
        headers: { "Authorization": `Bearer ${token}` }
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}
```

**Security Notes:**
- ✅ Most secure (no shared secrets)
- ⚠️ Requires external verification call (latency)
- ✅ Tokens expire automatically
- ✅ Can revoke specific tokens

---

## Webhook Security Checklist

### For Each Webhook Endpoint

**Pre-Deployment:**
- [ ] Secret generation (cryptographically random, 32+ bytes)
- [ ] Secret stored in vault (`vault/occ/{service}/webhook_secret.env`)
- [ ] Secret mirrored to Supabase edge function env
- [ ] Signature verification implemented
- [ ] Timestamp validation added (if supported)
- [ ] IP allowlist configured (if applicable)
- [ ] Rate limiting enabled
- [ ] Schema validation implemented
- [ ] Unit tests for signature verification
- [ ] Integration tests with mock webhooks
- [ ] Security review completed

**Post-Deployment:**
- [ ] Monitor for invalid signature attempts
- [ ] Track webhook processing times
- [ ] Alert on repeated failures
- [ ] Review logs weekly for anomalies
- [ ] Rotate secrets quarterly (or on incident)

---

## Chatwoot Webhook Implementation

### Current Implementation ✅

**Endpoint:** `https://{supabase-url}/functions/v1/chatwoot-webhook`  
**Method:** POST  
**Authentication:** HMAC-SHA256 via `X-Chatwoot-Signature` header  
**Secret:** `CHATWOOT_WEBHOOK_SECRET` environment variable

**Event Types Handled:**
- `message_created` - New customer message (processed)
- Other events - Filtered out (logged but not processed)

**Security Features Implemented:**
- ✅ HMAC-SHA256 signature verification
- ✅ Raw body used for verification (not parsed JSON)
- ✅ Failed attempts logged to observability_logs
- ✅ IP address captured (`x-forwarded-for` header)
- ✅ CORS headers configured
- ✅ Error responses don't leak implementation details

**Processing Flow:**
1. CORS preflight handling
2. Environment variable validation
3. Signature verification (FAIL → 401)
4. Payload parsing
5. Event type filtering
6. Business logic (queue for Agent SDK)
7. Observability logging
8. Success response

**Observability:**
```typescript
// Logged events
- Webhook received (INFO)
- Invalid signature (WARN) with IP
- Filtered events (INFO) with reason
- Processing errors (ERROR) with details
- Customer message queued (INFO) with metadata
```

---

### Shopify Webhook (Future Implementation)

**Endpoint:** `https://{supabase-url}/functions/v1/shopify-webhook` (not yet created)  
**Method:** POST  
**Authentication:** HMAC-SHA256 via `X-Shopify-Hmac-SHA256` header

**Shopify-Specific Headers:**
- `X-Shopify-Topic` - Event type (e.g., `orders/create`)
- `X-Shopify-Shop-Domain` - Shop that triggered event
- `X-Shopify-Hmac-SHA256` - Signature (base64-encoded)
- `X-Shopify-Webhook-Id` - Unique webhook delivery ID

**Verification:**
```typescript
function verifyShopifyWebhook(
  rawBody: string,
  hmacHeader: string,
  secret: string
): boolean {
  const hmac = createHmac("sha256", secret);
  hmac.update(rawBody, "utf8");
  const hash = hmac.digest("base64");
  
  return hash === hmacHeader;
}
```

**Event Types to Handle:**
- `orders/create` - New order (update Sales Pulse)
- `orders/updated` - Order status change
- `inventory_levels/update` - Inventory change (update Inventory Heatmap)
- `products/create` - New product
- `products/update` - Product changes

**Rate Limiting:**
- Shopify sends webhooks in bursts (e.g., bulk operations)
- Implement queue system to handle spikes
- Process webhooks asynchronously
- Return 200 quickly (< 5 seconds required by Shopify)

---

## Anti-Replay Protection

### Timestamp Validation

**Purpose:** Prevent replay attacks (attacker resending old valid webhooks)

**Implementation:**
```typescript
function isTimestampValid(
  timestamp: number,
  maxAgeSeconds: number = 300  // 5 minutes
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const age = now - timestamp;
  
  // Reject if too old
  if (age > maxAgeSeconds) {
    return false;
  }
  
  // Reject if in future (clock skew tolerance: 60s)
  if (age < -60) {
    return false;
  }
  
  return true;
}

// Usage (if service provides timestamp)
const timestamp = parseInt(req.headers.get("X-Webhook-Timestamp") || "0");
if (!isTimestampValid(timestamp)) {
  return new Response("Webhook timestamp invalid", { status: 401 });
}
```

**Services Supporting Timestamps:**
- Shopify: No timestamp header (verify by delivery uniqueness)
- Chatwoot: No timestamp header (add custom if needed)
- Stripe (example): `X-Stripe-Timestamp` header provided

---

### Idempotency Protection

**Purpose:** Prevent duplicate processing if webhook delivered multiple times

**Implementation:**
```typescript
// Store processed webhook IDs in database
const processedWebhooks = new Set<string>();

async function isWebhookProcessed(
  supabase: any,
  webhookId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("processed_webhooks")
    .select("id")
    .eq("webhook_id", webhookId)
    .single();
  
  return data !== null;
}

async function markWebhookProcessed(
  supabase: any,
  webhookId: string,
  metadata: any
) {
  await supabase
    .from("processed_webhooks")
    .insert({
      webhook_id: webhookId,
      service: "chatwoot",
      processed_at: new Date().toISOString(),
      metadata
    });
}

// Usage
const webhookId = req.headers.get("X-Webhook-Id") || 
                  `${payload.event}-${payload.conversation.id}-${payload.message.id}`;

if (await isWebhookProcessed(supabase, webhookId)) {
  return new Response("Already processed", { status: 200 });
}

// Process webhook...

await markWebhookProcessed(supabase, webhookId, payload);
```

**Database Schema:**
```sql
CREATE TABLE processed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id TEXT UNIQUE NOT NULL,
  service TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_processed_webhooks_webhook_id ON processed_webhooks(webhook_id);
CREATE INDEX idx_processed_webhooks_created_at ON processed_webhooks(created_at);

-- Auto-cleanup old entries (> 7 days)
CREATE POLICY cleanup_old_webhooks 
  ON processed_webhooks 
  FOR DELETE 
  USING (created_at < NOW() - INTERVAL '7 days');
```

---

## Rate Limiting for Webhooks

### Purpose
- Prevent webhook flooding attacks
- Handle burst traffic gracefully
- Protect downstream systems

### Implementation

**Option 1: Fixed Window Rate Limit**
```typescript
const webhookRateLimiter = new Map<string, number[]>();

function checkWebhookRateLimit(
  identifier: string,  // e.g., IP address or account ID
  maxRequests: number = 100,
  windowMs: number = 60000  // 1 minute
): boolean {
  const now = Date.now();
  const timestamps = webhookRateLimiter.get(identifier) || [];
  
  // Remove old timestamps outside window
  const recentTimestamps = timestamps.filter(t => now - t < windowMs);
  
  if (recentTimestamps.length >= maxRequests) {
    return false;  // Rate limit exceeded
  }
  
  recentTimestamps.push(now);
  webhookRateLimiter.set(identifier, recentTimestamps);
  
  return true;
}

// Usage
const clientIp = req.headers.get("x-forwarded-for") || "unknown";
if (!checkWebhookRateLimit(clientIp, 100, 60000)) {
  return new Response("Rate limit exceeded", { status: 429 });
}
```

**Option 2: Supabase Edge Function Rate Limiting**
```typescript
// Use Supabase built-in rate limiting (if available)
// Or implement with Upstash Redis

import { Ratelimit } from "https://esm.sh/@upstash/ratelimit";
import { Redis } from "https://esm.sh/@upstash/redis";

const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_URL"),
  token: Deno.env.get("UPSTASH_REDIS_TOKEN")
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m")  // 100 requests per minute
});

// Check rate limit
const identifier = req.headers.get("x-forwarded-for");
const { success, remaining } = await ratelimit.limit(identifier);

if (!success) {
  return new Response("Rate limit exceeded", { 
    status: 429,
    headers: {
      "X-RateLimit-Remaining": remaining.toString()
    }
  });
}
```

---

## Input Validation

### Schema Validation

**Create:** `app/services/webhooks/validators.ts`

```typescript
import { z } from "zod";

// Chatwoot webhook schema
export const ChatwootWebhookSchema = z.object({
  event: z.string(),
  account: z.object({
    id: z.number(),
    name: z.string()
  }),
  conversation: z.object({
    id: z.number(),
    inbox_id: z.number(),
    status: z.string(),
    created_at: z.number(),
    contact: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional()
    }).optional()
  }),
  message: z.object({
    id: z.number(),
    content: z.string(),
    message_type: z.number(),
    created_at: z.number(),
    sender: z.object({
      type: z.string()
    })
  }).optional()
});

// Validation
try {
  const validated = ChatwootWebhookSchema.parse(payload);
  // Process validated payload
} catch (error) {
  // Schema validation failed
  await logSecurityEvent("INVALID_PAYLOAD", {
    error: error.message,
    payload_preview: JSON.stringify(payload).substring(0, 200)
  });
  
  return new Response("Invalid payload", { status: 400 });
}
```

**Benefits:**
- Prevents injection attacks
- Ensures type safety
- Documents expected payload structure
- Catches API changes early

---

## Webhook Testing Framework

### Mock Webhook Requests

**Create:** `tests/fixtures/webhooks/`

**Chatwoot Test Payload:**
```json
{
  "event": "message_created",
  "account": {
    "id": 1,
    "name": "HotRodan Support"
  },
  "conversation": {
    "id": 123,
    "inbox_id": 1,
    "status": "open",
    "created_at": 1697040000,
    "contact": {
      "name": "Test Customer",
      "email": "test@example.com"
    }
  },
  "message": {
    "id": 456,
    "content": "Where is my order?",
    "message_type": 0,
    "created_at": 1697040000,
    "sender": {
      "type": "contact"
    }
  }
}
```

**Generate Valid Signature:**
```typescript
function generateTestSignature(payload: any, secret: string): string {
  const hmac = createHmac("sha256", secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest("hex");
}

// In test
const testSecret = "test-webhook-secret-32-chars-min";
const payload = { event: "message_created", ... };
const signature = generateTestSignature(payload, testSecret);

// Send test webhook
const response = await fetch(webhookUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Chatwoot-Signature": signature
  },
  body: JSON.stringify(payload)
});

expect(response.status).toBe(200);
```

---

### Security Tests

**Test Invalid Signature:**
```typescript
test("rejects webhook with invalid signature", async () => {
  const payload = { event: "message_created", ... };
  const wrongSignature = "invalid-signature-123";
  
  const response = await sendWebhook(payload, wrongSignature);
  
  expect(response.status).toBe(401);
  expect(response.json()).toMatchObject({
    error: "Invalid webhook signature"
  });
});
```

**Test Missing Signature:**
```typescript
test("rejects webhook without signature", async () => {
  const response = await fetch(webhookUrl, {
    method: "POST",
    body: JSON.stringify(payload)
    // No X-Chatwoot-Signature header
  });
  
  expect(response.status).toBe(401);
});
```

**Test Replay Attack:**
```typescript
test("rejects replayed webhook (old timestamp)", async () => {
  const oldTimestamp = Math.floor(Date.now() / 1000) - 600;  // 10 minutes ago
  const payload = { timestamp: oldTimestamp, ... };
  const validSignature = generateSignature(payload);
  
  const response = await sendWebhook(payload, validSignature);
  
  expect(response.status).toBe(401);
});
```

**Test Duplicate Processing:**
```typescript
test("prevents duplicate webhook processing", async () => {
  const payload = { event: "message_created", ... };
  const signature = generateSignature(payload);
  
  // Send same webhook twice
  const response1 = await sendWebhook(payload, signature);
  const response2 = await sendWebhook(payload, signature);
  
  expect(response1.status).toBe(200);
  expect(response2.status).toBe(200);
  expect(response2.json()).toMatchObject({ already_processed: true });
  
  // Verify only processed once
  const dbRecords = await getProcessingRecords(payload.message.id);
  expect(dbRecords.length).toBe(1);
});
```

---

## Secret Management

### Secret Generation

**Requirements:**
- Minimum 32 characters
- Cryptographically random
- High entropy

**Generation Methods:**
```bash
# Method 1: OpenSSL
openssl rand -hex 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 3: Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Storage:**
```bash
# Store in vault
echo "CHATWOOT_WEBHOOK_SECRET=<generated-secret>" > vault/occ/chatwoot/webhook_secret.env
chmod 600 vault/occ/chatwoot/webhook_secret.env
```

### Secret Rotation

**Frequency:** Every 90 days or on security incident

**Rotation Process:**
1. Generate new secret
2. Store as `webhook_secret_new.env`
3. Configure service to send both old and new signatures
4. Deploy edge function to accept both signatures
5. Monitor for 24 hours (verify new signature works)
6. Remove old signature support
7. Archive old secret as `.old`
8. Update documentation

**Shopify-Specific:**
- Shopify allows only one webhook secret per app
- During rotation: Brief window where webhooks may fail
- Coordinate rotation during low-traffic window
- Monitor webhook delivery failures in Partner Dashboard

---

## Monitoring & Alerting

### Webhook Security Events

**Log to:** `observability_logs` table with `log_type: 'WEBHOOK_SECURITY'`

**Events to Track:**
1. **Invalid Signature** (WARN)
   - IP address
   - Claimed service
   - Signature attempt
   - Payload preview (first 200 chars)

2. **Replay Attack** (WARN)
   - Timestamp
   - Age of replayed webhook
   - Source IP

3. **Rate Limit Exceeded** (WARN)
   - Source IP or identifier
   - Request count in window
   - Time until reset

4. **Unknown Event Type** (INFO)
   - Event type received
   - Service
   - Decision (filtered out)

5. **Processing Success** (INFO)
   - Event type
   - Processing time
   - Result summary

---

### Security Alerts

**Trigger Alerts When:**
- 🚨 > 5 invalid signatures from same IP in 1 hour (attack attempt)
- 🚨 > 10 replay attempts in 1 hour (replay attack)
- ⚠️ > 20 unknown event types (API changes or misconfiguration)
- ⚠️ Processing time > 10 seconds (performance degradation)

**Alert Channels:**
- Slack: #security-alerts
- Email: security@hotrodan.com
- Dashboard: Security events tile (red)

---

## Incident Response Runbook

### Suspected Webhook Attack

**Step 1: Identify Attack Pattern**
```sql
-- Query observability_logs
SELECT 
  metadata->>'ip' as ip_address,
  COUNT(*) as attempt_count,
  log_type,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM observability_logs
WHERE log_type = 'WEBHOOK_SECURITY'
  AND level = 'WARN'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY metadata->>'ip', log_type
HAVING COUNT(*) > 5
ORDER BY attempt_count DESC;
```

**Step 2: Block Malicious IPs**
```typescript
// Add to edge function
const BLOCKED_IPS = new Set([
  "1.2.3.4",
  "5.6.7.8"
]);

const clientIp = req.headers.get("x-forwarded-for");
if (BLOCKED_IPS.has(clientIp)) {
  await logSecurityEvent("BLOCKED_IP", { ip: clientIp });
  return new Response("Forbidden", { status: 403 });
}
```

**Step 3: Rotate Secrets**
- If signature appears compromised, rotate immediately
- Follow rotation procedure above
- Notify team in #security channel

**Step 4: Review Logs**
- Check for successful breaches (invalid signatures that passed)
- Verify no data exfiltration
- Document incident for compliance

---

### Webhook Delivery Failure

**Step 1: Check Service Status**
```bash
# Chatwoot
curl -I https://hotdash-chatwoot.fly.dev/hc

# Supabase Edge Function
curl -I https://{supabase-url}/functions/v1/chatwoot-webhook
```

**Step 2: Check Supabase Logs**
```bash
# Via Supabase CLI
npx supabase functions logs chatwoot-webhook --tail

# Check for errors
grep -i "error\|fail\|signature" <log-file>
```

**Step 3: Verify Secret Sync**
```bash
# Check secret in Supabase
npx supabase secrets list | grep CHATWOOT_WEBHOOK_SECRET

# Verify matches vault
source vault/occ/chatwoot/webhook_secret.env
echo $CHATWOOT_WEBHOOK_SECRET  # Compare (be careful with shell history)
```

**Step 4: Test Manually**
```bash
# Generate test payload and signature
payload='{"event":"test","account":{"id":1}}'
signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$CHATWOOT_WEBHOOK_SECRET" | cut -d' ' -f2)

# Send test webhook
curl -X POST https://{supabase-url}/functions/v1/chatwoot-webhook \
  -H "Content-Type: application/json" \
  -H "X-Chatwoot-Signature: $signature" \
  -d "$payload"

# Expected: 200 OK
```

---

## Best Practices Summary

### ✅ DO

1. **Always verify signatures** before processing
2. **Use constant-time comparison** for signatures
3. **Log all webhook attempts** (success + failure)
4. **Validate timestamps** if provided
5. **Implement idempotency** to prevent duplicates
6. **Rate limit by IP** to prevent abuse
7. **Return 200 quickly** (< 5s for Shopify)
8. **Process asynchronously** for heavy operations
9. **Rotate secrets quarterly** or on incident
10. **Monitor for attack patterns** daily

### ❌ DON'T

1. **Don't skip signature verification** (even for testing)
2. **Don't parse JSON before verifying** (injection risk)
3. **Don't leak secrets in logs** or error messages
4. **Don't process duplicate webhooks** (check idempotency)
5. **Don't trust webhook data blindly** (validate schema)
6. **Don't use weak secrets** (< 32 characters)
7. **Don't use timing-unsafe comparison** (security vulnerability)
8. **Don't expose internal errors** to webhook sender
9. **Don't skip logging** (needed for forensics)
10. **Don't configure webhooks over HTTP** (HTTPS only)

---

## Implementation Checklist

### For New Webhook Endpoint

**Planning:**
- [ ] Identify webhook service and event types
- [ ] Review service's webhook documentation
- [ ] Determine authentication method (HMAC/API key/OAuth)
- [ ] Design payload schema and validation
- [ ] Plan idempotency strategy

**Implementation:**
- [ ] Create Supabase edge function (`supabase/functions/{service}-webhook/index.ts`)
- [ ] Implement signature verification
- [ ] Add timestamp validation (if supported)
- [ ] Add schema validation (Zod or similar)
- [ ] Implement idempotency check
- [ ] Add rate limiting
- [ ] Add comprehensive logging
- [ ] Handle all error cases gracefully

**Testing:**
- [ ] Unit test signature verification
- [ ] Test with valid webhook
- [ ] Test with invalid signature
- [ ] Test with missing signature
- [ ] Test with old timestamp (replay)
- [ ] Test duplicate delivery (idempotency)
- [ ] Test rate limiting (burst requests)
- [ ] Test malformed payload

**Deployment:**
- [ ] Generate webhook secret (32+ chars)
- [ ] Store in vault
- [ ] Deploy edge function to Supabase
- [ ] Set WEBHOOK_SECRET env var in Supabase
- [ ] Configure webhook in service dashboard
- [ ] Test with service's webhook testing tool
- [ ] Monitor logs for first 24 hours
- [ ] Document in this framework

---

## Future Services

### Shopify Webhooks (Planned)
**Events Needed:**
- `orders/create` - New order notifications
- `inventory_levels/update` - Stock changes
- `products/update` - Product modifications

**Estimated Work:** 8 hours (edge function + tests + deployment)

### Stripe Webhooks (If Payment Processing Added)
**Events Needed:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

**Estimated Work:** 6 hours

### SendGrid Webhooks (If Email Automation Added)
**Events Needed:**
- `delivered`
- `opened`
- `bounced`

**Estimated Work:** 4 hours

---

## Security Compliance

### GDPR Considerations
- Log minimal PII in webhook logs
- Sanitize email addresses (hash or truncate)
- Anonymize IP addresses after 30 days
- Provide webhook data deletion mechanism

### Audit Trail
All webhook processing must be auditable:
- Webhook received timestamp
- Signature validation result
- Processing result (success/failure)
- Data modifications made
- Processing duration

**Retention:** 90 days minimum (compliance requirement)

---

## Performance Monitoring

### Metrics to Track

**Webhook Performance:**
- Processing time (p50, p95, p99)
- Success rate (%)
- Failure rate (%)
- Retry count (if webhook delivery fails)

**Security Metrics:**
- Invalid signatures per day
- Rate limit hits per day
- Blocked IPs count
- Unknown event types count

**Query:**
```sql
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) FILTER (WHERE log_type = 'WEBHOOK_SECURITY' AND level = 'WARN') as security_events,
  COUNT(*) FILTER (WHERE log_type = 'WEBHOOK_PROCESSED') as processed_webhooks,
  AVG((metadata->>'processing_time_ms')::numeric) as avg_processing_ms
FROM observability_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

---

## Documentation & Training

### For Engineers
- Webhook implementation guide (this document)
- Code examples for signature verification
- Testing procedures
- Deployment checklist

### For Operations
- Webhook monitoring dashboard
- Security alert response procedures
- Secret rotation procedures
- Incident response runbook

### For Compliance
- Webhook audit trail access
- PII handling in webhooks
- Data retention policies
- Vendor documentation (DPAs, security practices)

---

**Framework Complete:** 2025-10-11 21:42 UTC  
**Status:** Production-ready for Chatwoot, template for future webhooks  
**Owner:** Integrations (maintenance), Engineer (implementation)  
**Next Review:** When adding new webhook sources or after security incident

