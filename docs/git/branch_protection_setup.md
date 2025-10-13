---
epoch: 2025.10.E1
doc: docs/git/branch_protection_setup.md
owner: git-cleanup
last_reviewed: 2025-10-13
expires: 2025-10-20
---

# Branch Protection Rules Setup

## Overview

Branch protection rules help maintain code quality and prevent accidental changes to important branches. This document outlines recommended protection rules for the HotDash repository.

## Recommended Protection Rules for `main` Branch

### 1. Require Pull Request Reviews

**Setting**: Require a pull request before merging  
**Details**:
- Require 1 approval before merging
- Dismiss stale pull request approvals when new commits are pushed
- Require review from code owners (if CODEOWNERS file exists)

**Rationale**: Ensures all code is reviewed before merging to main, maintaining code quality and knowledge sharing.

### 2. Require Status Checks to Pass

**Setting**: Require status checks to pass before merging  
**Required Checks**:
- [ ] Secret scanning (gitleaks)
- [ ] Linter checks (if available)
- [ ] Build verification (if CI configured)
- [ ] Test suite (when tests exist)

**Rationale**: Automated verification catches issues before they reach main branch.

### 3. Require Conversation Resolution

**Setting**: Require conversation resolution before merging  
**Rationale**: Ensures all review comments are addressed before merge.

### 4. Require Linear History

**Setting**: Require branches to be up to date before merging  
**Rationale**: Maintains clean, linear git history; prevents merge conflicts.

### 5. Restrict Push Access

**Setting**: Restrict who can push to matching branches  
**Allowed**: Repository administrators only  
**Rationale**: Forces all changes through PR process, ensuring review.

### 6. Do Not Allow Force Pushes

**Setting**: Disabled  
**Rationale**: Protects main branch history from being rewritten.

### 7. Do Not Allow Deletions

**Setting**: Disabled  
**Rationale**: Prevents accidental deletion of main branch.

## How to Configure (GitHub UI)

1. Navigate to: `https://github.com/Jgorzitza/HotDash/settings/branches`
2. Click "Add branch protection rule"
3. Branch name pattern: `main`
4. Enable the following settings:

```
☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☐ Require review from Code Owners (optional if CODEOWNERS configured)

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  Status checks that are required:
    - gitleaks (if configured)
    - build (if CI configured)

☑ Require conversation resolution before merging

☐ Require signed commits (optional - requires GPG setup)

☑ Require linear history

☐ Require deployments to succeed before merging (optional)

☑ Lock branch (only for emergency lockdown)

☐ Do not allow bypassing the above settings (recommended for production)

☑ Restrict who can push to matching branches
  Add: Repository administrators

☑ Allow force pushes: NO
  
☑ Allow deletions: NO
```

5. Click "Create" or "Save changes"

## How to Configure (GitHub CLI)

For automated setup, use the GitHub CLI:

```bash
# Install GitHub CLI if needed
# Follow: https://cli.github.com/

# Authenticate
gh auth login

# Create branch protection rule
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  repos/Jgorzitza/HotDash/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["gitleaks"]}' \
  -f enforce_admins=false \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  -f restrictions=null \
  -f required_linear_history=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f required_conversation_resolution=true
```

## Verification

After setup, verify protection rules:

```bash
# Check branch protection status
gh api repos/Jgorzitza/HotDash/branches/main/protection

# Try to push directly to main (should fail)
git checkout main
git commit --allow-empty -m "test: verify protection"
git push origin main
# Expected: "protected branch hook declined"
```

## Additional Protection: Rulesets (GitHub Advanced)

For more granular control, consider GitHub Rulesets (requires GitHub Pro/Teams):

1. Navigate to: `https://github.com/Jgorzitza/HotDash/settings/rules`
2. Create ruleset for:
   - **Target branches**: `main`, `production/*`, `release/*`
   - **Rules**: Same as above plus additional metadata requirements
   - **Bypass list**: Repository admins only (for emergencies)

## Enforcement Strategy

### For agent/work branches:
- **No protection needed**: These are individual development branches
- **Self-managed**: Agents responsible for their own branch hygiene
- **Cleanup**: Delete after merge to main

### For main branch:
- **Full protection**: All rules enabled
- **No direct pushes**: All changes via PR
- **Review required**: At least 1 approval
- **Status checks**: Must pass before merge

### For special branches:
- `backup/*`: No protection (archival only)
- `originstory`: Protected (historical reference)
- `codex/*`: No protection (analysis branches)

## Emergency Override

In case of critical hotfix requiring immediate merge:

1. Request admin override in feedback/manager.md
2. Document reason for override
3. Create follow-up issue to address through normal process
4. Log override in compliance evidence

## Monitoring

Check protection compliance monthly:

```bash
# Run monthly cleanup script
./scripts/git/monthly-cleanup.sh

# Review branch protection status
gh api repos/Jgorzitza/HotDash/branches/main/protection | jq .
```

## Troubleshooting

### "Branch protection rule not enforced"
- Verify you're not a repository admin (admins can bypass by default)
- Check "Do not allow bypassing" is enabled
- Ensure status checks are properly configured

### "Status checks never complete"
- Verify GitHub Actions workflows are configured
- Check workflow names match required status check names
- Review Actions tab for failed workflows

### "Can't merge PR due to conversation requirement"
- All review comments must be resolved
- Check for pending conversations in PR
- Reviewers must explicitly resolve conversations

## Evidence

**Configuration Date**: 2025-10-13  
**Configured By**: git-cleanup agent  
**Approval**: Manager approved (docs/directions/git-cleanup.md)  
**Next Review**: 2025-10-20  

## Related Documents

- Git Protocol: `docs/git_protocol.md`
- PR Template: `.github/PULL_REQUEST_TEMPLATE.md`
- Secret Scanning: `.github/gitleaks.toml`
- Code Owners: `.github/CODEOWNERS`

