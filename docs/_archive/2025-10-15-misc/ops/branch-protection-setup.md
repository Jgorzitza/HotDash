# Branch Protection Rules — Setup Guide

**Purpose**: Protect main branch from accidental force-pushes and ensure code quality  
**Owner**: Manager  
**Created**: 2025-10-12  
**Status**: Ready for implementation

---

## Recommended Branch Protection Rules

### For `main` Branch

#### Required Settings

**1. Require Pull Request Before Merging** ✅

- **Require approvals**: 1 minimum
- **Dismiss stale reviews**: Yes (when new commits pushed)
- **Require review from Code Owners**: No (optional for future)

**2. Require Status Checks to Pass** ✅

- **Require branches to be up to date**: Yes
- **Required status checks**:
  - `test` (unit tests via Vitest)
  - `build` (TypeScript compilation)
  - `lint` (ESLint checks)
  - `secret-scan` (gitleaks, when available)

**3. Require Conversation Resolution** ✅

- All conversations must be resolved before merging

**4. Require Signed Commits** ⚠️ Optional

- Enable if team uses GPG signing
- Not critical for private repository

**5. Require Linear History** ✅

- **Prevent merge commits**: Yes
- Use squash merge for feature branches
- Keeps git history clean and linear

**6. Do Not Allow Bypassing** ✅

- **Include administrators**: Yes
- Even admins must follow PR process
- Prevents accidental direct commits

**7. Restrict Push Access** ✅

- No direct pushes to main
- All changes via pull requests
- Maintains code review quality

**8. Restrict Force Pushes** ✅ CRITICAL

- **Block force pushes**: Yes
- Prevents history rewriting
- Protects main branch integrity

**9. Restrict Deletions** ✅

- **Block branch deletion**: Yes
- Prevents accidental main branch deletion

---

## Implementation Steps

### Via GitHub Web UI

1. **Navigate to Settings**:

   ```
   https://github.com/Jgorzitza/HotDash/settings/branches
   ```

2. **Add Branch Protection Rule**:
   - Click "Add branch protection rule"
   - Branch name pattern: `main`

3. **Configure Settings** (check boxes):
   - ✅ Require a pull request before merging
     - ✅ Require approvals: 1
     - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - Add status checks: `test`, `build`, `lint`
   - ✅ Require conversation resolution before merging
   - ✅ Require linear history
   - ✅ Include administrators
   - ✅ Do not allow bypassing the above settings
   - ✅ Restrict who can push to matching branches (empty = no one)
   - ✅ Block force pushes
   - ✅ Do not allow deletions

4. **Save Protection Rule**:
   - Click "Create" or "Save changes"

### Via GitHub CLI (Alternative)

```bash
# Requires gh CLI installed and authenticated
gh api repos/Jgorzitza/HotDash/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"checks":[{"context":"test"},{"context":"build"},{"context":"lint"}]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field required_linear_history=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_conversation_resolution=true
```

---

## Verification

After configuring, verify protection rules:

```bash
# Via GitHub CLI
gh api repos/Jgorzitza/HotDash/branches/main/protection | jq

# Via Web UI
# Visit: https://github.com/Jgorzitza/HotDash/settings/branches
# Verify "main" branch shows protection rules
```

**Expected Result**:

- Green checkmark next to main branch
- "Protected" badge on main branch
- Attempt to push directly to main should fail

---

## Testing Branch Protection

### Test 1: Direct Push (Should Fail)

```bash
cd ~/HotDash/hot-dash
git checkout main
echo "test" >> test-protection.txt
git add test-protection.txt
git commit -m "test: verify branch protection"
git push origin main
# Expected: ERROR - protected branch
```

### Test 2: Force Push (Should Fail)

```bash
git push --force origin main
# Expected: ERROR - force push blocked
```

### Test 3: PR Process (Should Succeed)

```bash
git checkout -b test/branch-protection
echo "test" >> test-file.txt
git add test-file.txt
git commit -m "test: branch protection via PR"
git push -u origin test/branch-protection

# Create PR via GitHub UI or gh CLI
gh pr create --title "Test: Branch Protection" --base main
# Expected: SUCCESS - PR created, requires review
```

---

## Status Checks Setup

Branch protection requires these GitHub Actions to exist:

### Required Workflows

**1. `test` check** (`.github/workflows/tests.yml`):

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
```

**2. `build` check** (`.github/workflows/build.yml` or part of tests.yml):

```yaml
- run: npm run build
```

**3. `lint` check** (`.github/workflows/lint.yml` or part of tests.yml):

```yaml
- run: npm run lint
```

**Current Status**: ✅ Most checks already exist in `.github/workflows/`

---

## Benefits

**Code Quality**:

- ✅ All code reviewed before merge
- ✅ Tests must pass
- ✅ Linting enforced
- ✅ Conversations resolved

**Repository Safety**:

- ✅ No accidental force-pushes
- ✅ No direct commits to main
- ✅ Can't delete main branch
- ✅ History protected

**Team Workflow**:

- ✅ Clear review process
- ✅ Status checks visible
- ✅ Consistent merge strategy
- ✅ Better collaboration

---

## Exemptions (When Needed)

**Emergency Hotfix Process**:

1. Create hotfix branch: `hotfix/critical-issue`
2. Make fix and create PR
3. Request urgent review from manager
4. Manager can override (if "Include administrators" is unchecked)
5. Merge after approval

**Note**: Keep "Include administrators" checked for best security.

---

## Rollback Plan

If protection rules cause issues:

1. **Temporarily disable**:
   - Go to Settings → Branches
   - Edit rule → Uncheck specific settings
   - Or delete rule entirely

2. **Fix underlying issue**

3. **Re-enable protection**:
   - Follow implementation steps above
   - Verify with test push

---

## Monitoring

**Check Weekly**:

- Are protection rules still active?
- Are required checks passing?
- Any blocked PRs due to protection?

**Audit Monthly**:

- Review protection rule effectiveness
- Update required checks as needed
- Adjust approval requirements

---

## Documentation Updates

**After enabling branch protection**:

1. Update `REPO_STATUS.md` security section
2. Add note to `README.md` contribution guidelines
3. Document in `feedback/git-cleanup.md`
4. Update `docs/git_protocol.md` if it exists

---

**Setup Instructions**: Follow "Implementation Steps" above  
**Priority**: HIGH (protects main branch)  
**Estimated Time**: 15-30 minutes  
**Prerequisites**: Repository admin access

**Status**: 🟡 READY FOR IMPLEMENTATION (requires manager/admin)
