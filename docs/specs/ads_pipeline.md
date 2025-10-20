# Ads Intelligence Pipeline

**Owner**: Ads Agent  
**Version**: 1.0  
**Last Updated**: 2025-10-19  
**Status**: Production Ready

## Overview

The Ads Intelligence system provides comprehensive campaign performance tracking, ROAS/CPC/CPA monitoring, budget/performance alerting, HITL approvals for campaign changes, and Publer integration for social ads scheduling.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Ads Intelligence Pipeline                 │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│  Meta Ads    │      │  Google Ads  │     │   Organic    │
│  (Stub/Real) │      │  (Stub/Real) │     │   (Future)   │
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                  ┌───────────▼───────────┐
                  │ Campaign Metrics API  │
                  │ /api/ads/campaigns    │
                  └───────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   Metrics    │      │   Platform   │     │  Attribution │
│ Calculations │      │  Breakdown   │     │  (UTM/Orders)│
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   Budget     │      │ Performance  │     │   Daily      │
│   Alerts     │      │   Alerts     │     │   Rollup     │
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                  ┌───────────▼───────────┐
                  │    Ads Dashboard      │
                  │  + Approval Drawer    │
                  └───────────────────────┘
```

## Components

### 1. Campaign Data Sources

#### Meta Ads (Facebook/Instagram)
- **Location**: `app/services/ads/meta-stub.ts`
- **Feature Flag**: `ADS_REAL_DATA` (default: false)
- **Mock Campaigns**: 4 campaigns (Feed, Stories, Reels, Retargeting)
- **Real API**: Meta Marketing API (requires credentials)
- **Metrics**: spend, impressions, clicks, conversions, revenue

#### Google Ads
- **Location**: `app/services/ads/google-stub.ts`
- **Feature Flag**: `ADS_REAL_DATA` (default: false)
- **Mock Campaigns**: 6 campaigns (Search, Display, Shopping, Video, PMax, Brand)
- **Real API**: Google Ads API (requires credentials)
- **Metrics**: spend, impressions, clicks, conversions, revenue

### 2. Metrics Calculations

**Location**: `app/lib/ads/metrics.ts`

**Core Functions**:
- `calculateROAS(revenue, spend)` → ROAS as decimal (e.g., 3.5 = 3.5x)
- `calculateCPC(spend, clicks)` → CPC in cents
- `calculateCPA(spend, conversions)` → CPA in cents
- `calculateCTR(clicks, impressions)` → CTR as decimal (e.g., 0.035 = 3.5%)
- `calculateConversionRate(conversions, clicks)` → Rate as decimal

**Zero-Guards**: All functions return `null` for division by zero (never Infinity or NaN)

**Formulas**:
```
ROAS = Revenue / Spend
CPC = Spend / Clicks
CPA = Spend / Conversions
CTR = Clicks / Impressions
Conversion Rate = Conversions / Clicks
```

**Precision**:
- Monetary values: cents (no floating-point errors)
- ROAS: 2 decimal places
- CPC/CPA: rounded to nearest cent
- CTR/Conversion Rate: 4 decimal places

### 3. Platform Breakdown

**Location**: `app/lib/ads/platform-breakdown.ts`

**Purpose**: Aggregates campaigns by platform (meta, google, organic, tiktok, pinterest)

**Key Function**: `getPlatformBreakdown(campaigns)`

**Returns**:
```typescript
{
  platform: string;
  campaignCount: number;
  activeCampaigns: number;
  totalSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  roas: number;
  cpc: number;
  cpa: number;
  ctr: number;
  conversionRate: number;
}[]
```

**Sorting**: By total spend (highest first)

### 4. Daily Aggregation

**Location**: `app/lib/ads/daily-rollup.ts`

**Purpose**: Store and retrieve daily campaign metrics

**Database Table**: `ads_daily_metrics`

**Key Functions**:
- `storeDailyMetrics(metrics[], request)` → Upserts to Supabase
- `getDailyMetrics(campaignId, startDate, endDate, request)` → Historical data
- `aggregateDailyMetrics(campaignIds[], startDate, endDate, request)` → Multi-campaign aggregation

**Upsert Strategy**: Conflict on (campaign_id, metric_date) → updates existing rows

### 5. Budget Alerts

**Location**: `app/lib/ads/budget-alerts.ts`

**Purpose**: Monitor campaign spend vs budget

**Alert Thresholds**:
- **Warning**: 90-109% of budget
- **Critical**: ≥110% of budget (overspend)

**Key Functions**:
- `checkCampaignBudget(campaign, threshold?)` → Budget check result
- `storeBudgetAlert(alert, request)` → Save to Supabase
- `getUnacknowledgedAlerts(request)` → Active alerts

**Database Table**: `budget_alerts`

**Alert Structure**:
```typescript
{
  campaign_id: string;
  alert_type: 'budget_warning' | 'budget_critical';
  budget_cents: number;
  spend_cents: number;
  overspend_cents: number;
  overspend_percentage: number;
  severity: 'warning' | 'critical';
  message: string;
}
```

### 6. Performance Alerts

**Location**: `app/lib/ads/performance-alerts.ts`

**Purpose**: Monitor campaign performance metrics

**Alert Types**:
1. **low_roas**: ROAS < 1.5x (warning), < 1.0x (critical)
2. **no_conversions**: 0 conversions AND spend > $50
3. **high_cpa**: CPA > threshold (configurable)
4. **low_ctr**: CTR < 1% AND impressions > 1000

**Recommendations**:
- **PAUSE**: ROAS < 1.0x (unprofitable)
- **OPTIMIZE**: ROAS 1.0-1.5x, or low CTR
- **MONITOR**: No conversions but low spend
- **SCALE_DOWN**: High CPA

**Key Functions**:
- `checkCampaignPerformance(campaign, thresholds?)` → Performance check
- `storePerformanceAlert(alert, request)` → Save to Supabase
- `getPerformanceAlerts(request, severity?)` → Filtered alerts

**Database Table**: `performance_alerts`

### 7. UTM Attribution

**Location**: `app/lib/ads/utm-parser.ts`

**Purpose**: Link Shopify orders to ad campaigns via UTM parameters

**Attribution Models**:
1. **First-Touch**: Credits first campaign that brought customer
2. **Last-Touch**: Credits final campaign before purchase

**Data Source**: Shopify Admin API → `customerJourneySummary`

**Key Functions**:
- `parseOrderAttribution(order, model)` → Attribution result
- `groupByCampaign(attributions)` → Orders by campaign
- `buildCampaignSummary(attributions, campaignName, spend?)` → Campaign summary with ROAS

**GraphQL Query**: `/tmp/orders_utm_query.graphql` (validated with Shopify MCP)

### 8. API Routes

**Location**: `app/routes/api.ads.campaigns.ts`

**Endpoint**: `GET /api/ads/campaigns`

**Query Parameters**:
- `?platform=meta` - Filter by platform
- `?status=active` - Filter by status

**Response**:
```json
{
  "campaigns": [...],
  "summary": {
    "totalCampaigns": 10,
    "activeCampaigns": 8,
    "totalSpend": 3342500,
    "totalRevenue": 9687500,
    "overallROAS": 2.9
  },
  "filters": { ... }
}
```

### 9. UI Components

#### Ads Dashboard Tile
**Location**: `app/components/dashboard/AdsTile.tsx`

**Displays**:
- Total Spend (formatted with $ and commas)
- ROAS (color-coded: green ≥2x, yellow ≥1x, red <1x)
- Total Clicks
- Conversions
- Revenue
- Avg CPC
- Conversion Rate

**Data Loading**: React Router 7 `useFetcher()` from `/api/ads/campaigns`

#### Campaign Approval Drawer
**Location**: `app/components/ads/CampaignApprovalDrawer.tsx`

**HITL Workflow**:
1. **Draft** → AI agent proposes campaign change
2. **Review** → Operator views proposal with full evidence
3. **Approve/Reject** → Operator makes final decision

**Proposal Structure**:
- Campaign details (type, platform, budget)
- Evidence (projected spend, target ROAS, estimated metrics)
- Risk assessment (level, factors, mitigation)
- Rollback plan (availability, steps)

**Actions**:
- Approve (with optional notes)
- Reject (reason required)

### 10. Publer Integration

**Location**: `app/services/ads/publer-campaigns.ts`

**Purpose**: Schedule social media posts for ad campaigns

**Feature Flag**: `PUBLER_LIVE` (default: false)

**Platforms Supported**:
- Facebook
- Instagram
- Twitter
- LinkedIn
- Pinterest

**Key Functions**:
- `schedulePublerPost(post, options?)` → Schedule single post
- `schedulePublerCampaign(campaign, options?)` → Schedule campaign with multiple posts
- `getPublerPosts(campaignId, options?)` → Fetch scheduled posts
- `getPublerAnalytics(postId, options?)` → Post performance

## Database Schema

### ads_campaigns
```sql
campaign_id TEXT PRIMARY KEY
name TEXT NOT NULL
platform TEXT NOT NULL -- meta, google, organic
status TEXT NOT NULL -- active, paused, archived
budget_cents INTEGER
utm_campaign TEXT
utm_source TEXT
utm_medium TEXT
start_date DATE
end_date DATE
created_at TIMESTAMPTZ DEFAULT NOW()
```

### ads_daily_metrics
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
campaign_id TEXT NOT NULL
metric_date DATE NOT NULL
spend_cents INTEGER DEFAULT 0
impressions INTEGER DEFAULT 0
clicks INTEGER DEFAULT 0
conversions INTEGER DEFAULT 0
revenue_cents INTEGER DEFAULT 0
roas NUMERIC -- Calculated by trigger
cpc INTEGER -- Calculated by trigger
cpa INTEGER -- Calculated by trigger
ctr NUMERIC -- Calculated by trigger
conversion_rate NUMERIC -- Calculated by trigger
created_at TIMESTAMPTZ DEFAULT NOW()

UNIQUE(campaign_id, metric_date)
```

