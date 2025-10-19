# Branch Protection Setup Guide

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Configure GitHub branch protection rules

## Main Branch Protection

**Target**: `main` branch  
**Goal**: Prevent force pushes, require PR reviews, enforce CI checks

### Required Protection Rules

#### 1. Require Pull Request Reviews

**Settings**:

- Required approving reviews: **1**
- Dismiss stale pull request approvals: **Yes**
- Require review from Code Owners: **Yes**
- Restrict who can dismiss reviews: **Admins only**

**Configuration** (via UI):

1. Repository → Settings → Branches
2. Add rule for `main`
3. Enable "Require a pull request before merging"
4. Required approvals: 1
5. Check "Dismiss stale pull request approvals when new commits are pushed"

#### 2. Require Status Checks

**Required Checks**:

- `build-test` (from CI workflow)
- `Docs Policy`
- `Gitleaks (Secrets Scan)`
- `Danger`
- `Validate AI Agent Config`
- `guard-mcp`
- `idle-guard`

**Configuration**:

1. Enable "Require status checks to pass before merging"
2. Check "Require branches to be up to date before merging"
3. Search and add each required check

#### 3. Additional Protections

- ✅ Require conversation resolution before merging
- ✅ Require signed commits: **No** (optional)
- ✅ Require linear history: **No** (allow merge commits)
- ✅ Do not allow bypassing the above settings
- ✅ Restrict who can push to matching branches: **Admins**
- ✅ Allow force pushes: **No**
- ✅ Allow deletions: **No**

### Setup via GitHub CLI

```bash
# Enable branch protection
gh api repos/Jgorzitza/HotDash/branches/main/protection \
  --method PUT \
  --input - << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      {"context": "build-test"},
      {"context": "Docs Policy"},
      {"context": "Gitleaks (Secrets Scan)"},
      {"context": "Danger"},
      {"context": "Validate AI Agent Config"}
    ]
  },
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "restrictions": null,
  "enforce_admins": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

## Development Branch Protection

**Pattern**: `batch-*`, `agent-*`, `hotfix-*`

**Recommended**:

- Require CI passing (optional)
- Allow force pushes: **Yes** (for development)
- Allow deletions: **Yes** (cleanup)

## Release Branch Protection

**Pattern**: `release-*`

**Settings** (same as main):

- Require PR reviews: 1
- Require status checks
- No force pushes
- No deletions

## Verification

### Check Current Protection

```bash
gh api repos/Jgorzitza/HotDash/branches/main/protection
```

### Test Protection Rules

**Attempt force push** (should fail):

```bash
git push --force origin main
# Expected: Error - force push denied
```

**Attempt direct push** (should fail):

```bash
git push origin main
# Expected: Error - protected branch, requires PR
```

**Attempt merge without reviews** (should fail):

- Create PR
- Try to merge without approval
- Expected: "Merging is blocked - Review required"

## Bypass Emergency Procedure

**When needed**: Critical security fix, production down

**Process**:

1. CEO/Admin temporarily disables protection
2. Apply fix
3. Re-enable protection immediately
4. Document in incident report

**Command**:

```bash
# Disable protection (admin only)
gh api repos/Jgorzitza/HotDash/branches/main/protection --method DELETE

# Apply emergency fix
git push origin main

# Re-enable protection
# Run setup command above
```

## Related Documentation

- Security Hardening: `docs/runbooks/security_hardening.md`
- CI/CD Pipeline: `docs/runbooks/cicd_pipeline.md`
- GitHub Docs: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
