# Ads Pipeline Specification

**Version:** 1.0  
**Effective:** 2025-10-19  
**Owner:** Ads Agent

## Overview

The Ads Pipeline provides production-ready advertising intelligence with ROAS/CTR metrics, HITL (Human-in-the-Loop) approvals workflow, and integration with Meta/Google Ads and Publer social media scheduling.

## Architecture

### Components

1. **Metrics Helpers** (`app/lib/ads/metrics.ts`)
   - ROAS, CPC, CPA, CTR, Conversion Rate calculations
   - Zero-guards to prevent division by zero
   - Currency and percentage formatting

2. **Type Definitions** (`app/lib/ads/types.ts`)
   - Campaign, MetaCampaign, GoogleCampaign types
   - CampaignMetrics interface
   - Publer integration types
   - Supabase ads_metrics_daily table structure

3. **Publer Adapter** (`app/lib/ads/publer-adapter.stub.ts`)
   - Feature-flagged stub (USE_REAL_PUBLER_API=false)
   - Schedule/publish campaign posts
   - Export campaign plans for HITL approval
   - Health check endpoint

4. **Dashboard Tile** (`app/components/dashboard/CampaignMetricsTile.tsx`)
   - Display ROAS, CPC, spend, clicks, impressions
   - Loading and error states
   - Polaris UI components
   - Compact variant available

5. **Approvals Integration** (`app/lib/ads/approvals.ts`)
   - Wire ads to centralized approvals drawer
   - Evidence payloads (historical data, projected ROAS, similar campaigns)
   - Risk assessment (low/medium/high)
   - Rollback plans

6. **Platform Stubs**
   - **Meta Stub** (`app/lib/ads/meta-stub.ts`): Facebook/Instagram integration (stub mode)
   - **Google Ads Stub** (`app/lib/ads/google-ads-stub.ts`): Google Ads integration (stub mode)
   - Both include comprehensive OAuth/API documentation for real implementation

7. **Impact Metrics** (`app/lib/ads/impact-metrics.ts`)
   - Calculate per-campaign daily impact
   - Transform to Supabase row format
   - Batch store operations
   - Aggregate metrics across all campaigns

## Data Flow

```
┌──────────────────┐
│ Meta/Google Ads  │ (stub mode)
│ Platform APIs    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ Fetch Campaign Data  │
│ (meta-stub.ts,       │
│  google-ads-stub.ts) │
└────────┬─────────────┘
         │
         ▼
┌───────────────────────┐
│ Calculate Metrics     │
│ (metrics.ts,          │
│  impact-metrics.ts)   │
└────────┬──────────────┘
         │
         ▼
┌──────────────────────────┐
│ Store in Supabase        │
│ ads_metrics_daily table  │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Display in Dashboard    │
│ (CampaignMetricsTile)   │
└─────────────────────────┘
```

## HITL Approvals Workflow

### Campaign Creation

1. Agent proposes new campaign with:
   - Campaign details (name, budget, platform, targeting)
   - Evidence (historical data, similar campaigns)
   - Projected ROAS
   - Risk assessment

2. Approval request sent to approvals drawer with:
   - **Evidence**: Historical performance, projected metrics
   - **Risk Level**: Low/Medium/High based on budget and ROAS
   - **Rollback Plan**: Pause campaign, stop ad sets, refund unused budget

3. Human reviews and approves/rejects:
   - If approved → Create campaign via platform API
   - If rejected → Log reason, do not create

4. Post-approval:
   - Monitor performance
   - Store daily metrics to Supabase
   - Alert if ROAS falls below threshold

### Budget Changes

1. Agent proposes budget change with:
   - Current vs. new budget
   - Percent change
   - Justification

2. Risk assessment:
   - Large increases (>100%) = High risk
   - Moderate increases (50-100%) = Medium risk
   - Decreases = Low risk

3. Rollback plan: Revert to original budget if performance degrades

## Feature Flags

### Publer Integration

```typescript
// app/lib/ads/publer-adapter.stub.ts
const USE_REAL_PUBLER_API =
  process.env.PUBLER_LIVE === "true" ||
  process.env.FEATURE_ADS_PUBLER_ENABLED === "true";
```

**Requirements for Real Mode:**

- `PUBLER_API_KEY` environment variable
- `PUBLER_WORKSPACE_ID` environment variable
- `PUBLER_LIVE=true` or `FEATURE_ADS_PUBLER_ENABLED=true` to enable

### Platform Stubs

Both Meta and Google Ads stubs run in stub mode by default:

```typescript
const STUB_MODE = true; // Set to false when credentials configured
```

**Meta Requirements:**

- `META_ACCESS_TOKEN` (long-lived user access token or system user token)
- App ID and App Secret
- Permissions: ads_read, ads_management, business_management

**Google Ads Requirements:**

- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_REFRESH_TOKEN` (from OAuth flow)

## Supabase Schema

### ads_metrics_daily Table

```sql
CREATE TABLE ads_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'meta', 'google', 'unknown'
  date DATE NOT NULL,
  spend DECIMAL(10, 2) NOT NULL,
  revenue DECIMAL(10, 2) NOT NULL,
  impressions INTEGER NOT NULL,
  clicks INTEGER NOT NULL,
  conversions INTEGER NOT NULL,
  roas DECIMAL(10, 2) NOT NULL,
  cpc DECIMAL(10, 2) NOT NULL,
  cpa DECIMAL(10, 2) NOT NULL,
  ctr DECIMAL(10, 2) NOT NULL,
  conversion_rate DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

