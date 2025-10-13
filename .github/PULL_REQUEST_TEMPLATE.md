# Pull Request

<!-- 
🛡️ SECURITY REMINDER: Before submitting this PR, run:
  git grep -i "api_key\|secret\|password\|token\|private_key" HEAD | grep -v "vault/"
  
Expected: No results (or only vault/ references)
If secrets found: Remove them, use environment variables, add to .gitignore

📋 BRANCH PROTECTION: PRs to main require:
  • 1 approval before merge
  • All conversations resolved  
  • Branch up-to-date with main
  • All status checks passing (secret scan, linter, build)
-->

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

### 🔒 Security Pre-Submit Checklist
**Complete BEFORE creating PR:**
- [ ] Ran secret scan: `git grep -i "api_key\|secret\|password\|token\|private_key" HEAD | grep -v "vault/"`
- [ ] No secrets detected or only in vault/ directory
- [ ] Verified no credentials in .env files tracked by git
- [ ] Checked no large files (>1MB) added accidentally: `find . -type f -size +1M -not -path "./.git/*" -not -path "./node_modules/*"`
- [ ] Reviewed git diff before commit for accidental additions

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

### Evidence Artifacts
<!-- Link to evidence files in artifacts/ or reports/ directories -->
- Artifacts: `artifacts/<agent>/<timestamp>/`
- Reports: `reports/<category>/`
- Cleanup evidence: `feedback/git-cleanup.md` (if cleanup-related)

### Secret Scan Results ⚠️ MANDATORY
```bash
# Run this command and paste results:
git grep -i "api_key\|secret\|password\|token\|private_key" HEAD | wc -l
# Expected: 0 (or only documentation mentions in docs/, not in code)

# If gitleaks installed:
gitleaks detect --no-git -v
# Expected: No leaks detected
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

- [ ] **No secrets or credentials in code**
  ```bash
  # Run before committing:
  git grep -i "api_key\|secret\|password\|token\|private_key" HEAD
  # Expected: No matches (or only documentation mentions)
  ```
- [ ] **Secret scan passed** (gitleaks if installed)
- [ ] **No hardcoded credentials** in code or config files
- [ ] **Environment variables** used for sensitive data
- [ ] User input is validated and sanitized
- [ ] Authorization checks present
- [ ] CSRF protection considered (if applicable)
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] **Repository cleanup compliance**: No status files in root directory

### Stack Guardrails Compliance ⚠️ CRITICAL
**All changes must comply with canonical toolkit per `docs/directions/README.md#canonical-toolkit--secrets`**

#### Database & Backend
- [ ] ✅ **Supabase-only backend:** No non-Supabase database clients (MySQL, MongoDB, Redis, DynamoDB, Firebase)
- [ ] ✅ **Chatwoot on Supabase:** CX integration uses Supabase for persistence only
- [ ] ✅ **Secrets handling:** All credentials use process.env or vault references (no hardcoded values)

#### Frontend & AI Stack  
- [ ] ✅ **React Router 7 only:** No Remix, Next.js, Gatsby, or incompatible routing frameworks
- [ ] ✅ **OpenAI + LlamaIndex only:** No Anthropic, Claude, Cohere, HuggingFace, LangChain, or unauthorized AI services
- [ ] ✅ **External services:** No AWS SDK, Azure, Google Cloud, Firebase Admin (Shopify/Chatwoot/OpenAI/Supabase only)

#### Special Approval Required (Check if applicable)
- [ ] **Stack guardrail modification:** Requires Product Agent + Engineering Lead approval
- [ ] **Security/compliance changes:** Requires security review + manager approval
- [ ] **Database schema changes:** Requires Data + Reliability team approval

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
- [ ] PR title follows conventional commits (feat:, fix:, docs:, chore:, etc.)
- [ ] Description is clear and complete
- [ ] Tests pass in CI / GitHub Actions
- [ ] All conversations resolved
- [ ] Branch is up-to-date with main
- [ ] Code changes make sense
- [ ] No security concerns (secrets, injection, XSS, etc.)
- [ ] No performance concerns (N+1, blocking operations, etc.)
- [ ] Stack guardrails followed (Supabase, React Router 7, OpenAI/LlamaIndex only)
- [ ] Evidence provided (test results, screenshots, artifacts)
- [ ] Secret scan passed (required)
- [ ] Approve or request changes

### 🛡️ Security Review Checklist
**Critical Items:**
- [ ] No hardcoded secrets, API keys, passwords, or tokens
- [ ] Secret scan results clean (gitleaks passed)
- [ ] No credentials in tracked files
- [ ] All sensitive data uses environment variables
- [ ] Input validation present for user-submitted data
- [ ] Authorization checks in place for protected routes
- [ ] SQL queries use parameterized statements (no string concatenation)
- [ ] XSS prevention measures (sanitized output, CSP headers)
- [ ] CSRF protection where applicable
- [ ] No new external service dependencies without approval

### Review Focus Areas
<!-- What should reviewers pay special attention to? -->
- 
- 

---

**Reviewer**: <!-- Will be assigned -->  
**QA Sign-off**: <!-- QA team will verify before merge -->

