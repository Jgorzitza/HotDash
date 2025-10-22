# Google Ads & Facebook Ads API Credential Setup Guide

**Status**: 🔴 **P1 BLOCKER** - Required for Ads Automation  
**Owner**: CEO (Justin) - Requires Admin Access  
**ETA**: 1-2 hours (once started)  
**Last Updated**: 2025-10-21

---

## 🎯 Overview

This guide walks through obtaining API credentials for:

1. **Google Ads API** (campaign automation, budget optimization, A/B testing)
2. **Facebook Ads API** (cross-platform campaigns, social ads management)

**Current Status**:

- ✅ Code complete (11 files, 3,968 lines)
- ✅ Unit tests created (66 tests)
- ❌ **BLOCKED**: Missing API credentials
- ❌ Cannot test OAuth flow
- ❌ Cannot deploy to production

---

## 📋 Required Credentials

### Google Ads API (5 environment variables)

```bash
GOOGLE_ADS_CLIENT_ID=<OAuth 2.0 Client ID>
GOOGLE_ADS_CLIENT_SECRET=<OAuth 2.0 Client Secret>
GOOGLE_ADS_REFRESH_TOKEN=<OAuth 2.0 Refresh Token>
GOOGLE_ADS_DEVELOPER_TOKEN=<Google Ads Developer Token>
GOOGLE_ADS_CUSTOMER_IDS=<Customer ID(s), comma-separated>
```

### Facebook Ads API (4 environment variables)

```bash
FACEBOOK_ADS_ACCESS_TOKEN=<Long-lived Access Token>
FACEBOOK_ADS_APP_ID=<Facebook App ID>
FACEBOOK_ADS_APP_SECRET=<Facebook App Secret>
FACEBOOK_ADS_ACCOUNT_ID=<Ad Account ID, format: act_XXXXXXXXX>
```

---

## 🔐 Part 1: Google Ads API Setup

### Prerequisites

- ✅ Active Google Ads account
- ✅ Manager-level access to hotrodan.com Google Ads account
- ✅ Google Cloud Platform (GCP) project access
- ⏱️ Time required: 45-60 minutes

### Step 1: Apply for Developer Token (15 min)

**⚠️ CRITICAL**: Developer Token approval takes 1-3 business days

1. Go to Google Ads: https://ads.google.com
2. Navigate to: **Tools & Settings** → **Setup** → **API Center**
3. Click **Get Developer Token**
4. Fill out form:
   - **Application Name**: HotDash Ads Automation
   - **Purpose**: Campaign automation, budget optimization, A/B testing
   - **Use Case**: Internal use for hotrodan.com store operations
5. Click **Apply**
6. **Wait for approval** (check email for approval notification)

**Current Status**: ⏸️ Not started

### Step 2: Create OAuth 2.0 Credentials (15 min)

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select project or create new: **HotDash Production**
3. Navigate to: **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Configure consent screen (if first time):
   - User Type: **Internal** (for single-user use)
   - App Name: **HotDash Ads Manager**
   - User support email: justin@hotrodan.com
   - Developer contact: justin@hotrodan.com
6. Create OAuth client:
   - Application type: **Web application**
   - Name: **HotDash Ads API Client**
   - Authorized redirect URIs: `http://localhost:3000/oauth/callback`
7. **Save CLIENT_ID and CLIENT_SECRET**

**Current Status**: ⏸️ Not started

### Step 3: Generate Refresh Token (15 min)

**Option A: Using OAuth Playground** (Recommended)

1. Go to: https://developers.google.com/oauthplayground/
2. Click **OAuth 2.0 Configuration** (gear icon)
3. Check **Use your own OAuth credentials**
4. Enter your CLIENT_ID and CLIENT_SECRET
5. In left panel, find **Google Ads API v16**
6. Select scope: `https://www.googleapis.com/auth/adwords`
7. Click **Authorize APIs**
8. Sign in with Google Ads account
9. Grant permissions
10. Click **Exchange authorization code for tokens**
11. **Copy the refresh_token** (starts with `1//`)

**Option B: Using Custom Script** (Alternative)

```bash
cd /home/justin/HotDash/hot-dash
npx tsx scripts/ads/generate-refresh-token.ts
# Follow prompts to authorize and obtain refresh token
```

**Current Status**: ⏸️ Not started (requires CLIENT_ID + CLIENT_SECRET first)

### Step 4: Get Customer IDs (5 min)

1. Go to Google Ads: https://ads.google.com
2. Click account name in top-right
3. Copy **Customer ID** (10-digit number, format: 123-456-7890)
4. Remove dashes: `1234567890`
5. If managing multiple accounts, get all customer IDs (comma-separated)