CREATE INDEX idx_ads_metrics_campaign_date ON ads_metrics_daily(campaign_id, date DESC);
CREATE INDEX idx_ads_metrics_platform_date ON ads_metrics_daily(platform, date DESC);
```

## Contract Tests

### Test File

`tests/unit/ads/tracking.spec.ts`

### Coverage

- ✅ ROAS calculation with zero-guards
- ✅ CPC calculation with zero-guards
- ✅ CPA calculation with zero-guards
- ✅ CTR calculation with zero-guards
- ✅ Conversion rate calculation with zero-guards
- ✅ Negative input handling
- ✅ Currency formatting
- ✅ Percentage formatting

### Run Tests

```bash
npx vitest run tests/unit/ads/tracking.spec.ts
```

**Expected:** All 34 tests pass

## Metrics Definitions

### Primary Metrics

- **ROAS (Return on Ad Spend)**: `revenue / spend`
  - Target: ≥ 4.0x (Excellent), ≥ 2.0x (Good), < 2.0x (Needs Improvement)
- **CPC (Cost Per Click)**: `spend / clicks`
  - Lower is better, varies by industry and platform
- **CPA (Cost Per Acquisition)**: `spend / conversions`
  - Target: < $25 for Hot Rod AN products

### Secondary Metrics

- **CTR (Click-Through Rate)**: `(clicks / impressions) * 100`
  - Target: ≥ 2.0% (industry benchmark)
- **Conversion Rate**: `(conversions / clicks) * 100`
  - Target: ≥ 5.0% (e-commerce benchmark)

## Dashboard Integration

### Campaign Metrics Tile

**Location:** `app/components/dashboard/CampaignMetricsTile.tsx`

**Props:**

```typescript
interface CampaignMetricsTileProps {
  spend: number;
  roas: number;
  cpc: number;
  clicks: number;
  impressions: number;
  roasTrend?: "up" | "down" | "neutral";
  roasChange?: string;
  currency?: string;
  loading?: boolean;
  error?: string;
  period?: string;
}
```

**Usage:**

```tsx
import { CampaignMetricsTile } from "~/components/dashboard/CampaignMetricsTile";

<CampaignMetricsTile
  spend={2800}
  roas={6.0}
  cpc={1.32}
  clicks={2125}
  impressions={85000}
  roasTrend="up"
  roasChange="+15%"
  period="Last 7 days"
/>;
```

## API Routes (Future)

### Planned Endpoints

- `GET /api/ads/campaigns` - List all campaigns
- `GET /api/ads/campaigns/:id` - Get campaign details
- `GET /api/ads/metrics/daily` - Get daily metrics
- `POST /api/ads/campaigns` - Create campaign (HITL required)
- `PATCH /api/ads/campaigns/:id` - Update campaign (HITL required)
- `POST /api/ads/campaigns/:id/pause` - Pause campaign (HITL required)

## Monitoring & Alerts

### Performance Thresholds

- ROAS < 2.0x for 3+ days → Alert
- Daily spend > budget \* 1.2 → Alert
- CPA > $40 → Alert
- Campaign paused unexpectedly → Alert

### Health Checks

```typescript
// Publer health
const publerHealth = await publlerAdapter.healthCheck();

// Meta health
const metaHealth = await checkMetaHealth();

// Google Ads health
const googleHealth = await checkGoogleAdsHealth();
```

## Security & Compliance

### Secrets Management

- All API keys stored in environment variables
- Never commit credentials to Git
- Use GitHub Secrets for CI/CD
- Rotate tokens every 60 days (Meta) or annually (Google Ads)

### Data Privacy

- Campaign data is business data (not PII)
- No customer PII in ads metrics
- Aggregated metrics only in dashboard
- Audit logs for all HITL approvals

## Rollout Plan

### Phase 1: Stub Mode (Current)

- ✅ All stubs active
- ✅ Mock data for testing
- ✅ Dashboard tiles functional
- ✅ Approvals integration ready

### Phase 2: Meta Integration

- Configure `META_ACCESS_TOKEN`
- Set `STUB_MODE = false` in meta-stub.ts
- Test with single campaign
- Monitor for 7 days
- Expand to all campaigns

### Phase 3: Google Ads Integration

- Complete OAuth flow
- Configure developer token and credentials
- Set `STUB_MODE = false` in google-ads-stub.ts
- Test with search campaigns
- Monitor for 7 days
- Expand to display campaigns

### Phase 4: Publer Integration

- Configure Publer API key and workspace ID
- Set `USE_REAL_PUBLER_API = true`
- Test social post scheduling
- Monitor post delivery
- Enable HITL workflow for all posts

## Troubleshooting

### Common Issues

**Test Failures:**

- Floating point precision: Use `toBeCloseTo()` instead of `toBe()` for decimal comparisons
- Zero-guard failures: Verify all metrics helpers return 0 for invalid inputs

**Dashboard Tile Not Loading:**

- Check `loading` prop is set correctly
- Verify metrics data is passed as numbers (not strings)
- Check console for Polaris component errors

**Stub Mode Not Working:**

- Verify feature flags are set correctly
- Check mock data is properly formatted
- Ensure stub functions return Promises

## References

- **Publer API Docs**: https://publer.com/docs/posting
- **Meta Marketing API**: https://developers.facebook.com/docs/marketing-apis
- **Google Ads API**: https://developers.google.com/google-ads/api/docs/start
- **North Star**: `docs/NORTH_STAR.md`
- **Operating Model**: `docs/OPERATING_MODEL.md`
