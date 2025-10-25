# Publer Integration Guide

**Version**: 1.0  
**Last Updated**: 2025-10-21  
**Owner**: Integrations Agent

---

## Overview

This guide documents the complete Publer integration for social media posting with Human-In-The-Loop (HITL) approval workflow.

### Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Approval   │────▶│Publer Adapter│────▶│ Publer API   │
│   System     │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │Social Post   │
                     │Queue         │
                     └──────────────┘
```

---

## Components

### 1. Publer Client (`app/services/publer/client.ts`)

**Purpose**: Low-level Publer API client with OAuth authentication

**Features**:

- OAuth authentication with Bearer-API token
- Exponential backoff retry logic (max 3 retries)
- Rate limit tracking
- Comprehensive error handling

**Functions**:

- `listWorkspaces()` - Get available workspaces
- `listAccounts()` - Get social media accounts
- `getAccount(accountId)` - Get specific account details
- `schedulePost(post)` - Schedule a post for future publishing
- `publishPost(post)` - Publish immediately
- `getJobStatus(jobId)` - Check job status

**Usage**:

```typescript
import { createPublerClient } from "~/services/publer/client";

const client = createPublerClient();

// List workspaces
const workspaces = await client.listWorkspaces();
if (workspaces.success) {
  console.log("Workspaces:", workspaces.data);
}

// Schedule a post
const post = {
  text: "Hello from HotDash!",
  accountIds: ["68f10b022b719d07f37c8b34"],
  scheduledAt: "2025-11-01T12:00:00Z",
};

const result = await client.schedulePost(post);
if (result.success) {
  console.log("Job ID:", result.data?.job_id);
}
```

**Error Handling**:

```typescript
const result = await client.listAccounts();

if (!result.success) {
  console.error("Error:", result.error?.message);
  console.error("Status:", result.error?.status);
  console.error("Code:", result.error?.code);
}
```

**Rate Limiting**:

```typescript
const client = createPublerClient();
await client.listWorkspaces();

const rateLimitInfo = client.getRateLimitInfo();
console.log("Remaining requests:", rateLimitInfo?.remaining);

if (client.isRateLimitApproaching()) {
  console.warn("Rate limit approaching! Slow down requests");
}
```

---

### 2. Publer Adapter (`app/services/publer/adapter.ts`)

**Purpose**: HITL approval workflow integration

**Flow**:

1. Draft → Pending Review → Approved → Published
2. Receipt storage after publishing
3. Job status tracking

**Usage**:

```typescript
import { createPublerAdapter } from "~/services/publer/adapter";

const adapter = createPublerAdapter();

// Publish an approved post
const approval = {
  id: "approval-123",
  type: "social_post",
  status: "approved",
  content: {
    text: "Announcing new products!",
    accountIds: ["acc-123"],
    scheduledAt: "2025-11-01T10:00:00Z",
  },
  metadata: {
    platform: "twitter",
  },
  created_at: "2025-10-21T00:00:00Z",
};

const result = await adapter.publishApproval(approval);

if (result.success) {
  console.log("Published! Job ID:", result.jobId);
  console.log("Receipt ID:", result.receipt?.id);
} else {
  console.error("Failed:", result.error);
}
```

**Check Status**:

```typescript
const jobStatus = await adapter.checkPublishStatus("job-123");

if (jobStatus) {
  console.log("Status:", jobStatus.status);
  console.log("Progress:", jobStatus.progress);

  if (jobStatus.posts) {
    jobStatus.posts.forEach((post) => {
      console.log("Post URL:", post.url);
      console.log("Platform:", post.platform);
    });
  }
}
```

---

### 3. Social Post Queue (`app/services/social/queue.ts`)

**Purpose**: Queue management with automatic retries

**Features**:

- Priority queue (1-10, higher = more urgent)
- Automatic retry with exponential backoff
- Max 5 attempts per post
- Status tracking

**Usage**:

```typescript
import { getSocialPostQueue } from "~/services/social/queue";

