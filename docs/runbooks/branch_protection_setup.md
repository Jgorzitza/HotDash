# Branch Protection Setup Guide

**Purpose**: Configure GitHub branch protection rules to enforce CI checks and prevent broken code from reaching production.

**Last Updated**: 2025-10-20  
**Owner**: DevOps

---

## Required Branch Protection Rules

### Main Branch (`main`)

Navigate to: `Settings → Branches → Branch protection rules → main`

**If rule doesn't exist**: Click "Add branch protection rule" and set branch name pattern to `main`

---

## Configuration Checklist

### ✅ Require a pull request before merging

- [x] **Enabled**
- [x] Require approvals: **1**
- [ ] Dismiss stale pull request approvals when new commits are pushed
- [x] Require review from Code Owners (if CODEOWNERS file exists)
- [ ] Restrict who can dismiss pull request reviews (optional)
- [x] Allow specified actors to bypass required pull requests (Manager only)

### ✅ Require status checks to pass before merging

- [x] **Enabled**
- [x] Require branches to be up to date before merging

**Required status checks** (must all pass):

1. ✅ **lint** (from `ci.yml`)
   - Lints code with ESLint
   - Formats code with Prettier
   - Path: `.github/workflows/ci.yml` → `lint` job

2. ✅ **security** (from `ci.yml`)
   - Runs secret scanning with `scripts/security/scan-secrets.sh`
   - Path: `.github/workflows/ci.yml` → `security` job

3. ✅ **build** (from `ci.yml`)
   - Builds production application
   - Caches build artifacts
   - Path: `.github/workflows/ci.yml` → `build` job

4. ✅ **test-unit** (from `ci.yml`)
   - Runs unit tests with Vitest
   - Path: `.github/workflows/ci.yml` → `test-unit` job

5. ✅ **test-e2e** (from `ci.yml`)
   - Runs end-to-end tests with Playwright
   - Path: `.github/workflows/ci.yml` → `test-e2e` job

6. ✅ **test-a11y** (from `ci.yml`)
   - Runs accessibility tests with axe-core
   - Path: `.github/workflows/ci.yml` → `test-a11y` job

7. ✅ **test-lighthouse** (from `ci.yml`)
   - Runs Lighthouse performance tests
   - Path: `.github/workflows/ci.yml` → `test-lighthouse` job

8. ✅ **ci-complete** (from `ci.yml`)
   - Summary job that ensures all CI checks passed
   - Path: `.github/workflows/ci.yml` → `ci-complete` job

9. ✅ **Gitleaks** (from `gitleaks.yml`)
   - Scans for secrets in code
   - Path: `.github/workflows/gitleaks.yml`

10. ✅ **Docs Policy** (from `docs-policy.yml`)
    - Enforces docs allow-list
    - Path: `.github/workflows/docs-policy.yml`

11. ✅ **Danger** (from `danger.yml`)
    - Enforces PR rules (Issue linkage, DoD, Allowed paths)
    - Path: `.github/workflows/danger.yml`

12. ✅ **AI Config Validation** (from `ai-config.yml`)
    - Validates HITL AI agent configuration
    - Path: `.github/workflows/ai-config.yml`

### ✅ Require conversation resolution before merging

- [x] **Enabled**
- All review comments must be resolved before merging

### ✅ Require signed commits

- [ ] Optional (not enforced currently)
- Recommended for production repositories

### ✅ Require linear history

- [x] **Enabled**
- Prevents merge commits, requires rebase or squash

### ✅ Require deployments to succeed before merging

- [ ] Not applicable (deployments happen after merge)

### ✅ Lock branch

- [ ] **Disabled**
- Only enable for emergency freezes

### ✅ Do not allow bypassing the above settings

- [x] **Enabled**
- Exceptions: Repository admins only (for emergency fixes)

### ✅ Restrict who can push to matching branches

- [ ] Optional
- If enabled, only allow: Deployment keys, GitHub Actions

### ✅ Allow force pushes

- [ ] **Disabled** ❌
- Never allow force pushes to main

### ✅ Allow deletions

- [ ] **Disabled** ❌
- Never allow main branch deletion

---

