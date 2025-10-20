# Analytics Pipeline Specification

**Owner**: Analytics Agent  
**Version**: 1.0  
**Effective**: 2025-10-20  
**Issue**: #104

---

## Overview

Production-grade analytics pipelines that feed dashboard tiles, approvals evidence, and growth retros with trustworthy GA4/Shopify metrics under HITL (Human-in-the-Loop) control.

---

## Architecture

### Data Sources

1. **Google Analytics 4 (GA4)**
   - Traffic metrics (sessions, pageviews, bounce rate)
   - Conversion tracking (transactions, revenue, AOV)
   - Traffic sources (organic, paid, social, direct)
   - Built-in connectors: `app/services/analytics/` (NOT MCP)

2. **Shopify Admin GraphQL API**
   - Orders, revenue, refunds
   - Returns metrics (rate, count, refunded amount)
   - Product performance
   - Inventory levels
   - GraphQL validation: Use Shopify Dev MCP for schema validation

3. **Supabase (Internal)**
   - Aggregated metrics storage
   - Historical trends
   - Approval grades and feedback
   - Content performance tracking

---

## Components

### 1. Shopify Returns Analytics

**File**: `app/lib/analytics/shopify-returns.stub.ts`

**Feature Flag**: `ANALYTICS_REAL_DATA`

- Default: `false` (uses stub/mock data)
- Set to `true` when credentials available: `SHOPIFY_ADMIN_API_TOKEN`

**Mock Data**:

```typescript
{
  returnRate: 3.2,        // Automotive accessories typical: 2-5%
  totalReturns: 14,
  totalRefunded: 1253.5,
  period: { start, end }
}
```

**Real Implementation Requirements** (when credentials available):

- **GraphQL Query**: `orders` with `returns` connection
- **Scopes Required**:
  - `read_orders`
  - `read_marketplace_orders`
  - `read_returns`
- **Fields**: `Return.id`, `Return.status`, `refunds.totalRefundedSet`

---

### 2. Sampling Guard

**File**: `app/lib/analytics/sampling-guard.ts`

**Purpose**: Prevent over-sampling of analytics data to stay within API quotas

**Configuration**:

```typescript
{
  maxRequestsPerHour: 100,
  samplingRate: 1.0
}
```

**Behavior**:

- Resets counter every hour
- Blocks requests exceeding `maxRequestsPerHour`
- Applies probabilistic sampling via `samplingRate`
- Tracks status: `requestCount`, `limit`, `resetIn`

---

### 3. Nightly Sampling Guard Proof

**File**: `scripts/sampling-guard-proof.mjs`

**Contract Test**: `node scripts/sampling-guard-proof.mjs`

**Checks**:

1. Revenue Range (5000-50000)
2. Revenue Trend (±50%)
3. Conversion Range (0.5-10%)
4. Conversion Trend (±100%)
5. Sessions Range (1000-20000)
6. Sessions Trend (±75%)

**Output**: `artifacts/analytics/sampling-proofs/sampling-proof-YYYYMMDD.json`

**Status Values**: `PASSED`, `WARNING`, `FAILED`

**Usage**: Run nightly for Product/CEO review

---

### 4. Dashboard Snapshots

**File**: `scripts/dashboard-snapshot.mjs`

**Purpose**: Generate daily dashboard snapshots for CEO/Product review

**Output**: `artifacts/analytics/snapshots/YYYY-MM-DD.json`

**Metrics Captured**:

- Revenue (30-day rolling)
- AOV (average order value)
- Conversion rate
- Traffic (sessions, pageviews)
- Returns (rate, count, amount)
- Stock risk (WOS - weeks of supply)

---

### 5. Metrics Export for Content/Ads Agents

**File**: `scripts/metrics-for-content-ads.mjs`

**Purpose**: Supply metrics for Publer post-impact analysis and campaign optimization

**Output**: `artifacts/analytics/for-agents/metrics-for-ads-content-YYYY-MM-DD.json`

**Metrics Provided**:

- **Traffic**: Sessions, trend %
- **Conversion**: Rate, trend %
- **Revenue**: Total, trend %
- **Campaign Insights**: Traffic needs, conversion performance, SEO status

---

## API Routes

### Traffic Analytics

- **Route**: `app/routes/api.analytics.traffic.ts`
- **Method**: GET
- **Query Params**: `startDate`, `endDate`
- **Returns**: Sessions, pageviews, bounce rate, sources

### Shopify Returns

