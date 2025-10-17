# Secrets Management Runbook

**Owner:** devops
**Date:** 2025-10-16
**Status:** Production

## Overview

HotDash uses a secure secret management system with secrets stored in `vault/occ/**` (gitignored) and synchronized to GitHub Secrets and Fly.io secrets via automated sync script.

## Secret Sync Automation

### Sync Script

**Location:** `scripts/ops/sync-secrets.sh`

**Usage:**

```bash
# Dry run (recommended first)
./scripts/ops/sync-secrets.sh --dry-run

# Sync to both environments
./scripts/ops/sync-secrets.sh

# Sync to production only
./scripts/ops/sync-secrets.sh --environment production

# Sync to staging only
./scripts/ops/sync-secrets.sh --environment staging
```

### What Gets Synced

1. **Google Analytics Service Account**
   - File: `vault/occ/google/analytics-service-account.json`
   - Synced as: `GOOGLE_ANALYTICS_SERVICE_ACCOUNT`

2. **Text-based Secrets**
   - Any `.txt` file in `vault/occ/**`
   - Converted to uppercase with underscores
   - Example: `vault/occ/shopify/api-key.txt` → `SHOPIFY_API_KEY`

### Sync Process

1. Read secrets from `vault/occ/**`
2. Validate secret format and content
3. Sync to GitHub Secrets via `gh secret set`
4. Sync to Fly secrets via `fly secrets set`
5. Verify sync completed successfully

## Secrets Management Runbook

**Owner:** integrations agent  
**Date:** 2025-10-16  
**Purpose:** Secrets and credentials management for all adapters

---

## Overview

This document describes the secrets required for all integration adapters and how to manage them across environments.

**Environments:**

- **Local:** Development on developer machines
- **Staging:** Testing environment (Fly.io staging app)
- **Production:** Live environment (Fly.io production app)

---

## Adapter Requirements

### Shopify Admin GraphQL

**Required Secrets:**

- `SHOPIFY_API_KEY` - App API key from Partner Dashboard
- `SHOPIFY_API_SECRET` - App API secret from Partner Dashboard
- `SHOPIFY_STORE_URL` - Store domain (e.g., hotrodan.myshopify.com)

**Storage:**

- **Local:** `vault/occ/shopify/` (gitignored)
  - `api_key_staging.env`
  - `api_secret_staging.env`
  - `shop_domain_staging.env`
- **Staging:** Fly.io secrets (`fly secrets set`)
- **Production:** Fly.io secrets (`fly secrets set`)

**Rotation:** Every 90 days or on exposure

**Scopes Required:**

- `read_orders`
- `read_products`
- `read_inventory`
- `read_marketplace_orders`

---

### Supabase

**Required Secrets:**

- `SUPABASE_URL` - Project URL
- `SUPABASE_ANON_KEY` - Anonymous key (frontend)
- `SUPABASE_SERVICE_KEY` - Service role key (backend)

**Storage:**

- **Local:** `vault/occ/supabase/` (gitignored)
  - `database_url_staging.env`
  - `service_key_staging.env`
- **Staging:** Fly.io secrets
- **Production:** Fly.io secrets

**Rotation:** Every 90 days or on exposure

**Project:** mmbjiyhsvniqxibzgyvx

---

### Chatwoot

**Required Secrets:**

