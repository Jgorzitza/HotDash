# Feature Flags

**Owner**: All Agents  
**Last Updated**: 2025-10-19  
**Status**: Active

## Overview

Feature flags enable safe deployment of new features with the ability to enable/disable functionality without code changes. Flags are controlled via environment variables.

## Active Feature Flags

### Ads System Flags

#### `ADS_REAL_DATA`

**Purpose**: Controls whether ads system uses real Meta/Google APIs or mock data stubs.

**Default**: `false` (uses mock data)

**Values**:
- `false`: Return mock campaign data with realistic metrics (default, safe for development)
- `true`: Use real Meta Marketing API and Google Ads API (requires API credentials)

**Location**: 
- `app/services/ads/meta-stub.ts`
- `app/services/ads/google-stub.ts`

**Usage**:
```typescript
import { getMetaCampaigns } from "~/services/ads/meta-stub";

// Uses ADS_REAL_DATA environment variable
const campaigns = getMetaCampaigns();

// Override flag (for testing)
const campaigns = getMetaCampaigns({ useRealData: true });
```

**Required Credentials** (when `true`):
- **Meta**:
  - `META_ACCESS_TOKEN`: Meta Marketing API access token
  - `META_AD_ACCOUNT_ID`: Ad account ID
- **Google**:
  - `GOOGLE_ADS_DEVELOPER_TOKEN`: Developer token
  - `GOOGLE_ADS_CLIENT_CUSTOMER_ID`: Client customer ID
  - `GOOGLE_ADS_REFRESH_TOKEN`: OAuth2 refresh token

**Mock Data Characteristics** (when `false`):
- CTR: 1.0-5.0% (varies by platform/campaign type)
- ROAS: 2.0-4.0x (profitable campaigns)
- Conversion Rate: 1.0-4.99%
- Budget Usage: 93-100%
- 4 Meta campaigns (Facebook/Instagram)
- 6 Google campaigns (Search/Display/Shopping/Video/PMax)

**Rollout Plan**:
1. Development: `false` (mock data)
2. Staging: `true` (test credentials)
3. Production: `true` (production credentials)

---

#### `PUBLER_LIVE`

**Purpose**: Controls whether social media scheduling uses real Publer API or mock responses.

**Default**: `false` (uses mock mode)

**Values**:
- `false`: Return mock scheduling responses with simulated delays (default, safe for development)
- `true`: Use real Publer API for social media post scheduling (requires API credentials)

**Location**:
- `app/services/ads/publer-campaigns.ts`

**Usage**:
```typescript
import { schedulePublerPost } from "~/services/ads/publer-campaigns";

// Uses PUBLER_LIVE environment variable
const result = await schedulePublerPost({
  text: "Check out our sale!",
  platforms: ["facebook", "instagram"],
  scheduledTime: "2025-10-20T10:00:00Z",
  campaignId: "meta_camp_001",
});

// Override flag (for testing)
const result = await schedulePublerPost(post, { useLive: true });
```

**Required Credentials** (when `true`):
- `PUBLER_API_KEY`: Publer API key
- `PUBLER_WORKSPACE_ID`: Workspace ID

**Mock Mode Behavior** (when `false`):
- Simulates 300-500ms API delay
- Generates realistic post IDs (`publer_post_${timestamp}`)
- Returns success responses
- Mock analytics: 5000-15000 impressions, 100-600 clicks

**Supported Platforms**:
- Facebook
- Instagram
- Twitter
- LinkedIn
- Pinterest

**Rollout Plan**:
1. Development: `false` (mock mode)
2. Staging: `true` (test workspace)
3. Production: `true` (production workspace)

---

## Environment Variable Configuration

### Development (.env.local)

```bash
# Ads System - Use mock data during development
ADS_REAL_DATA=false

# Publer - Use mock mode during development
PUBLER_LIVE=false
```

### Staging (.env.staging)

