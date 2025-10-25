# Action Attribution Dashboard

**ANALYTICS-101**: Comprehensive attribution dashboard for growth actions with GA4 integration

## Overview

The Action Attribution Dashboard provides detailed performance analysis for approved growth actions, showing 7/14/28-day attribution windows with comprehensive metrics including impressions, clicks, conversions, revenue, and ROAS. The system integrates with GA4 using the `hd_action_key` custom dimension for accurate attribution tracking.

## Features

### 🎯 **Multi-Window Attribution Analysis**
- 7/14/28-day performance windows
- Real-time attribution metrics
- Performance delta calculations
- Expected vs actual impact comparison

### 📊 **Comprehensive Metrics**
- Impressions, clicks, conversions, revenue
- ROAS (Return on Ad Spend) calculations
- CTR (Click-Through Rate) analysis
- Cost per conversion tracking

### 🎯 **Confidence Scoring**
- Performance-based confidence scores
- Expected vs actual impact analysis
- ROI accuracy assessment
- Automated confidence updates

### 📈 **Action Rankings**
- Top-10 actions by realized ROI
- Revenue-based rankings
- Conversion-based rankings
- Confidence-based rankings

## Architecture

### Core Services

#### `app/services/ga/attribution.ts`
Main service for attribution analysis:

```typescript
// Key interfaces
interface AttributionMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roas: number;
  costPerConversion: number;
  conversionRate: number;
  ctr: number;
}

interface ActionAttribution {
  actionId: string;
  actionType: string;
  targetSlug: string;
  title: string;
  approvedAt: string;
  executedAt: string;
  expectedImpact: {
    impressions: number;
    conversions: number;
    revenue: number;
    roas: number;
  };
  actualImpact: {
    '7d': AttributionMetrics;
    '14d': AttributionMetrics;
    '28d': AttributionMetrics;
  };
  confidenceScore: number;
  realizedROI: number;
  performanceDelta: {
    impressions: number;
    conversions: number;
    revenue: number;
    roas: number;
  };
}
```

#### Key Functions

**`queryActionAttribution(actionIds, startDate, endDate)`**
- Queries GA4 for attribution data using `hd_action_key`
- Returns comprehensive metrics for specified actions
- Handles GA4 API integration and error fallbacks

**`calculateAttributionWindows(actionIds, endDate)`**
- Calculates 7/14/28-day attribution windows
- Processes multiple time periods simultaneously
- Returns structured attribution data

**`generateAttributionPanelData(actions, startDate, endDate)`**
- Generates comprehensive attribution panel data
- Calculates confidence scores and performance deltas
- Creates action rankings and summary metrics

### Dashboard Component

#### `app/components/attribution/AttributionPanel.tsx`
React component for attribution dashboard:

**Features:**
- Interactive time window selection (7d/14d/28d)
- Sortable action table with multiple criteria
- Real-time performance metrics display
- Action detail modal with comprehensive analysis
- Performance delta indicators

**View Modes:**
1. **Summary Cards**: Key metrics overview
2. **Actions Table**: Detailed performance analysis
3. **Action Details**: Comprehensive individual action analysis

### API Route

#### `app/routes/api.attribution.panel.ts`
API endpoint for attribution data:

**Query Parameters:**
- `startDate`: Analysis start date (default: 28 days ago)
- `endDate`: Analysis end date (default: today)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "period": { "start": "2025-09-24", "end": "2025-10-22" },
    "actions": [...],
    "summary": {
      "totalActions": 5,
      "totalRevenue": 25000,
      "totalConversions": 150,
      "averageROI": 3.2,
      "overallConfidence": 78
    },
    "rankings": {
      "byROI": [...],
      "byRevenue": [...],
      "byConversions": [...]
    }
  }
}
```

## Implementation Guide

### 1. **Setup Requirements**

**Dependencies:**
- Google Analytics 4 with `hd_action_key` custom dimension
- Growth actions database table
- GA4 Data API access

**Environment Variables:**
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GA4_PROPERTY_ID=your-property-id
```

### 2. **Database Schema**