## Verification Steps

### 1. Check Branch Protection is Active

```bash
# Using GitHub CLI (if authenticated)
gh api repos/:owner/:repo/branches/main/protection
```

Or visit: `https://github.com/OWNER/REPO/settings/branches`

### 2. Test with a PR

1. Create a test branch
2. Make a trivial change
3. Open a PR to main
4. Verify all required checks appear
5. Verify merge is blocked until checks pass

### 3. Verify Status Checks

```bash
# List all workflow runs for a commit
gh run list --commit COMMIT_SHA
```

---

## Status Check Job Names

These exact job names must be configured in branch protection:

| Job Name               | Workflow File     | Purpose                     |
| ---------------------- | ----------------- | --------------------------- |
| `lint`                 | `ci.yml`          | Code linting and formatting |
| `security`             | `ci.yml`          | Secret scanning             |
| `build`                | `ci.yml`          | Production build            |
| `test-unit`            | `ci.yml`          | Unit tests                  |
| `test-e2e`             | `ci.yml`          | End-to-end tests            |
| `test-a11y`            | `ci.yml`          | Accessibility tests         |
| `test-lighthouse`      | `ci.yml`          | Performance tests           |
| `ci-complete`          | `ci.yml`          | CI summary                  |
| `Gitleaks`             | `gitleaks.yml`    | Secret leak detection       |
| `Docs Policy`          | `docs-policy.yml` | Docs allow-list enforcement |
| `Danger`               | `danger.yml`      | PR rules enforcement        |
| `AI Config Validation` | `ai-config.yml`   | HITL config validation      |

---

## Emergency Override Procedure

**When**: Production is down and a hotfix is needed immediately

**Steps**:

1. Notify team in #engineering channel
2. Admin temporarily disables "Do not allow bypassing" setting
3. Merge hotfix PR with admin override
4. Immediately re-enable branch protection
5. Create post-mortem issue documenting:
   - What was broken
   - Why override was necessary
   - What checks were bypassed
   - Follow-up actions to prevent recurrence

**Approval Required**: CEO or Engineering Lead

---

## Maintenance

### Adding New Required Checks

1. Add new workflow to `.github/workflows/`
2. Ensure workflow runs on `pull_request` events
3. Add job name to branch protection required checks
4. Update this document

### Removing Required Checks

1. Remove from branch protection settings first
2. Archive or delete workflow file
3. Update this document
4. Announce in #engineering

---

## Monitoring

### Check Pass Rates

```bash
# Last 30 days of CI runs
gh run list --workflow=ci.yml --limit 100 | grep -c "completed success"
```

### Check Failures

```bash
# Recent failures
gh run list --workflow=ci.yml --status failure --limit 10
```

---

## Screenshot Example

**Required Status Checks Configuration**:

```
☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging

  Status checks that are required:
    ✓ lint
    ✓ security
    ✓ build
    ✓ test-unit
    ✓ test-e2e
    ✓ test-a11y
    ✓ test-lighthouse
    ✓ ci-complete
    ✓ Gitleaks
    ✓ Docs Policy
    ✓ Danger
    ✓ AI Config Validation
```

---

## Compliance Status

| Check                   | Status      | Enforced By                 |
| ----------------------- | ----------- | --------------------------- |
| Code Quality            | ✅ Required | `lint` job                  |
| Security Scanning       | ✅ Required | `security`, `Gitleaks` jobs |
| Tests Pass              | ✅ Required | `test-*` jobs               |
| Build Success           | ✅ Required | `build` job                 |
| Docs Policy             | ✅ Required | `Docs Policy` job           |
| PR Rules                | ✅ Required | `Danger` job                |
| HITL Config             | ✅ Required | `AI Config Validation` job  |
| Approval Required       | ✅ Required | Branch protection           |
| Conversation Resolution | ✅ Required | Branch protection           |
| Linear History          | ✅ Required | Branch protection           |
| Force Push Disabled     | ✅ Required | Branch protection           |

---

**Next Steps**:

1. Apply these settings to the main branch
2. Test with a sample PR
3. Document any exceptions or customizations
4. Review quarterly for updates

**Reference**: [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
