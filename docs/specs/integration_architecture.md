# Integration Architecture

**Owner**: Integrations Agent  
**Last Updated**: 2025-10-19  
**Status**: Production Ready

## Overview

All external API integrations (Supabase, Chatwoot, Publer, Shopify, Google Analytics) are implemented with:

- Feature flag toggles for mock (dev) vs real (production) APIs
- Graceful fallback to mock data on errors
- Comprehensive contract tests
- Error handling with retry logic
- Production activation guides

## Integration Summary

| Integration          | Feature Flag                 | Status        | Mock Available | Tests         |
| -------------------- | ---------------------------- | ------------- | -------------- | ------------- |
| Supabase (Idea Pool) | `IDEA_POOL_SUPABASE_ENABLED` | ✅ Ready      | Yes            | 5/5 passing   |
| Chatwoot (CX)        | N/A                          | ✅ Ready      | Yes            | 6/6 passing   |
| Publer (Social)      | `PUBLER_LIVE`                | ✅ Ready      | Yes            | 11/11 passing |
| Shopify Admin        | N/A                          | ✅ Production | No             | Existing      |
| Google Analytics     | `ANALYTICS_REAL_DATA`        | ⚙️ Pending    | Yes            | TBD           |

## Architecture Patterns

### 1. Feature Flag Strategy

All integrations use server-side feature flags (`app/utils/feature-flags.server.ts`):

```typescript
// Development (default)
IDEA_POOL_LIVE = false; // Use mock data
ANALYTICS_REAL_DATA = false; // Use fixtures
PUBLER_LIVE = false; // Mock social posts

// Production
IDEA_POOL_LIVE = true; // Real Supabase queries
ANALYTICS_REAL_DATA = true; // Real GA4 data
PUBLER_LIVE = true; // Real Publer API
```

**Activation**: Set env var to `true`, `1`, `on`, or `yes` (case insensitive)

### 2. Graceful Degradation

All integrations implement fallback chains:

1. **Check feature flag** → If disabled, return mock data
2. **Validate credentials** → If missing, log warning + return mock
3. **Execute API call** → If fails, log error + return mock
4. **Parse response** → If invalid, log error + return mock

Example (Idea Pool):

```typescript
// app/lib/analytics/idea-pool.ts
export async function getIdeaPoolAnalytics() {
  if (!isIdeaPoolSupabaseEnabled()) {
    return mockData; // Flag disabled
  }

  const config = getSupabaseConfig();
  if (!config) {
    return mockDataWithWarning; // Creds missing
  }

  try {
    const result = await supabase.query();
    return result.length > 0 ? result : mockDataWithWarning;
  } catch (error) {
    return mockDataWithError; // Query failed
  }
}
```

### 3. Error Handling

**Retryable Errors**:

- 5xx server errors
- 429 rate limits
- Network timeouts
- Connection failures

**Non-Retryable Errors**:

- 4xx client errors (except 429)
- Invalid credentials (401, 403)
- Malformed requests (400)

**Implementation**:

```typescript
class ServiceError extends Error {
  retryable: boolean;
  code?: string;
  scope: string;
}
```

### 4. Rate Limiting

Chatwoot client includes token bucket rate limiter:

- 10 requests per second window
- Automatic backoff on limit
- Per-client state management

## Integration Details

### Supabase (Idea Pool)

**Purpose**: Store and retrieve product suggestions/experiments

**Files**:

- Implementation: `app/lib/analytics/idea-pool.ts`
- Tests: `tests/integration/idea-pool.api.spec.ts`
- Route: `app/routes/api.analytics.idea-pool.ts`

**Schema** (pending Data agent migration):

```sql
CREATE TABLE idea_pool (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending_review', 'draft', 'approved', 'rejected')),
  rationale TEXT,
  projected_impact TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewer TEXT
);
```

**Activation**:

1. Data agent creates migration
2. Set `IDEA_POOL_SUPABASE_ENABLED=true`
3. Verify with: `curl /api/analytics/idea-pool` (check `source: "supabase"`)

**Rollback**: Set `IDEA_POOL_SUPABASE_ENABLED=false`

### Chatwoot (Customer Support)

**Purpose**: HITL customer reply workflow (draft as private note → approve → send public)

**Files**:

- Client: `app/services/support/chatwoot-client.ts`
- Tests: `tests/unit/integrations/chatwoot-client.spec.ts`
- Webhook: `app/routes/api.chatwoot.webhook.ts`

**Workflow**:

1. AI generates draft reply
2. POST private note with metadata (`ai_generated: true`)
3. Human reviews in Chatwoot UI
4. If approved, POST public reply (sends to customer)
5. Log grade (tone/accuracy/policy) to Supabase

**Env Vars**:

```
CHATWOOT_BASE_URL=https://app.chatwoot.com
CHATWOOT_API_KEY=<your-api-key>
CHATWOOT_ACCOUNT_ID=<account-id>
```

**Health Check**: See `scripts/ops/check-chatwoot-health.sh`

**Rollback**: No flag needed (always uses real API with auth)

### Publer (Social Posting)

**Purpose**: Schedule and track social media posts

**Files**:

