# Ads Module

Production-ready advertising intelligence with ROAS/CTR metrics, HITL approvals, and platform integrations.

## Quick Start

```typescript
import {
  calculateROAS,
  fetchMetaCampaigns,
  createCampaignApprovalRequest,
  AdsFeatureFlags,
} from "~/lib/ads";

// Calculate ROAS
const roas = calculateROAS(revenue, spend);

// Fetch campaigns (stub mode by default)
const campaigns = await fetchMetaCampaigns();

// Create approval request
const approval = createCampaignApprovalRequest(campaignData, evidence);
```

## Core Modules

### Metrics (`metrics.ts`)

- `calculateROAS(revenue, spend)` - Return on Ad Spend
- `calculateCPC(spend, clicks)` - Cost Per Click
- `calculateCPA(spend, conversions)` - Cost Per Acquisition
- `calculateCTR(clicks, impressions)` - Click-Through Rate
- `calculateConversionRate(conversions, clicks)` - Conversion percentage
- All functions include zero-guards

### Types (`types.ts`)

- `Campaign` - Base campaign interface
- `MetaCampaign` - Facebook/Instagram campaigns
- `GoogleCampaign` - Google Ads campaigns
- `CampaignMetrics` - Performance metrics
- `AdsApprovalRequest` - HITL approval structure

### Platform Adapters

- **Meta**: `meta-stub.ts` (stub) / `data-sources/meta.real.ts` (production)
- **Google**: `google-ads-stub.ts` (stub) / `data-sources/google.real.ts` (production)
- **Publer**: `publer-adapter.stub.ts` (stub) / `publer-adapter.real.ts` (production)

### Services

- **Campaign Service**: List, filter, sort, get campaigns
- **Metrics Service**: Aggregate, analyze, export metrics
- **Sync Service**: Orchestrate platform data sync
- **Alerts Service**: Monitor performance thresholds

## Feature Flags

Set in `app/config/ads.server.ts`:

- `FEATURE_ADS_PUBLER_ENABLED` - Use real Publer API
- `FEATURE_ADS_META_ENABLED` - Use real Meta API
- `FEATURE_ADS_GOOGLE_ENABLED` - Use real Google Ads API
- `FEATURE_ADS_DASHBOARD_TILE` - Show metrics tile
- `FEATURE_ADS_APPROVALS` - Require HITL approvals (default: true)
- `FEATURE_ADS_METRICS_STORAGE` - Store to Supabase

## API Routes

- `GET /api/ads/campaigns` - List all campaigns
- `GET /api/ads/campaigns/:id` - Campaign details
- `POST /api/ads/campaigns/:id/pause` - Pause campaign (HITL)
- `POST /api/ads/campaigns/:id/budget` - Update budget (HITL)
- `GET /api/ads/metrics/daily` - Daily metrics aggregation
- `GET /api/ads/health` - Module health status

## Testing

```bash
# Unit tests
npx vitest run tests/unit/ads/

# Integration tests
npx vitest run tests/integration/ads-api.spec.ts

# E2E tests
npx playwright test tests/e2e/ads-campaign-approval.spec.ts
```

## Database

Table: `ads_metrics_daily`

```sql
CREATE TABLE ads_metrics_daily (
  campaign_id TEXT,
  platform TEXT,
  date DATE,
  spend DECIMAL(10,2),
  roas DECIMAL(10,2),
  -- ... other metrics
  UNIQUE(campaign_id, date)
);
```

Migration: `supabase/migrations/20251019_ads_metrics_daily.sql`

## Deployment

1. Configure environment variables
2. Enable feature flags
3. Run database migration
4. Test health endpoint
5. Monitor alerts

See: `docs/runbooks/ads_deployment.md`
