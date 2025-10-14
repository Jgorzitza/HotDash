## Webhook Security Service

Comprehensive webhook security middleware for HotDash integrations.

### Features

- **HMAC Signature Validation**: Verifies webhook authenticity using timing-safe comparison
- **Idempotency Keys**: Prevents duplicate processing of webhooks
- **Replay Protection**: Validates webhook timestamps (default: 5 minute window)

### Supported Sources

- Shopify
- Chatwoot
- Stripe
- SendGrid
- Generic/Other

### Usage Example

```typescript
import { createWebhookSecurity } from '~/services/webhooks/security.server';

export const action: ActionFunction = async ({ request }) => {
  // Create security validator
  const security = createWebhookSecurity({
    source: 'shopify',
    secret: process.env.SHOPIFY_API_SECRET!,
  });

  // Validate webhook
  const validation = await security.validate(request);
  if (!validation.valid) {
    return new Response(validation.error, { status: validation.status });
  }

  // Process webhook safely
  const result = await processWebhook(request);

  // Mark as processed (idempotency)
  await security.markProcessed(validation.idempotencyKey!);

  return json({ success: true, result });
};
```

### Configuration Options

```typescript
interface WebhookSecurityConfig {
  source: 'shopify' | 'chatwoot' | 'stripe' | 'sendgrid' | 'other';
  secret: string; // HMAC secret key
  signatureHeader?: string; // Default: auto-detected per source
  timestampHeader?: string; // Default: auto-detected per source
  maxAgeSeconds?: number; // Default: 300 (5 minutes)
  algorithm?: 'sha256' | 'sha1'; // Default: sha256
}
```

### Database Schema

The `processed_webhook` table stores idempotency keys:

```sql
CREATE TABLE processed_webhook (
  id UUID PRIMARY KEY,
  source TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE (source, idempotency_key)
);
```

### Cleanup

Expired webhooks (older than 7 days) should be cleaned up periodically:

```typescript
import { cleanupExpiredWebhooks } from '~/services/webhooks/security.server';

// Run daily via cron or scheduled job
await cleanupExpiredWebhooks();
```

### Security Features

1. **HMAC Validation**
   - Timing-safe comparison prevents timing attacks
   - Supports both base64 and hex encoding
   - Algorithm: SHA-256 (default) or SHA-1

2. **Idempotency**
   - Unique key per webhook (from header or body hash)
   - Stored for 7 days
   - Race condition protection (duplicate key errors ignored)

3. **Replay Protection**
   - Timestamp validation (max age: 5 minutes default)
   - Prevents old webhook replay attacks

### Integration Examples

#### Shopify Webhook

```typescript
// app/routes/webhooks.shopify.orders.create.tsx
import { createWebhookSecurity } from '~/services/webhooks/security.server';

export const action: ActionFunction = async ({ request }) => {
  const security = createWebhookSecurity({
    source: 'shopify',
    secret: process.env.SHOPIFY_API_SECRET!,
  });

  const validation = await security.validate(request);
  if (!validation.valid) {
    return new Response(validation.error, { status: validation.status });
  }

  // Process order...
  await security.markProcessed(validation.idempotencyKey!);
  
  return new Response('OK', { status: 200 });
};
```

#### Chatwoot Webhook

```typescript
// app/routes/api.webhooks.chatwoot.tsx
import { createWebhookSecurity } from '~/services/webhooks/security.server';

export const action: ActionFunction = async ({ request }) => {
  const security = createWebhookSecurity({
    source: 'chatwoot',
    secret: process.env.CHATWOOT_WEBHOOK_SECRET!,
  });

  const validation = await security.validate(request);
  if (!validation.valid) {
    return new Response(validation.error, { status: validation.status });
  }

  // Forward to Agent SDK...
  await security.markProcessed(validation.idempotencyKey!);
  
  return json({ success: true });
};
```

### Testing

Run the webhook security tests:

```bash
npm test -- webhooks/security.test.ts
```

### Monitoring

Monitor webhook processing:

```sql
-- Check processed webhooks by source
SELECT source, COUNT(*), MAX(processed_at) as last_processed
FROM processed_webhook
GROUP BY source;

-- Check for duplicate webhook attempts
SELECT idempotency_key, COUNT(*) as attempts
FROM processed_webhook
GROUP BY idempotency_key
HAVING COUNT(*) > 1;
```

### Environment Variables

Required environment variables per source:

- **Shopify**: `SHOPIFY_API_SECRET`
- **Chatwoot**: `CHATWOOT_WEBHOOK_SECRET`
- **Stripe**: `STRIPE_WEBHOOK_SECRET`
- **SendGrid**: `SENDGRID_WEBHOOK_SECRET`