const queue = getSocialPostQueue();

// Enqueue a post with priority
const approval = {
  /* approval object */
};
const queued = queue.enqueue(approval, 9); // Priority 9 (high)

console.log("Queued post:", queued.id);

// Process queue
await queue.processQueue();

// Get status
const status = queue.getPost(queued.id);
console.log("Status:", status?.status);
console.log("Attempts:", status?.attempts);

// Get statistics
const stats = queue.getStats();
console.log("Queue stats:", stats);
// {
//   total: 5,
//   queued: 2,
//   processing: 1,
//   completed: 1,
//   failed: 1,
//   retrying: 0
// }
```

**Retry Configuration**:

```typescript
import { createSocialPostQueue } from "~/services/social/queue";

const queue = createSocialPostQueue({
  maxAttempts: 3,
  initialDelay: 2000, // 2 seconds
  maxDelay: 60000, // 1 minute
  backoffMultiplier: 2,
});
```

**Queue Cleanup**:

```typescript
// Remove posts older than 24 hours
const removed = queue.cleanup(24 * 60 * 60 * 1000);
console.log(`Removed ${removed} old posts`);
```

---

### 4. Rate Limiter (`app/lib/rate-limiter.ts`)

**Purpose**: Token bucket rate limiting for all APIs

**Per-API Limits**:

- **Shopify**: 2 requests/second, burst 10
- **Publer**: 5 requests/second, burst 15
- **Chatwoot**: 10 requests/second, burst 30

**Usage**:

```typescript
import { getPublerRateLimiter } from "~/lib/rate-limiter";

const limiter = getPublerRateLimiter();

// Execute request with rate limiting
const result = await limiter.execute(async () => {
  // Your API call here
  return await fetch("https://api.publer.com/...");
});
```

**Custom Rate Limiter**:

```typescript
import { getRateLimiter } from "~/lib/rate-limiter";

const limiter = getRateLimiter("my-api", {
  maxRequestsPerSecond: 20,
  burstSize: 50,
  retryOn429: true,
  maxRetries: 5,
});
```

---

### 5. API Routes

#### POST /api/social/publish

Publish an approved social post

**Request**:

```typescript
POST /api/social/publish
Content-Type: application/json

{
  "approval": {
    "id": "approval-123",
    "type": "social_post",
    "status": "approved",
    "content": {
      "text": "Hello world!",
      "accountIds": ["acc-123"],
      "scheduledAt": "2025-11-01T10:00:00Z"
    },
    "metadata": {},
    "created_at": "2025-10-21T00:00:00Z"
  }
}
```

**Response**:

```json
{
  "success": true,
  "jobId": "68f739fbe168dccb4098947b",
  "receiptId": "uuid-here"
}
```

#### POST /api/webhooks/publer

Receive Publer webhook events

**Headers**:

- `X-Publer-Signature`: HMAC-SHA256 signature

**Payload**:

```json
{
  "event": "job.completed",
  "job_id": "job-123",
  "status": "complete",
  "posts": [
    {
      "post_id": "post-123",
      "account_id": "acc-123",
      "platform": "twitter",
      "url": "https://twitter.com/...",
      "published_at": "2025-10-21T10:00:00Z"
    }
  ],
  "timestamp": "2025-10-21T10:00:01Z"
}
```

---

## Configuration

### Environment Variables

Required variables in `.env` or Fly secrets:

```bash
# Publer API
PUBLER_API_KEY=your-api-key-here
PUBLER_WORKSPACE_ID=your-workspace-id-here
PUBLER_WEBHOOK_SECRET=your-webhook-secret-here

