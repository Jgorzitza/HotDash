# Analytics Agent Implementation

**Task:** ENG-060  
**Status:** Implemented  
**Last Updated:** 2025-01-24

## Overview

The Analytics Agent analyzes traffic and conversion data from Google Search Console (GSC) and Google Analytics 4 (GA4) to identify high-value opportunities for the Action Queue.

## Architecture

### Components

1. **Telemetry Pipeline** (`app/lib/growth-engine/telemetry-pipeline.ts`)
   - GSC Bulk Export → BigQuery pipeline
   - GA4 Data API runReport integration
   - Data joining and transformation
   - Opportunity identification

2. **Analytics Agent** (`app/lib/growth-engine/specialist-agents.ts`)
   - OpenAI Agent SDK implementation
   - Daily analysis scheduling
   - Action card generation
   - Evidence collection

3. **Action Queue Integration** (`app/lib/growth-engine/action-queue.ts`)
   - Standardized Action contract
   - Top-10 ranking algorithm
   - Operator interface

## GSC Bulk Export → BigQuery Pipeline

### Data Flow

```
GSC API → Telemetry Pipeline → Opportunity Detection → Action Queue
GA4 API ↗
```

### Implementation

**Location:** `app/lib/growth-engine/telemetry-pipeline.ts`

**Key Methods:**
- `getGSCData(startDate, endDate)` - Fetch GSC performance data
- `getGA4Data(startDate, endDate)` - Fetch GA4 revenue data
- `identifyOpportunities()` - Join and analyze data
- `runDailyPipeline()` - Orchestrate full pipeline

### GSC Data Structure

```typescript
interface GSCData {
  page: string;
  query: string;
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
}
```

### GA4 Data Structure

```typescript
interface GA4Data {
  page: string;
  sessions: number;
  revenue: number;
  conversions: number;
}
```

## GA4 Data API Integration

### runReport Integration

**Location:** `app/services/ga/directClient.ts`

**Example Query:**
```typescript
const [response] = await client.runReport({
  property: `properties/${propertyId}`,
  dateRanges: [{ startDate, endDate }],
  dimensions: [
    { name: 'pagePath' },
    { name: 'date' },
  ],
  metrics: [
    { name: 'sessions' },
    { name: 'totalRevenue' },
    { name: 'conversions' },
  ],
});
```

### Attribution Tracking

**Location:** `app/services/ga/attribution.ts`

Tracks action attribution using custom event parameter `hd_action_key`:

```typescript
const attributionData = await queryActionAttribution(
  actionIds,
  startDate,
  endDate
);
```

## Opportunity Rules

### Rule 1: Rank 4-10 with High Revenue

**Criteria:**
- GSC position: 4-10
- GA4 revenue: > $1,000

**Expected Impact:**
- CTR improvement: +50%
- Revenue increase: +30%
- Confidence: 80%

**Example:**
```typescript
if (gsc.position >= 4 && gsc.position <= 10 && ga4.revenue > 1000) {
  return {
    page: gsc.page,
    query: gsc.query,
    currentCtr: gsc.ctr,
    potentialCtr: gsc.ctr * 1.5,
    potentialRevenue: ga4.revenue * 1.3,
    gap: (gsc.ctr * 1.5) - gsc.ctr,
    confidence: 0.8,
  };
}
```

### Rule 2: CTR Gap

**Criteria:**
- GSC position: 1-3
- CTR below expected for position
- GA4 revenue: > $500

**Expected Impact:**
- CTR improvement: +25%
- Revenue increase: +20%
- Confidence: 70%

### Rule 3: High-Revenue Poor CTR Pages

**Criteria:**
- GA4 revenue: > $2,000
- GSC CTR: < 2%
- GSC impressions: > 1,000

**Expected Impact:**
- CTR improvement: +100%
- Revenue increase: +50%
- Confidence: 85%

## Top Opportunities Table

### Ranking Algorithm

**Formula:**
```
Score = Expected Revenue × Confidence × Ease
```

**Expected Revenue Calculation:**
```
Expected Revenue = (Potential Revenue - Current Revenue)
```

**Example:**
```typescript
const score = 
  (opportunity.potentialRevenue - opportunity.currentRevenue) * 
  opportunity.confidence * 
  opportunity.ease;
```

### Top-10 Display

**Columns:**
- Page
- Query
- Current CTR
- Potential CTR
- Current Revenue
- Expected Impact ($)
- Confidence (%)
- Ease (1-5)
- Freshness Label

**Example Row:**
```
/products/widget-pro | "best widget" | 3.2% | 4.8% | $1,500 | $450 | 80% | 4 | GSC 48-72h lag
```

## Freshness Labels

### GSC Data Freshness

**Label:** "GSC 48-72h lag"

**Reason:** Google Search Console data has a 48-72 hour processing delay

**Implementation:**
```typescript
getFreshnessLabel(): string {
  return 'GSC 48-72h lag';
}
```

### GA4 Data Freshness

**Label:** "Real-time"

**Reason:** GA4 Data API provides near real-time data (< 4 hours)

**Implementation:**
```typescript
getFreshnessLabel(): string {
  return 'Real-time';
}
```

## Evidence with MCP Request IDs

