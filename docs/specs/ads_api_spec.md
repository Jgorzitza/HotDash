# Ads API Specification

> **Owner:** ads agent  
> **Date:** 2025-10-16  
> **Version:** 1.0

## Overview

Complete API specification for HotDash advertising performance endpoints.

## Base URL

```
/api/ads
```

## Endpoints

### GET /api/ads/performance

Fetch campaign performance data.

**Query Parameters:**
- `platform` (optional): Filter by platform (`meta`, `google`, `tiktok`)
- `dateStart` (optional): Start date (YYYY-MM-DD), default: 30 days ago
- `dateEnd` (optional): End date (YYYY-MM-DD), default: today
- `campaignId` (optional): Specific campaign ID

**Response:**
```json
{
  "campaigns": [...],
  "aggregated": {...},
  "meta": {
    "dateStart": "2025-10-01",
    "dateEnd": "2025-10-16",
    "platform": "all",
    "count": 3
  }
}
```

### GET /api/ads/recommendations

Generate campaign recommendations.

**Query Parameters:**
- `totalBudget` (optional): Total budget for optimization, default: 10000
- `dateStart` (optional): Start date for analysis
- `dateEnd` (optional): End date for analysis

**Response:**
```json
{
  "batchId": "batch_123",
  "recommendations": [...],
  "summary": "Generated 5 recommendations...",
  "totalProjectedRevenue": 15000,
  "meta": {...}
}
```

### POST /api/ads/recommendations

Approve or reject a recommendation.

**Request Body:**
```json
{
  "recommendationId": "rec_123",
  "action": "approve",
  "feedback": "Looks good"
}
```

**Response:**
```json
{
  "success": true,
  "recommendationId": "rec_123",
  "action": "approve",
  "message": "Recommendation approved successfully"
}
```

### GET /api/ads/export

Export performance data to CSV.

**Query Parameters:**
- `type`: Export type (`campaigns`, `aggregated`, `platforms`)
- `platform` (optional): Filter by platform
- `dateStart` (optional): Start date
- `dateEnd` (optional): End date
- `format` (optional): Export format, default: `csv`

**Response:**
CSV file download

### GET /api/ads/anomalies

Detect performance anomalies.

**Query Parameters:**
- `platform` (optional): Filter by platform
- `campaignId` (optional): Specific campaign
- `severity` (optional): Filter by severity (`critical`, `warning`, `info`)

**Response:**
```json
{
  "anomalies": [...],
  "summary": {
    "total": 5,
    "critical": 1,
    "warning": 3,
    "info": 1
  },
  "meta": {...}
}
```

### GET /api/ads/attribution

Calculate multi-touch attribution.

**Query Parameters:**
- `model` (optional): Attribution model, default: `position_based`
  - Options: `last_click`, `first_click`, `linear`, `time_decay`, `position_based`, `data_driven`
- `compare` (optional): Compare multiple models, default: `false`

**Response:**
```json
{
  "model": "position_based",
  "campaigns": [...],
  "summary": {...},
  "meta": {...}
}
```

### GET /api/ads/slo

Service Level Objective monitoring.

**Response:**
```json
{
  "dashboard": {
    "service": "ads-api",
    "slos": [...],
    "overallHealth": "healthy"
  },
  "report": {
    "summary": "...",
    "complianceRate": 95.5
  },
  "metrics": {...}
}
```

## Error Responses

All endpoints return standard error format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request
- `500`: Internal Server Error

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per IP

## Caching

- Performance data: 5 minutes TTL
- Recommendations: No cache (always fresh)
- SLO metrics: 1 minute TTL

## Authentication

Currently no authentication required (internal API).
Future: OAuth 2.0 with Shopify App Bridge.