- **Route**: `app/routes/api/shopify.returns.ts`
- **Method**: GET
- **Query Params**: `startDate`, `endDate`
- **Returns**: `ReturnsMetrics` (rate, count, refunded)
- **Feature Flag**: Uses `ANALYTICS_REAL_DATA` flag

---

## Rollout Plan

### Phase 1: Mock Data (Current - LIVE)

- ✅ Feature flag `ANALYTICS_REAL_DATA=false`
- ✅ All routes return stub data
- ✅ Sampling guard active
- ✅ Nightly proofs running
- ✅ Dashboard snapshots enabled

### Phase 2: Credentials Configuration

**Prerequisites**:

- Shopify Admin API access token
- GA4 service account credentials
- Supabase connection verified

**Steps**:

1. Store credentials in GitHub Environments/Secrets
2. Add to Fly.io secrets: `fly secrets set SHOPIFY_ADMIN_API_TOKEN=xxx`
3. Verify health check passes: `/api/health`
4. Test with `ANALYTICS_REAL_DATA=true` in staging

### Phase 3: Real Data Rollout

**Prerequisites**:

- Phase 2 complete
- Staging tests passing
- Sampling guard verified with real API

**Steps**:

1. Enable `ANALYTICS_REAL_DATA=true` in production
2. Monitor sampling guard proof output (first 24 hours)
3. Compare real vs. mock data ranges
4. Adjust sampling rate if quota issues
5. Update dashboard tiles with live data

---

## Rollback Plan

### Immediate Rollback (< 5 minutes)

**Trigger**: API failures, quota exceeded, data anomalies

**Actions**:

```bash
# 1. Disable real data flag
fly secrets set ANALYTICS_REAL_DATA=false -a hotdash-app

# 2. Restart app
fly apps restart hotdash-app

# 3. Verify stub data restored
curl https://hotdash.app/api/shopify/returns?startDate=2025-10-01&endDate=2025-10-31
```

### Migration Rollback

**Trigger**: Supabase migration failures

**Actions**:

```bash
# 1. Connect to Supabase
supabase db remote commit

# 2. Revert last migration
supabase migration repair <migration_id> --status reverted

# 3. Verify schema
supabase db diff
```

### Dashboard Restoration

**Trigger**: Metrics display errors, tile failures

**Actions**:

1. Restore last known good snapshot: `artifacts/analytics/snapshots/YYYY-MM-DD.json`
2. Redeploy previous app version: `fly deploy --image <previous-image>`
3. Verify tiles load: Check P95 < 3s

---

## Monitoring

### Health Checks

- **Endpoint**: `/api/health`
- **Checks**: Database connection, API tokens present (not expired), sampling guard status
- **Frequency**: Every 60 seconds

### Metrics

- **Dashboard P95 Load Time**: < 3s (target)
- **Sampling Guard Pass Rate**: ≥ 95%
- **Nightly Proof Status**: 100% PASSED (0 failures)
- **API Error Rate**: < 0.5%

### Alerts

- Sampling guard: `WARNING` or `FAILED` status → Slack notification
- API errors: > 5 errors/hour → PagerDuty alert
- Dashboard latency: P95 > 5s → Manager notification

---

## Testing

### Contract Test

```bash
node scripts/sampling-guard-proof.mjs
```

**Expected**: Status `PASSED`, 6/6 checks passing

### Integration Tests

- Mock API responses verified
- Feature flag toggle tested
- Sampling guard rate limiting verified
- Dashboard snapshot generation tested

### E2E Tests

- Dashboard tiles load with mock data
- Returns metrics display correctly
- Approval evidence includes analytics
- Metrics export for Content/Ads agents working

---

## Security

### Secrets Management

- **NEVER** commit credentials to repository
- Store in GitHub Environments/Secrets
- Use Fly.io secrets for runtime: `fly secrets set KEY=VALUE`
- Rotate tokens quarterly

### API Access

- Minimum required scopes only
- Read-only access where possible
- Rate limiting via sampling guard
- Audit all API calls in logs

---

## Compliance

### HITL (Human-in-the-Loop)

- All analytics-driven suggestions require approval
- CEO/Product review nightly sampling proofs
- Metrics export for agent decisions auditable

### Data Retention

- Sampling proofs: Keep 90 days
- Dashboard snapshots: Keep 365 days
- Aggregated metrics: Indefinite (Supabase)
- Raw API responses: NOT stored (privacy)

---

## Change Log

- **2025-10-20**: Version 1.0 - Initial spec created with rollout/rollback plans