# Optional
PUBLER_BASE_URL=https://app.publer.com/api/v1
```

### Vault Storage

Credentials stored in `vault/occ/publer/`:

- `api_token.env` - Contains `PUBLER_API_TOKEN`
- `workspace_id.env` - Contains `PUBLER_WORKSPACE_ID`

---

## Testing

### Manual API Testing

Run the test script:

```bash
export PUBLER_API_KEY=$(grep PUBLER_API_TOKEN vault/occ/publer/api_token.env | cut -d'=' -f2)
export PUBLER_WORKSPACE_ID=68f10ac478dcb2ca0fb2d991
npx tsx scripts/test-publer-api.ts
```

### Integration Tests

Run the test suite:

```bash
npm test -- tests/unit/services/publer-client.spec.ts
npm test -- tests/unit/services/publer-adapter.spec.ts
npm test -- tests/unit/services/social-queue.spec.ts
```

**Test Coverage**:

- Publer Client: 15 tests
- Publer Adapter: 13 tests
- Social Queue: 13 tests
- Total: 51 tests

---

## Workflows

### Publishing Workflow

1. **Create Draft**

   ```typescript
   const approval = {
     status: 'draft',
     content: { text: '...', accountIds: [...] },
   };
   ```

2. **Submit for Review**

   ```typescript
   approval.status = "pending_review";
   ```

3. **Approve**

   ```typescript
   approval.status = "approved";
   approval.approved_at = new Date().toISOString();
   approval.approved_by = "user-id";
   ```

4. **Publish**

   ```typescript
   const adapter = createPublerAdapter();
   const result = await adapter.publishApproval(approval);
   ```

5. **Track Status**
   ```typescript
   const status = await adapter.checkPublishStatus(result.jobId);
   ```

### Queue Workflow

1. **Enqueue Post**

   ```typescript
   const queue = getSocialPostQueue();
   const queued = queue.enqueue(approval, 9); // Priority 9
   ```

2. **Process Queue** (automatic or manual)

   ```typescript
   await queue.processQueue();
   ```

3. **Monitor Status**

   ```typescript
   const post = queue.getPost(queued.id);
   console.log(post.status); // 'queued' | 'processing' | 'completed' | 'failed' | 'retrying'
   ```

4. **Handle Failures**
   - Automatic retry up to 5 times
   - Exponential backoff: 5s → 10s → 20s → 40s → 80s
   - Final status: 'failed' after max retries

---

## Error Handling

### Common Errors

**1. Authentication Errors (401)**

```typescript
{
  code: 'CLIENT_ERROR',
  message: 'Unauthorized',
  status: 401
}
```

**Fix**: Check API key and workspace ID

**2. Rate Limit Errors (429)**

```typescript
{
  code: 'RATE_LIMIT_EXCEEDED',
  message: 'Rate limit exceeded',
  status: 429
}
```

**Handling**: Automatic retry with backoff (up to 3 times)

**3. Server Errors (500+)**

```typescript
{
  code: 'SERVER_ERROR',
  message: 'Server error: Internal error',
  status: 500
}
```

**Handling**: Automatic retry with backoff (up to 3 times)

**4. Permission Errors (403)**

```typescript
{
  code: 'CLIENT_ERROR',
  message: 'Permission denied',
  status: 403
}
```

**Fix**: Verify account permissions in Publer dashboard

---

## Webhooks

### Setup

1. Configure webhook in Publer dashboard
2. Set webhook URL: `https://your-app.fly.dev/api/webhooks/publer`
3. Generate webhook secret
4. Store secret in environment: `PUBLER_WEBHOOK_SECRET`

### Events

**job.completed** - Post published successfully

```json
{
  "event": "job.completed",
  "job_id": "job-123",
  "status": "complete",
  "posts": [...]
}
```

**job.failed** - Post publishing failed

```json
{
  "event": "job.failed",
  "job_id": "job-123",
  "status": "failed",
  "error": "Rate limit exceeded"
}
```

**job.started** - Post publishing started
**job.progress** - Publishing in progress

### Signature Verification

Webhooks include `X-Publer-Signature` header with HMAC-SHA256 signature.

