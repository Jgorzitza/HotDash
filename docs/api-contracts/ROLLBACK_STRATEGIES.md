# Rollback Strategies for API Adapters

## Overview

This document outlines rollback strategies for each external API adapter in case of failures, breaking changes, or incidents.

---

## Shopify Admin GraphQL Client

**File**: `app/lib/shopify/client.ts`

### Rollback Triggers
- GraphQL schema breaking changes
- Rate limit exhaustion
- Authentication failures
- Circuit breaker OPEN state

### Rollback Strategy

**Immediate Actions** (< 5 minutes):
1. Disable affected features in UI (feature flags)
2. Switch to cached data if available
3. Enable read-only mode for Shopify operations
4. Alert on-call engineer

**Short-term** (< 1 hour):
1. Revert to previous client version via git
2. Update GraphQL queries to compatible schema version
3. Increase rate limit delays if quota issue
4. Re-authenticate if auth issue

**Rollback Commands**:
```bash
# Revert client to previous version
git revert <commit-hash>
git push

# Deploy previous version
fly deploy --config fly.toml

# Enable read-only mode
export SHOPIFY_READ_ONLY=true
```

**Recovery Verification**:
- [ ] Health check returns 200
- [ ] Test query executes successfully
- [ ] Rate limit metrics within budget
- [ ] Circuit breaker returns to CLOSED

---

## Supabase RPC Client

**File**: `app/lib/supabase/client.ts`

### Rollback Triggers
- RPC function signature changes
- Database connection failures
- Row-level security policy changes
- Performance degradation

### Rollback Strategy

**Immediate Actions** (< 5 minutes):
1. Switch to anon key if service role key failing
2. Use cached data for read operations
3. Queue write operations for later
4. Alert database team

**Short-term** (< 1 hour):
1. Revert RPC function changes in Supabase dashboard
2. Restore previous database migration
3. Update RLS policies if needed
4. Clear connection pool and reconnect

**Rollback Commands**:
```bash
# Revert database migration
supabase db reset --db-url <connection-string>

# Restore from backup
supabase db restore <backup-id>

# Clear connection pool
export SUPABASE_POOL_RESET=true
```

**Recovery Verification**:
- [ ] RPC functions return expected data
- [ ] Connection pool healthy
- [ ] Query latency < 200ms P95
- [ ] No RLS policy violations

---

## Chatwoot API Client

**File**: `app/lib/chatwoot/client.ts`

### Rollback Triggers
- API endpoint changes
- Webhook signature validation failures
- Rate limit exceeded
- Conversation sync failures

### Rollback Strategy

**Immediate Actions** (< 5 minutes):
1. Disable webhook processing
2. Switch to manual conversation handling
3. Use cached conversation data
4. Alert customer support team

**Short-term** (< 1 hour):
1. Revert to previous API version
2. Update webhook signature validation
3. Reduce request rate if rate limited
4. Re-sync conversations from last known good state

**Rollback Commands**:
```bash
# Disable webhooks
export CHATWOOT_WEBHOOKS_ENABLED=false

# Reduce rate limit
export CHATWOOT_RATE_LIMIT=5  # requests per second

# Re-sync conversations
npm run chatwoot:sync --from=<timestamp>
```

**Recovery Verification**:
- [ ] Conversations load successfully
- [ ] Messages send without errors
- [ ] Webhooks process correctly
- [ ] Rate limit metrics healthy

---

## GA4 Analytics Client

**File**: `app/lib/analytics/client.ts`

### Rollback Triggers
- API quota exceeded
- Service account authentication failures
- Report schema changes
- Data processing delays

### Rollback Strategy

**Immediate Actions** (< 5 minutes):
1. Switch to cached analytics data
2. Disable real-time analytics queries
3. Use fallback to historical data
4. Alert analytics team

**Short-term** (< 1 hour):
1. Rotate service account credentials
2. Reduce query frequency
3. Update report dimensions/metrics
4. Request quota increase from Google

**Rollback Commands**:
```bash
# Use cached data only
export GA4_CACHE_ONLY=true

# Reduce query frequency
export GA4_QUERY_INTERVAL=3600  # 1 hour

# Rotate service account
gcloud iam service-accounts keys create new-key.json \
  --iam-account=<service-account>
```

**Recovery Verification**:
- [ ] Revenue queries return data
- [ ] Traffic queries return data
- [ ] Quota usage within limits
- [ ] Service account authenticated

---

## General Rollback Procedures

### Feature Flags

All adapters support feature flags for gradual rollback:

```typescript
// Disable specific adapter
export SHOPIFY_ENABLED=false
export SUPABASE_ENABLED=false
export CHATWOOT_ENABLED=false
export GA4_ENABLED=false

// Enable read-only mode
export SHOPIFY_READ_ONLY=true
export SUPABASE_READ_ONLY=true
```

### Circuit Breaker Manual Override

```typescript
import { shopifyCircuitBreaker } from "~/lib/circuit-breaker";

// Force circuit breaker OPEN (stop all requests)
shopifyCircuitBreaker.reset();

// Check circuit breaker state
const state = shopifyCircuitBreaker.getState();
```

### Cache Fallback

```typescript
import { shopifyCache } from "~/lib/cache/lru";

// Extend cache TTL during incident
shopifyCache.set("key", data, 60 * 60 * 1000); // 1 hour
```

### Monitoring During Rollback

```typescript
import { checkSLA, getAllSLAStatus } from "~/lib/monitoring/sla";
import { getRetryBudgetMetrics } from "~/lib/monitoring/retry-budget";

// Check SLA compliance
const slaStatus = getAllSLAStatus();

// Check retry budget
const retryMetrics = getRetryBudgetMetrics("shopify");
```

---

## Rollback Checklist

**Before Rollback**:
- [ ] Identify root cause
- [ ] Determine affected services
- [ ] Notify stakeholders
- [ ] Prepare rollback commands
- [ ] Backup current state

**During Rollback**:
- [ ] Execute rollback commands
- [ ] Monitor health checks
- [ ] Verify SLA compliance
- [ ] Check error rates
- [ ] Test critical paths

**After Rollback**:
- [ ] Confirm system stability
- [ ] Document incident
- [ ] Update runbooks
- [ ] Schedule post-mortem
- [ ] Plan permanent fix

---

## Escalation

**Level 1** (< 5 min): On-call engineer
**Level 2** (< 15 min): Engineering manager
**Level 3** (< 30 min): CTO + vendor support

**Contact**:
- Shopify Support: partners@shopify.com
- Supabase Support: support@supabase.io
- Chatwoot Support: support@chatwoot.com
- Google Cloud Support: cloud.google.com/support

---

## Testing Rollback Procedures

**Monthly Drills**:
1. Simulate adapter failure in staging
2. Execute rollback procedure
3. Verify recovery
4. Document lessons learned
5. Update runbooks

**Automated Tests**:
```bash
# Test circuit breaker
npm run test:circuit-breaker

# Test cache fallback
npm run test:cache-fallback

# Test feature flags
npm run test:feature-flags
```

---

**Last Updated**: 2025-10-15
**Owner**: integrations agent
**Review Frequency**: Monthly