```bash
# Ads System - Use test credentials
ADS_REAL_DATA=true
META_ACCESS_TOKEN=test_token_here
META_AD_ACCOUNT_ID=act_1234567890
GOOGLE_ADS_DEVELOPER_TOKEN=test_dev_token
GOOGLE_ADS_CLIENT_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_REFRESH_TOKEN=test_refresh_token

# Publer - Use test workspace
PUBLER_LIVE=true
PUBLER_API_KEY=test_api_key
PUBLER_WORKSPACE_ID=test_workspace_123
```

### Production (.env)

```bash
# Ads System - Use production credentials
ADS_REAL_DATA=true
META_ACCESS_TOKEN=<production_token>
META_AD_ACCOUNT_ID=<production_account>
GOOGLE_ADS_DEVELOPER_TOKEN=<production_token>
GOOGLE_ADS_CLIENT_CUSTOMER_ID=<production_customer_id>
GOOGLE_ADS_REFRESH_TOKEN=<production_refresh>

# Publer - Use production workspace
PUBLER_LIVE=true
PUBLER_API_KEY=<production_key>
PUBLER_WORKSPACE_ID=<production_workspace>
```

---

## Implementation Pattern

All feature flags follow this pattern:

```typescript
export function someFeature(options?: { useLive?: boolean }) {
  // Check environment variable (default: false)
  const useLive = options?.useLive ?? process.env.FEATURE_FLAG === "true";

  if (useLive) {
    // Real API implementation
    if (!process.env.REQUIRED_CREDENTIAL) {
      throw new Error("REQUIRED_CREDENTIAL not configured. Set FEATURE_FLAG=false or provide credentials.");
    }
    // ... real API logic
  } else {
    // Mock/stub implementation
    return mockData;
  }
}
```

**Key Principles**:
1. Default to `false` (safe mode)
2. Check environment variable
3. Allow override via function parameter (for testing)
4. Throw clear error if credentials missing when flag is `true`
5. Provide realistic mock data when flag is `false`

---

## Testing Feature Flags

### Unit Tests
```typescript
// Test both flag states
it("works with mock data (flag=false)", () => {
  const result = someFeature({ useLive: false });
  expect(result).toHaveProperty("mockField");
});

it("throws error without credentials (flag=true)", () => {
  expect(() => someFeature({ useLive: true })).toThrow();
});
```

### Contract Tests
Feature flag behavior is verified in contract tests:
- `tests/contract/ads.metrics.contract.test.ts`

### Integration Tests
Integration tests use mock mode by default:
- `tests/integration/ads-workflow.spec.ts`

---

## Monitoring

**Flag Usage Logs**:
- Log when real APIs are called (flag=true)
- Log API errors separately from mock mode
- Track flag toggle frequency

**Metrics to Monitor**:
- API call success rate (when flag=true)
- API latency vs. mock latency
- Error rates by flag state
- Credential validity

---

## Rollback Procedure

If real API integration fails:

1. Set flag to `false` in environment
2. Restart application
3. System automatically falls back to mock data
4. No code deployment needed

**Rollback Command**:
```bash
# Update environment variable
fly secrets set ADS_REAL_DATA=false --app hotdash-production

# Restart app (if needed)
fly apps restart hotdash-production
```

---

## Future Flags

### Planned Flags

#### `AI_CAMPAIGN_SUGGESTIONS`
- Auto-generate campaign optimization suggestions
- Default: `false`
- Target: Q1 2026

#### `AUTO_BUDGET_SCALING`
- Automatically scale budgets for high-performing campaigns
- Default: `false`
- Target: Q2 2026

---

## References

- Ads Pipeline Spec: `docs/specs/ads_pipeline.md`
- North Star (Operator-First Principles): `docs/NORTH_STAR.md`
- HITL Workflow: Defined in approval drawer component
- Meta API Docs: https://developers.facebook.com/docs/marketing-apis
- Google Ads API Docs: https://developers.google.com/google-ads/api
- Publer API Docs: https://publer.io/api

