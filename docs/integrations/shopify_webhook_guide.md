---
epoch: 2025.10.E1
doc: docs/integrations/shopify_webhook_guide.md
owner: integrations
last_reviewed: 2025-10-14
expires: 2025-10-28
---
# Shopify Webhook Implementation Guide

**For**: Engineer Agent (webhook implementation)  
**From**: Integrations Agent (Shopify expertise)  
**Purpose**: Provide Shopify-specific requirements for webhook infrastructure  
**Task**: P0 Task 1 - Coordinate on webhook implementation

## Overview

This guide provides Shopify-specific webhook requirements, HMAC validation patterns, and webhook types needed for growth automation (Growth Spec A3).

---

## HMAC Signature Verification (CRITICAL)

### Algorithm
- **Hash Function**: SHA-256
- **Encoding**: Base64
- **Header**: `X-Shopify-Hmac-SHA256`
- **Secret**: Shopify App Client Secret (from Partner Dashboard)

### Implementation Pattern

```typescript
import crypto from 'crypto';

/**
 * Verify Shopify webhook HMAC signature
 * 
 * @param rawBody - Raw request body (Buffer or string, BEFORE JSON.parse)
 * @param hmacHeader - Value from X-Shopify-Hmac-SHA256 header
 * @param secret - Shopify app client secret
 * @returns true if signature is valid
 */
export function verifyShopifyWebhook(
  rawBody: Buffer | string,
  hmacHeader: string,
  secret: string
): boolean {
  // Generate HMAC from raw body
  const calculatedHmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHmac),
      Buffer.from(hmacHeader)
    );
  } catch (error) {
    // timingSafeEqual throws if buffer lengths don't match
    return false;
  }
}
```

### Critical Requirements

1. **Use RAW body** - Must verify BEFORE parsing JSON
2. **Timing-safe comparison** - Use `crypto.timingSafeEqual()` (prevents timing attacks)
3. **Express middleware order** - Capture raw body BEFORE `express.json()`

```typescript
// CORRECT: Capture raw body first
app.use('/webhooks', express.raw({ type: 'application/json' }));

// Then verify HMAC
app.post('/webhooks/shopify', (req, res) => {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const rawBody = req.body; // Buffer
  
  if (!verifyShopifyWebhook(rawBody, hmac, SHOPIFY_SECRET)) {
    return res.status(403).send('Forbidden');
  }
  
  // Parse JSON after verification
  const payload = JSON.parse(rawBody.toString('utf8'));
  // Process webhook...
});
```

---

## Required HTTP Headers

### Incoming (From Shopify)

| Header | Example | Purpose |
|--------|---------|---------|
| `X-Shopify-Hmac-SHA256` | `13da8292c5d5030b24a3cf8…` | HMAC signature for verification |
| `X-Shopify-Topic` | `orders/create` | Webhook topic/event type |
| `X-Shopify-Shop-Domain` | `hot-rodan.myshopify.com` | Shop that triggered webhook |
| `X-Shopify-API-Version` | `2025-10` | API version used |
| `X-Shopify-Webhook-Id` | `uuid-string` | Unique webhook delivery ID |

### Validation Checks

```typescript
interface WebhookHeaders {
  hmac: string;
  topic: string;
  shopDomain: string;
  apiVersion: string;
  webhookId: string;
}

function extractAndValidateHeaders(req: Request): WebhookHeaders | null {
  const hmac = req.headers.get('X-Shopify-Hmac-SHA256');
  const topic = req.headers.get('X-Shopify-Topic');
  const shopDomain = req.headers.get('X-Shopify-Shop-Domain');
  const apiVersion = req.headers.get('X-Shopify-API-Version');
  const webhookId = req.headers.get('X-Shopify-Webhook-Id');

  // Validate all required headers present
  if (!hmac || !topic || !shopDomain || !apiVersion || !webhookId) {
    console.error('[Shopify Webhook] Missing required headers');
    return null;
  }

  // Validate shop domain matches expected store
  const expectedDomain = process.env.SHOPIFY_STORE_DOMAIN;
  if (shopDomain !== expectedDomain) {
    console.error(`[Shopify Webhook] Invalid shop: ${shopDomain}`);
    return null;
  }

  return { hmac, topic, shopDomain, apiVersion, webhookId };
}
```

---

