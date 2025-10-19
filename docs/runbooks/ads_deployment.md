# Ads Module Deployment Runbook

## Pre-Deployment Checklist

### 1. Environment Variables

**Required for Production:**

```bash
# Publer (social posting)
PUBLER_API_KEY=your_api_key_here
PUBLER_WORKSPACE_ID=your_workspace_id

# Meta/Facebook Ads
META_ACCESS_TOKEN=your_long_lived_token
META_AD_ACCOUNT_ID=act_1234567890

# Google Ads
GOOGLE_ADS_DEVELOPER_TOKEN=your_dev_token
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_CUSTOMER_ID=1234567890

# Alert Thresholds (optional)
ADS_MIN_ROAS=2.0
ADS_MAX_CPA=40.0
ADS_MAX_DAILY_SPEND=1000.0
```

### 2. Feature Flags

Start with all disabled, enable incrementally:

```bash
# Phase 1: Dashboard only (stub mode)
FEATURE_ADS_DASHBOARD_TILE=true
FEATURE_ADS_APPROVALS=true

# Phase 2: Enable Publer
FEATURE_ADS_PUBLER_ENABLED=true

# Phase 3: Enable Meta
FEATURE_ADS_META_ENABLED=true
FEATURE_ADS_METRICS_STORAGE=true

# Phase 4: Enable Google Ads
FEATURE_ADS_GOOGLE_ENABLED=true
```

### 3. Database Migration

```bash
cd supabase
supabase migration up --include 20251019_ads_metrics_daily
```

Verify table created:

```sql
SELECT * FROM ads_metrics_daily LIMIT 1;
```

### 4. Health Check

```bash
curl http://localhost:3000/api/ads/health
```

Expected response:

- `overall: "stub_mode"` initially
- All platforms `mode: "stub"`
- No missing config errors

## Deployment Phases

### Phase 1: Stub Mode (Day 1)

**Enable:**

- Dashboard tile (stub data)
- Approvals workflow (structure only)

**Verify:**

- Health endpoint returns 200
- Dashboard tile renders without errors
- Unit tests pass: 43/43

**Rollback:**

```bash
FEATURE_ADS_DASHBOARD_TILE=false
```

### Phase 2: Publer Integration (Day 3-5)

**Prerequisites:**

- Publer API key obtained
- Workspace ID configured
- Test account set up

**Enable:**

```bash
FEATURE_ADS_PUBLER_ENABLED=true
```

**Verify:**

- POST test campaign to Publer
- Check job status endpoint
- Verify post appears in Publer queue
- Monitor for 24 hours

**Rollback:**

```bash
FEATURE_ADS_PUBLER_ENABLED=false
```

### Phase 3: Meta Integration (Day 7-10)

**Prerequisites:**

- Meta App approved
- Long-lived access token generated
- Ad account permissions granted

**Enable:**

```bash
FEATURE_ADS_META_ENABLED=true
FEATURE_ADS_METRICS_STORAGE=true
```

**Verify:**

- Fetch campaigns returns real data
- Metrics stored to Supabase
- Dashboard shows live ROAS
- Monitor for 48 hours

**Rollback:**

```bash
FEATURE_ADS_META_ENABLED=false
FEATURE_ADS_METRICS_STORAGE=false
```

### Phase 4: Google Ads Integration (Day 12-15)

**Prerequisites:**

- Google Ads OAuth completed
- Developer token approved
- Refresh token stored

**Enable:**

```bash
FEATURE_ADS_GOOGLE_ENABLED=true
```

**Verify:**

- Fetch Google campaigns succeeds
- Metrics aggregate correctly across platforms
- No rate limit errors
- Monitor for 72 hours

**Rollback:**

```bash
FEATURE_ADS_GOOGLE_ENABLED=false
```

## Monitoring

### Key Metrics

- API response time < 2s
- Sync success rate > 99%
- Alert accuracy > 95%
- Zero data loss

### Alerts to Configure

- ROAS < 2.0 for 3+ days
- CPA > $40
- Daily spend > budget \* 1.2
- Campaign paused unexpectedly
- API errors > 5% rate

### Logs to Monitor

```bash
# Health checks
grep "ads/health" logs/*.log

# API errors
grep "ADS.*ERROR" logs/*.log

# Sync operations
grep "sync.*campaigns" logs/*.log
```

## Rollback Procedures

### Emergency Rollback (All Features)

```bash
FEATURE_ADS_PUBLER_ENABLED=false
FEATURE_ADS_META_ENABLED=false
FEATURE_ADS_GOOGLE_ENABLED=false
FEATURE_ADS_DASHBOARD_TILE=false
```

### Data Rollback

```sql
-- Backup before rollback
CREATE TABLE ads_metrics_daily_backup AS
SELECT * FROM ads_metrics_daily
WHERE created_at > '2025-10-19';

-- Restore if needed
INSERT INTO ads_metrics_daily
SELECT * FROM ads_metrics_daily_backup;
```

## Troubleshooting

See: `docs/runbooks/ads_troubleshooting.md`
