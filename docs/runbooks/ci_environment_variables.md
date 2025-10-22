# CI Environment Variables

**Owner:** DevOps  
**Created:** 2025-10-20  
**Status:** Active

## Overview

This runbook documents all required environment variables for GitHub Actions CI/CD pipelines, their sources, rotation procedures, and security requirements.

## Required Variables

### GitHub Repository Secrets

| Secret Name              | Required By            | Purpose                          | Rotation             | Source                              |
| ------------------------ | ---------------------- | -------------------------------- | -------------------- | ----------------------------------- |
| `FLY_API_TOKEN`          | Deploy workflows       | Fly.io deployment authentication | 90 days              | Fly.io Dashboard → Access Tokens    |
| `OPENAI_API_KEY_STAGING` | Test workflows         | OpenAI API for test fixtures     | 180 days             | OpenAI Dashboard → API Keys         |
| `SUPABASE_SERVICE_KEY`   | Test workflows, Deploy | Supabase admin access            | Never (service role) | Supabase Dashboard → Settings → API |
| `SUPABASE_URL`           | Test workflows, Deploy | Supabase project endpoint        | Never (static)       | Supabase Dashboard → Settings → API |

### Playwright Environment Variables

| Variable                   | Default                  | Purpose                         | Set By                    |
| -------------------------- | ------------------------ | ------------------------------- | ------------------------- |
| `DISABLE_WELCOME_MODAL`    | `true`                   | Skip welcome modal in E2E tests | `.env.example`            |
| `CI`                       | `true`                   | Detect CI environment           | GitHub Actions (auto-set) |
| `PLAYWRIGHT_BROWSERS_PATH` | `~/.cache/ms-playwright` | Browser cache location          | Playwright (auto-set)     |

### Node.js Environment Variables

| Variable       | Default                     | Purpose                       | Set By                     |
| -------------- | --------------------------- | ----------------------------- | -------------------------- |
| `NODE_ENV`     | `test`                      | Test environment flag         | `package.json` scripts     |
| `NODE_OPTIONS` | `--max-old-space-size=4096` | Increase heap size for builds | `.github/workflows/ci.yml` |

## Workflow-Specific Requirements

### `ci.yml` (Main CI Pipeline)

```yaml
env:
  CI: true
  DISABLE_WELCOME_MODAL: true
  NODE_ENV: test
```

**Secrets Required:** None (uses public workflows)

### `preview-deploy.yml` (PR Preview Deployments)

```yaml
secrets:
  FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### `deploy-staging.yml` & `deploy-production.yml`

```yaml
secrets:
  FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
  SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
```

## Secret Rotation Procedures

### FLY_API_TOKEN (Every 90 Days)

1. Generate new token: `fly tokens create deploy -x 90d`
2. Update GitHub secret: Settings → Secrets and variables → Actions → `FLY_API_TOKEN`
3. Test deploy workflow: `gh workflow run deploy-staging --ref main`
4. Revoke old token: `fly tokens list` → `fly tokens revoke <token-id>`

### OPENAI_API_KEY_STAGING (Every 180 Days)

1. Generate new key: OpenAI Dashboard → API Keys → Create new secret key
2. Update GitHub secret: `OPENAI_API_KEY_STAGING`
3. Run test workflow: `gh workflow run ci --ref main`
4. Delete old key from OpenAI Dashboard

### SUPABASE_SERVICE_KEY (On Compromise Only)

**⚠️ WARNING:** Service role key rotation requires coordination with Data/Engineer

1. Generate new key: Supabase Dashboard → Settings → API → Generate new service role key
2. Update GitHub secret + Fly.io secrets (staging & production)
3. Run full test suite + staging deployment
4. Monitor for auth errors (15 minutes)
5. Document rotation in `feedback/devops/<date>.md`

## Security Requirements

### Secret Scanning (Gitleaks)

- Runs on every PR and push to `main`
- Baseline: `security/gitleaks-baseline.json`
- Config: `.gitleaks.toml`
- SARIF upload to Security tab

### Push Protection

- Enabled on repository settings
- Prevents commits with secrets
- Override requires admin approval

### Secret Access Audit

```bash
# List all secrets
gh secret list

# Check secret last updated
gh secret list --json name,updatedAt | jq '.[] | "\(.name): \(.updatedAt)"'

# Verify Fly.io token
fly tokens list

# Verify Supabase connection
curl "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_SERVICE_KEY"
```

## Troubleshooting

### Deployment Fails: "Unauthorized"

**Cause:** `FLY_API_TOKEN` expired or invalid  
**Fix:** Rotate token per procedure above

### Tests Fail: "OPENAI_API_KEY not found"

**Cause:** Missing or incorrect `OPENAI_API_KEY_STAGING`  
**Fix:** Verify secret exists and has correct value

### E2E Tests Fail: "Modal blocking interactions"

**Cause:** `DISABLE_WELCOME_MODAL` not set  
**Fix:** Add to workflow env vars:

```yaml
env:
  DISABLE_WELCOME_MODAL: true
```

## Related Documents

- Secret Audit Report: `docs/runbooks/secrets_audit_report.md`
- Drift Checklist: `docs/runbooks/drift_checklist.md`
- Manager Startup Checklist: `docs/runbooks/manager_startup_checklist.md`

## Change Log

- 2025-10-20: Initial documentation (DevOps Agent)
