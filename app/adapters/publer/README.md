# Publer Adapter

Social media scheduling integration for HotDash via Publer API.

## Status

🟡 **Mock Mode** - Development only, no live posting

## Files

- `types.ts` - TypeScript type definitions for Publer API
- `client.mock.ts` - Mock client for development/testing
- `client.live.ts` - **NOT IMPLEMENTED** - Production OAuth client

## Usage

```typescript
import { getPublerClient } from "~/adapters/publer/client.mock";

const publer = getPublerClient();

// Schedule a post (mock - no actual API call)
const response = await publer.schedulePost({
  bulk: {
    state: "scheduled",
    posts: [
      {
        networks: {
          instagram: {
            type: "photo",
            text: "New product launch! 🚗",
          },
        },
        accounts: [
          {
            id: "mock-instagram-account-001",
            scheduled_at: "2025-10-25T14:00:00Z",
          },
        ],
      },
    ],
  },
});

console.log(response.data.job_id); // mock-job-...
```

## Feature Flag

```typescript
// In client.mock.ts
export const PUBLER_LIVE_POSTING_ENABLED = false; // Default: mock only
```

**To enable live posting:**

1. Complete OAuth setup (see `docs/integrations/publer-oauth-setup.md`)
2. Implement `client.live.ts`
3. Set `PUBLER_LIVE_POSTING_ENABLED = true`
4. Get CEO approval

## OAuth Setup

See complete guide: `docs/integrations/publer-oauth-setup.md`

**Quick checklist:**

- [ ] Publer account created
- [ ] OAuth app registered
- [ ] Credentials in `.env` (never commit!)
- [ ] Workspace ID obtained
- [ ] Social accounts connected
- [ ] `client.live.ts` implemented
- [ ] Token refresh implemented
- [ ] CEO approval

## Integration Points

### Content → Publer Flow

```
Idea Pool Fixture
  ↓
Post Drafter Service (CON-005)
  ↓
Approvals Drawer (HITL)
  ↓  (CEO approves)
Publer Adapter (schedules post)
  ↓
Publer API (publishes to social)
  ↓
Engagement Analyzer (tracks metrics)
```

### HITL Requirements

All social posts must:

1. Draft via Post Drafter Service
2. Stage in Approvals Drawer
3. Await CEO approval/edits
4. Record approval grades (tone/accuracy/policy)
5. Only then schedule via Publer

**No auto-posting without HITL.**

## Mock Client Behavior

The mock client simulates:

- ✅ Scheduling posts (returns fake job_id)
- ✅ Fetching metrics (returns random engagement data)
- ✅ Listing connected accounts (returns 3 mock accounts)
- ✅ Checking job status (always returns "completed")

**What it doesn't do:**

- ❌ Make real API calls
- ❌ Publish to actual social accounts
- ❌ Require OAuth credentials
- ❌ Track real performance metrics

## Error Handling

```typescript
try {
  const response = await publer.schedulePost(request);
  console.log(`Scheduled: ${response.data.job_id}`);
} catch (error) {
  if (error.message.includes("401")) {
    // Token expired - refresh required
  } else if (error.message.includes("429")) {
    // Rate limit - retry with backoff
  } else {
    // Other error - log and escalate
  }
}
```

## Testing

```bash
# Run tests (when implemented)
npm run test app/adapters/publer

# Lint
npm run lint -- app/adapters/publer
```

## Security

- **Tokens**: Never log access tokens
- **Credentials**: Store in environment variables only
- **Database**: Encrypt tokens before storage
- **Rate Limits**: Implement exponential backoff
- **Validation**: Check all inputs before API calls

## Resources

- **Publer Docs**: https://publer.com/docs/
- **OAuth Guide**: `docs/integrations/publer-oauth-setup.md`
- **Type Definitions**: `types.ts`
- **Content Tracking**: `docs/specs/content_tracking.md`

## Support

- **Owner**: Content Agent
- **Feedback**: `feedback/content/YYYY-MM-DD.md`
- **Issues**: Tag @content in Issue comments
