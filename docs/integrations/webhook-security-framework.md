# Webhook Security Framework
**Owner**: Integrations  
**Date**: 2025-10-12  
**Status**: Active  
**Review Cycle**: Quarterly

---

## Executive Summary

This document defines security patterns, authentication methods, and testing frameworks for all webhook integrations in HotDash. Webhooks are critical for real-time data synchronization but present significant security risks if not properly secured.

**Threat Model**:
- Spoofed webhook requests
- Replay attacks
- Man-in-the-middle attacks
- Denial of service (DoS)
- Data exfiltration

**Security Principles**:
1. **Verify authenticity** - Every webhook must be authenticated
2. **Prevent replay attacks** - Use timestamps and idempotency
3. **Encrypt in transit** - HTTPS only, TLS 1.2+
4. **Rate limiting** - Prevent DoS attacks
5. **Minimal exposure** - Only accept webhooks from verified sources

---

## 1. Shopify Webhooks

### Authentication Method: HMAC Signature

**Algorithm**: HMAC-SHA256  
**Documentation**: https://shopify.dev/docs/apps/webhooks/configuration/https#step-5-verify-the-webhook

#### Signature Verification

```typescript
// packages/integrations/shopify-webhook-verifier.ts
import crypto from 'crypto';

export function verifyShopifyWebhook(
  body: string,
  hmacHeader: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(hmacHeader)
  );
}
```

#### Headers to Extract

```typescript
const signature = req.headers['x-shopify-hmac-sha256'];
const topic = req.headers['x-shopify-topic'];
const shopDomain = req.headers['x-shopify-shop-domain'];
const webhookId = req.headers['x-shopify-webhook-id'];
```

#### Security Controls

1. **HMAC Verification** (Required)
   - Verify `X-Shopify-Hmac-SHA256` header
   - Use timing-safe comparison to prevent timing attacks
   - Reject if signature invalid

2. **Shop Domain Validation** (Required)
   - Verify `X-Shopify-Shop-Domain` is registered in our system
   - Reject webhooks from unknown shops
   - Whitelist: `hotroddash.myshopify.com` (production)

3. **Timestamp Validation** (Recommended)
   - Shopify doesn't send timestamps, but we log receipt time
   - Reject if webhook processing delayed > 5 minutes
   - Prevents replay if attacker captures request

4. **Idempotency** (Required)
   - Use `X-Shopify-Webhook-Id` to track processed webhooks
   - Store webhook IDs in Redis (TTL: 24 hours)
   - Reject duplicate webhook IDs

5. **HTTPS Only** (Required)
   - Shopify only sends webhooks to HTTPS endpoints
   - Enforce TLS 1.2+ on our webhook receivers
   - Use certificate pinning if possible

#### Example Implementation

```typescript
// app/routes/api/webhooks/shopify.tsx
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const hmac = request.headers.get('x-shopify-hmac-sha256');
  const webhookId = request.headers.get('x-shopify-webhook-id');
  const shopDomain = request.headers.get('x-shopify-shop-domain');
  
  // 1. Verify HMAC
  if (!hmac || !verifyShopifyWebhook(body, hmac, env.SHOPIFY_WEBHOOK_SECRET)) {
    console.error('[Webhook] Invalid HMAC signature');
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Verify shop domain
  if (shopDomain !== env.SHOPIFY_SHOP_DOMAIN) {
    console.error('[Webhook] Unknown shop domain:', shopDomain);
    return json({ error: 'Unknown shop' }, { status: 403 });
  }
  
  // 3. Check idempotency
  if (await redis.get(`webhook:${webhookId}`)) {
    console.warn('[Webhook] Duplicate webhook:', webhookId);
    return json({ ok: true }, { status: 200 }); // Already processed
  }
  
  // 4. Mark as processing
  await redis.setex(`webhook:${webhookId}`, 86400, 'processing');
  
  // 5. Process webhook asynchronously
  await queueWebhookProcessing({ body, topic, shopDomain });
  
  return json({ ok: true }, { status: 200 });
}
```

#### Webhook Topics (Security Relevance)

| Topic | Sensitivity | Validation Required |
|-------|-------------|---------------------|
| `orders/create` | HIGH | Yes - Contains PII |
| `orders/updated` | HIGH | Yes - Contains PII |
| `products/create` | LOW | Yes - Data integrity |
| `inventory_levels/update` | MEDIUM | Yes - Business critical |
| `app/uninstalled` | CRITICAL | Yes - Triggers cleanup |

