# CI/CD Pipeline Documentation

**Created**: 2025-10-19  
**Owner**: DevOps  
**Molecule**: D-016  
**Purpose**: Complete CI/CD pipeline documentation and troubleshooting

## Pipeline Overview

**Total Workflows**: 17 active workflows  
**Primary CI**: `.github/workflows/ci.yml`  
**Deploy**: Production and Staging workflows  
**Security**: Gitleaks, Secret Scanning, Danger

## Workflow Inventory

| Workflow                 | File                         | Triggers             | Purpose              | Status                |
| ------------------------ | ---------------------------- | -------------------- | -------------------- | --------------------- |
| CI                       | ci.yml                       | push, PR             | Build, test, lint    | ⚠️ Failing (lockfile) |
| Deploy to Production     | deploy-production.yml        | workflow_dispatch    | Production deploy    | Active                |
| Deploy to Staging        | deploy-staging.yml           | workflow_dispatch    | Staging deploy       | Active                |
| Gitleaks                 | gitleaks.yml                 | push, PR, daily cron | Secrets scan         | Active                |
| Secret Scanning          | secret-scanning.yml          | push, PR             | GitHub secret scan   | Active                |
| Docs Policy              | docs-policy.yml              | push, PR             | Markdown allow-list  | Active                |
| Validate AI Agent Config | validate-ai-config.yml       | push, PR             | AI config validation | Active                |
| Danger                   | danger.yml                   | PR                   | PR validation        | Active                |
| Rollback Staging         | rollback-staging.yml         | workflow_dispatch    | Staging rollback     | Active                |
| Rollback Production      | rollback-production.yml      | workflow_dispatch    | Production rollback  | Active                |
| Manager Batch Guardrails | manager-batch-guardrails.yml | push                 | Manager validation   | Active                |
| Preview Docs             | preview-docs.yml             | PR                   | Docs preview         | Active                |
| Pull Request Review      | pr-review.yml                | PR                   | Automated PR review  | Active                |
| Manager Keepalive        | manager-keepalive.yml        | schedule             | Manager health       | Active                |
| pilot-dev-guards         | pilot-dev-guards.yml         | push, PR             | Pilot guards         | Active                |
| guard-mcp                | guard-mcp.yml                | push, PR             | MCP guards           | Active                |
| idle-guard               | idle-guard.yml               | push, PR             | Idle detection       | Active                |

## CI Workflow (ci.yml)

### Triggers

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

### Jobs

#### build-test

**Purpose**: Build application, run tests, linting  
**Runs on**: ubuntu-latest  
**Steps**:

1. Checkout code (full history)
2. Setup Node.js 20 with npm cache
3. Install dependencies (`npm ci`)
4. Detect changed files
5. Compute test globs
6. Run format check (`npm run fmt`)
7. Run lint (`npm run lint`)
8. Run targeted tests (affected files or full suite)
9. Upload test results (JUnit XML)

**Known Issue**: Fails on "Use Node.js 20" step  
**Root Cause**: `package-lock.json` in `.gitignore`  
**Fix**: Remove from `.gitignore`, commit lockfile  
**Status**: Proposed fix in `artifacts/devops/2025-10-19/CI_STATUS_REPORT.md`

#### manager-outcome

**Purpose**: Verify manager produced PR or escalation  
**Depends on**: build-test  
**Runs on**: ubuntu-latest  
**Steps**:

1. Checkout code
2. Run `scripts/manager/assert-outcome.sh`

**Status**: Skipped (build-test dependency failed)

### Environment Variables Required

```yaml
env:
  NODE_VERSION: 20
  # From secrets:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
  SHOPIFY_API_KEY: ${{ secrets.SHOPIFY_API_KEY }}
  # ... see docs/runbooks/required_env_vars.md
```

## Deploy Workflows

### deploy-production.yml

**Trigger**: Manual (`workflow_dispatch`)  
**Target**: Production environment (Fly.io)

**Steps**:

1. Checkout code at specified ref
2. Setup Node.js
3. Install dependencies
4. Run tests (`npm run test:ci`)
5. Build application
6. Deploy to Fly.io production app
7. Run smoke tests
8. Verify health endpoints

**Secrets Required**:

- `FLY_API_TOKEN` - Fly.io deployment token
- All application secrets

**Rollback**: Use `rollback-production.yml`

### deploy-staging.yml

**Trigger**: Automatic on main branch merge, or manual  
**Target**: Staging environment

**Similar to production** but:

- Different Fly.io app name
- Mock data enabled
- Less strict health checks
- Faster deployment (parallel instances)

## Security Workflows

### gitleaks.yml

**Schedule**: Daily at 00:00 UTC + push/PR  
**Purpose**: Detect secrets in code

**Steps**:

1. Checkout full history
2. Install Gitleaks v8.18.4
3. Run scan with baseline
4. Upload SARIF to GitHub Security

**Configuration**: `.gitleaks.toml`  
**Baseline**: `security/gitleaks-baseline.json`

**Documentation**: `docs/runbooks/secrets_scanning.md`

### danger.yml

**Trigger**: Pull requests  
**Purpose**: PR validation and checks

**Checks**:

- Issue linkage (`Fixes #123` in body)
- Definition of Done present
- Allowed paths validation
- HITL configuration for AI agents
- File size limits
- Commit message format

**Fails if**: Required checks don't pass

## Policy Workflows

### docs-policy.yml

**Trigger**: Push, PR  
**Purpose**: Enforce markdown allow-list

**Command**: `node scripts/policy/check-docs.mjs`

**Allowed Patterns**:

- `README.md`
- `docs/NORTH_STAR.md`
- `docs/directions/*.md`
- `feedback/*/*.md`
- `docs/runbooks/*.md`
- etc. (see `RULES.md`)

**Fails if**: Disallowed `.md` files present

### validate-ai-config.yml

**Trigger**: Push, PR  
**Purpose**: Validate AI agent configurations

**Command**: `node scripts/policy/check-ai-config.mjs`

**Validates**:

- `human_review: true` for customer-facing agents
- Reviewer configuration present
- Review queue defined
- Grading requirements

## Troubleshooting Guide

### Common Failures

#### 1. "Dependencies lock file is not found"

**Error**:

```
Dependencies lock file is not found in /home/runner/work/HotDash/HotDash.
Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

**Cause**: `package-lock.json` in `.gitignore`  
**Fix**:

```bash
sed -i '/^package-lock\.json$/d' .gitignore
git add package-lock.json .gitignore
git commit -m "fix(ci): track package-lock.json"
```

#### 2. "npm ci" fails

**Error**: `npm ERR! The `npm ci` command can only install with an existing package-lock.json`

**Cause**: Missing or corrupted lockfile  
**Fix**:

```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "chore: regenerate package-lock.json"
```

#### 3. Tests fail in CI but pass locally

**Possible causes**:

- Environment variables missing in CI
- Different Node version
- Timezone differences
- File path issues (case sensitivity)

**Debug**:

```bash
# Check Node version matches
node --version  # Local
# vs CI log

# Run tests with same env as CI
unset $(env | grep -v '^PATH' | cut -d= -f1)
npm run test:ci
```

#### 4. Gitleaks false positives

**Error**: New secrets detected (but they're not real secrets)

**Fix**: Update baseline or allowlist

```bash
# Add to allowlist in .gitleaks.toml
[allowlist]
paths = ["path/to/file.js"]

# OR update baseline
gitleaks detect --source . --report-format json \
  --report-path security/gitleaks-baseline.json
```

#### 5. Deploy timeout

**Error**: Workflow times out after 60 minutes

**Causes**:

- Large build taking too long
- Fly.io deploy stuck
- Health checks failing

**Fix**:

```bash
# Check Fly.io status
fly status -a hotdash-app

# View logs
fly logs -a hotdash-app

# Cancel stuck deploy
gh run cancel <run-id>

# Retry deploy
gh workflow run deploy-production --ref main
```

## Workflow Dependencies

```
CI Workflow:
  build-test
    ├─> manager-outcome (depends on build-test)

Deploy Production:
  (manual trigger)
    ├─> Run CI checks
    ├─> Build
    ├─> Deploy
    └─> Smoke tests

Gitleaks:
  (independent, runs on schedule + push/PR)
```

## Secrets Management

### Required GitHub Secrets

**Application**:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `OPENAI_API_KEY`
- `DATABASE_URL`

**Deployment**:

- `FLY_API_TOKEN`

**MCP (Pending)**:

- `SUPABASE_ACCESS_TOKEN`
- `GITHUB_MCP_TOKEN`

**Testing**:

- `DISABLE_WELCOME_MODAL=true`

### Update Secrets

```bash
# Via GitHub CLI
gh secret set SECRET_NAME -b "secret-value"

# Via GitHub UI
# Repository → Settings → Secrets and variables → Actions → New repository secret
```

## Monitoring CI Health

### Metrics to Track

1. **Success Rate**: Target >95%
2. **Build Time**: Target <10 minutes
3. **Test Time**: Target <5 minutes
4. **Deploy Time**: Target <15 minutes

### Check CI Status

```bash
# Latest runs
gh run list --limit 10

# Specific workflow
gh run list --workflow=ci --limit 5

# View specific run
gh run view <run-id>

# Watch running workflow
gh run watch
```

## Optimization Tips

### Speed Up CI

1. **Cache dependencies**:

   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: npm # Requires lockfile!
   ```

2. **Run tests in parallel**:

   ```yaml
   strategy:
     matrix:
       shard: [1, 2, 3, 4]
   ```

3. **Skip unnecessary steps**:

   ```yaml
   - name: Run tests
     if: github.event_name != 'schedule'
   ```

4. **Use targeted tests** (already implemented):
   - Changed files detection
   - Computed test globs
   - Run only affected tests

### Reduce False Positives

1. **Gitleaks**: Maintain baseline
2. **Linter**: Fix gradually, use `// eslint-disable-next-line`
3. **Danger**: Update rules in `Dangerfile.js`

## Related Documentation

- Secrets: `docs/runbooks/required_env_vars.md`
- Deployment: `docs/runbooks/production_deploy.md`
- Policy Scripts: `docs/runbooks/policy_scripts.md`
- Backup/Recovery: `docs/runbooks/backup_recovery.md`
