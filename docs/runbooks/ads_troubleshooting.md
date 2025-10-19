# Ads Module Troubleshooting

## Common Issues

### Dashboard Tile Not Showing

**Symptom**: Campaign Metrics Tile missing from dashboard

**Check:**

```bash
# Verify feature flag
echo $FEATURE_ADS_DASHBOARD_TILE

# Check health endpoint
curl /api/ads/health
```

**Fix:**

```bash
# Enable tile
export FEATURE_ADS_DASHBOARD_TILE=true

# Restart app
npm run dev
```

### Campaigns Not Loading

**Symptom**: Empty campaign list or 500 error

**Check:**

```bash
# Test campaigns endpoint
curl /api/ads/campaigns

# Check platform health
curl /api/ads/health | jq '.data.platforms'
```

**Possible Causes:**

1. **Stub mode active** - Expected behavior, returns mock data
2. **API credentials invalid** - Check META*ACCESS_TOKEN or GOOGLE_ADS*\* vars
3. **Rate limit exceeded** - Wait 1 hour, check platform dashboard

**Fix:**

- Stub mode: Working as designed, configure real APIs to get live data
- Invalid credentials: Regenerate tokens, update env vars
- Rate limits: Implement request throttling

### ROAS Calculation Returns 0

**Symptom**: All ROAS values showing 0.00x

**Check:**

```javascript
// Test calculation directly
import { calculateROAS } from "~/lib/ads";
console.log(calculateROAS(1000, 250)); // Should return 4.0
```

**Possible Causes:**

1. Spend is 0 (zero-guard triggered)
2. Revenue is 0 or negative
3. Data format incorrect (string vs number)

**Fix:**

- Verify input types are numbers
- Check revenue data from platform APIs
- Review zero-guard logic in `app/lib/ads/metrics.ts`

### Approval Requests Not Working

**Symptom**: Approval workflow not triggered

**Check:**

```bash
# Verify approvals enabled
echo $FEATURE_ADS_APPROVALS

# Test pause endpoint
curl -X POST /api/ads/campaigns/test-1/pause \
  -H "Content-Type: application/json" \
  -d '{"reason":"Test"}'
```

**Possible Causes:**

1. Feature flag disabled
2. Campaign not found
3. Request body malformed

**Fix:**

```bash
# Enable approvals
export FEATURE_ADS_APPROVALS=true

# Verify request format matches API contract
# See: docs/specs/ads_api_contracts.md
```

### Metrics Not Storing to Supabase

**Symptom**: ads_metrics_daily table empty

**Check:**

```bash
# Verify feature flag
echo $FEATURE_ADS_METRICS_STORAGE

# Check table exists
psql -c "SELECT COUNT(*) FROM ads_metrics_daily;"

# Check RLS policies
psql -c "SELECT * FROM pg_policies WHERE tablename='ads_metrics_daily';"
```

**Fix:**

```bash
# Enable storage
export FEATURE_ADS_METRICS_STORAGE=true

# Run migration if needed
cd supabase && supabase migration up
```

### Platform API Errors

#### Meta API Errors

**401 Unauthorized:**

- Access token expired (60-day limit)
- Regenerate long-lived token
- Update META_ACCESS_TOKEN

**190 Token Error:**

- App permissions revoked
- Re-authorize app in Meta for Developers

**100 Invalid Parameter:**

- Check campaign ID format
- Verify ad account ID correct

#### Google Ads API Errors

**401 Unauthorized:**

- Refresh token invalid
- Re-run OAuth flow
- Update GOOGLE_ADS_REFRESH_TOKEN

**PERMISSION_DENIED:**

- Developer token not approved
- Apply for standard access in Google Ads

**INVALID_CUSTOMER_ID:**

- Customer ID format incorrect
- Should be 10 digits without dashes

### Publer API Errors

**401 Unauthorized:**

- API key invalid or expired
- Regenerate in Publer dashboard
- Update PUBLER_API_KEY

**403 Forbidden:**

- Workspace ID incorrect
- Verify workspace permissions
- Update PUBLER_WORKSPACE_ID

**400 Bad Request:**

- Post payload malformed
- Check network-specific requirements
- Validate against Publer API docs

## Performance Issues

### Slow API Response

**Symptom**: API routes taking > 3s

**Check:**

- Number of campaigns being fetched
- Platform API response times
- Database query performance

**Fix:**

- Implement pagination
- Add response caching
- Optimize database indexes

### Memory Usage High

**Symptom**: Node process using excessive memory

**Check:**

- Campaign data size
- Number of concurrent syncs
- Memory leak in adapters

**Fix:**

- Batch process large datasets
- Implement streaming for metrics
- Add memory profiling

## Diagnostic Commands

```bash
# Full health check
curl /api/ads/health | jq

# Test specific campaign
curl /api/ads/campaigns/meta-campaign-1 | jq

# Check daily metrics
curl "/api/ads/metrics/daily?date=2025-06-15" | jq

# Run all ads tests
npx vitest run tests/unit/ads/

# Check lint errors
npm run lint | grep ads
```

## Escalation

If issue persists after troubleshooting:

1. Capture error logs
2. Document steps attempted
3. Post in feedback/ads/YYYY-MM-DD.md
4. Tag manager in GitHub Issue

**Critical Issues** (immediate escalation):

- Data loss in ads_metrics_daily
- Campaign accidentally paused/deleted
- Overspend > 2x daily budget
- Zero conversions across all campaigns
