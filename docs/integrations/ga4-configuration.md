# GA4 Configuration Guide

**Version:** 1.0
**Last Updated:** 2025-10-16
**Owner:** Analytics Agent

---

## Prerequisites

1. Google Analytics 4 property
2. Google Cloud Project with Analytics API enabled
3. Service account with Analytics Viewer role

---

## Configuration Steps

### 1. Create Service Account

```bash
# In Google Cloud Console
1. Go to IAM & Admin > Service Accounts
2. Create Service Account: "analytics-service"
3. Grant role: "Viewer"
4. Create JSON key
5. Download key file
```

### 2. Add Service Account to GA4

```bash
# In Google Analytics Admin
1. Go to Admin > Property > Property Access Management
2. Add user: service-account@project.iam.gserviceaccount.com
3. Role: Viewer
4. Save
```

### 3. Configure Environment Variables

**Local Development (`.env.local`):**
```bash
GOOGLE_APPLICATION_CREDENTIALS=vault/occ/google/analytics-service-account.json
GA_PROPERTY_ID=339826228
GA_MODE=direct
```

**Production (Fly.io Secrets):**
```bash
fly secrets set GA_PROPERTY_ID=339826228
fly secrets set GA_MODE=direct
fly secrets set GOOGLE_APPLICATION_CREDENTIALS_BASE64=$(base64 -w 0 vault/occ/google/analytics-service-account.json)
```

### 4. Verify Configuration

```bash
# Test GA4 connection
export GOOGLE_APPLICATION_CREDENTIALS=vault/occ/google/analytics-service-account.json
export GA_PROPERTY_ID=339826228
node scripts/test-ga-analytics.mjs
```

**Expected output:**
```
✅ Revenue Metrics Retrieved
✅ Traffic Metrics Retrieved
✅ All tests passed!
```

---

## Configuration Options

### Required

- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON
- `GA_PROPERTY_ID` - GA4 property ID (numeric)

### Optional

- `GA_MODE` - Mode: `direct` (default) or `mcp`
- `GA_CACHE_TTL_MS` - Cache TTL in milliseconds (default: 300000 = 5 minutes)

---

## Fallback Behavior

If GA4 is not configured, the system will:
1. Log warning: "GA not configured, using mock data"
2. Return mock data for all metrics
3. Continue functioning normally

**Mock data includes:**
- Revenue: $12,500 (67 transactions)
- Traffic: 5,200 sessions (70% organic)
- Conversion Rate: 1.29%

---

## Troubleshooting

### Error: "Permission Denied"

**Cause:** Service account doesn't have access to GA4 property

**Fix:**
1. Go to GA4 Admin > Property Access Management
2. Add service account email
3. Grant "Viewer" role

### Error: "Property not found"

**Cause:** Incorrect property ID

**Fix:**
1. Go to GA4 Admin > Property Settings
2. Copy Property ID (numeric, e.g., 339826228)
3. Update `GA_PROPERTY_ID` environment variable

### Error: "Quota exceeded"

**Cause:** Too many API requests

**Fix:**
- System automatically retries with exponential backoff
- Check Prometheus metrics: `ga.quota_exceeded`
- Consider increasing cache TTL

### Error: "Credentials not found"

**Cause:** Service account JSON file missing

**Fix:**
1. Verify file exists: `vault/occ/google/analytics-service-account.json`
2. Check `GOOGLE_APPLICATION_CREDENTIALS` points to correct path
3. Ensure file is gitignored (never commit credentials)

---

## Security Best Practices

1. **Never commit credentials** - Use `.gitignore` for `vault/`
2. **Use service accounts** - Don't use personal Google accounts
3. **Minimal permissions** - Grant only "Viewer" role
4. **Rotate keys** - Rotate service account keys every 90 days
5. **Monitor access** - Check GA4 audit logs regularly

---

## Performance Optimization

### Caching

**Default:** 5-minute TTL on core metrics

**Adjust cache TTL:**
```bash
# Increase to 10 minutes
export GA_CACHE_TTL_MS=600000
```

**Monitor cache performance:**
```bash
# Check Prometheus metrics
curl http://localhost:3000/metrics | grep cache
```

### Batch Queries

Use batch query API for multiple metrics:
```typescript
import { executeBatchQueries } from '~/lib/analytics/batch';

const results = await executeBatchQueries([
  { name: 'revenue', dimensions: [], metrics: ['totalRevenue'] },
  { name: 'traffic', dimensions: [], metrics: ['sessions'] },
], { start: '2025-01-01', end: '2025-01-31' });
```

---

## Monitoring

### Prometheus Metrics

```
ga.api_calls{operation="getRevenueMetrics", success="true"}
ga.api_latency{operation="getRevenueMetrics"}
ga.quota_exceeded
ga.sampling_detected
cache.hits{key="analytics:revenue:30d"}
cache.misses{key="analytics:revenue:30d"}
```

### Health Check

```bash
curl http://localhost:3000/api/health/ga
```

**Expected response:**
```json
{
  "status": "healthy",
  "configured": true,
  "propertyId": "339826228",
  "lastSuccess": "2025-10-16T10:30:00Z"
}
```

---

## Support

**Issues:** Create GitHub issue with label `analytics`
**Logs:** Check application logs for `[Analytics]` prefix
**Metrics:** Monitor `/metrics` endpoint

---

**Configuration complete!** ✅

