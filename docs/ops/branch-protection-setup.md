# Branch Protection Setup Guide

## Overview

This guide provides instructions for setting up branch protection rules on the `main` branch to ensure code quality and prevent accidental changes.

**Owner**: git-cleanup agent  
**Last Updated**: 2025-10-14  
**Target Branch**: `main`

---

## Recommended Protection Rules

### 1. Require Pull Request Reviews

**Setting**: Require pull request reviews before merging  
**Value**: ✅ Enabled  
**Reviewers**: At least 1 approval required

**Why**: Ensures all code is reviewed before merging to main

### 2. Require Status Checks

**Setting**: Require status checks to pass before merging  
**Value**: ✅ Enabled  
**Required checks**:
- `CI Tests` - All unit and integration tests
- `Stack Guardrails` - Stack compliance validation
- `Secret Scanning` - Gitleaks secret detection
- `Accessibility CI` - a11y compliance

**Why**: Ensures code quality and security standards are met

### 3. Require Conversation Resolution

**Setting**: Require conversation resolution before merging  
**Value**: ✅ Enabled

**Why**: Ensures all review comments are addressed

### 4. Require Signed Commits

**Setting**: Require signed commits  
**Value**: ⚠️ Optional (recommended for production)

**Why**: Verifies commit authenticity

### 5. Include Administrators

**Setting**: Include administrators in protection rules  
**Value**: ✅ Enabled

**Why**: No one bypasses quality gates, not even admins

### 6. Restrict Pushes

**Setting**: Restrict who can push to matching branches  
**Value**: ✅ Enabled  
**Allowed**: GitHub Actions, specific team members only

**Why**: Prevents accidental direct commits to main

### 7. Allow Force Pushes

**Setting**: Allow force pushes  
**Value**: ❌ Disabled

**Why**: Protects git history from being rewritten

### 8. Allow Deletions

**Setting**: Allow deletions  
**Value**: ❌ Disabled

**Why**: Prevents accidental branch deletion

---

## Setup Instructions

### Option 1: GitHub Web UI

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Branches**
3. Click **Add rule** under "Branch protection rules"
4. Enter `main` as the branch name pattern
5. Enable the following options:

   **Pull Request Requirements**:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require review from Code Owners (if CODEOWNERS file exists)

   **Status Checks**:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select required checks:
     - `CI Tests`
     - `Stack Guardrails`
     - `Secret Scanning`
     - `Accessibility CI`

   **Other Requirements**:
   - ✅ Require conversation resolution before merging
   - ✅ Require signed commits (optional)
   - ✅ Include administrators

   **Rules Applied to Everyone**:
   - ✅ Restrict who can push to matching branches
   - ❌ Allow force pushes (keep disabled)
   - ❌ Allow deletions (keep disabled)

6. Click **Create** to save the rule

### Option 2: GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate
gh auth login

# Create branch protection rule
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI Tests","Stack Guardrails","Secret Scanning","Accessibility CI"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"dismissal_restrictions":{},"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  --field restrictions=null \
  --field required_conversation_resolution=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

### Option 3: GitHub API (with token)

```bash
# Set your GitHub token
export GITHUB_TOKEN="your_token_here"

# Apply protection rules
curl -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/Jgorzitza/HotDash/branches/main/protection \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["CI Tests", "Stack Guardrails", "Secret Scanning", "Accessibility CI"]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": false,
      "required_approving_review_count": 1
    },
    "restrictions": null,
    "required_conversation_resolution": true,
    "allow_force_pushes": false,
    "allow_deletions": false
  }'
```

---

## Verification

After applying the rules, verify they're working:

### 1. Check Protection Status

```bash
# Using GitHub CLI
gh api repos/:owner/:repo/branches/main/protection | jq

# Or via web UI
# Go to Settings → Branches → View rule for main
```

### 2. Test Protection

Try to push directly to main (should fail):
```bash
git checkout main
echo "test" >> README.md
git add README.md
git commit -m "test: direct commit"
git push origin main
# Expected: Error - protected branch
```

### 3. Test PR Workflow

Create a PR and verify:
- ✅ Status checks run automatically
- ✅ At least 1 approval required
- ✅ Cannot merge with failing checks
- ✅ Cannot merge with unresolved conversations

---

## Exceptions and Special Cases

### Emergency Hotfixes

For critical production issues:
1. Create branch: `hotfix/description`
2. Create PR as usual
3. Mark as urgent in PR description
4. Expedited review process (single approval)
5. Status checks must still pass

### Repository Administrators

Even admins must follow the protection rules. To make an exception:
1. Temporarily disable "Include administrators" (not recommended)
2. Make necessary changes
3. Re-enable "Include administrators" immediately
4. Document exception in `feedback/manager.md`

---

## Maintenance

### Update Required Checks

When adding new CI workflows:
1. Update protection rules via GitHub UI or API
2. Add new check name to required_status_checks
3. Document in this guide

### Review Protection Rules

Schedule: Quarterly  
Owner: Manager  
Action: Review and update protection rules as needed

---

## Troubleshooting

### Status Check Not Running

**Problem**: Required status check doesn't appear  
**Solution**:
1. Ensure workflow is defined in `.github/workflows/`
2. Check workflow triggers include `pull_request`
3. Verify workflow name matches required check name

### Cannot Merge PR

**Problem**: "Required status checks are failing"  
**Solution**:
1. Check CI logs for failure details
2. Fix issues in feature branch
3. Push new commit to trigger re-run
4. Request re-approval if needed

### Accidental Direct Commit

**Problem**: Committed directly to main before protection  
**Solution**:
1. Create branch from current main
2. Reset main to previous commit
3. Create PR from branch
4. Merge via proper workflow

---

## Resources

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub API Documentation](https://docs.github.com/en/rest/branches/branch-protection)
- [GitHub CLI Reference](https://cli.github.com/manual/gh_api)

---

**Note**: These rules are recommendations. Adjust based on your team's needs while maintaining security and quality standards.

**Status**: 📋 DOCUMENTATION READY - Implementation requires admin access
