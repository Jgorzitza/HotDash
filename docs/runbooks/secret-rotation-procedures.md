---
epoch: 2025.10.E1
doc: docs/runbooks/secret-rotation-procedures.md
owner: deployment
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# Secret Rotation Procedures

**Owner**: Deployment Agent  
**Last Updated**: 2025-10-14  
**Purpose**: Secure credential rotation for all HotDash services

---

## Overview

All secrets must be rotated on a schedule to maintain security posture. This runbook provides step-by-step procedures for rotating each service's credentials.

### Rotation Schedule

| Service | Secrets | Rotation Frequency | Last Rotated |
|---------|---------|-------------------|--------------|
| **Supabase** | DATABASE_URL, SERVICE_KEY | 90 days | 2025-10-10 |
| **Shopify** | API_KEY, API_SECRET, CLI_TOKEN | 90 days | 2025-10-09 |
| **Chatwoot** | API_TOKEN, REDIS_URL, WEBHOOK_SECRET | 90 days | 2025-10-10 |
| **Fly.io** | API_TOKEN | 180 days | 2025-10-10 |
| **OpenAI** | API_KEY | 90 days | TBD |
| **Google** | SERVICE_ACCOUNT_JSON | 365 days | TBD |
| **Zoho** | EMAIL_CREDENTIALS | 180 days | TBD |

---

## Secret Storage Architecture

### Current State (✅ Secure)

**Local Development**:
- Secrets in `vault/occ/` directory (gitignored ✅)
- Never committed to version control ✅
- Developers source from vault before running commands

**CI/CD (GitHub Actions)**:
- Secrets stored in GitHub Environments (staging, production)
- Access controlled by environment protection rules
- Synced from vault by deployment agent

**Production (Fly.io)**:
- Secrets stored in Fly.io encrypted secrets
- Access via environment variables only
- No secrets in fly.toml or config files

---

## Rotation Procedures

### 1. Supabase Secrets

**What to Rotate**:
- `DATABASE_URL` - Postgres connection string
- `SUPABASE_SERVICE_KEY` - Service role key
- `SUPABASE_URL` - API endpoint (rarely changes)

**Procedure**:

```bash
# 1. Generate new service key in Supabase Dashboard
# https://supabase.com/dashboard/project/_/settings/api
# Copy new service_role key

# 2. Update vault
cd ~/HotDash/hot-dash
echo "SUPABASE_SERVICE_KEY=\"anon.new-key-here\"" > vault/occ/supabase/service_key_staging.env

# 3. Update Fly.io secrets
source vault/occ/fly/api_token.env
source vault/occ/supabase/service_key_staging.env
~/.fly/bin/fly secrets set SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" -a hotdash-staging
~/.fly/bin/fly secrets set SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" -a hotdash-agent-service

# 4. Update GitHub Actions secrets
source vault/occ/supabase/service_key_staging.env
gh secret set SUPABASE_SERVICE_KEY --env staging --body "$SUPABASE_SERVICE_KEY"

# 5. Verify apps restart and work
~/.fly/bin/fly status -a hotdash-staging
curl -f https://hotdash-staging.fly.dev/health

# 6. Test database connectivity
# Access Supabase dashboard and verify connections

# 7. Log rotation
echo "$(date -u +%Y-%m-%d): Rotated Supabase service key" >> vault/rotation_log.txt
```

**Rollback**:
- Keep old key for 24 hours before revoking
- Revert secrets if issues detected

---

### 2. Shopify Secrets

**What to Rotate**:
- `SHOPIFY_API_KEY` - App API key (rarely rotates - regenerate if compromised)
- `SHOPIFY_API_SECRET` - App API secret (rotate quarterly)
- `SHOPIFY_CLI_AUTH_TOKEN` - CLI authentication (rotate every 90 days)

**Procedure**:

