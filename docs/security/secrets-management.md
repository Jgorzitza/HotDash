# Secrets Management

**Task:** SECURITY-AUDIT-003  
**Status:** Implemented  
**Last Updated:** 2025-01-24

## Overview

HotDash uses a comprehensive secrets management system to securely handle credentials, API keys, and sensitive configuration. All secrets are stored in environment variables and never committed to version control.

## Secret Storage Locations

### ✅ Approved Storage

1. **Environment Variables** (`.env.local`, `.env`)
   - Local development only
   - MUST be in `.gitignore`
   - Never commit to repository

2. **GitHub Secrets**
   - Production credentials
   - CI/CD workflows
   - Access via `${{ secrets.SECRET_NAME }}`

3. **Fly.io Secrets**
   - Production deployment
   - Set via `fly secrets set`
   - Never in `fly.toml`

4. **Local Vault** (`vault/`)
   - Service account JSON files
   - Development credentials
   - Gitignored directory

### ❌ Never Store Secrets In

- Source code files
- Configuration files committed to git
- Documentation
- Comments
- Log files
- Error messages
- PR descriptions or Issue comments

## Secret Categories

### Shopify (Required)

| Secret | Description | Rotation | Required |
|--------|-------------|----------|----------|
| `SHOPIFY_API_KEY` | Partner app API key | 90 days | Yes |
| `SHOPIFY_API_SECRET` | Partner app secret | 90 days | Yes |
| `SHOPIFY_APP_URL` | App URL (https://...) | Never | Yes |
| `SHOPIFY_SHOP_DOMAIN` | Store domain | Never | Yes |
| `SCOPES` | API permissions | Never | Yes |

### Database (Required)

| Secret | Description | Rotation | Required |
|--------|-------------|----------|----------|
| `SUPABASE_URL` | Supabase project URL | Never | Yes |
| `SUPABASE_SERVICE_KEY` | Service role key | 90 days | Yes |
| `SUPABASE_ANON_KEY` | Anonymous key (RLS) | 90 days | No |
| `DATABASE_URL` | Direct DB connection | 90 days | No |

### Chatwoot (Required)

| Secret | Description | Rotation | Required |
|--------|-------------|----------|----------|
| `CHATWOOT_BASE_URL` | Instance URL | Never | Yes |
| `CHATWOOT_TOKEN` | API access token | 90 days | Yes |
| `CHATWOOT_ACCOUNT_ID` | Account ID | Never | Yes |
| `CHATWOOT_SLA_MINUTES` | SLA threshold | Never | No |
| `CHATWOOT_EMBED_TOKEN` | Widget token | 90 days | No |

### Analytics (Optional)

| Secret | Description | Rotation | Required |
|--------|-------------|----------|----------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Service account path | 90 days | No |
| `GA_MCP_PROJECT_ID` | GA project ID | Never | No |
| `GA_MCP_PROPERTY_ID` | GA property ID | Never | No |

### Social Media (Optional)

| Secret | Description | Rotation | Required |
|--------|-------------|----------|----------|
| `META_APP_ID` | Facebook/Instagram app ID | 90 days | No |
| `META_APP_SECRET` | Facebook/Instagram secret | 90 days | No |
| `TIKTOK_CLIENT_KEY` | TikTok client key | 90 days | No |
| `TIKTOK_CLIENT_SECRET` | TikTok client secret | 90 days | No |

### Communication (Optional)

| Secret | Description | Rotation | Required |
|--------|-------------|----------|----------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID | 90 days | No |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | 90 days | No |
| `TWILIO_NUMBER` | Twilio phone number | Never | No |

## Secrets Manager Service

### Usage

```typescript
import { getSecretsManager, getSecret, getRequiredSecret } from '~/services/security/secrets-manager';

// Get optional secret
const apiKey = getSecret('OPTIONAL_API_KEY');

// Get required secret (throws if missing)
const dbUrl = getRequiredSecret('SUPABASE_URL');

// Validate category
const manager = getSecretsManager();
const { isValid, errors } = manager.validateCategory(SecretCategory.SHOPIFY);

// Get audit report
const report = manager.getAuditReport();
console.log(`Secrets: ${report.present}/${report.total} present`);

// Check rotation needs
const needsRotation = manager.getSecretsNeedingRotation();
```

### Validation

The secrets manager validates:
- ✅ Required secrets are present
- ✅ URLs are valid format
- ✅ Shopify domains end with `.myshopify.com`
- ✅ Numeric values are valid numbers
- ✅ Secrets match expected patterns

## Secret Rotation Procedures

### When to Rotate

- ✅ Every 90 days (scheduled)
- ✅ Immediately if exposed in code/logs
- ✅ Immediately if in git history
- ✅ When team member leaves
- ✅ If suspicious activity detected
- ✅ After security incident

### How to Rotate

#### 1. Shopify API Credentials

```bash
# 1. Generate new credentials in Shopify Partners
# 2. Update in GitHub Secrets
gh secret set SHOPIFY_API_KEY --body "new_key"
gh secret set SHOPIFY_API_SECRET --body "new_secret"

# 3. Update in Fly.io
fly secrets set SHOPIFY_API_KEY=new_key SHOPIFY_API_SECRET=new_secret

# 4. Update local .env.local
# Edit .env.local manually

# 5. Test with new credentials
npm run dev:vite

# 6. Verify old credentials no longer work
```

#### 2. Supabase Keys

```bash
# 1. Generate new service role key in Supabase dashboard
# 2. Update in GitHub Secrets
gh secret set SUPABASE_SERVICE_KEY --body "new_key"

# 3. Update in Fly.io
fly secrets set SUPABASE_SERVICE_KEY=new_key

# 4. Update local .env.local
# Edit .env.local manually

# 5. Test connection
npx tsx scripts/test/test-supabase-connection.ts

# 6. Revoke old key in Supabase dashboard
```

#### 3. Chatwoot Token

```bash
# 1. Generate new access token in Chatwoot
# 2. Update in GitHub Secrets
gh secret set CHATWOOT_TOKEN --body "new_token"

# 3. Update in Fly.io
fly secrets set CHATWOOT_TOKEN=new_token

# 4. Update local .env.local
# Edit .env.local manually

# 5. Test API access
curl -H "api_access_token: new_token" https://chatwoot.hotrodan.com/api/v1/accounts/1

# 6. Revoke old token in Chatwoot
```

### Rotation Checklist

- [ ] Generate new credential in service
- [ ] Update in GitHub Secrets
- [ ] Update in Fly.io Secrets
- [ ] Update in local `.env.local`
- [ ] Test with new credential
- [ ] Verify application works
- [ ] Revoke old credential
- [ ] Confirm old credential no longer works
- [ ] Document rotation date
- [ ] Update rotation tracking

## Validation Scripts

### Check All Secrets

```bash
# Validate all required secrets are present
npx tsx scripts/security/validate-secrets.ts

# Expected output:
# ✅ All required secrets present
# ✅ Shopify secrets valid
# ✅ Database secrets valid
# ✅ Chatwoot secrets valid
```

### Check Rotation Status

```bash
# Check which secrets need rotation
npx tsx scripts/security/check-rotation.ts

# Expected output:
# ⚠️ 3 secrets need rotation:
#   - SHOPIFY_API_SECRET (last rotated 95 days ago)
#   - SUPABASE_SERVICE_KEY (never rotated)
#   - CHATWOOT_TOKEN (last rotated 92 days ago)
```

### Audit Report

```bash
# Generate secrets audit report
npx tsx scripts/security/secrets-audit.ts

# Expected output:
# 📊 Secrets Audit Report
# Total: 25
# Present: 18
# Missing: 7
# Needs Rotation: 3
#
# By Category:
#   Shopify: 5/5 present
#   Database: 3/4 present
#   Chatwoot: 4/5 present
#   Analytics: 2/3 present
#   Social: 2/4 present
#   Communication: 2/4 present
```

## Security Best Practices

### ✅ DO

- Use environment variables for all secrets
- Store in GitHub Secrets for CI/CD
- Use `.env.local` for local dev (gitignored)
- Rotate regularly (every 90 days)
- Use minimal required permissions
- Document rotation in security log
- Run validation before deployment
- Enable push protection and secret scanning

### ❌ DON'T

- Hardcode secrets in any file
- Commit `.env*` files
- Share secrets in chat/email
- Log secret values
- Use production secrets in dev
- Bypass security checks
- Disable push protection
- Ignore secret scanning alerts

## Incident Response

### If Secret Exposed

**IMMEDIATE (within 15 minutes):**

1. Rotate the credential in the service
2. Revoke old credential immediately
3. Remove from code if present
4. Purge from git history if committed
5. Update in all secret stores
6. Notify team of rotation
7. Document incident

**FOLLOW-UP (within 24 hours):**

1. Review access logs for unauthorized use
2. Verify new credential works
3. Confirm old credential revoked
4. Update documentation
5. Add to incident log
6. Review prevention measures

## Monitoring

### Daily Checks

- [ ] Push protection: ON
- [ ] Secret scanning: ON
- [ ] Gitleaks: GREEN on main
- [ ] No open secret alerts
- [ ] No `.env*` files in git

### Weekly Checks

- [ ] Review secret scanning alerts
- [ ] Verify all secrets in proper stores
- [ ] Check for stale credentials
- [ ] Review access logs

### Monthly Checks

- [ ] Rotate credentials approaching 90 days
- [ ] Audit secret usage
- [ ] Review incident log
- [ ] Update security documentation

## References

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Fly.io Secrets Management](https://fly.io/docs/reference/secrets/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Shopify API Security](https://shopify.dev/docs/apps/auth/oauth)
- Task: SECURITY-AUDIT-003 in TaskAssignment table