## Idempotency (Duplicate Prevention)

### Requirements
- **Webhook ID**: Unique per delivery (from `X-Shopify-Webhook-Id`)
- **Storage**: Track processed webhook IDs to prevent duplicates
- **Retention**: Keep at least 24 hours of IDs (Shopify retries for up to 4 hours)

### Implementation

```typescript
// In-memory store (production should use Redis/database)
const processedWebhooks = new Set<string>();

function isWebhookProcessed(webhookId: string): boolean {
  if (processedWebhooks.has(webhookId)) {
    console.warn(`[Shopify Webhook] Duplicate delivery: ${webhookId}`);
    return true;
  }
  return false;
}

function markWebhookProcessed(webhookId: string): void {
  processedWebhooks.add(webhookId);
  
  // Cleanup old entries (keep last 10,000)
  if (processedWebhooks.size > 10000) {
    const oldest = Array.from(processedWebhooks).slice(0, 1000);
    oldest.forEach(id => processedWebhooks.delete(id));
  }
}

// In webhook handler
app.post('/webhooks/shopify', async (req, res) => {
  const headers = extractAndValidateHeaders(req);
  if (!headers) return res.status(400).send('Bad Request');

  // Check for duplicate
  if (isWebhookProcessed(headers.webhookId)) {
    return res.status(200).send('Already processed');
  }

  // Verify HMAC
  const rawBody = req.body;
  if (!verifyShopifyWebhook(rawBody, headers.hmac, SHOPIFY_SECRET)) {
    return res.status(403).send('Forbidden');
  }

  // Mark as processed BEFORE processing (prevents race conditions)
  markWebhookProcessed(headers.webhookId);

  // Process webhook
  const payload = JSON.parse(rawBody.toString('utf8'));
  await processWebhook(headers.topic, payload);

  return res.status(200).send('OK');
});
```

---

## Webhook Topics Needed for Growth Automation

### Priority Topics (Growth Spec A3)

| Topic | Purpose | Payload |
|-------|---------|---------|
| `products/create` | Track new products for automation | Product object |
| `products/update` | Detect product changes needing automation | Product object |
| `pages/create` | Track manually created pages | Page object |
| `pages/update` | Detect page updates | Page object |
| `collections/create` | Track new collections | Collection object |
| `collections/update` | Detect collection changes | Collection object |

### Secondary Topics (Future)

| Topic | Purpose | Payload |
|-------|---------|---------|
| `orders/create` | Order fulfillment automation | Order object |
| `orders/fulfilled` | Fulfillment tracking | Order object |
| `inventory_levels/update` | Stock monitoring | Inventory level |

### Configuration (shopify.app.toml)

```toml
[webhooks]
api_version = "2025-10"

  # Growth automation webhooks
  [[webhooks.subscriptions]]
  topics = ["products/create"]
  uri = "/webhooks/products/create"

  [[webhooks.subscriptions]]
  topics = ["products/update"]
  uri = "/webhooks/products/update"

  [[webhooks.subscriptions]]
  topics = ["pages/create"]
  uri = "/webhooks/pages/create"

  [[webhooks.subscriptions]]
  topics = ["pages/update"]
  uri = "/webhooks/pages/update"

  [[webhooks.subscriptions]]
  topics = ["collections/create"]
  uri = "/webhooks/collections/create"

  [[webhooks.subscriptions]]
  topics = ["collections/update"]
  uri = "/webhooks/collections/update"
```

---

## Response Requirements

### Timing
- **Connection**: Must establish within 1 second
- **Total Response**: Must complete within 5 seconds
- **Success Code**: Must return `200 OK`

### Retry Behavior
- **Retry Count**: 8 times over 4 hours if no 200 response
- **Auto-Delete**: Subscription deleted after 8 consecutive failures
- **Warning**: Email sent to app developer before deletion

### Recommended Pattern: Queue for Later Processing