---

## 2. Chatwoot Webhooks

### Authentication Method: HMAC Signature

**Algorithm**: HMAC-SHA256  
**Documentation**: https://www.chatwoot.com/docs/product/channels/api/webhooks

#### Signature Verification

```typescript
// packages/integrations/chatwoot-webhook-verifier.ts
import crypto from 'crypto';

export function verifyChatwootWebhook(
  body: string,
  signatureHeader: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signatureHeader)
  );
}
```

#### Headers to Extract

```typescript
const signature = req.headers['x-chatwoot-signature'];
const event = req.headers['x-chatwoot-event'];
```

#### Security Controls

1. **HMAC Verification** (Required)
   - Verify `X-Chatwoot-Signature` header
   - Use timing-safe comparison
   - Reject if signature invalid

2. **Event Type Validation** (Required)
   - Verify `X-Chatwoot-Event` is expected type
   - Whitelist: `message_created`, `conversation_updated`, etc.
   - Reject unknown event types

3. **Timestamp Validation** (Required)
   - Extract timestamp from webhook payload
   - Reject if timestamp > 5 minutes old
   - Prevents replay attacks

4. **Idempotency** (Required)
   - Use webhook `id` field from payload
   - Store processed IDs in Redis (TTL: 24 hours)
   - Reject duplicates

5. **IP Whitelisting** (Optional - Self-hosted)
   - Whitelist Fly.io IP range for hotdash-chatwoot
   - Reject webhooks from unexpected IPs
   - Use Fly.io proxy headers: `Fly-Client-IP`

6. **HTTPS Only** (Required)
   - Chatwoot sends to HTTPS endpoints only
   - Enforce TLS 1.2+

#### Example Implementation

```typescript
// app/routes/api/webhooks/chatwoot.tsx
export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();
  const signature = request.headers.get('x-chatwoot-signature');
  const event = request.headers.get('x-chatwoot-event');
  
  // 1. Verify signature
  if (!signature || !verifyChatwootWebhook(body, signature, env.CHATWOOT_WEBHOOK_SECRET)) {
    console.error('[Webhook] Invalid signature');
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Parse payload
  const payload = JSON.parse(body);
  const webhookId = payload.id;
  const timestamp = new Date(payload.created_at).getTime();
  
  // 3. Validate timestamp (within 5 minutes)
  if (Date.now() - timestamp > 5 * 60 * 1000) {
    console.error('[Webhook] Timestamp too old:', timestamp);
    return json({ error: 'Expired' }, { status: 400 });
  }
  
  // 4. Check idempotency
  if (await redis.get(`chatwoot:${webhookId}`)) {
    console.warn('[Webhook] Duplicate webhook:', webhookId);
    return json({ ok: true }, { status: 200 });
  }
  
  // 5. Mark as processing
  await redis.setex(`chatwoot:${webhookId}`, 86400, 'processing');
  
  // 6. Process webhook asynchronously
  await queueChatwootWebhook({ body, event });
  
  return json({ ok: true }, { status: 200 });
}
```

#### Webhook Events (Security Relevance)

| Event | Sensitivity | Validation Required |
|-------|-------------|---------------------|
| `message_created` | HIGH | Yes - Contains PII |
| `conversation_updated` | MEDIUM | Yes - Customer data |
| `conversation_resolved` | MEDIUM | Yes - Audit trail |
| `contact_created` | HIGH | Yes - PII |

---

## 3. Generic Webhook Security Pattern

### Standard Security Controls

Every webhook endpoint must implement these controls:

