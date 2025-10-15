# Ads Performance Tracking Specification

> **Owner:** ads agent  
> **Date:** 2025-10-15  
> **Status:** Initial Implementation  
> **Version:** 1.0

---

## Overview

This specification defines the ads performance tracking system for HotDash. The system calculates and tracks advertising performance metrics across multiple platforms (Meta, Google, TikTok) to support future HITL campaign management.

## Purpose

Enable data-driven advertising decisions by:
1. Tracking campaign performance across platforms
2. Calculating key metrics (ROAS, CPC, CPM, CPA)
3. Aggregating performance data for analysis
4. Providing foundation for HITL campaign recommendations

## Architecture

### Components

1. **Tracking Service** (`app/services/ads/tracking.ts`)
   - Core calculation functions
   - TypeScript types and interfaces
   - Campaign aggregation logic

2. **API Route** (`app/routes/api/ads.performance.ts`)
   - REST endpoint for performance data
   - Caching layer (5-minute TTL)
   - Audit logging to DashboardFact

3. **Data Structure** (defined in tracking service)
   - Campaign metrics
   - Performance calculations
   - Aggregated results

---

## Metrics Definitions

### ROAS (Return on Ad Spend)

**Formula:** `revenue / ad_spend`

**Interpretation:** For every $1 spent on ads, how much revenue is generated.

**Example:** ROAS of 4.0 means $4 revenue per $1 ad spend.

**Target:** ≥ 3.0 (3x return)

### CPC (Cost Per Click)

**Formula:** `ad_spend / clicks`

**Interpretation:** Average cost for each click on an ad.

**Example:** CPC of $1.25 means each click costs $1.25.

**Target:** Platform-dependent (Meta: $0.50-$2.00, Google: $1.00-$3.00)

### CPM (Cost Per Mille)

**Formula:** `(ad_spend / impressions) * 1000`

**Interpretation:** Cost to show ads to 1,000 people.

**Example:** CPM of $12.50 means $12.50 per 1,000 impressions.

**Target:** Platform-dependent (Meta: $5-$15, Google: $10-$20)

### CPA (Cost Per Acquisition)

**Formula:** `ad_spend / conversions`

**Interpretation:** Average cost to acquire one customer/conversion.

**Example:** CPA of $25 means each conversion costs $25.

**Target:** < Average Order Value (AOV)

### CTR (Click-Through Rate)

**Formula:** `(clicks / impressions) * 100`

**Interpretation:** Percentage of people who click after seeing the ad.

**Example:** CTR of 2.5% means 2.5 out of 100 viewers click.

**Target:** ≥ 1.5% (varies by platform and ad type)

### Conversion Rate

**Formula:** `(conversions / clicks) * 100`

**Interpretation:** Percentage of clicks that result in conversions.

**Example:** 5% conversion rate means 5 out of 100 clicks convert.

**Target:** ≥ 3% (varies by industry)

---

## Data Structures

### CampaignMetrics

Raw metrics from ad platforms:

```typescript
interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  platform: 'meta' | 'google' | 'tiktok' | 'other';
  status: 'active' | 'paused' | 'completed' | 'draft';
  adSpend: number;        // USD
  revenue: number;        // USD
  impressions: number;
  clicks: number;
  conversions: number;
  dateStart: string;      // ISO 8601
  dateEnd: string;        // ISO 8601
  metadata?: Record<string, any>;
}
```

### PerformanceMetrics

Calculated performance metrics:

```typescript
interface PerformanceMetrics {
  roas: number;
  cpc: number;
  cpm: number;
  cpa: number;
  ctr: number;
  conversionRate: number;
}
```

### CampaignPerformance

Complete campaign data with calculations:

```typescript
interface CampaignPerformance extends CampaignMetrics, PerformanceMetrics {
  calculatedAt: string;
}
```

### AggregatedPerformance

Aggregated metrics across campaigns:

```typescript
interface AggregatedPerformance {
  totalCampaigns: number;
  totalAdSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  aggregatedRoas: number;
  averageCpc: number;
  averageCpm: number;
  averageCpa: number;
  aggregatedCtr: number;
  aggregatedConversionRate: number;
  byPlatform: Record<AdPlatform, PerformanceMetrics & {
    campaigns: number;
    adSpend: number;
    revenue: number;
  }>;
  dateStart: string;
  dateEnd: string;
  calculatedAt: string;
}
```

---

## API Specification

### Endpoint

**GET** `/api/ads/performance`

### Authentication

