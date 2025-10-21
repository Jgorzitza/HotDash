# Google Ads API Setup Guide

**Last Updated**: 2025-10-21  
**Status**: Credentials Needed

---

## Required Credentials

The following environment variables must be set in `.env`:

```bash
GOOGLE_ADS_CLIENT_ID=your_oauth_client_id
GOOGLE_ADS_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CUSTOMER_IDS=1234567890,0987654321  # Comma-separated
```

---

## Setup Procedure

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "HotDash Google Ads Integration"
3. Enable Google Ads API

### 2. Get Developer Token

1. Go to [Google Ads API Center](https://ads.google.com/aw/apicenter)
2. Request developer token
3. Wait for approval (can take 1-2 business days)
4. Copy token → `GOOGLE_ADS_DEVELOPER_TOKEN`

### 3. Create OAuth 2.0 Credentials

1. In Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Application type: Desktop app
4. Download JSON file
5. Extract `client_id` → `GOOGLE_ADS_CLIENT_ID`
6. Extract `client_secret` → `GOOGLE_ADS_CLIENT_SECRET`

### 4. Generate Refresh Token

Run the OAuth flow to get refresh token:

```bash
# Install Google Auth library
npm install googleapis

# Run authentication flow
node scripts/ads/generate-refresh-token.js
```

This will:
1. Open browser for Google OAuth consent
2. Authorize the application
3. Display refresh token
4. Copy token → `GOOGLE_ADS_REFRESH_TOKEN`

### 5. Get Customer IDs

1. Log into [Google Ads](https://ads.google.com/)
2. Click on account selector (top right)
3. Copy customer ID (10-digit number, remove dashes)
4. For multiple accounts, comma-separate: `1234567890,0987654321`
5. Set → `GOOGLE_ADS_CUSTOMER_IDS`

---

## Testing Integration

Once credentials are configured:

```bash
# Run comprehensive test suite
npx tsx scripts/ads/test-google-ads-integration.ts
```

This tests:
- ✅ OAuth authentication
- ✅ Campaign fetching
- ✅ Performance metrics (last 7 days)
- ✅ Ad group performance
- ✅ Keyword performance
- ✅ Rate limiting (5 parallel requests)

Expected output:
```
🚀 Google Ads Integration Test Suite
==================================================
✅ All required environment variables found
✅ Client created successfully
📊 Testing with 2 customer ID(s)

🧪 Testing: OAuth Authentication...
✅ PASS (234ms)

🧪 Testing: Fetch Campaigns...
  Found 12 campaigns
✅ PASS (567ms)

...

📊 Test Summary
==================================================
Total Tests: 6
✅ Passed: 6
❌ Failed: 0
⏱️  Total Duration: 2,345ms
```

---

## Rate Limits

Google Ads API v16 rate limits:
- **Basic tier**: 15,000 operations/day
- **Standard tier**: 250,000 operations/day
- **Per request**: 500 ms minimum between requests (recommended)

Our implementation:
- ✅ Token caching (reduces auth requests)
- ✅ Parallel requests for multiple customers
- ✅ 5-minute response caching
- ✅ Graceful error handling

---

## Storage

**Vault Location**: `vault/occ/google/ads_credentials.json`

```json
{
  "client_id": "xxx.apps.googleusercontent.com",
  "client_secret": "xxx",
  "refresh_token": "1//xxx",
  "developer_token": "xxx",
  "customer_ids": ["1234567890", "0987654321"]
}
```

**Security**: Never commit credentials to git. Use `.env` and vault only.

---

## API Reference

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [OAuth 2.0 Setup](https://developers.google.com/google-ads/api/docs/oauth/overview)
- [Rate Limits](https://developers.google.com/google-ads/api/docs/best-practices/quotas)
- [Google Ads Query Language](https://developers.google.com/google-ads/api/docs/query/overview)

---

## Troubleshooting

### "Invalid developer token"
- Token not approved yet (wait 1-2 business days)
- Using test account (need approved token for production)

### "Invalid refresh token"
- Regenerate token using OAuth flow
- Check token hasn't expired (lasts indefinitely but can be revoked)

### "Customer not found"
- Verify customer ID is correct (10 digits, no dashes)
- Ensure OAuth account has access to customer account

### Rate limit errors
- Reduce parallel requests
- Increase cache duration
- Implement exponential backoff

---

## Status

**Current**: ❌ Credentials not configured  
**Next Step**: Request credentials from Manager/CEO  
**Testing**: ⏸️ Awaiting credentials

Once configured, run test script to verify integration.