### budget_alerts
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
campaign_id TEXT NOT NULL
campaign_name TEXT NOT NULL
platform TEXT NOT NULL
alert_type TEXT NOT NULL
budget_cents INTEGER
spend_cents INTEGER
threshold_percentage NUMERIC
overspend_cents INTEGER
overspend_percentage NUMERIC
severity TEXT NOT NULL
message TEXT NOT NULL
triggered_at TIMESTAMPTZ DEFAULT NOW()
acknowledged BOOLEAN DEFAULT FALSE
acknowledged_at TIMESTAMPTZ
acknowledged_by TEXT
```

### performance_alerts
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
campaign_id TEXT NOT NULL
campaign_name TEXT NOT NULL
platform TEXT NOT NULL
alert_type TEXT NOT NULL
current_value NUMERIC
threshold_value NUMERIC
severity TEXT NOT NULL
message TEXT NOT NULL
recommendation TEXT NOT NULL
action TEXT NOT NULL
triggered_at TIMESTAMPTZ DEFAULT NOW()
acknowledged BOOLEAN DEFAULT FALSE
acknowledged_at TIMESTAMPTZ
acknowledged_by TEXT
```

## Workflows

### Campaign Performance Monitoring Workflow

```
1. Fetch Campaigns
   ↓
2. Calculate Metrics (ROAS, CPC, CPA, CTR, Conversion Rate)
   ↓
3. Check Budget (vs threshold)
   ↓
4. Check Performance (vs targets)
   ↓
5. Generate Alerts (if thresholds exceeded)
   ↓
6. Store Alerts (Supabase)
   ↓
7. Display in Dashboard + Approval Drawer
```