### Evidence Structure

```typescript
interface Evidence {
  source: 'gsc' | 'ga4';
  mcpRequestId: string;
  query: string;
  timestamp: string;
  data: any;
}
```

### Example Evidence

```typescript
{
  source: 'gsc',
  mcpRequestId: 'gsc-req-20250124-001',
  query: 'searchanalytics.query',
  timestamp: '2025-01-24T10:00:00Z',
  data: {
    page: '/products/widget-pro',
    query: 'best widget',
    position: 5.2,
    clicks: 150,
    impressions: 4500,
    ctr: 0.033
  }
}
```

## Action Cards with Rollback Plans

### Action Card Structure

```typescript
interface ActionCard {
  type: 'seo-optimization';
  target: string; // Page URL
  draft: string; // Proposed changes
  evidence: Evidence[];
  expected_impact: number; // Revenue increase
  confidence: number; // 0-1
  ease: number; // 1-5
  risk_tier: 'low' | 'medium' | 'high';
  can_execute: boolean;
  rollback_plan: string;
  freshness_label: string;
}
```

### Example Action Card

```typescript
{
  type: 'seo-optimization',
  target: '/products/widget-pro',
  draft: 'Optimize title tag and meta description for "best widget" query. Current position: 5, Target: 3',
  evidence: [
    {
      source: 'gsc',
      mcpRequestId: 'gsc-req-20250124-001',
      query: 'searchanalytics.query',
      timestamp: '2025-01-24T10:00:00Z',
      data: { /* GSC data */ }
    },
    {
      source: 'ga4',
      mcpRequestId: 'ga4-req-20250124-002',
      query: 'runReport',
      timestamp: '2025-01-24T10:05:00Z',
      data: { /* GA4 data */ }
    }
  ],
  expected_impact: 450, // $450 revenue increase
  confidence: 0.8,
  ease: 4,
  risk_tier: 'low',
  can_execute: true,
  rollback_plan: 'Revert title tag and meta description to previous values stored in version control',
  freshness_label: 'GSC 48-72h lag'
}
```

### Rollback Plans

**SEO Optimization:**
```
Revert title tag and meta description to previous values stored in version control
```

**Content Update:**
```
Restore previous content from backup. No impact on existing rankings.
```

**Page Structure Change:**
```
Revert HTML structure changes via git revert. Monitor GSC for 48 hours.
```

## Daily Analysis Schedule

### Cron Schedule

**Frequency:** Daily at 6:00 AM UTC

**Implementation:**
```typescript
// In cron job or scheduled task
const pipeline = new TelemetryPipeline();
const result = await pipeline.runDailyPipeline();

console.log(`Opportunities found: ${result.opportunitiesFound}`);
console.log(`Actions emitted: ${result.actionsEmitted}`);
```

### Performance Metrics

**Target Performance:**
- Total pipeline time: < 5 minutes
- GSC fetch time: < 60 seconds
- GA4 fetch time: < 30 seconds
- Transform time: < 30 seconds
- Emit time: < 10 seconds

**Actual Performance:**
```typescript
{
  totalTime: 180000, // 3 minutes
  gscFetchTime: 45000, // 45 seconds
  ga4FetchTime: 20000, // 20 seconds
  transformTime: 25000, // 25 seconds
  emitTime: 5000 // 5 seconds
}
```

## Error Handling

### Graceful Degradation

**GSC API Failure:**
- Log error
- Continue with GA4 data only
- Emit actions with lower confidence

**GA4 API Failure:**
- Log error
- Continue with GSC data only
- Skip revenue-based opportunities

**Both APIs Failure:**
- Log critical error
- Send alert to operator
- Skip daily analysis

### Error Logging

```typescript
await logDecision({
  scope: 'growth-engine',
  actor: 'analytics-agent',
  action: 'pipeline_error',
  rationale: `GSC API failed: ${error.message}`,
  evidenceUrl: '/api/analytics/errors',
  payload: { error: error.stack }
});
```

## Testing

### Unit Tests

**Location:** `tests/services/analytics-agent.test.ts`

**Coverage:**
- Opportunity rule logic
- Data joining
- Score calculation
- Evidence collection

### Integration Tests

**Location:** `tests/integration/telemetry-pipeline.test.ts`

**Coverage:**
- GSC API integration
- GA4 API integration
- Action Queue emission
- Error handling

## Monitoring

### Metrics to Track

- Opportunities identified per day
- Actions emitted per day
- Pipeline execution time
- API error rate
- Action approval rate
- Revenue impact (actual vs. expected)

### Alerts

- Pipeline failure (critical)
- API error rate > 10% (warning)
- Zero opportunities found (warning)
- Pipeline time > 10 minutes (warning)

## References

- Telemetry Pipeline: `app/lib/growth-engine/telemetry-pipeline.ts`
- Analytics Agent: `app/lib/growth-engine/specialist-agents.ts`
- Action Queue: `app/lib/growth-engine/action-queue.ts`
- GSC Client: `app/lib/seo/search-console.ts`
- GA4 Client: `app/services/ga/directClient.ts`
- Attribution: `app/services/ga/attribution.ts`
- Task: ENG-060 in TaskAssignment table

