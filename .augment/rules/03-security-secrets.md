---
description: Security practices, secrets management, and Gitleaks enforcement
globs:
  - "**/*"
  - "!vault/**"
  - "!.env*"
alwaysApply: true
---

# Security & Secrets Management

**Source:** `docs/RULES.md`, `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

## Core Security Principle

**NO SECRETS IN CODE OR DOCS - EVER**

## Secret Storage Locations

### ✅ ALLOWED

1. **GitHub Environments/Secrets**
   - Primary storage for CI/CD secrets
   - Access via GitHub Actions
   - Never exposed in logs

2. **Local Vault**
   - Path: `vault/` (gitignored)
   - For local development credentials
   - Never committed to repository

3. **Fly.io Secrets**
   - For deployment secrets
   - Set via `fly secrets set`
   - Never in fly.toml or code

4. **Environment Variables**
   - `.env.local` (gitignored)
   - Load with `export $(grep -v '^#' .env.local | xargs)`
   - Never commit `.env*` files

### ❌ FORBIDDEN

- ❌ Hardcoded in source code
- ❌ Committed in configuration files
- ❌ In documentation or comments
- ❌ In git history (even if later removed)
- ❌ In log files or error messages
- ❌ In PR descriptions or Issue comments

## GitHub Security Features

### Push Protection (REQUIRED)

**Status:** MUST be enabled at all times

**Check:** Settings → Code security & analysis → Push protection

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

### Secret Scanning (REQUIRED)

**Status:** MUST be enabled at all times

**Check:** Settings → Code security & analysis → Secret scanning

**What it does:**
- Continuously scans repository for secrets
- Alerts on detected credentials
- Integrates with Security tab

**If alert triggered:**
1. Rotate the credential immediately
2. Remove from code/history
3. Update in proper secret store
4. Close alert after verification

## Gitleaks (CI Enforcement)

### What is Gitleaks?

Automated secret detection that runs on:
- Every PR
- Every push to main
- Local development (recommended)

### Running Locally

```bash
# Before committing
gitleaks detect --source . --redact

# Expected output
✅ No leaks detected
```

### CI Integration

- Runs automatically on all PRs
- SARIF results uploaded to Security tab
- PR blocked if secrets detected

### If Gitleaks Fails

**DO NOT MERGE THE PR**

1. Identify the detected secret
2. Remove from code immediately
3. Rotate the credential
4. Update in proper secret store
5. Purge from git history if committed
6. Re-run Gitleaks
7. Only merge when clean

## Secret Rotation

### When to Rotate

- ✅ Immediately if exposed in code/logs
- ✅ Immediately if in git history
- ✅ Immediately if in PR/Issue
- ✅ Regularly (every 90 days minimum)
- ✅ When team member leaves
- ✅ If suspicious activity detected

### How to Rotate

1. **Generate new credential** in service (GitHub, Supabase, etc.)
2. **Update in secret store** (GitHub Secrets, Vault, Fly)
3. **Test with new credential** in dev environment
4. **Deploy to production** (if applicable)
5. **Revoke old credential** in service
6. **Verify old credential no longer works**
7. **Document rotation** in security log

## Service-Specific Guidelines

### GitHub Personal Access Tokens

- **Storage:** GitHub Secrets or `~/.cursor/mcp.json` (local only)
- **Scope:** Minimal required permissions
- **Rotation:** Every 90 days
- **Never:** In code, docs, or git history

### Supabase Access Tokens

- **Storage:** GitHub Secrets or `.env.local`
- **Type:** Service role key for backend, anon key for frontend
- **Rotation:** Every 90 days or on exposure
- **Never:** In client-side code (use anon key only)

### Shopify API Credentials

- **Storage:** GitHub Secrets or `.env.local`
- **Type:** App credentials from Partner Dashboard
- **Rotation:** On exposure or team change
- **Never:** In repository or logs

### Google Analytics Service Account

- **Storage:** `vault/occ/google/analytics-service-account.json` (gitignored)
- **Type:** Service account JSON key
- **Rotation:** Every 90 days
- **Never:** In repository or shared publicly

### Fly.io Auth Token

- **Storage:** `~/.fly/config.yml` (local) or GitHub Secrets (CI)
- **Type:** Personal auth token
- **Rotation:** Every 90 days
- **Never:** In code or fly.toml

## Environment Variables

### Local Development

**File:** `.env.local` (MUST be gitignored)

```bash
# Example structure (never commit actual values)
SHOPIFY_API_KEY=your_key_here
SHOPIFY_API_SECRET=your_secret_here
SUPABASE_URL=your_url_here
SUPABASE_ANON_KEY=your_key_here
```

**Loading:**
```bash
export $(grep -v '^#' .env.local | xargs)
```

### CI/CD

**Storage:** GitHub Environments/Secrets

**Access:** Via `${{ secrets.SECRET_NAME }}` in workflows

**Never:** Echo or log secret values

## Verification Checklist

### Before Every Commit

- [ ] Run `gitleaks detect --source . --redact`
- [ ] Check no secrets in changed files
- [ ] Verify `.env*` files are gitignored
- [ ] Confirm vault/ is gitignored

### Before Every PR

- [ ] Gitleaks CI check passes
- [ ] No secrets in PR description
- [ ] No secrets in code comments
- [ ] Environment variables properly referenced

### Daily (Manager Startup)

- [ ] Push protection enabled
- [ ] Secret scanning enabled
- [ ] Gitleaks green on main
- [ ] No open secret incidents
- [ ] All secrets in proper stores

## Incident Response

### If Secret Exposed

**IMMEDIATE ACTIONS (within 15 minutes):**

1. **Rotate the credential** in the service
2. **Revoke old credential** immediately
3. **Remove from code** if present
4. **Purge from git history** if committed
5. **Update in secret store** with new credential
6. **Notify team** of rotation
7. **Document incident** in security log

**FOLLOW-UP (within 24 hours):**

1. Review access logs for unauthorized use
2. Verify new credential works
3. Confirm old credential revoked
4. Update documentation
5. Add to incident log
6. Review prevention measures

### Git History Purging

If secret was committed:

```bash
# Use git-filter-repo or BFG Repo-Cleaner
# DO NOT use git filter-branch (deprecated)

# Example with git-filter-repo
git filter-repo --path-glob '*secret*' --invert-paths

# Force push (coordinate with team)
git push --force-with-lease
```

**WARNING:** This rewrites history. Coordinate with all team members.

## Stop the Line Triggers

**STOP ALL WORK if:**

- ❌ Secret detected in code (local or CI)
- ❌ Push protection disabled
- ❌ Secret scanning disabled
- ❌ Gitleaks failing on main
- ❌ Open secret incident unresolved

**Action:** Resolve immediately before any other work

## Best Practices

### ✅ DO

- Use environment variables for all secrets
- Store in GitHub Secrets for CI/CD
- Use `.env.local` for local dev (gitignored)
- Rotate regularly (every 90 days)
- Use minimal required permissions
- Document rotation in security log
- Run Gitleaks before every commit
- Enable push protection and secret scanning

### ❌ DON'T

- Hardcode secrets in any file
- Commit `.env*` files
- Share secrets in chat/email
- Log secret values
- Use production secrets in dev
- Bypass security checks
- Disable push protection
- Ignore Gitleaks warnings

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