```bash
# 1. Generate new CLI auth token
# Run: shopify auth logout && shopify auth login
# Copy new token from credentials file

# 2. Update vault
cd ~/HotDash/hot-dash
echo "SHOPIFY_CLI_AUTH_TOKEN_STAGING=\"new-token-here\"" > vault/occ/shopify/cli_auth_token_staging.env

# 3. Update GitHub Actions
source vault/occ/shopify/cli_auth_token_staging.env
gh secret set SHOPIFY_CLI_AUTH_TOKEN_STAGING --env staging --body "$SHOPIFY_CLI_AUTH_TOKEN_STAGING"

# 4. Test deployment
gh workflow run deploy-staging.yml

# 5. Log rotation
echo "$(date -u +%Y-%m-%d): Rotated Shopify CLI token" >> vault/rotation_log.txt
```

**For API Key/Secret** (Only if compromised):
- Regenerate in Shopify Partner Dashboard
- Update vault, Fly, GitHub in that order
- Redeploy all apps immediately

---

### 3. Chatwoot Secrets

**What to Rotate**:
- `CHATWOOT_TOKEN` - API access token
- `CHATWOOT_REDIS_URL` - Redis connection (Upstash managed)
- `CHATWOOT_WEBHOOK_SECRET` - Webhook signature secret

**Procedure**:

```bash
# 1. Generate new API token in Chatwoot
# SSH into Chatwoot container
source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
~/.fly/bin/fly ssh console --app hotdash-chatwoot

# In container:
bundle exec rails runner "
  user = User.find_by(email: 'justin@hotrodan.com')
  token = user.access_tokens.create!(name: 'HotDash API Token Rotation ' + Time.now.to_s)
  puts 'New Token: ' + token.access_token
"
exit

# 2. Update vault
echo "CHATWOOT_API_TOKEN_STAGING=\"new-token-here\"" > vault/occ/chatwoot/api_token_staging.env

# 3. Update Fly.io
source vault/occ/chatwoot/api_token_staging.env
~/.fly/bin/fly secrets set CHATWOOT_TOKEN="$CHATWOOT_API_TOKEN_STAGING" -a hotdash-staging

# 4. Update GitHub
gh secret set CHATWOOT_TOKEN_STAGING --env staging --body "$CHATWOOT_API_TOKEN_STAGING"

# 5. Test integration
curl -H "api_access_token: $CHATWOOT_API_TOKEN_STAGING" \
  https://hotdash-chatwoot.fly.dev/api/v1/accounts/1/contacts

# 6. Revoke old token in Chatwoot UI
# Settings → Profile → Access Tokens → Revoke old token

# 7. Log rotation
echo "$(date -u +%Y-%m-%d): Rotated Chatwoot API token" >> vault/rotation_log.txt
```

---

### 4. Fly.io API Token

**What to Rotate**:
- `FLY_API_TOKEN` - Fly.io CLI and deployment automation

**Procedure**:

```bash
# 1. Generate new token
~/.fly/bin/fly auth token

# Output shows new token - copy it

# 2. Update vault
echo "FLY_API_TOKEN=\"fm2_new-token-here\"" > vault/occ/fly/api_token.env

# 3. Update GitHub Actions
source vault/occ/fly/api_token.env
gh secret set FLY_API_TOKEN --body "$FLY_API_TOKEN"

# 4. Test Fly CLI
source vault/occ/fly/api_token.env
~/.fly/bin/fly apps list

# 5. Test deployment
gh workflow run infrastructure-monitoring.yml

# 6. Log rotation
echo "$(date -u +%Y-%m-%d): Rotated Fly API token" >> vault/rotation_log.txt
```

**Warning**: Update quickly - old token expires after generation of new one (for personal tokens)

---

### 5. OpenAI API Key

**What to Rotate**:
- `OPENAI_API_KEY` - GPT-4 and embedding access

**Procedure**:

