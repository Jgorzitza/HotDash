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

## Evidence
<!-- Attach screenshots, logs, or test results -->

### Screenshots (if UI changes)
<!-- Drag and drop screenshots here -->

### Test Results
```
<!-- Paste test output here -->
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

### Security
- [ ] No secrets or credentials in code
- [ ] User input is validated and sanitized
- [ ] Authorization checks present
- [ ] CSRF protection considered (if applicable)
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

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
- [ ] PR title follows conventional commits
- [ ] Description is clear and complete
- [ ] Tests pass in CI
- [ ] Code changes make sense
- [ ] No security concerns
- [ ] No performance concerns
- [ ] Approve or request changes

### Review Focus Areas
<!-- What should reviewers pay special attention to? -->
- 
- 

---

**Reviewer**: <!-- Will be assigned -->  
**QA Sign-off**: <!-- QA team will verify before merge -->

