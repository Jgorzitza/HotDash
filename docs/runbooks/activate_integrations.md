# Production Integration Activation Guide

**Owner**: Integrations Agent  
**Last Updated**: 2025-10-19  
**Estimated Time**: 45-60 minutes  
**Prerequisites**: Manager approval, all secrets configured

## Pre-Activation Checklist

- [ ] All contract tests passing (`npm run test:ci`)
- [ ] Secrets configured in GitHub Environments
- [ ] Fly.io secrets set for production app
- [ ] Manager approval in Issue #110
- [ ] Rollback plan reviewed

## Activation Order

Activate integrations in this order to minimize risk:

1. **Supabase (Idea Pool)** - Read-only, mock fallback
2. **Publer (Social)** - Dev account test first
3. **Analytics (GA4)** - Future

Chatwoot is always live (no feature flag).

---

## 1. Supabase (Idea Pool)

**Risk**: Low (read-only, graceful fallback)  
**Dependency**: Data agent must create `idea_pool` table migration first

### Step 1.1: Verify Migration

```bash
cd ~/HotDash/hot-dash
supabase migration list
```

**Expected**: `idea_pool` table migration appears in Remote column

**If missing**:

- Contact Data agent
- Do NOT proceed with activation
- Activation will work but return mock data with warnings

### Step 1.2: Set Feature Flag

```bash
# Production (Fly.io)
fly secrets set IDEA_POOL_SUPABASE_ENABLED=true -a hotdash-app

# Or GitHub Environments
# Navigate to Settings → Environments → production → Add secret
# Name: IDEA_POOL_SUPABASE_ENABLED
# Value: true
```

### Step 1.3: Restart App

```bash
fly apps restart hotdash-app
```

### Step 1.4: Verify Activation

```bash
# Check API response
curl https://hotdash-app.fly.dev/api/analytics/idea-pool | jq .

# Expected output:
{
  "success": true,
  "source": "supabase",  # ← Must be "supabase", not "mock"
  "data": {
    "items": [...],
    "totals": {...}
  },
  "timestamp": "..."
}
```

**If source is "mock"**:

- Check logs: `fly logs -a hotdash-app | grep idea-pool`
- Common issues:
  - Secret not set: `fly secrets list` should show `IDEA_POOL_SUPABASE_ENABLED`
  - Migration missing: See Step 1.1
  - Supabase creds missing: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

### Step 1.5: Monitor

```bash
# Watch for errors
fly logs -a hotdash-app --filter "idea-pool" --tail

# Check success rate (should be 100% or fall back to mock gracefully)
```

### Rollback (Supabase)

```bash
fly secrets set IDEA_POOL_SUPABASE_ENABLED=false -a hotdash-app
fly apps restart hotdash-app
```

---

## 2. Publer (Social Posting)

**Risk**: Medium (writes to external system)  
**Strategy**: Test with dev account first, then production

### Step 2.1: Verify Dev Account

Create test Publer workspace:

- Name: "HotDash Dev Testing"
- Connect 1 test social account (Twitter/Facebook test page)
- Note workspace ID

### Step 2.2: Set Dev Secrets

```bash
fly secrets set \
  PUBLER_API_KEY=<dev-api-key> \
  PUBLER_WORKSPACE_ID=<dev-workspace-id> \
  -a hotdash-app-dev
```

### Step 2.3: Test Dev Mode (Mock)

```bash
# In dev environment, flag should be false
fly ssh console -a hotdash-app-dev
> echo $PUBLER_LIVE
# Expected: (empty or false)

# Test mock API
curl -X POST https://hotdash-app-dev.fly.dev/api/social/post \
  -H "Content-Type: application/json" \
  -d '{"text": "Test post", "accountIds": ["mock-twitter-1"]}'

# Expected: {"ok": true, "jobId": "mock-job-1-..."}
```

### Step 2.4: Activate Dev Environment

```bash
fly secrets set PUBLER_LIVE=true -a hotdash-app-dev
fly apps restart hotdash-app-dev
```

### Step 2.5: Test Real API (Dev Workspace)

```bash
# Schedule a test post
curl -X POST https://hotdash-app-dev.fly.dev/api/social/post \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Integration test post - please ignore",
    "accountIds": ["<dev-account-id>"]
  }'

# Expected: {"ok": true, "jobId": "real-job-..."}

# Check status
curl https://hotdash-app-dev.fly.dev/api/social/status/<job-id>

# Expected: {"ok": true, "status": {"status": "complete", ...}}
```

**Verify in Publer UI**:

- Login to dev workspace
- Check "Posts" → should see test post scheduled
- Confirm it appears correctly

### Step 2.6: Activate Production

⚠️ **ONLY after dev testing succeeds**

```bash
fly secrets set \
  PUBLER_API_KEY=<production-api-key> \
  PUBLER_WORKSPACE_ID=<production-workspace-id> \
  PUBLER_LIVE=true \
  -a hotdash-app

fly apps restart hotdash-app
```

### Step 2.7: Verify Production

```bash
# Check logs
fly logs -a hotdash-app | grep publer-adapter

# Expected: "Using real Publer API (production mode)"

# Test with caution (will post to real accounts)
# Only test during off-hours or with "Draft" mode
```

### Step 2.8: Monitor

```bash
# Watch job completion rate
fly logs -a hotdash-app --filter "publer" --tail

# Alert criteria:
# - >5% jobs failing
# - Jobs taking >5 minutes to complete
# - 401/403 errors (credential issue)
```

### Rollback (Publer)

```bash
# Immediate rollback to mock mode
fly secrets set PUBLER_LIVE=false -a hotdash-app
fly apps restart hotdash-app

# Verify
curl https://hotdash-app.fly.dev/api/social/post \
  -X POST -H "Content-Type: application/json" \
  -d '{"text": "Test", "accountIds": ["mock-1"]}'
# Expected: jobId starts with "mock-job-"
```

