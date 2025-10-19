# Publer OAuth Setup

## Overview

Publer uses API key authentication (not OAuth). This guide covers obtaining and configuring Publer API credentials for Hot Rod AN Control Center.

## Prerequisites

- Publer account (Pro plan or higher for API access)
- Access to Publer workspace settings

## Step 1: Generate API Key

1. Log in to https://app.publer.com
2. Navigate to **Settings** → **API**
3. Click **Generate New API Key**
4. Copy the API key immediately (shown only once)
5. Store in secure location (do not commit to Git)

## Step 2: Get Workspace ID

1. In Publer dashboard, open target workspace
2. URL format: `https://app.publer.com/workspace/{WORKSPACE_ID}`
3. Copy the workspace ID from URL
4. Alternative: GET `/api/v1/account_info` returns all workspace IDs

## Step 3: Configure Environment Variables

Add to `.env` (local) or GitHub Secrets (production):

```bash
# Publer API Credentials
PUBLER_API_KEY=your_api_key_here
PUBLER_WORKSPACE_ID=your_workspace_id_here
PUBLER_BASE_URL=https://app.publer.com/api/v1

# Feature Flag (enable real API)
PUBLER_LIVE=false  # Set to 'true' for production
FEATURE_ADS_PUBLER_ENABLED=false  # Alternative flag name
```

## Step 4: Verify Configuration

Test API connectivity:

```bash
curl -X GET https://app.publer.com/api/v1/account_info \
  -H "Authorization: Bearer-API YOUR_API_KEY" \
  -H "Accept: application/json"
```

Expected response:

```json
{
  "id": "user_id",
  "name": "Your Name",
  "email": "you@example.com",
  "workspaces": [...]
}
```

Or use the health check endpoint:

```bash
curl http://localhost:3000/api/ads/health
```

## Step 5: Enable Feature Flag

Once verified:

```bash
# Production
export PUBLER_LIVE=true

# Or alternative
export FEATURE_ADS_PUBLER_ENABLED=true
```

Restart application for changes to take effect.

## API Rate Limits

- **Free Plan**: No API access
- **Pro Plan**: 1,000 API calls/month
- **Business Plan**: 10,000 API calls/month
- **Agency Plan**: Unlimited API calls

Monitor usage via `/account_info` endpoint.

## Security Best Practices

1. **Never commit API keys** - Use environment variables or secrets management
2. **Rotate keys every 90 days** - Generate new key, update env vars
3. **Use separate keys** - Different keys for dev/staging/production
4. **Monitor usage** - Set up alerts for unusual activity
5. **Revoke compromised keys immediately** - Regenerate in Publer dashboard

## Troubleshooting

### 401 Unauthorized

- API key invalid or expired
- Regenerate key in Publer dashboard
- Update PUBLER_API_KEY environment variable

### 403 Forbidden

- Workspace ID incorrect or no access
- Verify workspace ID from URL
- Check workspace permissions

### 429 Too Many Requests

- Rate limit exceeded
- Wait for limit reset (monthly)
- Upgrade plan if needed

### Connection Timeout

- Publer API may be experiencing issues
- Check https://status.publer.com
- Retry with exponential backoff

## Required Scopes

Publer API keys have full access to all workspace features:

- Read account information
- List social accounts
- Create and schedule posts
- Check post status
- Delete drafts
- Manage content calendar

No granular scopes available.

## References

- Publer API Documentation: https://publer.com/docs
- API Authentication: https://publer.com/docs/getting-started
- Rate Limits: https://publer.com/pricing