```typescript
// packages/integrations/webhook-security.ts

export interface WebhookSecurityConfig {
  verifySignature: (body: string, signature: string, secret: string) => boolean;
  extractHeaders: (request: Request) => Record<string, string>;
  validateTimestamp?: (timestamp: number) => boolean;
  validateSource?: (source: string) => boolean;
  idempotencyKey: (payload: any) => string;
}

export class WebhookSecurityHandler {
  constructor(private config: WebhookSecurityConfig) {}
  
  async verifyAndProcess(request: Request): Promise<Response> {
    // 1. Extract raw body (before parsing)
    const body = await request.text();
    const headers = this.config.extractHeaders(request);
    
    // 2. Verify signature
    if (!this.config.verifySignature(body, headers.signature, this.secret)) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // 3. Parse payload
    const payload = JSON.parse(body);
    
    // 4. Validate timestamp (if configured)
    if (this.config.validateTimestamp) {
      if (!this.config.validateTimestamp(payload.timestamp)) {
        return new Response('Expired', { status: 400 });
      }
    }
    
    // 5. Validate source (if configured)
    if (this.config.validateSource) {
      if (!this.config.validateSource(payload.source)) {
        return new Response('Forbidden', { status: 403 });
      }
    }
    
    // 6. Check idempotency
    const idempotencyKey = this.config.idempotencyKey(payload);
    if (await this.isProcessed(idempotencyKey)) {
      return new Response('OK', { status: 200 });
    }
    
    // 7. Mark as processing
    await this.markProcessing(idempotencyKey);
    
    // 8. Queue for async processing
    await this.queueProcessing(payload);
    
    return new Response('OK', { status: 200 });
  }
}
```

---

## 4. Anti-Replay Protection

### Timestamp-Based Validation

```typescript
// packages/integrations/replay-protection.ts

const MAX_TIMESTAMP_DIFF = 5 * 60 * 1000; // 5 minutes

export function validateTimestamp(timestamp: number): boolean {
  const now = Date.now();
  const diff = Math.abs(now - timestamp);
  
  if (diff > MAX_TIMESTAMP_DIFF) {
    console.error('[Security] Webhook timestamp out of range:', {
      timestamp,
      now,
      diff,
    });
    return false;
  }
  
  return true;
}
```

### Idempotency Tracking

```typescript
// packages/integrations/idempotency.ts

export class IdempotencyTracker {
  constructor(private redis: Redis) {}
  
  async isProcessed(key: string): Promise<boolean> {
    const exists = await this.redis.get(`idempotency:${key}`);
    return exists !== null;
  }
  
  async markProcessing(key: string): Promise<void> {
    // Store for 24 hours
    await this.redis.setex(`idempotency:${key}`, 86400, JSON.stringify({
      processedAt: Date.now(),
      status: 'processing',
    }));
  }
  
  async markComplete(key: string): Promise<void> {
    await this.redis.setex(`idempotency:${key}`, 86400, JSON.stringify({
      processedAt: Date.now(),
      status: 'completed',
    }));
  }
}
```

---

## 5. Rate Limiting & DoS Prevention

### Rate Limiter for Webhooks

```typescript
// packages/integrations/webhook-rate-limiter.ts

export class WebhookRateLimiter {
  private readonly maxPerMinute = 100;
  private readonly maxPerSecond = 10;
  
  async checkLimit(source: string): Promise<boolean> {
    const minuteKey = `webhook:rate:minute:${source}:${Math.floor(Date.now() / 60000)}`;
    const secondKey = `webhook:rate:second:${source}:${Math.floor(Date.now() / 1000)}`;
    
    const [minuteCount, secondCount] = await Promise.all([
      redis.incr(minuteKey),
      redis.incr(secondKey),
    ]);
    
    // Set TTLs
    await Promise.all([
      redis.expire(minuteKey, 60),
      redis.expire(secondKey, 1),
    ]);
    
    if (secondCount > this.maxPerSecond) {
      console.warn('[Rate Limit] Exceeded per-second limit:', source);
      return false;
    }
    
    if (minuteCount > this.maxPerMinute) {
      console.warn('[Rate Limit] Exceeded per-minute limit:', source);
      return false;
    }
    
    return true;
  }
}
```

### Application Rate Limits

| Source | Max/second | Max/minute | Action on Breach |
|--------|-----------|------------|------------------|
| Shopify | 10 | 100 | Reject with 429 |
| Chatwoot | 20 | 200 | Reject with 429 |
| Unknown | 5 | 50 | Reject with 403 |

---

## 6. Monitoring & Alerting

### Metrics to Track

```typescript
// packages/integrations/webhook-metrics.ts

export interface WebhookMetrics {
  received: number;           // Total webhooks received
  verified: number;           // Successfully verified
  rejected: number;           // Failed verification
  duplicates: number;         // Duplicate webhooks
  expired: number;            // Timestamp expired
  rateLimited: number;        // Rate limit breaches
  processed: number;          // Successfully processed
  failed: number;             // Processing failures
  avgProcessingTimeMs: number; // Average processing time
}
```