---

## 3. Analytics (Google Analytics 4)

**Status**: Pending implementation (Task 6)  
**Flag**: `ANALYTICS_REAL_DATA`

### When Ready

```bash
fly secrets set ANALYTICS_REAL_DATA=true -a hotdash-app
fly apps restart hotdash-app
```

### Verification

```bash
curl https://hotdash-app.fly.dev/api/analytics/traffic | jq .source
# Expected: "ga4" not "mock"
```

---

## 4. Chatwoot (Customer Support)

**Status**: Always active (no feature flag)  
**Already in Production**: Uses real API with authentication

### Health Check

```bash
# Run Chatwoot health check script
cd ~/HotDash/hot-dash
./scripts/ops/check-chatwoot-health.sh

# Expected output:
# ✅ Chatwoot health endpoint OK
# ✅ API authentication successful
# ✅ Can fetch conversations
```

### Monitor HITL Workflow

1. **Private Notes**: Check that AI drafts appear as private notes

   ```bash
   # Chatwoot UI → Conversations → Check for private notes with metadata
   ```

2. **Public Replies**: Verify approved notes become public replies

3. **Grading**: Ensure grades (tone/accuracy/policy) logged to Supabase

### Issues

**401 Unauthorized**:

```bash
fly secrets list -a hotdash-app | grep CHATWOOT
# Verify CHATWOOT_API_KEY, CHATWOOT_ACCOUNT_ID set
```

**Rate Limiting**:

- Check logs for "Rate limit reached"
- Client auto-retries with backoff
- Alert if >10% requests rate-limited

---

## Post-Activation Monitoring

### Day 1 (First 24 Hours)

- [ ] Check all integration logs every 2 hours
- [ ] Verify error rates < 1%
- [ ] Confirm mock fallbacks working (if any errors)
- [ ] Test one full workflow per integration:
  - Supabase: View idea pool in dashboard
  - Publer: Schedule one real post (during business hours)
  - Chatwoot: Draft → Approve → Send one reply

### Week 1

- [ ] Daily log review
- [ ] Monitor job completion rates (Publer)
- [ ] Track HITL approval rates (Chatwoot)
- [ ] Check Supabase query performance

### Ongoing

- [ ] Weekly integration health report
- [ ] Monthly secret rotation (API keys)
- [ ] Quarterly review of feature flag usage

---

## Troubleshooting

### All Integrations Return Mock Data

**Cause**: Feature flags not activated

**Fix**:

```bash
fly secrets list -a hotdash-app

# Should see:
# IDEA_POOL_SUPABASE_ENABLED=true
# PUBLER_LIVE=true
# ANALYTICS_REAL_DATA=true

# If missing, set them:
fly secrets set FLAG_NAME=true -a hotdash-app
fly apps restart hotdash-app
```

### Credentials Invalid

**Symptoms**:

- 401/403 errors in logs
- Mock data with "credentials missing" warning

**Fix**:

```bash
# Verify secrets set
fly secrets list -a hotdash-app

# Re-set if needed
fly secrets set SUPABASE_SERVICE_KEY=<key> -a hotdash-app
fly secrets set PUBLER_API_KEY=<key> -a hotdash-app
fly secrets set CHATWOOT_API_KEY=<key> -a hotdash-app

# Restart
fly apps restart hotdash-app
```

### Rate Limiting

**Symptoms**:

- Logs show "Rate limit reached"
- 429 errors from external APIs

**Chatwoot**: Built-in token bucket (10 req/sec), auto-retries

**Publer**: Check usage in Publer dashboard

**Supabase**: Unlikely (generous limits), but check project quota

### Network Timeouts

**Cause**: Fly.io egress issues or external API downtime

**Fix**:

1. Check external API status pages
2. Verify Fly.io network status
3. Integrations will fallback to mock gracefully

---

## Emergency Contacts

**Integration Issues**:

- Integrations Agent: Review logs, check feature flags
- DevOps Agent: Fly.io secrets, network issues
- Data Agent: Supabase migrations, schema issues

**External Services**:

- Supabase Support: https://supabase.com/support
- Chatwoot Support: https://www.chatwoot.com/help-center
- Publer Support: https://publer.com/support

---

## Rollback Decision Tree

```
Issue Detected
    │
    ├─ Affecting single integration?
    │   └─ Yes → Rollback that integration only (set flag=false)
    │
    ├─ Affecting all integrations?
    │   └─ Yes → Emergency rollback (all flags=false)
    │
    ├─ Data loss risk?
    │   └─ Yes → STOP, contact Manager immediately
    │
    └─ Customer impact?
        ├─ Yes → Immediate rollback
        └─ No → Monitor, rollback if issues persist >15 min
```

---

## Success Criteria

After activation, confirm:

- [ ] **Supabase**: API returns `source: "supabase"` with real data
- [ ] **Publer**: Test post scheduled and visible in Publer dashboard
- [ ] **Chatwoot**: Private notes → Public replies workflow functioning
- [ ] **Logs**: No errors in past 1 hour
- [ ] **Mock Fallback**: Temporarily break one integration, verify mock fallback works
- [ ] **Rollback**: Test rollback procedure (flag=false → restart → verify mock mode)

---

## Documentation References

- Integration Architecture: `docs/specs/integration_architecture.md`
- Feature Flags: `docs/specs/feature_flags.md`
- Chatwoot Setup: `docs/integrations/publer-oauth-setup.md`
- Publer OAuth: `docs/devops/publer-secret-setup.md`

---

## Change Log

- 2025-10-19: Initial activation guide for Supabase, Publer, Chatwoot