```typescript
import Queue from 'better-queue';

// Create webhook processing queue
const webhookQueue = new Queue(async (job: { topic: string; payload: any }) => {
  // Process webhook asynchronously
  await processWebhook(job.topic, job.payload);
});

app.post('/webhooks/shopify', async (req, res) => {
  // 1. Validate HMAC (fast)
  const headers = extractAndValidateHeaders(req);
  if (!headers) return res.status(400).send('Bad Request');

  const rawBody = req.body;
  if (!verifyShopifyWebhook(rawBody, headers.hmac, SHOPIFY_SECRET)) {
    return res.status(403).send('Forbidden');
  }

  // 2. Check idempotency (fast)
  if (isWebhookProcessed(headers.webhookId)) {
    return res.status(200).send('Already processed');
  }

  // 3. Queue for processing (fast)
  const payload = JSON.parse(rawBody.toString('utf8'));
  webhookQueue.push({ topic: headers.topic, payload });
  
  // 4. Mark as processing and respond immediately
  markWebhookProcessed(headers.webhookId);
  res.status(200).send('OK');
  
  // Processing happens asynchronously in queue
});
```

---

## Complete Webhook Handler Template

```typescript
// app/routes/webhooks.shopify.ts
import { ActionFunctionArgs } from 'react-router';
import crypto from 'crypto';

const SHOPIFY_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET!;
const EXPECTED_SHOP = process.env.SHOPIFY_STORE_DOMAIN!;

export async function action({ request }: ActionFunctionArgs) {
  // 1. Extract headers
  const hmac = request.headers.get('X-Shopify-Hmac-SHA256');
  const topic = request.headers.get('X-Shopify-Topic');
  const shopDomain = request.headers.get('X-Shopify-Shop-Domain');
  const webhookId = request.headers.get('X-Shopify-Webhook-Id');

  // 2. Validate headers present
  if (!hmac || !topic || !shopDomain || !webhookId) {
    console.error('[Shopify Webhook] Missing headers');
    return new Response('Bad Request', { status: 400 });
  }

  // 3. Validate shop domain
  if (shopDomain !== EXPECTED_SHOP) {
    console.error(`[Shopify Webhook] Invalid shop: ${shopDomain}`);
    return new Response('Forbidden', { status: 403 });
  }

  // 4. Get raw body
  const rawBody = await request.text();

  // 5. Verify HMAC signature
  const calculatedHmac = crypto
    .createHmac('sha256', SHOPIFY_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(calculatedHmac),
    Buffer.from(hmac)
  );

  if (!isValid) {
    console.error('[Shopify Webhook] Invalid HMAC signature');
    return new Response('Forbidden', { status: 403 });
  }

  // 6. Check idempotency
  if (await isWebhookProcessed(webhookId)) {
    return new Response('Already processed', { status: 200 });
  }

  // 7. Mark as processed
  await markWebhookProcessed(webhookId);

  // 8. Parse payload
  const payload = JSON.parse(rawBody);

  // 9. Queue or process based on topic
  switch (topic) {
    case 'products/create':
      await queueProductAutomation(payload);
      break;
    case 'products/update':
      await queueProductAutomation(payload);
      break;
    case 'pages/create':
      await queuePageAutomation(payload);
      break;
    case 'pages/update':
      await queuePageAutomation(payload);
      break;
    default:
      console.log(`[Shopify Webhook] Unhandled topic: ${topic}`);
  }

  // 10. Always return 200 OK
  return new Response('OK', { status: 200 });
}
```

---

## Testing Webhooks

### Using Shopify CLI

```bash
# Trigger test webhook
shopify app webhook trigger \
  --topic=products/create \
  --address=/webhooks/shopify
```

### Manual Test with curl

```bash
#!/bin/bash
# Test webhook with valid HMAC

SECRET="your-webhook-secret"
PAYLOAD='{"id":12345,"title":"Test Product"}'

# Generate HMAC
HMAC=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -binary | base64)

# Send request
curl -X POST http://localhost:3000/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Hmac-SHA256: $HMAC" \
  -H "X-Shopify-Topic: products/create" \
  -H "X-Shopify-Shop-Domain: test-store.myshopify.com" \
  -H "X-Shopify-Webhook-Id: test-$(date +%s)" \
  -d "$PAYLOAD"
```

---

## Webhook Payload Examples

### products/create

```json
{
  "id": 8706585378117,
  "title": "Hot Rod AN Fitting - 6AN",
  "body_html": "<p>Premium aluminum fitting</p>",
  "vendor": "Hot Rod AN",
  "product_type": "Fittings",
  "tags": ["PACK:5", "automotive"],
  "status": "active",
  "variants": [
    {
      "id": 45656945524037,
      "title": "Default Title",
      "price": "12.99",
      "sku": "HRA-6AN-001",
      "inventory_quantity": 100
    }
  ],
  "created_at": "2025-10-14T18:00:00Z",
  "updated_at": "2025-10-14T18:00:00Z"
}
```

