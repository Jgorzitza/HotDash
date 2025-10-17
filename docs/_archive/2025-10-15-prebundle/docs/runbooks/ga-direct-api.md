---
epoch: 2025.10.E1
doc: docs/runbooks/ga-direct-api.md
owner: engineer
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Google Analytics Direct API Integration

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Implementation Date**: 2025-10-11

---

## Overview

This runbook documents the Google Analytics Direct API integration for HotDash, implemented as Phase 1 of the LlamaIndex + Agent SDK sprint. The integration provides real-time analytics data for the SEO & Content Watch tile using the official Google Analytics Data API v1.

---

## Architecture

### Components

1. **DirectGAClient** (`app/services/ga/directClient.ts`)
   - Official Google Analytics Data API v1 client wrapper
   - Implements `GaClient` interface for consistency
   - Handles authentication, API calls, and response transformation

2. **Configuration** (`app/config/ga.server.ts`)
   - Multi-mode support: `mock`, `direct`, `mcp`
   - Environment-based mode selection
   - Smart defaults with auto-detection

3. **Ingest Service** (`app/services/ga/ingest.ts`)
   - Client selection logic
   - Caching and fact recording
   - Anomaly detection

---

## Configuration

### Environment Variables

#### Required for Direct Mode

```bash
# Path to Google service account credentials JSON file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Google Analytics property ID
GA_PROPERTY_ID=123456789

# Mode selection (optional - defaults intelligently)
GA_MODE=direct
```

#### Optional Variables

```bash
# Legacy mock flag (still supported)
GA_USE_MOCK=1  # 1 for mock, 0 for live

# Cache TTL in milliseconds (default: 5 minutes)
GA_CACHE_TTL_MS=300000

# MCP server host (only for mcp mode)
GA_MCP_HOST=https://analytics-mcp.fly.dev
```

### Mode Selection Logic

The system automatically determines the mode based on environment variables:

| Priority | Condition                            | Result     |
| -------- | ------------------------------------ | ---------- |
| 1        | `GA_MODE=direct`                     | Direct API |
| 2        | `GA_MODE=mcp`                        | MCP server |
| 3        | `GA_MODE=mock` or `GA_USE_MOCK=1`    | Mock data  |
| 4        | `GOOGLE_APPLICATION_CREDENTIALS` set | Direct API |
| 5        | Default                              | Mock data  |

---

## Service Account Setup

### Credentials Location

**Production**: `vault/occ/google/analytics-service-account.json`  
**Permissions**: `600` (owner read/write only)  
**Service Account**: analytics-mcp-fly@hotrodan-seo-reports.iam.gserviceaccount.com  
**Google Cloud Project**: hotrodan-seo-reports

### Required Permissions

The service account must have:

- **Google Analytics role**: Viewer or Marketer
- **API access**: Google Analytics Data API v1 enabled

### Verification

```bash
# Check credentials file exists and has correct permissions
ls -la vault/occ/google/analytics-service-account.json
# Should show: -rw------- 1 owner owner 2388 ...

# Verify service account email
cat vault/occ/google/analytics-service-account.json | grep client_email
```

---

## Usage

### Development (Mock Mode)

```bash
# No configuration needed - uses mock data by default
npm run dev
```

### Staging (Direct API)

```bash
# Set environment variables
export GOOGLE_APPLICATION_CREDENTIALS=/home/justin/HotDash/hot-dash/vault/occ/google/analytics-service-account.json
export GA_PROPERTY_ID=your-staging-property-id
export GA_MODE=direct

# Run application
npm run dev
```

### Production (Direct API)

```bash
# Set via fly secrets
fly secrets set \
  GOOGLE_APPLICATION_CREDENTIALS=/app/vault/occ/google/analytics-service-account.json \
  GA_PROPERTY_ID=your-production-property-id \
  GA_MODE=direct

# Deploy
fly deploy
```

---

## API Details

### Data Fetched

**Endpoint**: `BetaAnalyticsDataClient.runReport()`  
**Property Format**: `properties/{propertyId}`  
**Dimensions**: `pagePath` (landing pages)  
**Metrics**: `sessions` (total sessions)  
**Ordering**: Sessions descending  
**Limit**: 100 top pages

### Request Structure

```typescript
{
  property: `properties/${propertyId}`,
  dateRanges: [{
    startDate: 'YYYY-MM-DD',
    endDate: 'YYYY-MM-DD',
  }],
  dimensions: [{ name: 'pagePath' }],
  metrics: [{ name: 'sessions' }],
  orderBys: [{
    metric: { metricName: 'sessions' },
    desc: true,
  }],
  limit: 100,
}
```

### Response Transformation

GA API response rows are transformed to:

```typescript
interface GaSession {
  landingPage: string; // From dimensionValues[0].value
  sessions: number; // From metricValues[0].value (parsed as int)
  wowDelta: number; // Week-over-week delta (calculated separately)
  evidenceUrl?: string; // Optional drill-down link
}
```

---

## Performance

### Latency Targets

- **Direct API**: <100ms P95
- **Cache hit**: <1ms
- **Cache TTL**: 5 minutes (configurable)

### Rate Limits

Google Analytics Data API quotas:

- **Queries per day**: 25,000
- **Queries per 100 seconds**: 1,250