**Verification Process**:

1. Extract signature from header
2. Calculate expected signature using webhook secret
3. Compare using timing-safe comparison
4. Reject if signatures don't match

**Code**:

```typescript
import { verifyWebhookSignature } from "~/services/publer/webhooks";

const signature = request.headers.get("X-Publer-Signature");
const rawBody = await request.text();
const secret = process.env.PUBLER_WEBHOOK_SECRET;

const result = verifyWebhookSignature(rawBody, signature, secret);

if (!result.valid) {
  return Response.json({ error: "Invalid signature" }, { status: 401 });
}
```

---

## Monitoring

### Health Checks

```typescript
import { checkPublerHealth } from "~/services/integrations/health";

const health = await checkPublerHealth();

console.log("Healthy:", health.healthy);
console.log("Latency:", health.latencyMs + "ms");

if (!health.healthy) {
  console.error("Error:", health.error);
}
```

### Rate Limit Monitoring

```typescript
const client = createPublerClient();

// After each API call
const info = client.getRateLimitInfo();

if (info) {
  console.log(`Rate limit: ${info.remaining}/${info.limit}`);
  console.log(`Resets at: ${new Date(info.reset * 1000).toISOString()}`);
}

if (client.isRateLimitApproaching()) {
  console.warn("Rate limit approaching - slow down requests!");
}
```

---

## Troubleshooting

### Issue: Posts not publishing

**Symptoms**: Posts stuck in 'queued' or 'processing' status

**Checks**:

1. Verify API credentials: `PUBLER_API_KEY`, `PUBLER_WORKSPACE_ID`
2. Check rate limits: `client.getRateLimitInfo()`
3. Review queue stats: `queue.getStats()`
4. Check error logs for specific errors

**Resolution**:

```typescript
// Check queue for errors
const posts = queue.getAllPosts("failed");
posts.forEach((post) => {
  console.log("Failed post:", post.id);
  console.log("Error:", post.error);
  console.log("Attempts:", post.attempts);
});

// Retry manually
queue.enqueue(approval, 10); // High priority retry
```

### Issue: Webhook signature verification failing

**Symptoms**: Webhooks rejected with 401 errors

**Checks**:

1. Verify `PUBLER_WEBHOOK_SECRET` matches Publer dashboard
2. Check webhook signature format (should be hex string)
3. Ensure raw body is used (not parsed JSON)

**Resolution**:

```typescript
// Debug signature verification
const rawBody = await request.text();
console.log("Raw body length:", rawBody.length);
console.log("Signature:", signature);

// Test with known secret
const testResult = verifyWebhookSignature(rawBody, signature, "test-secret");
```

### Issue: Rate limiting

**Symptoms**: 429 errors, slow publishing

**Resolution**:

1. Use rate limiter for all API calls
2. Increase retry delays
3. Reduce concurrent requests
4. Monitor `isRateLimitApproaching()`

```typescript
import { getPublerRateLimiter } from "~/lib/rate-limiter";

const limiter = getPublerRateLimiter({
  maxRequestsPerSecond: 3, // Reduce from 5
  maxRetries: 5, // Increase retries
});

await limiter.execute(async () => {
  return await client.schedulePost(post);
});
```

---

## API Reference

### Types

**PublerPost**

```typescript
interface PublerPost {
  text: string;
  accountIds: string[];
  scheduledAt?: string; // ISO 8601
  media?: PublerMedia[];
}
```

**PublerJobResponse**

```typescript
interface PublerJobResponse {
  job_id: string;
  status: "pending" | "processing" | "complete" | "failed";
  created_at: string;
}
```

**SocialPostApproval**

```typescript
interface SocialPostApproval {
  id: string;
  type: "social_post";
  status: "draft" | "pending_review" | "approved" | "rejected";
  content: {
    text: string;
    accountIds: string[];
    scheduledAt?: string;
    media?: Array<{ url: string; type: "image" | "video" }>;
  };
  metadata: {
    platform?: string;
    estimated_reach?: number;
  };
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}
```