### pages/create

```json
{
  "id": 123456789,
  "title": "How to Install AN Fittings",
  "handle": "how-to-install-an-fittings",
  "body_html": "<p>Installation guide content...</p>",
  "author": "HotDash Automation",
  "created_at": "2025-10-14T18:00:00Z",
  "updated_at": "2025-10-14T18:00:00Z",
  "published_at": "2025-10-14T18:00:00Z"
}
```

---

## Integration with Growth Automation

### Webhook → Action Queue Flow

```typescript
// When webhook received → Queue action for AI processing

async function queueProductAutomation(product: any) {
  // 1. Store webhook payload
  await db.webhookEvents.create({
    type: 'shopify_product',
    shopifyId: product.id,
    payload: product,
    receivedAt: new Date()
  });

  // 2. Trigger AI analysis
  await db.actions.create({
    type: 'analyze_product_seo',
    status: 'pending',
    payload: {
      productId: product.id,
      title: product.title,
      tags: product.tags
    }
  });

  console.log(`[Growth] Queued SEO analysis for product: ${product.title}`);
}

async function queuePageAutomation(page: any) {
  // Similar pattern for pages
  await db.webhookEvents.create({
    type: 'shopify_page',
    shopifyId: page.id,
    payload: page,
    receivedAt: new Date()
  });

  await db.actions.create({
    type: 'analyze_page_seo',
    status: 'pending',
    payload: {
      pageId: page.id,
      title: page.title,
      handle: page.handle
    }
  });
}
```

---

## Error Handling

### Shopify Retry Behavior
- 8 retries over 4 hours (exponential backoff)
- Webhook deleted after 8 consecutive failures
- Warning email before deletion

### Recommended Error Response Strategy

```typescript
try {
  // Process webhook
  await processWebhook(topic, payload);
  return new Response('OK', { status: 200 });
} catch (error) {
  // Log error but still return 200 to prevent retries
  console.error('[Shopify Webhook] Processing error:', error);
  
  // Store failed webhook for manual review
  await db.failedWebhooks.create({
    webhookId,
    topic,
    payload,
    error: error.message,
    receivedAt: new Date()
  });

  // Return 200 to stop Shopify retries
  // We'll handle retry internally
  return new Response('Accepted', { status: 200 });
}
```

---

## Monitoring & Logging

### Metrics to Track

```typescript
// Log metrics for each webhook
console.log(JSON.stringify({
  event: 'shopify_webhook_received',
  topic: headers.topic,
  webhookId: headers.webhookId,
  shopDomain: headers.shopDomain,
  processingTime: Date.now() - startTime,
  status: 'success'
}));
```

### Alert Conditions
- HMAC validation failures > 5/minute → Possible attack
- Processing time > 3 seconds → Performance issue
- Duplicate webhooks > 10/minute → Retry storm
- Failed processing > 10% → Integration issue

---

## Security Checklist

- [ ] HMAC signature verification implemented
- [ ] Timing-safe comparison used
- [ ] Raw body captured before parsing
- [ ] Shop domain validation
- [ ] Idempotency tracking (webhook IDs)
- [ ] Rate limiting per IP (optional but recommended)
- [ ] Suspicious request logging
- [ ] Webhook secret stored in vault
- [ ] All webhook handlers return 200 OK
- [ ] Queue processing for long-running tasks

---

## References

- Shopify Webhooks: https://shopify.dev/docs/apps/build/webhooks
- HMAC Verification: https://shopify.dev/docs/apps/build/webhooks/subscribe/https
- Webhook Topics: https://shopify.dev/docs/api/webhooks
- React Router Webhooks: https://shopify.dev/docs/api/shopify-app-react-router/latest/guide-webhooks

---

**For Engineer**: This guide provides Shopify-specific requirements. Implement webhook infrastructure using these patterns, then coordinate with Integrations agent for Shopify MCP validation.

**Next Steps**:
1. Engineer implements webhook handlers using patterns above
2. Integrations validates with Shopify MCP
3. Test with Shopify CLI trigger
4. Deploy to staging for live testing

