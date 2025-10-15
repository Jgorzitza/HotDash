# Production Secrets Mirroring Checklist

**Task:** 6 - Production Secrets Readiness  
**Owner:** Integrations + Deployment  
**Created:** 2025-10-12  
**Purpose:** Prepare secrets for production launch

---

## Secrets Inventory

### Current Status: Staging Secrets ✅

**Staging Secrets Present (13 files):**
1. `chatwoot/api_token_staging.env` ✅
2. `chatwoot/redis_staging.env` ✅
3. `chatwoot/super_admin_staging.env` ✅
4. `fly/api_token.env` ✅
5. `openai/api_key_staging.env` ✅
6. `shopify/api_key_staging.env` ✅
7. `shopify/api_secret_staging.env` ✅
8. `shopify/app_url_staging.env` ✅
9. `shopify/cli_auth_token_staging.env` ✅
10. `shopify/shop_domain_staging.env` ✅
11. `shopify/smoke_test_url_staging.env` ✅
12. `supabase/database_url_staging.env` ✅
13. `supabase/service_key_staging.env` ✅

---

## Production Secrets Required

### Critical Path (Required for Launch)

**Shopify Production:**
- [ ] `shopify/api_key_production.env`
- [ ] `shopify/api_secret_production.env`
- [ ] `shopify/app_url_production.env`
- [ ] `shopify/shop_domain_production.env` (Hot Rodan production store)

**Supabase Production:**
- [ ] `supabase/database_url_production.env`
- [ ] `supabase/service_key_production.env`
- [ ] `supabase/anon_key_production.env`

**Chatwoot Production:**
- [ ] `chatwoot/api_token_production.env`
- [ ] `chatwoot/base_url_production.env` (hotdash-chatwoot.fly.dev)
- [ ] `chatwoot/account_id_production.env`
- [ ] `chatwoot/webhook_secret_production.env`

**OpenAI Production:**
- [ ] `openai/api_key_production.env`

**Google Analytics Production:**
- [ ] `google/analytics-service-account-production.json`
- [ ] `google/analytics-property-id-production.env`

**Fly.io Production:**
- [ ] `fly/api_token.env` (already exists, verify still valid)

---

## Mirroring Procedure

### Phase 1: Generate Production Secrets (Deployment Team)

**Shopify:**
1. Create production Shopify app (or use existing)
2. Get API key and secret from Partner Dashboard
3. Save to `vault/occ/shopify/*_production.env`
4. Set permissions: `chmod 600 *.env`

**Supabase:**
1. Use existing production Supabase project
2. Get connection string from project settings
3. Get service role key from API settings
4. Save securely

**Chatwoot:**
1. Generate production API token in Chatwoot admin
2. Get production URL (hotdash-chatwoot.fly.dev)
3. Generate webhook secret: `openssl rand -hex 32`
4. Save all credentials

**OpenAI:**
1. Use existing OpenAI account
2. Generate new API key for production
3. Save securely

**Google Analytics:**
1. Use existing service account or create new
2. Download JSON credentials
3. Get production property ID
4. Save both files

---

### Phase 2: Mirror to GitHub Actions (Deployment Team)

**Repository Secrets to Set:**
```bash
# Shopify
SHOPIFY_API_KEY
SHOPIFY_API_SECRET
SHOPIFY_APP_URL
SHOPIFY_SHOP_DOMAIN

# Supabase
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Chatwoot
CHATWOOT_BASE_URL
CHATWOOT_API_TOKEN
CHATWOOT_ACCOUNT_ID
CHATWOOT_WEBHOOK_SECRET

# OpenAI
OPENAI_API_KEY

# Google Analytics
GA_SERVICE_ACCOUNT_JSON  (entire JSON as secret)
GA_PROPERTY_ID

# Fly.io
FLY_API_TOKEN
```

**Set via:**
```bash
gh secret set SHOPIFY_API_KEY < vault/occ/shopify/api_key_production.env
# ... repeat for all secrets
```

---

### Phase 3: Smoke Test Production Secrets

**Before Launch - Verify Each Secret:**

**Shopify:**
```bash
# Test API connection
curl -X POST "https://${SHOPIFY_SHOP_DOMAIN}/admin/api/2024-10/graphql.json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ shop { name } }"}'

# Expected: {"data":{"shop":{"name":"Hot Rodan"}}}
```

**Supabase:**
```bash
# Test database connection
psql "${SUPABASE_DATABASE_URL}" -c "SELECT 1;"

# Expected: (1 row)
```

**Chatwoot:**
```bash
# Test API token
curl "${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations" \
  -H "api_access_token: ${CHATWOOT_API_TOKEN}"

# Expected: {"data":[...]}
```

**OpenAI:**
```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer ${OPENAI_API_KEY}"

# Expected: {"data":[...]}
```

**Google Analytics:**
```bash
# Verify service account file exists and is valid JSON
cat "${GOOGLE_APPLICATION_CREDENTIALS}" | jq . > /dev/null

# Expected: No errors
```

---

## Security Checklist

**Before Mirroring:**
- [ ] All secrets use secure generation (crypto-random, not predictable)
- [ ] All .env files have 600 permissions (owner read/write only)
- [ ] No secrets committed to git (verify with `git log -p | grep -i 'api.*key'`)
- [ ] Vault directory has 700 permissions

**During Mirroring:**
- [ ] Use secure channel (gh CLI, not manual copy-paste)
- [ ] Verify GitHub repository secrets are encrypted at rest
- [ ] Limit secret access to necessary workflows only
- [ ] Document who has access to which secrets

**After Mirroring:**
- [ ] Run smoke tests for all secrets
- [ ] Verify no secrets in application logs
- [ ] Test secret rotation procedure
- [ ] Document secret rotation schedule (90 days)

---

## Production Deployment Coordination

**Deployment Team Actions:**
1. Generate all production secrets (using procedures above)
2. Save to `vault/occ/*_production.env` files
3. Mirror to GitHub Actions secrets
4. Run smoke tests for each service
5. Confirm with Integrations agent (verification)
6. Deploy application with production secrets
7. Monitor for 24 hours post-launch

**Integrations Team Actions:**
1. ✅ Provide this checklist to Deployment team
2. ⏳ Verify smoke test results after mirroring
3. ⏳ Monitor integration health post-launch
4. ⏳ Document any issues in incident log

**Timeline:**
- Secrets generation: 2-4 hours
- Mirroring and testing: 1-2 hours
- Total: 3-6 hours (plan for 1 business day)

---

## Rollback Plan

**If Production Secrets Fail:**
1. Revert to staging secrets (immediate)
2. Investigate secret issue (parallel)
3. Regenerate failing secret
4. Re-test and redeploy

**If Secrets Compromised:**
1. Rotate ALL secrets immediately
2. Revoke compromised credentials
3. Audit access logs
4. Incident report to Compliance

---

## Ongoing Maintenance

**Rotation Schedule:**
- Shopify: 90 days (or on security incident)
- Supabase: 90 days
- Chatwoot: 90 days
- OpenAI: 90 days
- Google Analytics: 180 days (service account)
- Webhook secrets: 90 days

**Rotation Process:**
1. Generate new secret
2. Store as `*_new.env`
3. Update application to accept both old and new
4. Deploy
5. Verify new secret works
6. Remove old secret support
7. Archive old secret as `*_old.env`

---

**Checklist Complete:** 2025-10-12 04:11 UTC  
**Status:** Ready for Deployment team execution  
**Coordination:** Tag @deployment when ready to mirror secrets

