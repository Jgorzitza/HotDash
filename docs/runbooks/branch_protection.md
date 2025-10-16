# Branch Protection Rules

## Overview

This document defines the branch protection rules for the HotDash repository to ensure code quality and prevent accidental changes to critical branches.

## Protected Branches

### main

**Protection Level:** Maximum

**Required Status Checks:**
- ✅ Docs Policy
- ✅ Gitleaks (Secrets Scan)
- ✅ Danger
- ✅ AI Config Check

**Branch Protection Rules:**

1. **Require Pull Request Reviews**
   - Required approving reviews: 1
   - Dismiss stale reviews: Yes
   - Require review from Code Owners: No (optional)

2. **Require Status Checks**
   - Require branches to be up to date: Yes
   - Status checks that must pass:
     - `docs-policy`
     - `gitleaks`
     - `danger`
     - `ai-config-check`

3. **Require Conversation Resolution**
   - All conversations must be resolved: Yes

4. **Require Signed Commits**
   - Enabled: No (optional, recommended for production)

5. **Require Linear History**
   - Enabled: No (allows merge commits)

6. **Include Administrators**
   - Enabled: No (allows emergency fixes)

7. **Restrict Push Access**
   - Who can push: Repository administrators only
   - Force pushes: Not allowed
   - Deletions: Not allowed

8. **Lock Branch**
   - Enabled: No (allows normal development)

## Setup Instructions

### Via GitHub UI

1. Go to repository Settings
2. Navigate to Branches
3. Click "Add rule" or edit existing rule
4. Branch name pattern: `main`
5. Configure protection rules as listed above
6. Click "Create" or "Save changes"

### Via GitHub CLI

```bash
# Enable branch protection
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["docs-policy","gitleaks","danger","ai-config-check"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field required_conversation_resolution=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Bypass Procedures

### Emergency Hotfix

**When:** Critical production issue requiring immediate fix

**Procedure:**
1. Create hotfix branch from main
2. Make minimal fix
3. Test thoroughly
4. Create PR with `[HOTFIX]` prefix
5. Request emergency review
6. Merge after single approval
7. Document in incident report

### Temporary Bypass

**When:** CI system is down or status check is broken

**Procedure:**
1. Document reason in PR
2. Get manager approval
3. Temporarily disable specific check
4. Merge PR
5. Re-enable check immediately
6. Create issue to fix broken check

## Verification

### Check Current Protection

```bash
# Via GitHub CLI
gh api repos/:owner/:repo/branches/main/protection

# Via GitHub UI
Settings → Branches → Branch protection rules
```

### Test Protection

```bash
# Try to push directly to main (should fail)
git checkout main
git commit --allow-empty -m "Test"
git push origin main
# Expected: Error - protected branch

# Try to force push (should fail)
git push --force origin main
# Expected: Error - force push not allowed
```

## Common Issues

### Status Check Not Required

**Symptom:** PR can be merged without status check passing

**Fix:**
1. Go to Settings → Branches
2. Edit main branch protection
3. Add missing status check to required list
4. Save changes

### Can't Merge Despite Passing Checks

**Symptom:** All checks pass but merge button disabled

**Possible Causes:**
- Branch not up to date with main
- Unresolved conversations
- Missing required review

**Fix:**
1. Update branch: `git merge origin/main`
2. Resolve all conversations
3. Request review if needed

### Administrator Can Bypass

**Symptom:** Administrators can push directly to main

**Fix:**
1. Enable "Include administrators" in branch protection
2. Or enforce via team policy

## Best Practices

### ✅ DO

- Always create PRs for changes to main
- Wait for all status checks to pass
- Resolve all review comments
- Keep branch up to date with main
- Use descriptive PR titles and descriptions

### ❌ DON'T

- Push directly to main
- Force push to main
- Bypass status checks without approval
- Merge with failing checks
- Delete main branch

## Monitoring

### Weekly Review

- Check branch protection is enabled
- Verify all required checks are active
- Review bypass incidents
- Update rules if needed

### Alerts

Set up alerts for:
- Direct pushes to main (should never happen)
- Force pushes to main (should never happen)
- Branch protection disabled
- Required checks removed

## Related Documentation

- CI/CD Workflows: `.github/workflows/`
- Danger Rules: `Dangerfile.js`
- Docs Policy: `scripts/policy/check-docs.mjs`
- Gitleaks: `docs/runbooks/gitleaks_setup.md`

## Changelog

- 2025-10-16: Initial branch protection documentation

