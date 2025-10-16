# Ads Performance Module

Complete advertising performance tracking and optimization system for HotDash.

## Overview

The Ads module provides comprehensive tools for tracking, analyzing, and optimizing advertising campaigns across Meta, Google, and TikTok platforms.

## Features

### Core Tracking
- **ROAS Calculation**: Revenue / Ad Spend with time-series analysis
- **Performance Metrics**: CPC, CPM, CPA, CTR, Conversion Rate
- **Multi-Platform**: Meta (Facebook/Instagram), Google Ads, TikTok Ads
- **Campaign Aggregation**: Platform and time-period rollups

### Advanced Analytics
- **ROAS Trends**: Daily, weekly, monthly, quarterly analysis
- **Forecasting**: Linear regression-based ROAS predictions
- **Benchmarking**: Industry comparisons by platform
- **Incremental ROAS**: Measure true ad impact vs baseline

### Budget Optimization
- **Smart Allocation**: ROAS-weighted budget distribution
- **Pacing Monitor**: Track spend vs budget targets
- **Scaling Recommendations**: Data-driven budget adjustments
- **Constraint-Based**: Respect min/max budgets per platform/campaign

### Campaign Management
- **Dashboard**: Visual performance overview with Shopify Polaris
- **Drill-Down**: Campaign → AdSet → Ad hierarchy
- **Channel Breakdown**: Platform comparison and analysis
- **CSV Export**: Download performance data

### Creative & Audience
- **Creative Analysis**: Performance tracking, fatigue detection
- **A/B Testing**: Statistical significance, winner determination
- **Audience Insights**: Performance by segment, lookalike recommendations
- **Overlap Detection**: Identify audience duplication

### Attribution
- **6 Models**: Last-click, first-click, linear, time-decay, position-based, data-driven
- **Multi-Touch**: Customer journey tracking
- **Model Comparison**: Side-by-side attribution analysis
- **Incremental Lift**: Measure true ad contribution

### Intelligence
- **Anomaly Detection**: Statistical alerts for performance issues
- **Recommendations**: AI-powered suggestions with HITL approval
- **Bid Strategy**: Cost cap and target ROAS analysis
- **UTM Management**: Parameter validation and enforcement

### Monitoring
- **SLO Dashboard**: Service level objective tracking
- **Telemetry**: Cost and latency monitoring
- **Performance Budgets**: Route-level performance enforcement
- **Error Taxonomy**: Standardized error handling

## Architecture

### File Structure

```
app/
├── lib/ads/
│   ├── tracking.ts              # Core metrics calculation
│   ├── roas.ts                  # Advanced ROAS analysis
│   ├── creative-analysis.ts     # Creative performance
│   ├── audience-insights.ts     # Audience analysis
│   ├── ab-tests.ts              # A/B testing
│   ├── attribution.ts           # Multi-touch attribution
│   ├── anomaly-detection.ts     # Anomaly alerts
│   ├── budget-pacing.ts         # Budget monitoring
│   ├── drill-down.ts            # Campaign hierarchy
│   ├── channel-breakdown.ts     # Platform comparison
│   ├── csv-export.ts            # Data export
│   ├── forecast.ts              # Spend forecasting
│   ├── bid-strategy.ts          # Bidding analysis
│   ├── utm-helper.ts            # UTM management
│   ├── caching.ts               # Performance caching
│   ├── telemetry.ts             # Monitoring
│   ├── performance-budget.ts    # Performance tracking
│   ├── error-taxonomy.ts        # Error handling
│   ├── adapters.ts              # Platform adapters
│   ├── slo-dashboard.ts         # SLO monitoring
│   └── __tests__/               # Unit tests
├── services/ads/
│   ├── budget-optimizer.ts      # Budget optimization
│   ├── recommendations.ts       # HITL recommendations
│   ├── aggregation-job.ts       # Daily aggregation
│   └── __tests__/               # Service tests
└── routes/
    ├── ads.dashboard.tsx        # Dashboard UI
    └── api/
        ├── ads.performance.ts   # Performance API
        ├── ads.recommendations.ts # Recommendations API
        ├── ads.export.ts        # Export API
        ├── ads.anomalies.ts     # Anomalies API
        ├── ads.attribution.ts   # Attribution API
        └── ads.slo.ts           # SLO API
```

### Data Flow

1. **Adapters** fetch data from ad platforms (Meta, Google, TikTok)
2. **Tracking** calculates performance metrics
3. **Services** perform analysis and optimization
4. **API Routes** expose data to frontend
5. **Dashboard** displays visual insights
6. **Recommendations** suggest actions (HITL approval required)

## API Endpoints

- `GET /api/ads/performance` - Campaign performance data
- `GET /api/ads/recommendations` - Generate recommendations
- `POST /api/ads/recommendations` - Approve/reject recommendations
- `GET /api/ads/export` - Export to CSV
- `GET /api/ads/anomalies` - Detect anomalies
- `GET /api/ads/attribution` - Attribution analysis
- `GET /api/ads/slo` - SLO monitoring

See `docs/specs/ads_api_spec.md` for full API documentation.

## Database Schema

Supabase tables:
- `ads_daily_aggregations` - Daily performance rollups
- `ads_campaign_snapshots` - Point-in-time campaign data
- `ads_recommendations` - AI recommendations with HITL
- `ads_anomalies` - Performance alerts
- `ads_customer_journeys` - Attribution data

See `docs/specs/ads_supabase_schema.sql` for full schema.

## Usage

### Fetch Performance Data

```typescript
import { createAdapter, getAdapterConfig } from './lib/ads/adapters';
import { calculateCampaignPerformance } from './lib/ads/tracking';

const config = getAdapterConfig('production');
const adapter = createAdapter('meta', config);
const campaigns = await adapter.fetchCampaigns('2025-10-01', '2025-10-16');
const performance = campaigns.map(calculateCampaignPerformance);
```

### Generate Recommendations

```typescript
import { generateRecommendations } from './services/ads/recommendations';

const recommendations = generateRecommendations(campaigns, {
  totalBudget: 10000,
  minBudgetPerCampaign: 100,
});
```

### Detect Anomalies

```typescript
import { detectAllAnomalies } from './lib/ads/anomaly-detection';

const anomalies = detectAllAnomalies(currentMetrics, historicalMetrics);
```

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tracking.test.ts

# Run with coverage
npm test -- --coverage
```

## Deployment

See `docs/runbooks/ads_deployment.md` for deployment procedures.

## Configuration

Environment variables:
- `META_ADS_API_KEY` - Meta Ads API key
- `GOOGLE_ADS_API_KEY` - Google Ads API key
- `TIKTOK_ADS_API_KEY` - TikTok Ads API key
- `ADS_CACHE_TTL_MS` - Cache TTL (default: 300000 = 5 min)

## Monitoring

- **SLO Dashboard**: `/api/ads/slo`
- **Telemetry**: Automatic cost/latency tracking
- **Performance Budgets**: Route-level enforcement
- **Anomaly Alerts**: Real-time detection

## Contributing

1. Create feature branch
2. Write tests
3. Update documentation
4. Submit PR with evidence

## License

Proprietary - HotDash

