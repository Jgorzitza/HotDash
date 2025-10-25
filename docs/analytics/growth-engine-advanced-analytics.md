# Growth Engine Advanced Analytics

**ANALYTICS-023**: Comprehensive advanced analytics system for Growth Engine phases 9-12

## Overview

The Growth Engine Advanced Analytics system provides sophisticated attribution modeling, performance optimization, and predictive insights for growth actions across all channels. This system is designed to support the advanced phases of the Growth Engine with data-driven decision making.

## Features

### 🎯 **Advanced Attribution Modeling**
- Multi-touch attribution analysis (7/14/28-day windows)
- Action-specific performance tracking
- Revenue attribution across all touchpoints
- Efficiency scoring and optimization recommendations

### 📊 **Performance Analytics**
- Real-time growth action performance
- Channel-specific performance breakdown
- ROI optimization recommendations
- Budget allocation guidance

### 🔮 **Predictive Insights**
- Performance trend analysis
- Seasonal pattern recognition
- Optimization opportunity identification
- Scaling recommendations

### 💰 **Budget Optimization**
- ROI-based budget recommendations
- Performance-based scaling suggestions
- Cost-per-conversion analysis
- Revenue-per-dollar optimization

## Architecture

### Core Services

#### `app/services/analytics/growthEngineAdvanced.ts`
Main service containing all analytics logic:

```typescript
// Key interfaces
interface GrowthAction {
  actionId: string;
  actionType: 'seo' | 'ads' | 'content' | 'social' | 'email' | 'product';
  targetSlug: string;
  title: string;
  description: string;
  approvedAt: string;
  executedAt: string;
  status: 'approved' | 'executed' | 'completed' | 'failed';
  budget?: number;
  expectedROI?: number;
}

interface AttributionData {
  actionId: string;
  actionType: string;
  targetSlug: string;
  attributionWindows: {
    '7d': AttributionMetrics;
    '14d': AttributionMetrics;
    '28d': AttributionMetrics;
  };
  totalAttribution: AttributionMetrics;
  efficiency: {
    costPerConversion: number;
    revenuePerDollar: number;
    efficiencyScore: number; // 0-100
  };
}
```

#### Key Functions

**`calculateAdvancedAttribution(actions, attributionData)`**
- Calculates multi-touch attribution for all growth actions
- Processes 7/14/28-day attribution windows
- Computes efficiency scores and performance metrics

**`generateGrowthEngineAnalytics(actions, attributionData, startDate, endDate)`**
- Generates comprehensive analytics report
- Provides performance insights and recommendations
- Calculates optimization opportunities

**`exportGrowthEngineAnalytics(analytics)`**
- Formats analytics data for dashboard display
- Provides dashboard-ready data structure

### Dashboard Component

#### `app/components/analytics/GrowthEngineAnalytics.tsx`
React component for displaying advanced analytics:

**Features:**
- Interactive timeframe selection (7d/14d/28d)
- Multiple view modes (Overview/Attribution/Recommendations)
- Real-time performance metrics
- Optimization recommendations
- Budget allocation guidance

**View Modes:**
1. **Overview**: Summary metrics, top performers, insights
2. **Attribution**: Detailed attribution analysis table
3. **Recommendations**: Action recommendations and budget guidance

### API Route

#### `app/routes/api.analytics.growth-engine.ts`
API endpoint for fetching analytics data:

**Query Parameters:**
- `startDate`: Analysis start date (default: 28 days ago)
- `endDate`: Analysis end date (default: today)
- `timeframe`: Attribution window (7d/14d/28d)

**Response Format:**
```json
{
  "analytics": {
    "period": { "start": "2025-09-24", "end": "2025-10-22" },
    "summary": {
      "totalActions": 5,
      "totalRevenue": 125000,
      "totalConversions": 450,
      "averageROI": 3.8,
      "overallEfficiency": 78.5
    },
    "attributionAnalysis": [...],
    "performanceInsights": {...},
    "recommendations": {...}
  },
  "timeframe": "28d",
  "period": { "start": "2025-09-24", "end": "2025-10-22" }
}
```