```bash
# 1. Generate new key in OpenAI dashboard
# https://platform.openai.com/api-keys
# Create new key with name "HotDash Staging - YYYY-MM-DD"

# 2. Update vault
echo "OPENAI_API_KEY=\"sk-proj-new-key-here\"" > vault/occ/openai/api_key_staging.env

# 3. Update Fly.io (if used)
source vault/occ/openai/api_key_staging.env
~/.fly/bin/fly secrets set OPENAI_API_KEY="$OPENAI_API_KEY" -a hotdash-agent-service

# 4. Test AI services
curl -f https://hotdash-agent-service.fly.dev/health

# 5. Revoke old key in OpenAI dashboard

# 6. Log rotation
echo "$(date -u +%Y-%m-%d): Rotated OpenAI API key" >> vault/rotation_log.txt
```

---

### 6. Google Analytics Service Account

**What to Rotate**:
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` - Service account credentials

**Procedure**:

```bash
# 1. Create new service account key in Google Cloud Console
# https://console.cloud.google.com/iam-admin/serviceaccounts
# Create new JSON key for existing service account

# 2. Update vault
cp ~/Downloads/new-service-account.json vault/occ/google/analytics-service-account.json
chmod 600 vault/occ/google/analytics-service-account.json

# 3. Convert to single-line JSON for Fly secrets
NEW_CREDS=$(cat vault/occ/google/analytics-service-account.json | jq -c .)

# 4. Update Fly.io
source vault/occ/fly/api_token.env
~/.fly/bin/fly secrets set GOOGLE_APPLICATION_CREDENTIALS_JSON="$NEW_CREDS" -a hotdash-staging

# 5. Test GA integration
# Test via app /api/analytics endpoint

# 6. Delete old key in Google Cloud Console

# 7. Log rotation
echo "$(date -u +%Y-%m-%d): Rotated Google Analytics service account" >> vault/rotation_log.txt
```

---

## Automation Script

### Rotation Reminder Script

```bash
#!/usr/bin/env bash
# scripts/ops/check-secret-rotation.sh

# Check vault file ages and alert if rotation needed

ROTATION_LOG="vault/rotation_log.txt"
mkdir -p vault

for secret in vault/occ/**/*.env; do
  AGE_DAYS=$(( ($(date +%s) - $(stat -c %Y "$secret")) / 86400 ))
  
  if [ $AGE_DAYS -gt 90 ]; then
    echo "⚠️  $secret is $AGE_DAYS days old - rotation recommended"
  fi
done
```

---

## Emergency Rotation (Compromised Secrets)

**If secrets are leaked**:

1. **Immediate** (within 1 hour):
   - Rotate ALL affected secrets immediately
   - Revoke compromised credentials
   - Check logs for unauthorized access

2. **Short-term** (within 24 hours):
   - Rotate dependent secrets
   - Audit access logs
   - Document incident

3. **Follow-up** (within 1 week):
   - Review secret management practices
   - Update procedures based on lessons learned
   - Conduct security training

---

## Verification Checklist

After any rotation:

- [ ] New secret saved in vault/
- [ ] New secret set in Fly.io
- [ ] New secret set in GitHub Actions (if used)
- [ ] Old secret documented (for rollback if needed)
- [ ] Apps restarted successfully
- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] Old secret revoked (after 24hr grace period)
- [ ] Rotation logged in vault/rotation_log.txt

---

## Security Best Practices

1. **Never commit secrets**: vault/ is gitignored ✅
2. **Rotate regularly**: 90-day default for most secrets
3. **Use environment vars**: Apps read from env, not files
4. **Minimize access**: Limit who can access vault/
5. **Log all rotations**: Maintain audit trail
6. **Test immediately**: Verify new secrets work before revoking old
7. **Grace period**: Keep old secrets valid for 24hr rollback window

---

## References

- Credential Index: `docs/ops/credential_index.md`
- Environment Matrix: `docs/deployment/env_matrix.md`
- Infrastructure Operations: `docs/runbooks/infrastructure_operations.md`
- Growth Audit: `docs/audits/hotdash-growth-execution-audit-2025-10-14.md`

---

**Next Review**: 2025-10-21  
**Rotation Frequency**: Quarterly audit of all secrets

