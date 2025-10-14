# Webhook Security Middleware

HMAC validation, rate limiting, and security middleware for Agent SDK webhooks.

## HMAC Validation

### Usage

**Basic usage:**
```typescript
import { hmacValidation } from './middleware/hmac-validation';

app.post('/webhooks/chatwoot', 
  hmacValidation('CHATWOOT_WEBHOOK_SECRET'),
  webhookHandler
);
```

**Chatwoot webhooks:**
```typescript
import { chatwootHMACValidation } from './middleware/hmac-validation';

app.post('/webhooks/chatwoot', 
  chatwootHMACValidation(),
  webhookHandler
);
```

**Shopify webhooks:**
```typescript
import { shopifyHMACValidation } from './middleware/hmac-validation';

app.post('/webhooks/shopify', 
  shopifyHMACValidation(),
  webhookHandler
);
```

### Features

✅ HMAC-SHA256 signature validation  
✅ Replay protection (timestamp + nonce)  
✅ Timing-safe comparison  
✅ Configurable tolerance  

### Configuration

```typescript
hmacValidation('SECRET_ENV_VAR', {
  algorithm: 'sha256',              // HMAC algorithm
  header: 'x-webhook-signature',    // Signature header name
  timestampHeader: 'x-webhook-timestamp', // Timestamp header
  timestampTolerance: 300,          // 5 minutes (seconds)
  nonceStore: new Set(),            // Nonce storage for replay protection
})
```

### Request Headers

**Required:**
- `x-webhook-signature`: HMAC signature of request body

**Optional (for replay protection):**
- `x-webhook-timestamp`: Unix timestamp (seconds)
- `x-webhook-nonce`: Unique request identifier

### Signature Generation (Webhook Sender)

```bash
# Example: Generate HMAC signature
secret="your-webhook-secret"
payload='{"event":"test"}'

signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$secret" | cut -d' ' -f2)
echo "x-webhook-signature: $signature"
```

---

## Rate Limiting

Prevent webhook spam and DoS attacks.

### Usage

```typescript
import { webhookRateLimit } from './middleware/hmac-validation';

app.post('/webhooks/chatwoot',
  webhookRateLimit(100, 60000), // 100 req/min
  chatwootHMACValidation(),
  webhookHandler
);
```

### Parameters

- `maxRequests`: Maximum requests per window (default: 100)
- `windowMs`: Time window in milliseconds (default: 60000 = 1 min)

### Behavior

- Tracks requests by IP address
- Returns `429 Too Many Requests` when limit exceeded
- Automatic window reset

---

## IP Allowlist

Restrict webhooks to specific IPs.

### Usage

```typescript
import { ipAllowlist } from './middleware/hmac-validation';

const chatwootIPs = ['192.168.1.100', '10.0.0.50'];

app.post('/webhooks/chatwoot',
  ipAllowlist(chatwootIPs),
  chatwootHMACValidation(),
  webhookHandler
);
```

---

## Complete Integration Example

```typescript
import express from 'express';
import { 
  chatwootHMACValidation, 
  webhookRateLimit,
  ipAllowlist 
} from './middleware/hmac-validation';

const app = express();

// Chatwoot webhook with full security
app.post('/webhooks/chatwoot',
  webhookRateLimit(100, 60000),           // Rate limit: 100/min
  ipAllowlist(['192.168.1.100']),         // IP allowlist (optional)
  chatwootHMACValidation(),               // HMAC validation
  async (req, res) => {
    // Webhook is validated - safe to process
    const event = req.body;
    console.log('Validated webhook:', event);
    res.json({ received: true });
  }
);

// Generic webhook with custom secret
app.post('/webhooks/custom',
  webhookRateLimit(50, 60000),
  hmacValidation('CUSTOM_WEBHOOK_SECRET', {
    header: 'x-custom-signature',
    timestampTolerance: 600, // 10 minutes
  }),
  customWebhookHandler
);
```

---

## Security Headers

Set webhook secret in environment:

```bash
# .env
CHATWOOT_WEBHOOK_SECRET=your-secret-here
SHOPIFY_WEBHOOK_SECRET=your-secret-here
CUSTOM_WEBHOOK_SECRET=your-secret-here
```

**Generate strong secrets:**
```bash
# Generate 32-byte random secret
openssl rand -hex 32
```

---

## Testing

Run security tests:
```bash
npm test -- hmac-validation.test.ts
```

**Test coverage:**
- Valid signature → Pass ✅
- Invalid signature → 401 ❌
- Missing signature → 401 ❌
- Expired timestamp → 401 ❌
- Replay attack (duplicate nonce) → 401 ❌
- Rate limit exceeded → 429 ❌

---

## Troubleshooting

### "Invalid signature"
- Verify webhook secret matches sender's secret
- Check request body format (exact JSON match)
- Ensure no middleware modifies body before validation

### "Request expired"
- Check server clock sync (NTP)
- Adjust `timestampTolerance` if needed
- Verify timestamp is in seconds (not milliseconds)

### "Duplicate request"
- Normal for replay attack prevention
- Check nonce is unique per request
- Nonce store clears after 10,000 entries

---

**Security Contact**: @compliance  
**Integration Support**: @engineer  
**Last Updated**: 2025-10-14