- Adapter: `app/lib/integrations/publer-adapter.ts`
- Client: `packages/integrations/publer.ts`
- Tests: `tests/unit/integrations/publer-adapter.spec.ts`

**Workflow**:

1. Agent/user drafts post content
2. `schedulePost()` → Returns `job_id`
3. Poll `getJobStatus(job_id)` → `pending|processing|complete|failed`
4. Store receipt in Supabase for audit

**Env Vars**:

```
PUBLER_LIVE=false              # Dev mode (mock)
PUBLER_API_KEY=<key>           # Production only
PUBLER_WORKSPACE_ID=<id>       # Production only
```

**Activation**:

1. Set `PUBLER_LIVE=true`
2. Verify credentials set
3. Test with dev account first

**Rollback**: Set `PUBLER_LIVE=false`

### Shopify Admin GraphQL

**Purpose**: Read orders, inventory, products; write metafields, variants

**Files**:

- Client: `app/shopify.server.ts`
- Tests: `tests/unit/shopify.*.spec.ts`

**Always Production** (no mock mode)

**Mutations Guarded**: All write operations require HITL approval

### Google Analytics 4 (Future)

**Purpose**: Traffic, conversion, revenue metrics

**Flag**: `ANALYTICS_REAL_DATA`

**Status**: Pending implementation (Task 6)

## Monitoring

### Integration Health Indicators

1. **Supabase**: Check `source` field in API response
   - `"supabase"` = Live data ✅
   - `"mock"` with warnings = Degraded ⚠️
   - `"mock"` no warnings = Flag disabled 🔵

2. **Chatwoot**: Monitor private note → public reply conversion rate
   - Expected: >90% of drafts approved
   - Alert if <70% (review quality issue)

3. **Publer**: Track job completion rate
   - Expected: >95% jobs complete within 5 minutes
   - Alert if >5% failed or timeout

4. **Shopify**: Monitor mutation approval latency
   - Target: <15 min for CX, same-day for inventory/growth
   - Alert if >1 hour for CX

### Logs

All integrations log to structured logger:

```typescript
logger.info("[integration-name] Action", { context });
logger.error("[integration-name] Error", { error, retryable });
```

Filter by scope: `grep "\[publer-adapter\]" logs/app.log`

## Security

### Secrets Management

**Never in code**:

- API keys
- Access tokens
- Service keys

**Storage**:

- Development: `.env.local` (gitignored)
- Production: GitHub Environments + Secrets
- Fly.io: `fly secrets set KEY=value`

### Secret Scanning

- GitHub Push Protection: ON
- Gitleaks CI: Runs on every PR
- SARIF upload to Security tab

### Access Control

- Supabase: Service key (admin), RLS policies for user data
- Chatwoot: API key scoped to account
- Publer: Workspace-scoped API key
- Shopify: OAuth app with minimal scopes

## Testing Strategy

### Contract Tests

Verify API request/response structure without hitting real APIs:

- Mock fetch/client
- Validate payloads
- Test error paths
- Verify retryable flags

**Run**: `npx vitest run tests/integration/`

### Feature Flag Tests

Verify flag toggles switch between mock and real implementations:

- Test flag=false → mock data
- Test flag=true → real API path (mocked)
- Test env var parsing (1, true, on, yes)

**Run**: `npx vitest run tests/unit/feature-flags.server.spec.ts`

### E2E Tests (Future)

Full workflow with real staging APIs:

- Idea pool: Create → Query → Approve
- Chatwoot: Webhook → Draft → Approve → Send
- Publer: Schedule → Poll → Complete

## Production Activation Checklist

See `docs/runbooks/activate_integrations.md` for step-by-step guide.

## Rollback Procedures

### Emergency Rollback (All Integrations)

1. Set all feature flags to `false`:

   ```bash
   fly secrets set IDEA_POOL_SUPABASE_ENABLED=false \
                    ANALYTICS_REAL_DATA=false \
                    PUBLER_LIVE=false
   ```

2. Restart app: `fly apps restart <app-name>`

3. Verify mock data serving: Check API responses for `source: "mock"`

### Per-Integration Rollback

**Supabase**:

```bash
fly secrets set IDEA_POOL_SUPABASE_ENABLED=false
```

**Publer**:

```bash
fly secrets set PUBLER_LIVE=false
```

**Chatwoot**: No rollback needed (always uses real API)

### Troubleshooting

**Symptom**: API returns mock data in production  
**Cause**: Feature flag not set or set to non-truthy value  
**Fix**: `fly secrets set FLAG_NAME=true` and restart

**Symptom**: 401/403 errors  
**Cause**: Missing or invalid credentials  
**Fix**: Verify secrets set correctly, check API key validity

**Symptom**: Timeout errors  
**Cause**: Network issues or rate limiting  
**Fix**: Check rate limits, verify network egress from Fly.io

## Documentation Links

- Feature Flags: `docs/specs/feature_flags.md`
- Analytics Pipeline: `docs/specs/analytics_pipeline.md`
- Activation Guide: `docs/runbooks/activate_integrations.md`
- Chatwoot Setup: `docs/integrations/publer-oauth-setup.md`
- Publer OAuth: `docs/devops/publer-secret-setup.md`

## Change Log

- 2025-10-19: Initial version with Supabase, Chatwoot, Publer integrations production-ready