**Growth Actions Table:**
```sql
CREATE TABLE growth_actions (
  action_id VARCHAR(255) PRIMARY KEY,
  action_type ENUM('seo', 'ads', 'content', 'social', 'email', 'product'),
  target_slug VARCHAR(255),
  title VARCHAR(500),
  description TEXT,
  approved_at TIMESTAMP,
  executed_at TIMESTAMP,
  status ENUM('approved', 'executed', 'completed', 'failed'),
  expected_impact JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. **GA4 Custom Dimension Setup**

**Required Custom Dimension:**
- **Name**: `hd_action_key`
- **Scope**: Event
- **Description**: Action attribution key for growth actions

**Setup Script:**
```bash
npx tsx scripts/analytics/setup-ga4-custom-dimensions.ts
```

### 4. **Integration Steps**

**Step 1: Install Dependencies**
```bash
npm install @google-analytics/data
```

**Step 2: Configure GA4**
```typescript
// app/config/ga.server.ts
export const gaConfig = {
  mode: 'direct', // or 'mock' for development
  propertyId: process.env.GA4_PROPERTY_ID,
  credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS
};
```

**Step 3: Implement Action Tracking**
```typescript
// In your growth action execution code
import { trackEvent } from '~/utils/analytics';

// Track action execution with attribution key
trackEvent('growth_action_executed', {
  hd_action_key: actionId,
  action_type: actionType,
  target_slug: targetSlug,
  expected_impact: expectedImpact
});
```

**Step 4: Fetch Attribution Data**
```typescript
// In your dashboard component
import { useLoaderData } from '@remix-run/react';

export default function AttributionDashboard() {
  const { data } = useLoaderData();
  
  return (
    <AttributionPanel 
      data={data} 
    />
  );
}
```

## Usage Examples

### 1. **Basic Attribution Query**

```typescript
// Query attribution data for specific actions
import { queryActionAttribution } from '~/services/ga/attribution';

const attributionData = await queryActionAttribution(
  ['action-001', 'action-002'],
  '2025-10-01',
  '2025-10-22'
);

console.log('Attribution data:', attributionData);
```

### 2. **Generate Attribution Panel**

```typescript
// Generate complete attribution panel data
import { generateAttributionPanelData } from '~/services/ga/attribution';

const panelData = await generateAttributionPanelData(
  actions,
  '2025-10-01',
  '2025-10-22'
);

console.log('Panel data:', panelData.summary);
console.log('Top performer:', panelData.summary.topPerformer);
```

### 3. **Calculate Confidence Scores**

```typescript
// Get confidence scores for actions
const actionsWithConfidence = panelData.actions.map(action => ({
  actionId: action.actionId,
  title: action.title,
  confidenceScore: action.confidenceScore,
  realizedROI: action.realizedROI,
  performanceDelta: action.performanceDelta
}));

console.log('Actions with confidence:', actionsWithConfidence);
```

## Performance Optimization

### 1. **Caching Strategy**
- Cache attribution data for 1 hour
- Use Redis for high-frequency queries
- Implement incremental updates

### 2. **Data Processing**
- Process attribution data in batches
- Use background jobs for heavy calculations
- Implement data aggregation for large datasets

### 3. **API Optimization**
- Implement pagination for large result sets
- Use compression for API responses
- Cache frequently accessed metrics

## Monitoring and Alerts

### 1. **Performance Monitoring**
- Track API response times
- Monitor data processing latency
- Alert on calculation errors

### 2. **Data Quality**
- Validate attribution data completeness
- Monitor GA4 data freshness
- Alert on missing custom dimensions

### 3. **Business Metrics**
- Track confidence score trends
- Monitor ROI improvements
- Alert on performance degradation

## Troubleshooting

### Common Issues

**1. Missing Attribution Data**
- Verify `hd_action_key` custom dimension is set up
- Check GA4 data processing delays (24-48 hours)
- Ensure action tracking is implemented correctly

**2. Low Confidence Scores**
- Review expected vs actual impact calculations
- Check for data quality issues
- Analyze performance delta calculations

**3. API Performance Issues**
- Check GA4 API quotas and limits
- Implement proper caching
- Optimize database queries

### Debug Mode

Enable debug logging:
```typescript
// Set environment variable
DEBUG_ATTRIBUTION=true

// Check logs for detailed attribution calculations
console.log('Attribution data:', attributionData);
console.log('Confidence scores:', confidenceScores);
```

## Future Enhancements

### Planned Features
1. **Advanced Attribution Models**
   - Time-decay attribution
   - Position-based attribution
   - Data-driven attribution

2. **Machine Learning Integration**
   - Predictive confidence scoring
   - Automated performance optimization
   - Anomaly detection

3. **Real-time Analytics**
   - Live performance monitoring
   - Instant confidence updates
   - Real-time ranking updates

4. **Integration Expansions**
   - Additional data sources
   - Third-party analytics platforms
   - Custom attribution models

## Support

For technical support or questions about the Action Attribution Dashboard:

1. **Documentation**: Check this guide and inline code comments
2. **Logs**: Review application logs for error details
3. **Database**: Verify data integrity and completeness
4. **GA4**: Ensure proper setup and data flow

---

**ANALYTICS-101**: Action Attribution Dashboard Integration implementation complete ✅
