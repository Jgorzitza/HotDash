# SEO API Reference

## Endpoints

### GET /api/seo/monitoring

Returns anomaly counts, critical issues, and Core Web Vitals.

**Query Parameters:**

- `shop` (required): Shop domain

**Response:**

```json
{
  "success": true,
  "data": {
    "anomalyCount": 3,
    "criticalCount": 1,
    "vitals": { "LCP": { "value": 2300, "passes": true } }
  }
}
```

### GET /api/seo/anomalies

Returns detected SEO anomalies.

**Query Parameters:**

- `shop` (required): Shop domain

**Response:**

```json
{
  "success": true,
  "data": {
    "anomalies": [{ "id": "...", "type": "traffic", "severity": "critical" }],
    "summary": { "total": 1, "critical": 1, "warning": 0 }
  }
}
```

### GET /api/seo/recommendations

Returns HITL-ready SEO recommendations.

**Query Parameters:**

- `shop` (required): Shop domain
- `url` (optional): Page URL

**Response:**

```json
{
  "success": true,
  "data": {
    "recommendations": [
      { "id": "...", "priority": "critical", "title": "..." }
    ],
    "summary": { "total": 2, "critical": 1, "high": 1 }
  }
}
```

## Modules

### vitals.ts

- `normalizeVitals(vitals, device)` - Normalize Core Web Vitals

### search-console.ts

- `fetchSearchConsoleQueries(config, startDate, endDate)` - Fetch GSC data

### recommendations.ts

- `generatePerformanceRecommendations(vitals, url)` - Generate recommendations

### cannibalization.ts

- `detectOrganicVsOrganicConflicts(queries)` - Detect keyword conflicts

### approvals.ts

- `createSEOApprovalPayload(recommendation, vitals)` - Create HITL payload

### anomalies-detector.ts

- `detectTrafficAnomalies(current, previous, url)` - Detect anomalies
- `scanForAnomalies(urlMetrics)` - Scan multiple URLs

### metrics.ts

- `calculateSEOKPIs(current, previous)` - Calculate KPIs
- `aggregateMetrics(dailyMetrics)` - Aggregate over time
