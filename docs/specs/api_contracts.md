# API Contracts - All Endpoints

**Version**: 1.0
**Last Updated**: 2025-10-19

## Analytics APIs

### GET /api/analytics/revenue

**Response**: RevenueResponseSchema

```json
{
  "revenue": number,
  "period": string,
  "change": number?,
  "currency": string (default: "USD"),
  "previousPeriod": { revenue, period }?
}
```

**Feature Flag**: `ANALYTICS_REAL_DATA`
**Data Source**: Shopify Orders GraphQL (when enabled), mocks (when disabled)

### GET /api/analytics/conversion-rate

**Response**: ConversionResponseSchema

```json
{
  "conversionRate": number,
  "period": string,
  "change": number?,
  "previousPeriod": { conversionRate, period }?
}
```

**Feature Flag**: `ANALYTICS_REAL_DATA`
**Data Source**: GA4 (when enabled), mocks (when disabled)

### GET /api/analytics/traffic

**Response**: TrafficResponseSchema

```json
{
  "sessions": number,
  "users": number,
  "pageviews": number,
  "period": string,
  "bounceRate": number?,
  "avgSessionDuration": number?,
  "previousPeriod": { sessions, users, pageviews, period }?
}
```

**Feature Flag**: `ANALYTICS_REAL_DATA`
**Data Source**: GA4

### GET /api/analytics/idea-pool

**Response**: IdeaPoolResponseSchema

```json
{
  "success": boolean,
  "data": {
    "items": Array<IdeaPoolItem>,
    "totals": { pending, approved, rejected }
  },
  "source": string,
  "timestamp": string,
  "warnings": string[]?,
  "error": string?
}
```

**Feature Flag**: `IDEA_POOL_LIVE`
**Data Source**: Supabase idea_pool table

---

## Shopify APIs

### GET /api/shopify/revenue

**Internal**: Revenue calculation from Shopify Orders
**Feature Flag**: `SHOPIFY_REAL_DATA`

---

## Ads APIs

### GET /api/ads/campaigns

**Response**:

```json
{
  "campaigns": Array<Campaign>,
  "total": number,
  "metrics": { roas, cpc, cpa, spend, revenue }
}
```

**Feature Flag**: `ADS_REAL_DATA`
**Data Source**: Meta/Google stubs → real APIs when enabled

---

## Support APIs

### POST /api/chatwoot/webhook

**Request**: Chatwoot webhook payload
**Response**: 200 OK or retry headers
**Feature Flag**: `CHATWOOT_LIVE`

---

## SEO APIs

### GET /api/seo/anomalies

**Response**: Array of SEO anomalies
**Feature Flag**: `SEO_MONITORING_ENABLED`

---

## Approval APIs

### GET /api/approvals

**Response**: Array<Approval>
**Service**: app/services/approvals/index.ts

### GET /api/approvals/counts

**Response**: ApprovalCounts

---

**Contract Tests**: See scripts/policy/check-contracts.mjs
**Validation**: All APIs return expected schemas
