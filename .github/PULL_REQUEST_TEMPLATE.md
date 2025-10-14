# Pull Request

## Description
<!-- Describe what this PR does and why it's needed -->

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI change (no functional changes)
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update

## Changes Made
<!-- List the specific changes in this PR -->
- 
- 
- 

## Testing
<!-- Describe how this was tested -->

### Unit Tests
- [ ] Added/updated unit tests
- [ ] All unit tests pass locally (`npm run test:unit`)

### E2E Tests
- [ ] Added/updated E2E tests (if UI changes)
- [ ] All E2E tests pass locally (`npm run test:e2e`)

### Manual Testing
- [ ] Tested in local environment
- [ ] Tested in mock mode (`MOCK=1`)
- [ ] Tested edge cases
- [ ] Tested error scenarios

## Evidence ⭐ REQUIRED

<!-- All PRs must include evidence. See docs/git_protocol.md -->

### Test Results
```bash
# Unit tests
npm run test:unit
# Paste output here - must show PASSING

# E2E tests (if UI changes)
npm run test:e2e
# Paste output here - must show PASSING

# Lint check
npm run lint
# Expected: No errors

# Type check
npm run typecheck
# Expected: No errors
```

### Screenshots (if UI changes)
<!-- Drag and drop screenshots showing before/after or new functionality -->

### Evidence Artifacts ⭐ REQUIRED
<!-- All code changes MUST include evidence - see docs/git_protocol.md -->

**Link to evidence files** (choose relevant):
- Test results: `artifacts/<agent>/<timestamp>/test-results/`
- Screenshots: `artifacts/<agent>/<timestamp>/screenshots/`
- Performance reports: `reports/performance/<date>/`
- Migration logs: `artifacts/data/<timestamp>/migration-logs/`
- Cleanup evidence: `feedback/git-cleanup.md` (if cleanup-related)
- Deployment logs: `artifacts/deployment/<timestamp>/`

**Evidence must include**:
- [ ] Command executed (exact command with timestamp)
- [ ] Output/results (full output or link to file)
- [ ] Validation steps (how you verified it works)

**Example**:
```
Command: npm run test:unit
Timestamp: 2025-10-14T10:30:00Z
Output: artifacts/qa/2025-10-14/test-results.txt
Result: ✅ 127/127 tests passed
```

### Secret Scan Results ⚠️ MANDATORY
```bash
# REQUIRED: Run secret scan before every PR
# This is automated by git hooks, but verify manually:

# Method 1: Quick grep scan
git grep -i "api_key\|secret\|password\|token\|private_key" HEAD | wc -l
# Expected: 0 (or only documentation mentions in docs/, not in code)

# Method 2: Gitleaks (recommended - install if not present)
gitleaks detect --no-git -v
# Expected: "no leaks found"

# Method 3: Check specific patterns
git diff --cached | grep -E "(sk_|pk_|ghp_|gho_|sbp_|supabase_|SUPABASE_|SHOPIFY_)" || echo "No secrets found"
# Expected: "No secrets found"

# Paste results here:


```

## Code Review Checklist

### Code Quality
- [ ] Code follows project conventions
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] No `console.log()` in production code
- [ ] Comments added for complex logic
- [ ] No unnecessary dependencies added

### Testing
- [ ] New functionality has tests
- [ ] Bug fixes have regression tests
- [ ] Test coverage maintained or increased
- [ ] Tests are meaningful (not just for coverage)
- [ ] Mock data is realistic
- [ ] Tests are deterministic (no flakiness)

### Security ⚠️ CRITICAL

- [ ] **Secret scan completed and passed** ✅ REQUIRED
  ```bash
  # Run ALL three methods in "Secret Scan Results" section above
  # 1. grep scan for common patterns
  # 2. gitleaks detect (recommended)
  # 3. Check Shopify/Supabase/GitHub patterns
  ```
- [ ] **No secrets or credentials in code**
- [ ] **No hardcoded credentials** in code or config files
- [ ] **Environment variables** used for sensitive data (.env.example updated)
- [ ] User input is validated and sanitized
- [ ] Authorization checks present (RLS policies if Supabase)
- [ ] CSRF protection considered (if applicable)
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities (user input escaped)
- [ ] **Repository cleanup compliance**: 
  - [ ] No status files in root directory
  - [ ] Old files archived (not deleted)
  - [ ] Evidence files in artifacts/ directory

### Performance
- [ ] No N+1 query problems
- [ ] Database indexes appropriate
- [ ] Large data sets paginated
- [ ] Expensive operations cached
- [ ] No blocking operations on main thread

### Accessibility (if UI changes)
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1)
- [ ] Forms have labels
- [ ] Interactive elements have ARIA labels

### Documentation
- [ ] README updated (if user-facing changes)
- [ ] API documentation updated (if API changes)
- [ ] Migration guide added (if breaking changes)
- [ ] Environment variables documented in .env.example

## Database Changes
<!-- If this PR includes database migrations -->
- [ ] Migration tested locally
- [ ] Rollback migration created
- [ ] Migration is idempotent
- [ ] Data migration plan (if needed)
- [ ] Indexes added for new queries

## Breaking Changes
<!-- List any breaking changes and migration steps -->

## Deployment Notes
<!-- Any special deployment considerations -->

## Related Issues
<!-- Link related issues -->
Closes #
Related to #

---

## For Reviewers

### Quick Review Checklist
- [ ] PR title follows conventional commits (feat:, fix:, docs:, etc.)
- [ ] Description is clear and complete
- [ ] **Secret scan results provided** ✅ CRITICAL
- [ ] **Evidence artifacts linked** (commands, outputs, validation)
- [ ] Tests pass in CI (all status checks green)
- [ ] Code changes make sense
- [ ] No security concerns (secret scan passed)
- [ ] No performance concerns (queries optimized)
- [ ] Repository cleanup compliance (no root status files)
- [ ] Approve or request changes

### Review Focus Areas
<!-- What should reviewers pay special attention to? -->
- 
- 

### Post-Merge Checklist
- [ ] Verify branch deleted after merge (automated)
- [ ] Verify CI passes on main
- [ ] Monitor for any post-merge issues
- [ ] Update related documentation if needed

---

**Reviewer**: <!-- Will be assigned -->  
**QA Sign-off**: <!-- QA team will verify before merge -->  
**Security Review**: <!-- Required if touching auth, RLS, or secrets -->