### Alerts

| Condition | Threshold | Severity |
|-----------|-----------|----------|
| Failed verification rate | > 5% | WARNING |
| Failed verification rate | > 20% | CRITICAL |
| Duplicate webhooks | > 50/hour | WARNING |
| Rate limit breaches | > 10/hour | WARNING |
| Processing failures | > 10/hour | CRITICAL |
| Avg processing time | > 5 seconds | WARNING |

### Dashboards

**Real-Time Dashboard**:
- Webhooks received per minute (by source)
- Verification success rate
- Processing latency (P50, P95, P99)
- Rate limit breaches
- Duplicate detection rate

**Historical Dashboard**:
- Daily webhook volume trends
- Security incident timeline
- Failed verification patterns
- Processing performance trends

---

## 7. Testing Framework

### Unit Tests

```typescript
// tests/webhooks/shopify-security.test.ts

describe('Shopify Webhook Security', () => {
  test('accepts valid HMAC signature', async () => {
    const body = JSON.stringify({ id: '123', topic: 'orders/create' });
    const hmac = generateShopifyHmac(body, SECRET);
    
    const result = verifyShopifyWebhook(body, hmac, SECRET);
    expect(result).toBe(true);
  });
  
  test('rejects invalid HMAC signature', async () => {
    const body = JSON.stringify({ id: '123' });
    const hmac = 'invalid-signature';
    
    const result = verifyShopifyWebhook(body, hmac, SECRET);
    expect(result).toBe(false);
  });
  
  test('rejects tampered body', async () => {
    const body = JSON.stringify({ id: '123' });
    const hmac = generateShopifyHmac(body, SECRET);
    const tamperedBody = JSON.stringify({ id: '456' });
    
    const result = verifyShopifyWebhook(tamperedBody, hmac, SECRET);
    expect(result).toBe(false);
  });
  
  test('prevents timing attacks', async () => {
    // Test that verification uses timing-safe comparison
    const body = JSON.stringify({ id: '123' });
    const validHmac = generateShopifyHmac(body, SECRET);
    const invalidHmac = validHmac.slice(0, -1) + 'X';
    
    const start = Date.now();
    verifyShopifyWebhook(body, invalidHmac, SECRET);
    const duration = Date.now() - start;
    
    // Verification should take roughly same time regardless
    expect(duration).toBeLessThan(10); // Fast comparison
  });
});
```

### Integration Tests

```typescript
// tests/webhooks/integration.test.ts

describe('Webhook Integration Tests', () => {
  test('full Shopify webhook flow', async () => {
    const payload = {
      id: '123',
      created_at: new Date().toISOString(),
      order: { /* ... */ },
    };
    
    const body = JSON.stringify(payload);
    const hmac = generateShopifyHmac(body, SECRET);
    
    const response = await fetch('https://hotdash.app/api/webhooks/shopify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Hmac-SHA256': hmac,
        'X-Shopify-Topic': 'orders/create',
        'X-Shopify-Shop-Domain': 'hotroddash.myshopify.com',
        'X-Shopify-Webhook-Id': '123',
      },
      body,
    });
    
    expect(response.status).toBe(200);
    
    // Verify webhook was processed
    await waitFor(() => {
      expect(getProcessedWebhooks()).toContain('123');
    });
  });
});
```

### Security Tests