Current usage: ~288 queries/day (1 per 5 minutes)

---

## Error Handling

### Common Errors

#### 1. Missing Credentials

```
Error: GOOGLE_APPLICATION_CREDENTIALS environment variable required
```

**Solution**: Set `GOOGLE_APPLICATION_CREDENTIALS` to service account path

#### 2. Missing Property ID

```
Error: GA_PROPERTY_ID environment variable required
```

**Solution**: Set `GA_PROPERTY_ID` to your GA4 property ID

#### 3. API Authentication Failure

```
Error: Could not load the default credentials
```

**Solutions**:

- Verify credentials file exists and is readable
- Check service account has GA access
- Validate JSON file is not corrupted

#### 4. API Quota Exceeded

```
Error: Quota exceeded for quota metric 'Queries' and limit 'Queries per day'
```

**Solutions**:

- Increase cache TTL to reduce query frequency
- Switch to mock mode temporarily
- Request quota increase from Google

---

## Monitoring

### Key Metrics

1. **Query Success Rate**: % of successful GA API calls
2. **Cache Hit Rate**: % of requests served from cache
3. **P95 Latency**: 95th percentile query latency
4. **API Quota Usage**: Daily query count vs limit

### Logging

Console output includes mode selection:

```
[GA] Using direct API client
[GA] Using mock client
[GA] Using MCP client
```

### Health Checks

```bash
# Test direct API connection
curl http://localhost:3000/api/dashboard/analytics

# Check logs for GA client mode
docker logs hotdash-app | grep "\[GA\]"
```

---

## Troubleshooting

### Mode Not Switching

**Symptom**: App uses mock data despite setting `GA_MODE=direct`

**Diagnosis**:

```bash
# Check environment variables are set
echo $GA_MODE
echo $GOOGLE_APPLICATION_CREDENTIALS
echo $GA_PROPERTY_ID
```

**Solutions**:

- Restart application after setting environment variables
- Check for `GA_USE_MOCK=1` override
- Verify credentials file path is correct

### Empty Data Response

**Symptom**: API returns no sessions data

**Diagnosis**:

```bash
# Check property ID is correct
echo $GA_PROPERTY_ID

# Verify date range is valid
# GA4 properties only have data from creation date forward
```

**Solutions**:

- Confirm property ID matches your GA4 property
- Check date range doesn't exceed data availability
- Verify service account has access to property

### Slow Queries

**Symptom**: Latency exceeds 100ms P95

**Diagnosis**:

- Check cache hit rate
- Verify network latency to Google APIs
- Check for API throttling

**Solutions**:

- Increase cache TTL
- Pre-warm cache during off-peak hours
- Consider regional API endpoints

---

## Testing

### Unit Tests

Location: `tests/unit/ga.direct.spec.ts` and `tests/unit/ga.config.spec.ts`

```bash
# Run GA tests
npm run test:unit tests/unit/ga.direct.spec.ts tests/unit/ga.config.spec.ts

# Should see:
# ✓ tests/unit/ga.config.spec.ts (11 tests)
# ✓ tests/unit/ga.direct.spec.ts (10 tests)
# Test Files: 2 passed (2)
# Tests: 21 passed (21)
```

### Integration Testing

```bash
# Test with mock mode (no credentials needed)
GA_MODE=mock npm run dev

# Test with direct API (requires credentials)
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/creds.json
export GA_PROPERTY_ID=123456789
export GA_MODE=direct
npm run dev

# Access dashboard and verify analytics tile shows data
```

---

## Migration Guide

### From Mock Mode to Direct API

1. **Obtain credentials**:

   ```bash
   # Verify service account credentials exist
   ls -la vault/occ/google/analytics-service-account.json
   ```

2. **Get property ID**:
   - Log into Google Analytics
   - Navigate to Admin → Property Settings
   - Copy Property ID (numeric value)

3. **Set environment variables**:

   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/home/justin/HotDash/hot-dash/vault/occ/google/analytics-service-account.json
   export GA_PROPERTY_ID=your-property-id
   export GA_MODE=direct
   ```

4. **Test locally**:

   ```bash
   npm run dev
   # Check console for: [GA] Using direct API client
   ```

5. **Deploy to production**:

   ```bash
   fly secrets set \
     GOOGLE_APPLICATION_CREDENTIALS=/app/vault/occ/google/analytics-service-account.json \
     GA_PROPERTY_ID=your-property-id \
     GA_MODE=direct

   fly deploy
   ```

### Rollback to Mock Mode

```bash
# Option 1: Set GA_MODE
export GA_MODE=mock

# Option 2: Use legacy flag
export GA_USE_MOCK=1

# Restart application
npm run dev
```

---

## Related Documentation

- [Google Analytics MCP Final Summary](../GoogleMCP-FINAL-PROJECT-SUMMARY.md)
- [Engineer Sprint Direction](../directions/engineer-sprint-llamaindex-agentsdk.md)
- [GA Ingest Design](../design/ga_ingest.md)
- [Credential Index](../ops/credential_index.md)

---

## Support

**Owner**: Engineer Agent  
**Sprint**: engineer-sprint-llamaindex-agentsdk (Phase 1)  
**Implementation**: 2025-10-11  
**Feedback**: feedback/engineer.md

For issues or questions, see feedback/engineer.md for latest updates and troubleshooting.