**Current Status**: ⏸️ Not started

### Step 5: Store Credentials (5 min)

**Option A: Local Vault** (Development)

```bash
cd /home/justin/HotDash/hot-dash
mkdir -p vault/occ/google
cat > vault/occ/google/ads_credentials.json << EOF
{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "YOUR_REFRESH_TOKEN",
  "developer_token": "YOUR_DEVELOPER_TOKEN",
  "customer_ids": ["1234567890", "9876543210"]
}
EOF
chmod 600 vault/occ/google/ads_credentials.json
```

**Option B: Fly.io Secrets** (Production)

```bash
cd /home/justin/HotDash/hot-dash
fly secrets set \
  GOOGLE_ADS_CLIENT_ID="YOUR_CLIENT_ID" \
  GOOGLE_ADS_CLIENT_SECRET="YOUR_CLIENT_SECRET" \
  GOOGLE_ADS_REFRESH_TOKEN="YOUR_REFRESH_TOKEN" \
  GOOGLE_ADS_DEVELOPER_TOKEN="YOUR_DEVELOPER_TOKEN" \
  GOOGLE_ADS_CUSTOMER_IDS="1234567890,9876543210"
```

**Option C: GitHub Secrets** (CI/CD)

1. Go to: https://github.com/Jgorzitza/HotDash/settings/secrets/actions
2. Add each secret:
   - `GOOGLE_ADS_CLIENT_ID`
   - `GOOGLE_ADS_CLIENT_SECRET`
   - `GOOGLE_ADS_REFRESH_TOKEN`
   - `GOOGLE_ADS_DEVELOPER_TOKEN`
   - `GOOGLE_ADS_CUSTOMER_IDS`

**Current Status**: ⏸️ Not started (requires credentials first)

---

## 🔐 Part 2: Facebook Ads API Setup

### Prerequisites

- ✅ Active Facebook Ads account
- ✅ Admin access to Facebook Ad Account
- ✅ Facebook Developer account
- ⏱️ Time required: 30-45 minutes

### Step 1: Create Facebook App (10 min)

1. Go to: https://developers.facebook.com/apps
2. Click **Create App**
3. Choose use case: **Business**
4. Fill out form:
   - **App Name**: HotDash Ads Manager
   - **App Contact Email**: justin@hotrodan.com
5. Click **Create App**
6. **Save APP_ID** (displayed on dashboard)

**Current Status**: ⏸️ Not started

### Step 2: Add Marketing API (5 min)

1. In app dashboard, click **Add Product**
2. Find **Marketing API** → Click **Set Up**
3. Accept terms and conditions
4. Navigate to: **Settings** → **Basic**
5. **Save APP_SECRET** (click Show to reveal)

**Current Status**: ⏸️ Not started

### Step 3: Generate Access Token (15 min)

**Option A: Using Access Token Tool** (Recommended)

1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your app from dropdown
3. Click **Get Token** → **Get User Access Token**
4. Select permissions:
   - `ads_management`
   - `ads_read`
   - `business_management`
   - `read_insights`
5. Click **Generate Access Token**
6. Grant permissions
7. **Copy short-lived token**
8. Convert to long-lived token:

```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

9. **Save the long-lived access_token** (valid for 60 days)

**Current Status**: ⏸️ Not started

### Step 4: Get Ad Account ID (5 min)

1. Go to: https://business.facebook.com/settings/ad-accounts
2. Select your ad account
3. Copy **Ad Account ID** (format: 1234567890)
4. Prepend `act_`: `act_1234567890`

**Current Status**: ⏸️ Not started

### Step 5: Store Credentials (5 min)

**Option A: Local Vault** (Development)

```bash
cd /home/justin/HotDash/hot-dash
mkdir -p vault/occ/facebook
cat > vault/occ/facebook/ads_credentials.json << EOF
{
  "access_token": "YOUR_LONG_LIVED_ACCESS_TOKEN",
  "app_id": "YOUR_APP_ID",
  "app_secret": "YOUR_APP_SECRET",
  "account_id": "act_1234567890"
}
EOF
chmod 600 vault/occ/facebook/ads_credentials.json
```

**Option B: Fly.io Secrets** (Production)

```bash
fly secrets set \
  FACEBOOK_ADS_ACCESS_TOKEN="YOUR_ACCESS_TOKEN" \
  FACEBOOK_ADS_APP_ID="YOUR_APP_ID" \
  FACEBOOK_ADS_APP_SECRET="YOUR_APP_SECRET" \
  FACEBOOK_ADS_ACCOUNT_ID="act_1234567890"
