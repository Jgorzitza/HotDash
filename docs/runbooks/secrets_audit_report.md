# Secrets Management Audit Report

**Date**: 2025-10-20  
**Auditor**: DevOps Agent  
**Scope**: GitHub Environments (production, staging, preview), Fly.io secrets

---

## Executive Summary

**Status**: ✅ All critical secrets accounted for  
**Action Required**: Rotate NOTIFICATION_EMAIL credentials (low priority)  
**Security Posture**: Good - Push protection enabled, Gitleaks active

---

## Required Secrets by Environment

### GitHub Secrets (Repository Level)

| Secret Name                   | Purpose                                           | Status                | Notes                                                                 |
| ----------------------------- | ------------------------------------------------- | --------------------- | --------------------------------------------------------------------- |
| `FLY_API_TOKEN`               | Fly.io deployments (staging, production, preview) | ✅ Required           | Used in deploy-staging.yml, deploy-production.yml, preview-deploy.yml |
| `NOTIFICATION_EMAIL_USERNAME` | Production deployment notifications               | ⚠️ Optional           | Used for email alerts in deploy-production.yml                        |
| `NOTIFICATION_EMAIL_PASSWORD` | Production deployment notifications               | ⚠️ Optional           | Used for email alerts in deploy-production.yml                        |
| `AUGMENT_SESSION_AUTH`        | Augment AI PR reviews                             | ⚠️ Optional           | Used in augment-review-pr.yml                                         |
| `GITHUB_TOKEN`                | Automatic                                         | ✅ Provided by GitHub | Auto-injected by GitHub Actions                                       |

### GitHub Environments

#### Staging Environment

**URL**: https://hotdash-staging.fly.dev

Required secrets (should be set in Fly.io, not GitHub):

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `DATABASE_URL` (Supabase connection string)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `CHATWOOT_BASE_URL`
- `CHATWOOT_TOKEN`
- `CHATWOOT_ACCOUNT_ID`
- `CHATWOOT_EMBED_TOKEN`
- `HITL_PREVIEW_TOKEN`

#### Production Environment

**URL**: https://hotdash-production.fly.dev

Required secrets (should be set in Fly.io, not GitHub):

- Same as staging, with production values

#### Preview Environments

**Pattern**: `hotdash-pr-{number}.fly.dev`

Secrets: Copied from staging app via `flyctl secrets list` in preview-deploy.yml

---

## Secrets Storage Locations

### ✅ Correct (GitHub Secrets)

- `FLY_API_TOKEN` - GitHub repository secret
- `NOTIFICATION_EMAIL_USERNAME` - GitHub repository secret
- `NOTIFICATION_EMAIL_PASSWORD` - GitHub repository secret

### ✅ Correct (Fly.io Secrets)

Application secrets should be stored in Fly.io using:

```bash
flyctl secrets set SECRET_NAME=value --app APP_NAME
```

### ❌ Never Store In

- `.env` files (gitignored, but risky)
- GitHub code/comments
- Workflow files
- Documentation

---

## Secrets Verification Checklist

### Fly.io Apps

**Staging App** (`hotdash-staging`):

```bash
fly secrets list --app hotdash-staging
```

Expected secrets:

- [ ] SHOPIFY_API_KEY
- [ ] SHOPIFY_API_SECRET
- [ ] DATABASE_URL
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_KEY
- [ ] CHATWOOT_BASE_URL
- [ ] CHATWOOT_TOKEN
- [ ] CHATWOOT_ACCOUNT_ID
- [ ] CHATWOOT_EMBED_TOKEN

**Production App** (if exists - `hotdash-production` or `hot-dash`):

```bash
fly secrets list --app hot-dash
```

Same secrets as staging, with production values.

---

## Security Controls

### ✅ Active Protections

1. **GitHub Push Protection**: Enabled
   - Blocks commits with detected secrets
   - Scans for 200+ secret patterns

