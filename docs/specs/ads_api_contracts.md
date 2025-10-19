# Ads API Contracts

API contract specifications for the ads intelligence module.

## Base URL

`/api/ads`

## Authentication

All endpoints require authenticated session (Shopify Admin embedded app).

## Endpoints

### GET /api/ads/campaigns

List all advertising campaigns with filtering.

**Query Parameters:**

- `platform` (optional): Filter by platform (`meta`, `google`)
- `status` (optional): Filter by status (`active`, `paused`, `ended`, `draft`)
- `minROAS` (optional): Minimum ROAS threshold (number)
- `maxCPA` (optional): Maximum CPA threshold (number)
- `search` (optional): Search by campaign name (string)
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "data": {
    "campaigns": [],
    "totalCount": 0
  }
}
```

### GET /api/ads/campaigns/:id

Get details for a specific campaign.

**Parameters:**

- `id` (required): Campaign ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "campaign-1",
    "name": "Summer Sale",
    "platform": "meta",
    "status": "active",
    "metrics": {
      "roas": 4.5,
      "cpc": 1.25,
      "spend": 1000
    }
  }
}
```

### POST /api/ads/campaigns/:id/pause

Create pause approval request (HITL).

**Body:**

```json
{
  "reason": "ROAS below threshold for 3 days"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "approvalRequest": {
      "type": "campaign_pause",
      "evidence": {},
      "rollback": {},
      "risk": {}
    }
  }
}
```

### POST /api/ads/campaigns/:id/budget

Create budget change approval request (HITL).

**Body:**

```json
{
  "newBudget": 250,
  "justification": "Scaling successful campaign"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "approvalRequest": {},
    "currentBudget": 100,
    "newBudget": 250,
    "percentChange": "150.0"
  }
}
```

### GET /api/ads/metrics/daily

Query daily campaign metrics.

**Query Parameters:**

- `date` (optional): Target date (YYYY-MM-DD, default: today)
- `platform` (optional): Filter by platform
- `campaignId` (optional): Filter by specific campaign

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2025-06-15",
    "snapshots": [],
    "aggregate": {
      "totalSpend": 1300,
      "totalRevenue": 7300,
      "averageROAS": 5.5
    }
  }
}
```

### GET /api/ads/health

Check ads module health status.

**Response:**

```json
{
  "success": true,
  "data": {
    "overall": "stub_mode",
    "platforms": {
      "publer": {
        "status": "ok",
        "mode": "stub"
      },
      "meta": {
        "status": "ok",
        "mode": "stub"
      },
      "google": {
        "status": "ok",
        "mode": "stub"
      }
    },
    "recommendations": []
  }
}
```

## Error Responses

All endpoints return errors in consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "timestamp": "2025-06-15T10:00:00Z"
  }
}
```

**Common Error Codes:**

- `MISSING_CAMPAIGN_ID` - Campaign ID not provided
- `CAMPAIGN_NOT_FOUND` - Campaign does not exist
- `INVALID_BUDGET` - Budget value invalid
- `APPROVALS_DISABLED` - HITL approvals not enabled
- `CAMPAIGNS_FETCH_ERROR` - Failed to fetch campaigns
- `DAILY_METRICS_ERROR` - Failed to fetch metrics
- `HEALTH_CHECK_ERROR` - Health check failed

## Rate Limits

No rate limits in current implementation. Future: 100 req/min per user.

## Versioning

Current version: v1 (no version in URL path)