Requires Shopify authentication (via session).

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dateStart` | string | No | 30 days ago | Start date (YYYY-MM-DD) |
| `dateEnd` | string | No | Today | End date (YYYY-MM-DD) |
| `platform` | string | No | All | Filter by platform (meta\|google\|tiktok\|other) |

### Response Format

**Success (200):**

```json
{
  "totalCampaigns": 5,
  "totalAdSpend": 2500.00,
  "totalRevenue": 10000.00,
  "totalImpressions": 455000,
  "totalClicks": 4700,
  "totalConversions": 224,
  "aggregatedRoas": 4.0,
  "averageCpc": 0.53,
  "averageCpm": 5.49,
  "averageCpa": 11.16,
  "aggregatedCtr": 1.03,
  "aggregatedConversionRate": 4.77,
  "byPlatform": {
    "meta": {
      "campaigns": 2,
      "adSpend": 800,
      "revenue": 3500,
      "roas": 4.38,
      "cpc": 0.84,
      "cpm": 10.00,
      "cpa": 11.43,
      "ctr": 1.19,
      "conversionRate": 7.37
    },
    "google": {
      "campaigns": 2,
      "adSpend": 1300,
      "revenue": 6500,
      "roas": 5.0,
      "cpc": 0.74,
      "cpm": 7.43,
      "cpa": 10.00,
      "ctr": 1.00,
      "conversionRate": 7.43
    },
    "tiktok": {
      "campaigns": 1,
      "adSpend": 400,
      "revenue": 1200,
      "roas": 3.0,
      "cpc": 0.20,
      "cpm": 2.00,
      "cpa": 16.67,
      "ctr": 1.00,
      "conversionRate": 1.20
    }
  },
  "dateStart": "2025-09-15",
  "dateEnd": "2025-10-15",
  "calculatedAt": "2025-10-15T14:00:00.000Z"
}
```

**Error (4xx/5xx):**

```json
{
  "error": {
    "message": "Error description",
    "scope": "ads.performance",
    "code": "ERROR_CODE",
    "retryable": false
  }
}
```

### Response Headers

- `Cache-Control: private, max-age=300` (5-minute cache)
- `X-Cache: HIT|MISS` (cache status)
- `X-Response-Time: {duration}ms` (processing time)

---

## Caching Strategy

**TTL:** 5 minutes (300 seconds)

**Cache Key Format:** `ads:{shopDomain}:{dateStart}:{dateEnd}:{platform}`

**Invalidation:** Automatic expiration after TTL

**Rationale:** Ad platform data updates hourly; 5-minute cache balances freshness with performance.

---

## Audit Logging

All API calls are logged to `DashboardFact` table:

```typescript
{
  shopDomain: string,
  factType: "ads.performance",
  scope: "dashboard",
  value: AggregatedPerformance,
  metadata: {
    dateStart: string,
    dateEnd: string,
    platform: string | null,
    campaignCount: number,
    generatedAt: string
  }
}
```

---

## Future Enhancements

### Phase 2: Real Platform Integration

1. **Meta Ads API Integration**
   - Connect to Facebook/Instagram Ads API
   - Fetch real campaign data
   - Handle OAuth authentication

2. **Google Ads API Integration**
   - Connect to Google Ads API
   - Fetch Search and Shopping campaigns
   - Handle service account authentication

3. **TikTok Ads API Integration**
   - Connect to TikTok Marketing API
   - Fetch campaign performance
   - Handle OAuth authentication

### Phase 3: Historical Tracking

1. **Supabase Storage**
   - Store daily snapshots of campaign performance
   - Enable trend analysis
   - Support week-over-week comparisons

2. **Performance Trends**
   - Calculate WoW (Week-over-Week) deltas
   - Detect anomalies in performance
   - Alert on significant changes

### Phase 4: HITL Campaign Management

1. **Budget Recommendations**
   - Suggest budget increases for high-ROAS campaigns
   - Recommend pausing low-performing campaigns
   - Optimize budget allocation across platforms

2. **Campaign Suggestions**
   - Recommend new campaigns based on product performance
   - Suggest audience targeting improvements
   - Propose creative variations

3. **Approval Workflow**
   - Draft budget changes → CEO review → Apply
   - Show evidence (ROAS trends, projected impact)
   - Track approval grades and learning

---

## Testing

### Unit Tests

Test all calculation functions:

```typescript
// Example test cases
describe('calculateRoas', () => {
  it('calculates correct ROAS', () => {
    expect(calculateRoas(1000, 250)).toBe(4.0);
  });
  
  it('returns 0 for zero ad spend', () => {
    expect(calculateRoas(1000, 0)).toBe(0);
  });
});
```

### Integration Tests

Test API endpoint:

```typescript
// Example integration test
describe('GET /api/ads/performance', () => {
  it('returns aggregated performance', async () => {
    const response = await fetch('/api/ads/performance');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.totalCampaigns).toBeGreaterThan(0);
  });
});
```

---

## Security Considerations

1. **Authentication:** All API calls require Shopify session authentication
2. **PII Protection:** No customer PII in logs or responses
3. **Read-Only:** Current implementation is read-only (no mutations)
4. **Rate Limiting:** Respect ad platform API rate limits
5. **Secrets Management:** Store API credentials in GitHub Secrets/Fly.io secrets

---

## Performance Targets

- **API Response Time:** P95 < 500ms (with cache), P95 < 2s (cache miss)
- **Cache Hit Rate:** > 80%
- **Error Rate:** < 0.5%
- **Calculation Accuracy:** 100% (verified against platform data)

---

## Changelog

- **1.0 (2025-10-15):** Initial implementation with mock data and core calculations