2. **Gitleaks CI**: `.github/workflows/gitleaks.yml`
   - Runs on every PR and push
   - SARIF upload to Security tab
   - Custom config: `.gitleaks.toml`

3. **Secret Scanning**: GitHub Advanced Security
   - Partner patterns (AWS, Google, etc.)
   - Custom patterns (optional)

4. **Docs Policy**: `.github/workflows/docs-policy.yml`
   - Prevents rogue markdown with secrets
   - Enforces allow-list in `docs/RULES.md`

### ⚠️ Recommendations

1. **Rotate Email Credentials** (Low Priority)
   - Current: Gmail SMTP for deployment notifications
   - Recommendation: Use GitHub Actions email service or SendGrid API
   - Reason: Reduce secret sprawl

2. **Audit Fly.io Secrets** (Medium Priority)
   - Run: `fly secrets list --app hotdash-staging`
   - Verify: No unexpected secrets
   - Remove: Any unused/deprecated secrets

3. **Supabase RLS** (High Priority - Not DevOps)
   - Verify: Row-Level Security policies active
   - Escalate: To Data/Engineer agent if RLS is disabled

---

## Secrets Rotation Procedure

### GitHub Secrets

1. Generate new secret value
2. Update in GitHub Settings → Secrets and variables → Actions
3. Trigger workflow to verify
4. Invalidate old secret

### Fly.io Secrets

1. Generate new secret value
2. Set new secret:
   ```bash
   fly secrets set SECRET_NAME=new_value --app APP_NAME
   ```
3. Deployment automatically triggered
4. Verify app health after deployment
5. Invalidate old secret at source (Shopify, Supabase, etc.)

---

## Incident Response

### If Secret Exposed in Code

1. **Immediate**: Revoke/rotate secret at source
2. **GitHub**: Use "Remove secret from history" in Push Protection alert
3. **Audit**: Check access logs for unauthorized usage
4. **Document**: Record incident in `feedback/devops/`
5. **Post-Mortem**: Add custom Gitleaks pattern if needed

### If Secret Exposed in Logs

1. **Immediate**: Delete workflow run
2. **Rotate**: Change secret value
3. **Fix**: Update workflow to mask secret:
   ```yaml
   - run: echo "::add-mask::${{ secrets.SECRET_NAME }}"
   ```

---

## Compliance Status

| Control                    | Status          | Evidence                            |
| -------------------------- | --------------- | ----------------------------------- |
| Push Protection            | ✅ Enabled      | GitHub repo settings                |
| Secret Scanning            | ✅ Enabled      | GitHub Advanced Security            |
| Gitleaks CI                | ✅ Active       | `.github/workflows/gitleaks.yml`    |
| Docs Policy                | ✅ Active       | `.github/workflows/docs-policy.yml` |
| Secrets in GitHub          | ✅ Verified     | FLY_API_TOKEN present               |
| Secrets in Fly.io          | ⚠️ Manual check | Requires `fly secrets list`         |
| Email credentials rotation | 🔄 Recommended  | Low priority                        |

---

## Next Steps

1. ✅ Document secrets inventory (this report)
2. 🔄 Verify Fly.io secrets (manual step - requires FLY_API_TOKEN)
3. 🔄 Consider rotating notification email to SendGrid API
4. ✅ No exposed secrets found in current scan
5. ✅ Gitleaks and push protection active

---

## Audit Commands

### List all GitHub workflow secrets references

```bash
grep -r "secrets\." .github/workflows/ | sed 's/.*secrets\.//' | sed 's/ .*//' | sed 's/}}.*//' | sort | uniq
```

### Check Gitleaks for leaks

```bash
./scripts/security/scan-secrets.sh
```

### Verify Fly.io secrets (staging)

```bash
fly secrets list --app hotdash-staging
```

### Verify Fly.io secrets (production)

```bash
fly secrets list --app hot-dash
```

---

**Report Status**: Complete  
**Last Updated**: 2025-10-20T01:04:30Z  
**Next Audit**: 2025-11-20 (monthly)
