# Secrets Management Policy

## Overview

This document defines the policy and procedures for managing secrets (API keys, tokens, passwords, certificates) in the HotDash application.

## Core Principles

1. **Never commit secrets to version control**
2. **Use environment-specific secret stores**
3. **Rotate secrets regularly**
4. **Audit secret access**
5. **Minimize secret scope and lifetime**

## Secret Storage Locations

### GitHub Secrets (CI/CD)

**Purpose:** Secrets used in GitHub Actions workflows

**How to add:**
```bash
# Via GitHub UI
Settings → Secrets and variables → Actions → New repository secret

# Via GitHub CLI
gh secret set SECRET_NAME
```

**Current secrets:**
- `FLY_API_TOKEN` - Fly.io deployment token
- Additional secrets as needed per environment

### Fly.io Secrets (Runtime)

**Purpose:** Secrets used by the application at runtime

**How to add:**
```bash
# Staging
fly secrets set SECRET_NAME=value -a hotdash-staging

# Production
fly secrets set SECRET_NAME=value -a hotdash-production
```

**Current secrets:**
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOP_DOMAIN`
- `SHOPIFY_APP_URL`
- `SCOPES`
- `DATABASE_URL`
- `SESSION_SECRET`
- `CHATWOOT_ACCESS_TOKEN`
- `CHATWOOT_ACCOUNT_ID`
- `CHATWOOT_BASE_URL`
- `GA_PROPERTY_ID`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- `GA_MODE`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

### Local Development

**Purpose:** Secrets for local development

**How to use:**
```bash
# Create .env.local (gitignored)
cp .env.example .env.local

# Edit with your local secrets
nano .env.local

# Load in shell
export $(grep -v '^#' .env.local | xargs)
```

**Never commit `.env.local` or any `.env*` files with real secrets**

## Secret Rotation Schedule

| Secret Type | Rotation Frequency | Owner |
|-------------|-------------------|-------|
| API Keys | Every 90 days | DevOps |
| Database Passwords | Every 90 days | DevOps |
| Session Secrets | Every 180 days | DevOps |
| Service Tokens | Every 90 days | DevOps |
| Certificates | Before expiry | DevOps |

## Secret Rotation Procedure

### 1. Generate New Secret

```bash
# Example: Generate new session secret
openssl rand -base64 32
```

### 2. Update in Secret Store

```bash
# GitHub Secrets
gh secret set SESSION_SECRET

# Fly.io Secrets (staging first)
fly secrets set SESSION_SECRET=<new-value> -a hotdash-staging

# Verify staging works
curl https://hotdash-staging.fly.dev/health

# Then production
fly secrets set SESSION_SECRET=<new-value> -a hotdash-production
```

### 3. Verify Application

- Check health endpoints
- Verify authentication works
- Check logs for errors

### 4. Document Rotation

Update rotation log:
```bash
echo "$(date -u +"%Y-%m-%d"): Rotated SESSION_SECRET" >> docs/runbooks/secret_rotation_log.md
```

### 5. Revoke Old Secret

If applicable, revoke the old secret in the source system (e.g., API provider dashboard)

## Secret Detection & Prevention

### Gitleaks (Pre-commit)

**Setup:**
```bash
# Install Gitleaks
brew install gitleaks  # macOS
# or download from https://github.com/gitleaks/gitleaks/releases

# Run before commit
gitleaks detect --source . --redact
```

### GitHub Push Protection

**Status:** ENABLED (required)

**What it does:**
- Scans commits for secrets before push
- Blocks push if secrets detected
- Prevents accidental exposure

**If triggered:**
1. DO NOT force push
2. Remove the secret from code
3. Rotate the credential immediately
4. Purge from git history if needed
5. Re-scan before pushing

### CI Secret Scanning

**Workflow:** `.github/workflows/gitleaks.yml`

**Runs on:**
- Every push
- Every pull request

**Action on detection:**
- Fails the build
- Creates security alert
- Blocks merge

## Secret Access Audit

### Who Has Access

| Secret | Access Level | Users/Services |
|--------|-------------|----------------|
| GitHub Secrets | Admin | Repository admins |
| Fly.io Secrets | Deploy | GitHub Actions (via FLY_API_TOKEN) |
| Production Secrets | Runtime | Production app only |
| Staging Secrets | Runtime | Staging app only |

### Audit Log

All secret access is logged:
- GitHub: Settings → Security → Audit log
- Fly.io: `fly logs -a <app-name>`

## Incident Response

### If Secret Exposed

**IMMEDIATE (< 15 minutes):**
1. Rotate the secret immediately
2. Revoke old secret in source system
3. Check access logs for unauthorized use
4. Update in all secret stores

**FOLLOW-UP (< 24 hours):**
1. Investigate how exposure occurred
2. Update prevention measures
3. Document incident
4. Review and improve processes

### If Secret Suspected Compromised

1. Rotate immediately (don't wait for confirmation)
2. Review access logs
3. Monitor for suspicious activity
4. Document investigation

## Best Practices

### ✅ DO

- Use environment variables for all secrets
- Store in GitHub Secrets for CI/CD
- Store in Fly.io Secrets for runtime
- Use `.env.local` for local dev (gitignored)
- Rotate regularly (every 90 days)
- Use minimal required permissions
- Document rotation in logs
- Run Gitleaks before every commit
- Enable push protection and secret scanning

### ❌ DON'T

- Hardcode secrets in any file
- Commit `.env*` files with real secrets
- Share secrets in chat/email/Slack
- Log secret values
- Use production secrets in dev/staging
- Bypass security checks
- Disable push protection
- Ignore Gitleaks warnings
- Reuse secrets across environments

## Secret Naming Conventions

Use consistent naming:
- `<SERVICE>_API_KEY` - API keys
- `<SERVICE>_API_SECRET` - API secrets
- `<SERVICE>_TOKEN` - Access tokens
- `<SERVICE>_URL` - Service URLs
- `DATABASE_URL` - Database connection strings
- `SESSION_SECRET` - Session encryption keys

## Verification Checklist

### Before Deployment
- [ ] All secrets in proper stores (GitHub/Fly)
- [ ] No secrets in code or config files
- [ ] Gitleaks scan passed
- [ ] Push protection enabled
- [ ] Secret scanning enabled

### After Deployment
- [ ] Application starts successfully
- [ ] Health checks passing
- [ ] Authentication working
- [ ] No secret-related errors in logs

### Monthly Review
- [ ] Check secret rotation schedule
- [ ] Review access logs
- [ ] Verify push protection enabled
- [ ] Check for stale secrets
- [ ] Update documentation

## Emergency Contacts

- **Security Incident:** Create GitHub Issue with `security` label
- **Manager:** Check GitHub Issues for escalation
- **Fly.io Support:** https://fly.io/docs/about/support/

## References

- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- Fly.io Secrets: https://fly.io/docs/reference/secrets/
- Gitleaks: https://github.com/gitleaks/gitleaks