## Implementation Guide

### 1. **Setup Requirements**

**Dependencies:**
- Google Analytics 4 with `hd_action_key` custom dimension
- Growth actions database table
- GA4 Admin API access for attribution data

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
  budget DECIMAL(10,2),
  expected_roi DECIMAL(5,2)
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
npm install @google-analytics/data @google-analytics/admin
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

**Step 3: Implement Growth Action Tracking**
```typescript
// In your growth action execution code
import { trackEvent } from '~/utils/analytics';

// Track action execution
trackEvent('growth_action_executed', {
  hd_action_key: actionId,
  action_type: actionType,
  target_slug: targetSlug,
  budget: budget,
  expected_roi: expectedROI
});
```

**Step 4: Fetch Analytics Data**
```typescript
// In your dashboard component
import { useLoaderData } from '@remix-run/react';

export default function GrowthEngineDashboard() {
  const { analytics } = useLoaderData();
  
  return (
    <GrowthEngineAnalyticsComponent 
      analytics={analytics} 
    />
  );
}
```

## Usage Examples

### 1. **Basic Analytics Fetch**

```typescript
// Fetch analytics for last 28 days
const response = await fetch('/api/analytics/growth-engine?timeframe=28d');
const { analytics } = await response.json();

console.log('Total Revenue:', analytics.summary.totalRevenue);
console.log('Top Action:', analytics.summary.topPerformingAction);
```

### 2. **Attribution Analysis**

```typescript
// Get attribution data for specific action
const actionAttribution = analytics.attributionAnalysis.find(
  data => data.actionId === 'action-001'
);

console.log('7-day conversions:', actionAttribution.attributionWindows['7d'].conversions);
console.log('Efficiency score:', actionAttribution.efficiency.efficiencyScore);
```

### 3. **Budget Optimization**

```typescript
// Get budget recommendations
const budgetRecs = analytics.recommendations.budgetRecommendations;

budgetRecs.forEach(rec => {
  console.log(`Action ${rec.actionId}:`);
  console.log(`  Current: $${rec.currentBudget}`);
  console.log(`  Recommended: $${rec.recommendedBudget}`);
  console.log(`  Expected ROI: ${rec.expectedROI}x`);
});
```

## Performance Optimization

### 1. **Caching Strategy**
- Cache analytics data for 1 hour
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
- Track overall efficiency trends
- Monitor ROI improvements
- Alert on performance degradation

## Troubleshooting

### Common Issues

**1. Missing Attribution Data**
- Verify `hd_action_key` custom dimension is set up
- Check GA4 data processing delays (24-48 hours)
- Ensure action tracking is implemented correctly

**2. Low Efficiency Scores**
- Review action targeting and execution
- Check for data quality issues
- Analyze attribution window settings

**3. API Performance Issues**
- Check GA4 API quotas and limits
- Implement proper caching
- Optimize database queries

### Debug Mode

Enable debug logging:
```typescript
// Set environment variable
DEBUG_ANALYTICS=true

// Check logs for detailed attribution calculations
console.log('Attribution data:', attributionData);
console.log('Efficiency scores:', efficiencyScores);
```

## Future Enhancements

### Planned Features
1. **Machine Learning Integration**
   - Predictive performance modeling
   - Automated optimization recommendations
   - Anomaly detection

2. **Advanced Attribution Models**
   - Time-decay attribution
   - Position-based attribution
   - Data-driven attribution

3. **Real-time Analytics**
   - Live performance monitoring
   - Instant optimization alerts
   - Real-time budget adjustments

4. **Integration Expansions**
   - Additional data sources
   - Third-party analytics platforms
   - Custom attribution models

## Support

For technical support or questions about the Growth Engine Advanced Analytics system:

1. **Documentation**: Check this guide and inline code comments
2. **Logs**: Review application logs for error details
3. **Database**: Verify data integrity and completeness
4. **GA4**: Ensure proper setup and data flow

---

**ANALYTICS-023**: Growth Engine Advanced Analytics implementation complete ✅