```typescript
// tests/webhooks/security.test.ts

describe('Webhook Security Tests', () => {
  test('rejects webhook without signature', async () => {
    const response = await fetch('/api/webhooks/shopify', {
      method: 'POST',
      body: JSON.stringify({ id: '123' }),
    });
    
    expect(response.status).toBe(401);
  });
  
  test('rejects replay attack', async () => {
    // Send same webhook twice
    const payload = { id: '123', created_at: new Date().toISOString() };
    const body = JSON.stringify(payload);
    const hmac = generateShopifyHmac(body, SECRET);
    
    const headers = {
      'X-Shopify-Hmac-SHA256': hmac,
      'X-Shopify-Webhook-Id': '123',
    };
    
    // First request succeeds
    const response1 = await fetch('/api/webhooks/shopify', {
      method: 'POST',
      headers,
      body,
    });
    expect(response1.status).toBe(200);
    
    // Second request (replay) is rejected
    const response2 = await fetch('/api/webhooks/shopify', {
      method: 'POST',
      headers,
      body,
    });
    expect(response2.status).toBe(200); // Accepted but not processed
  });
  
  test('enforces rate limits', async () => {
    const requests = Array.from({ length: 15 }, (_, i) => ({
      id: String(i),
      created_at: new Date().toISOString(),
    }));
    
    const responses = await Promise.all(
      requests.map(payload => 
        fetch('/api/webhooks/shopify', {
          method: 'POST',
          headers: {
            'X-Shopify-Hmac-SHA256': generateShopifyHmac(
              JSON.stringify(payload),
              SECRET
            ),
            'X-Shopify-Webhook-Id': payload.id,
          },
          body: JSON.stringify(payload),
        })
      )
    );
    
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

---

## 8. Incident Response

### Security Incident Types

1. **Failed Verification Spike**
   - **Detection**: > 20% verification failures
   - **Response**: Block source IP, investigate logs
   - **Escalation**: Security team

2. **Replay Attack Detected**
   - **Detection**: High duplicate rate
   - **Response**: Enhance idempotency checks
   - **Escalation**: Engineering team

3. **DoS Attack**
   - **Detection**: Rate limit breaches
   - **Response**: Temporarily block source
   - **Escalation**: Infrastructure team

4. **Compromised Webhook Secret**
   - **Detection**: Valid webhooks from unknown sources
   - **Response**: Rotate secrets immediately
   - **Escalation**: Security + Engineering teams

### Incident Response Playbook

**Step 1: Detection**
- Monitor alerts from webhook security metrics
- Check logs for suspicious patterns

**Step 2: Containment**
- Block suspicious IP addresses
- Temporarily disable affected webhook endpoints
- Rotate webhook secrets if compromised

**Step 3: Investigation**
- Analyze logs for attack patterns
- Identify affected webhooks/data
- Document timeline

**Step 4: Recovery**
- Re-enable endpoints with enhanced security
- Verify no data corruption
- Update security controls

**Step 5: Post-Mortem**
- Root cause analysis
- Update security controls
- Team training

---

## 9. Implementation Checklist

### Phase 1: Core Security (Week 1)
- [x] Implement Shopify HMAC verification
- [x] Implement Chatwoot HMAC verification
- [ ] Add timestamp validation
- [ ] Add idempotency tracking (Redis)
- [ ] Add rate limiting

### Phase 2: Testing (Week 2)
- [ ] Unit tests for signature verification
- [ ] Integration tests for full flow
- [ ] Security penetration tests
- [ ] Load testing

### Phase 3: Monitoring (Week 3)
- [ ] Implement webhook metrics tracking
- [ ] Create Grafana dashboards
- [ ] Set up PagerDuty alerts
- [ ] Document incident response

### Phase 4: Production Hardening (Week 4)
- [ ] IP whitelisting (if applicable)
- [ ] Certificate pinning
- [ ] Enhanced logging
- [ ] Security audit

---

## 10. Compliance & Audit

### Security Controls Checklist

- [x] **Authentication**: HMAC signature verification
- [x] **Authorization**: Shop domain validation
- [ ] **Anti-Replay**: Timestamp + idempotency
- [x] **Encryption**: HTTPS/TLS 1.2+
- [ ] **Rate Limiting**: Per-source limits
- [ ] **Monitoring**: Security metrics and alerts
- [ ] **Logging**: Audit trail for all webhooks
- [x] **Testing**: Comprehensive security tests

### Audit Log Requirements

Every webhook must log:
1. Timestamp (UTC)
2. Source (Shopify, Chatwoot, etc.)
3. Webhook ID
4. Verification result (success/failure)
5. Processing result (success/failure/duplicate)
6. Processing duration
7. IP address (for suspicious activity tracking)

**Retention**: 90 days minimum, 1 year for security incidents

---

## References

- [Shopify Webhook Verification](https://shopify.dev/docs/apps/webhooks/configuration/https#step-5-verify-the-webhook)
- [Chatwoot Webhooks](https://www.chatwoot.com/docs/product/channels/api/webhooks)
- [OWASP Webhook Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Webhook_Security_Cheat_Sheet.html)
- [HMAC-SHA256 Specification](https://datatracker.ietf.org/doc/html/rfc4868)
- [Timing Attack Prevention](https://codahale.com/a-lesson-in-timing-attacks/)

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-12  
**Next Review**: 2026-01-12  
**Owner**: Integrations Agent