### Order Attribution Workflow

```
1. Fetch Shopify Orders (with customerJourneySummary)
   ↓
2. Parse UTM Parameters (first-touch or last-touch)
   ↓
3. Match to Campaign (via utm_campaign field)
   ↓
4. Calculate Revenue per Campaign
   ↓
5. Update ads_daily_metrics (revenue_cents, conversions)
   ↓
6. Recalculate ROAS (with attributed revenue)
```

### HITL Approval Workflow

```
1. AI Agent Analyzes Campaign Performance
   ↓
2. Agent Proposes Change (pause, budget increase, etc.)
   ↓
3. Agent Prepares Proposal (evidence, risk, rollback)
   ↓
4. Proposal Displayed in Approval Drawer
   ↓
5. Operator Reviews (all context visible)
   ↓
6. Operator Approves or Rejects (reason required if reject)
   ↓
7. System Executes Approved Action
   ↓
8. System Logs Decision for Learning
```

## Testing

### Contract Tests
**Location**: `tests/contract/ads.metrics.contract.test.ts`
**Coverage**: API response shapes, 6 fixtures, 1 wildcard
**Status**: ✅ 6/6 passing

### Unit Tests
**Location**: `tests/unit/ads/metrics.spec.ts`
**Coverage**: Calculations, zero-guards, formatting, edge cases
**Status**: ✅ 60/60 passing

### Integration Tests
**Location**: `tests/integration/ads-workflow.spec.ts`
**Coverage**: Full workflow end-to-end
**Status**: ⚠️ 2/7 passing (requires mock environment setup)

## Feature Flags

See `docs/specs/feature_flags.md` for detailed configuration.

**Active Flags**:
- `ADS_REAL_DATA` (default: false) → Use real APIs vs stubs
- `PUBLER_LIVE` (default: false) → Use real Publer API vs mock

## Monitoring & Alerting

**Key Metrics**:
- Campaign ROAS (target: >1.5x)
- Budget utilization (alert: >90%)
- CPC trends
- Conversion rate
- Alert acknowledgment rate
- API error rates

**Logs**:
- Campaign fetches
- Metrics calculations
- Alert generation
- Approval decisions
- API errors

## Rollback Plan

1. Set `ADS_REAL_DATA=false` → Falls back to mock data
2. Set `PUBLER_LIVE=false` → Falls back to mock mode
3. Pause underperforming campaigns via approval drawer
4. Revert database migrations if schema issues

## Future Enhancements

- TikTok Ads integration
- Pinterest Ads integration
- Multi-touch attribution modeling
- AI-powered campaign suggestions
- Auto-budget scaling for high-performers
- A/B testing framework
- Creative performance analysis

## References

- North Star: `docs/NORTH_STAR.md`
- Feature Flags: `docs/specs/feature_flags.md`
- Shopify GraphQL Query: `/tmp/orders_utm_query.graphql`
- Meta API Docs: https://developers.facebook.com/docs/marketing-apis
- Google Ads API: https://developers.google.com/google-ads/api
- Publer API: https://publer.io/api