**QueuedPost**

```typescript
interface QueuedPost {
  id: string;
  approval: SocialPostApproval;
  status: "queued" | "processing" | "completed" | "failed" | "retrying";
  priority: number; // 1-10
  attempts: number;
  maxAttempts: number;
  error?: string;
  receipt?: SocialPostReceipt;
  createdAt: string;
  updatedAt: string;
}
```

---

## Best Practices

### 1. Always Use Rate Limiter

```typescript
import { getPublerRateLimiter } from "~/lib/rate-limiter";

const limiter = getPublerRateLimiter();

// Good
await limiter.execute(() => client.schedulePost(post));

// Bad - direct call without rate limiting
await client.schedulePost(post);
```

### 2. Handle Errors Gracefully

```typescript
const result = await adapter.publishApproval(approval);

if (!result.success) {
  // Log error
  console.error("Publishing failed:", result.error);

  // Queue for retry with lower priority
  queue.enqueue(approval, 3);

  // Notify user
  await notifyUser("Publishing delayed, will retry");
}
```

### 3. Monitor Queue Health

```typescript
// Regularly check queue stats
setInterval(() => {
  const stats = queue.getStats();

  if (stats.failed > 10) {
    console.warn("High failure rate in queue!");
    // Alert operations team
  }

  if (stats.retrying > 5) {
    console.warn("Many posts retrying!");
    // Check rate limits
  }
}, 60000); // Every minute
```

### 4. Cleanup Old Posts

```typescript
// Daily cleanup of completed/failed posts older than 7 days
const sevenDays = 7 * 24 * 60 * 60 * 1000;
queue.cleanup(sevenDays);
```

### 5. Use Webhooks for Status Updates

```typescript
// Don't poll for status
// Bad:
while (true) {
  const status = await client.getJobStatus(jobId);
  if (status.status === "complete") break;
  await sleep(5000);
}

// Good: Wait for webhook
// Publer sends webhook when job completes
```

---

## Security

### API Keys

- Store in environment variables or Fly secrets
- Never commit to git
- Rotate regularly (every 90 days)

### Webhook Secrets

- Use strong random secret (32+ characters)
- Always verify signatures
- Use timing-safe comparison

### Request Validation

```typescript
// Validate all inputs
if (!approval.content.text || approval.content.text.length > 500) {
  return { error: "Invalid text length" };
}

if (
  !Array.isArray(approval.content.accountIds) ||
  approval.content.accountIds.length === 0
) {
  return { error: "accountIds required" };
}
```

---

## Performance

### Latency Targets

- Publer API: < 2000ms
- Queue processing: < 500ms per post
- Webhook processing: < 200ms

### Optimization Tips

1. Batch operations when possible
2. Use queue for async processing
3. Implement caching for account lists
4. Monitor rate limits proactively

---

## Migration Guide

### From packages/integrations/publer.ts

**Old Code**:

```typescript
import { schedulePost } from "~/packages/integrations/publer";

const result = await schedulePost({
  text: "Hello",
  accountIds: ["acc1"],
});
```

**New Code**:

```typescript
import { createPublerAdapter } from "~/services/publer/adapter";

const adapter = createPublerAdapter();
const result = await adapter.publishApproval(approval);
```

**Benefits**:

- Type safety
- Error handling
- Retry logic
- Rate limiting
- HITL workflow integration

---

## Support

### Issues

Report issues in feedback file: `feedback/integrations/YYYY-MM-DD.md`

### Documentation

- Official Publer Docs: https://publer.com/docs
- Internal Specs: `docs/specs/`
- Runbooks: `docs/runbooks/`

### Contacts

- Owner: Integrations Agent
- Escalation: Manager

---

**End of Publer Integration Guide**