- `CHATWOOT_API_TOKEN` - API access token
- `CHATWOOT_ACCOUNT_ID` - Account ID
- `CHATWOOT_BASE_URL` - API base URL (e.g., https://app.chatwoot.com)

**Storage:**

- **Local:** `vault/occ/chatwoot/` (gitignored)
  - `api_token_staging.env`
  - `account_id_staging.env`
- **Staging:** Fly.io secrets
- **Production:** Fly.io secrets

**Rotation:** Every 90 days or on exposure

**Rate Limit:** 10 requests/second

---

### Publer (Social Media)

**Required Secrets:**

- `PUBLER_API_KEY` - Publer API key
- `PUBLER_WORKSPACE_ID` - Workspace identifier (default: "HotRodAN")

**Storage:**

- **Local:** `vault/occ/publer/` (gitignored)
  - `api_key_staging.env`
  - `workspace_id_staging.env`
- **Staging:** Fly.io secrets (staging workspace)
- **Production:** Fly.io secrets (production workspace)

**Rotation:** Every 90 days or on exposure

**Platforms Supported:**

- Facebook
- Instagram
- Twitter
- LinkedIn
- Pinterest
- TikTok
- YouTube
- Reddit
- Telegram
- Google Business

---

### Google Analytics (GA4)

**Required Secrets:**

- `GA4_PROPERTY_ID` - GA4 property ID
- `GA4_SERVICE_ACCOUNT_KEY` - Service account JSON key

**Storage:**

- **Local:** `vault/occ/google/` (gitignored)
  - `analytics-service-account.json`
  - `property_id_staging.env`
- **Staging:** Fly.io secrets (JSON as base64)
- **Production:** Fly.io secrets (JSON as base64)

**Rotation:** Every 90 days

**Project:** hotrodan-seo-reports

---

## Local Development Setup

### 1. Clone Vault Credentials

```bash
# Ensure vault/ directory exists and is gitignored
mkdir -p vault/occ/{shopify,supabase,chatwoot,publer,google}

# Copy staging credentials from secure storage
# (Coordinate with manager for access)
```

### 2. Load Environment Variables

```bash
# Load all staging credentials
export $(grep -v '^#' vault/occ/shopify/api_key_staging.env | xargs)
export $(grep -v '^#' vault/occ/shopify/api_secret_staging.env | xargs)
export $(grep -v '^#' vault/occ/supabase/database_url_staging.env | xargs)
export $(grep -v '^#' vault/occ/supabase/service_key_staging.env | xargs)
# ... etc for other services
```

### 3. Verify Credentials

```bash
# Test MCP tools
./mcp/test-mcp-tools.sh

# Expected output:
# ✓ Shopify MCP - Ready
# ✓ Supabase MCP - Ready
# ✓ All tools operational
```

---

## Staging Deployment

### Set Secrets in Fly.io

```bash
# Shopify
fly secrets set SHOPIFY_API_KEY="..." --app hot-dash-staging
fly secrets set SHOPIFY_API_SECRET="..." --app hot-dash-staging
fly secrets set SHOPIFY_STORE_URL="hotrodan.myshopify.com" --app hot-dash-staging

# Supabase
fly secrets set SUPABASE_URL="..." --app hot-dash-staging
fly secrets set SUPABASE_ANON_KEY="..." --app hot-dash-staging
fly secrets set SUPABASE_SERVICE_KEY="..." --app hot-dash-staging

# Chatwoot
fly secrets set CHATWOOT_API_TOKEN="..." --app hot-dash-staging
fly secrets set CHATWOOT_ACCOUNT_ID="..." --app hot-dash-staging
fly secrets set CHATWOOT_BASE_URL="https://app.chatwoot.com" --app hot-dash-staging

# Publer (staging workspace)
fly secrets set PUBLER_API_KEY="..." --app hot-dash-staging
fly secrets set PUBLER_WORKSPACE_ID="HotRodAN-Staging" --app hot-dash-staging

# Google Analytics
fly secrets set GA4_PROPERTY_ID="..." --app hot-dash-staging
fly secrets set GA4_SERVICE_ACCOUNT_KEY="$(cat vault/occ/google/analytics-service-account.json | base64)" --app hot-dash-staging
```

### Verify Secrets

```bash
# List secrets (values are hidden)
fly secrets list --app hot-dash-staging

# Expected output:
# NAME                        DIGEST
# SHOPIFY_API_KEY             abc123...
# SHOPIFY_API_SECRET          def456...
# SUPABASE_URL                ghi789...
# ...
```

---

## Production Deployment

### Set Secrets in Fly.io

```bash
# Use production credentials (NOT staging)
fly secrets set SHOPIFY_API_KEY="..." --app hot-dash-production
fly secrets set SHOPIFY_API_SECRET="..." --app hot-dash-production
fly secrets set SHOPIFY_STORE_URL="hotrodan.myshopify.com" --app hot-dash-production

# Supabase (production project)
fly secrets set SUPABASE_URL="..." --app hot-dash-production
fly secrets set SUPABASE_ANON_KEY="..." --app hot-dash-production
fly secrets set SUPABASE_SERVICE_KEY="..." --app hot-dash-production

# Chatwoot (production account)
fly secrets set CHATWOOT_API_TOKEN="..." --app hot-dash-production
fly secrets set CHATWOOT_ACCOUNT_ID="..." --app hot-dash-production
fly secrets set CHATWOOT_BASE_URL="https://app.chatwoot.com" --app hot-dash-production

# Publer (production workspace)
fly secrets set PUBLER_API_KEY="..." --app hot-dash-production
fly secrets set PUBLER_WORKSPACE_ID="HotRodAN" --app hot-dash-production

# Google Analytics (production property)
fly secrets set GA4_PROPERTY_ID="..." --app hot-dash-production
fly secrets set GA4_SERVICE_ACCOUNT_KEY="$(cat vault/occ/google/analytics-service-account-prod.json | base64)" --app hot-dash-production
```

---

## Secret Rotation

### When to Rotate

- ✅ Every 90 days (scheduled)
- ✅ Immediately if exposed in code/logs
- ✅ Immediately if team member leaves
- ✅ If suspicious activity detected

### Rotation Procedure

1. **Generate new credential** in service (Shopify, Supabase, etc.)
2. **Update in vault/** for local development
3. **Update in Fly.io** for staging/production
4. **Test with new credential** in staging
5. **Deploy to production** if staging works
6. **Revoke old credential** in service
7. **Verify old credential no longer works**
8. **Document rotation** in this file

### Rotation Log

| Service  | Last Rotated | Next Rotation | Rotated By |
| -------- | ------------ | ------------- | ---------- |
| Shopify  | 2025-10-16   | 2026-01-14    | manager    |
| Supabase | 2025-10-16   | 2026-01-14    | manager    |
| Chatwoot | 2025-10-16   | 2026-01-14    | manager    |
| Publer   | 2025-10-16   | 2026-01-14    | manager    |
| GA4      | 2025-10-16   | 2026-01-14    | manager    |

---

## Security Best Practices

### ✅ DO

- Store secrets in `vault/` (gitignored)
- Use Fly.io secrets for deployment
- Rotate every 90 days
- Use minimal required permissions
- Document rotation in this file
- Test in staging before production

### ❌ DON'T

- Hardcode secrets in code
- Commit secrets to git
- Share secrets in chat/email
- Log secret values
- Use production secrets in staging
- Bypass secret rotation schedule

---

## Troubleshooting

### Issue: "Unable to authenticate with Shopify"

**Cause:** Invalid or expired API credentials

**Fix:**

1. Verify `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` are set
2. Check credentials in Shopify Partner Dashboard
3. Rotate credentials if expired
4. Verify API scopes are correct

### Issue: "Supabase RPC call failed"

**Cause:** Invalid service key or project URL

**Fix:**

1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
2. Check project settings in Supabase dashboard
3. Ensure service key has correct permissions
4. Rotate key if compromised

### Issue: "Chatwoot API rate limit exceeded"

**Cause:** Too many requests (> 10/sec)

**Fix:**

1. Implement rate limiting in code
2. Add caching to reduce API calls
3. Use webhooks instead of polling

### Issue: "Publer post failed"

**Cause:** Invalid API token or workspace

**Fix:**

1. Verify `PUBLER_API_KEY` is valid
2. Check `PUBLER_WORKSPACE_ID` matches workspace
3. Ensure workspace has connected social accounts
4. Verify API token has posting permissions

---

## Monitoring

### Daily Checks

- [ ] All secrets set in Fly.io (staging and production)
- [ ] No secrets in git history (Gitleaks clean)
- [ ] No secrets in logs
- [ ] Vault/ directory gitignored

### Weekly Checks

- [ ] Test all API connections
- [ ] Verify MCP tools operational
- [ ] Check for expiring credentials (< 30 days)

### Monthly Checks

- [ ] Review rotation schedule
- [ ] Audit secret usage
- [ ] Update rotation log
- [ ] Test secret rotation procedure

---

**Last Updated:** 2025-10-16  
**Maintained by:** integrations agent  
**Next Review:** 2025-11-16