```

**Current Status**: ⏸️ Not started

---

## ✅ Part 3: Verification

### Test Google Ads Integration

```bash
cd /home/justin/HotDash/hot-dash
npx tsx scripts/ads/test-google-ads-integration.ts
```

**Expected Output**:

```
✅ OAuth authentication successful
✅ Fetched 5 campaigns
✅ Campaign performance data retrieved
✅ Ad groups retrieved
✅ Keywords retrieved
✅ Rate limiting respected

All tests passed! (6/6)
```

**Current Status**: ⏸️ Not started (requires credentials)

### Test Facebook Ads Integration

```bash
cd /home/justin/HotDash/hot-dash
npx tsx scripts/ads/test-facebook-ads-integration.ts
```

**Expected Output**:

```
✅ Authentication successful
✅ Fetched 3 campaigns
✅ Campaign insights retrieved
✅ Budget updates tested

All tests passed! (4/4)
```

**Current Status**: ⏸️ Not started (requires credentials)

---

## 📊 Current Status Summary

### Google Ads API

- [ ] **Step 1**: Apply for Developer Token (⏸️ Not started - **START HERE**)
- [ ] **Step 2**: Create OAuth credentials (⏸️ Waiting for Step 1)
- [ ] **Step 3**: Generate Refresh Token (⏸️ Waiting for Step 2)
- [ ] **Step 4**: Get Customer IDs (⏸️ Not started)
- [ ] **Step 5**: Store credentials (⏸️ Waiting for Steps 1-4)
- [ ] **Verification**: Test integration (⏸️ Waiting for Step 5)

**Estimated Time**: 1 hour active work + 1-3 days Developer Token approval

### Facebook Ads API

- [ ] **Step 1**: Create Facebook App (⏸️ Not started)
- [ ] **Step 2**: Add Marketing API (⏸️ Waiting for Step 1)
- [ ] **Step 3**: Generate Access Token (⏸️ Waiting for Step 2)
- [ ] **Step 4**: Get Ad Account ID (⏸️ Not started)
- [ ] **Step 5**: Store credentials (⏸️ Waiting for Steps 1-4)
- [ ] **Verification**: Test integration (⏸️ Waiting for Step 5)

**Estimated Time**: 45 minutes active work

---

## 🚨 Blockers & Dependencies

### Current Blockers

1. **CEO Action Required**: All credential setup requires Justin's admin access
2. **Developer Token Approval**: Google Ads Developer Token takes 1-3 business days
3. **Integration Testing**: Cannot verify ads automation until credentials obtained

### What's Ready

- ✅ Code complete (11 files, 3,968 lines)
- ✅ Unit tests created (66 tests)
- ✅ Test scripts ready (`scripts/ads/test-google-ads-integration.ts`)
- ✅ Setup documentation complete (`docs/ads/google-ads-setup.md`)
- ✅ OAuth flow implemented

### What's Blocked

- ❌ OAuth authentication testing
- ❌ Campaign data fetching verification
- ❌ Automation recommendations testing
- ❌ A/B testing with live campaigns
- ❌ Production deployment

---

## 📞 Next Steps

**Immediate Action (CEO)**:

1. Start Google Ads Developer Token application (Step 1) - **15 minutes**
2. While waiting for approval, set up Facebook Ads credentials (Steps 1-5) - **45 minutes**
3. Once Google Developer Token approved, complete Google Ads setup (Steps 2-5) - **45 minutes**
4. Run verification tests to confirm integration - **10 minutes**
5. Deploy credentials to Fly.io for production - **5 minutes**

**Ads Agent Next Actions**:

1. ✅ Fix unit test expectations (30 minutes) - **IN PROGRESS**
2. ⏸️ Wait for credentials
3. Run integration tests once credentials available
4. Mark BLOCKER-001 as resolved
5. Mark ADS-010 & ADS-011 as complete

**Total Time to Unblock**:

- **Active work**: ~2 hours (CEO)
- **Waiting time**: 1-3 business days (Google Developer Token approval)
- **Testing & verification**: 30 minutes (Ads Agent)

---

## 📚 Additional Resources

- **Google Ads API Docs**: https://developers.google.com/google-ads/api/docs/start
- **Facebook Marketing API Docs**: https://developers.facebook.com/docs/marketing-apis
- **OAuth 2.0 Playground**: https://developers.google.com/oauthplayground/
- **Internal Setup Guide**: `docs/ads/google-ads-setup.md` (178 lines)
- **Integration Test Script**: `scripts/ads/test-google-ads-integration.ts` (241 lines)

---

**Document Status**: ✅ Complete  
**Last Updated**: 2025-10-21T18:00Z  
**Next Review**: When credentials obtained
