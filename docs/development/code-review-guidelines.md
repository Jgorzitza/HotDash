# Code Review Guidelines

**Task:** QUALITY-ASSURANCE-003  
**Status:** Implemented  
**Last Updated:** 2025-01-24

## Overview

All code changes in HotDash must go through a mandatory code review process before merging. This ensures code quality, security, and adherence to project standards.

## Code Review Process

### 1. Before Creating a PR

**Developer Checklist:**

- [ ] Code is complete and tested locally
- [ ] All tests passing (`npm run test:ci`)
- [ ] Code formatted (`npm run fmt`)
- [ ] No linting errors (`npm run lint`)
- [ ] No secrets detected (`npm run scan`)
- [ ] Commits follow conventional commit format
- [ ] Branch is up to date with main

### 2. Creating a PR

**Required Information:**

1. **Issue Linkage** - Must include `Fixes #<issue-number>`
2. **Allowed Paths** - File patterns this PR can modify
3. **Summary** - What changed and why
4. **Testing Evidence** - Screenshots, logs, test results
5. **Risk Assessment** - Risk level and mitigation plan
6. **Rollback Plan** - How to undo changes if needed

**Use the PR template** - Fill out all sections completely

### 3. Automated Checks

**CI/CD Workflows (must pass):**

- ✅ **Formatting** - Prettier check
- ✅ **Linting** - ESLint check
- ✅ **Tests** - All test suites
- ✅ **Security** - Gitleaks secret scanning
- ✅ **Docs Policy** - Markdown file validation
- ✅ **Danger** - PR requirements validation
- ✅ **MCP Evidence** - MCP tool usage validation (if applicable)
- ✅ **Dev MCP Ban** - No dev MCP usage in production code

**All checks must be green before review**

### 4. Code Review

**Reviewer Responsibilities:**

1. Review code changes thoroughly
2. Check against review checklist (below)
3. Test changes locally if needed
4. Provide constructive feedback
5. Approve or request changes
6. Ensure all discussions resolved before merge

**Review Timeline:**

- **P0 (Critical):** Within 4 hours
- **P1 (High):** Within 24 hours
- **P2 (Medium):** Within 48 hours
- **P3 (Low):** Within 1 week

### 5. Addressing Feedback

**Developer Actions:**

1. Read all feedback carefully
2. Make requested changes
3. Respond to comments
4. Re-request review when ready
5. Resolve conversations when addressed

**Do NOT:**
- Dismiss feedback without discussion
- Force push over reviewer comments
- Merge without approval
- Ignore CI failures

### 6. Merging

**Merge Requirements:**

- [ ] All CI checks passing
- [ ] At least 1 approval from required reviewer
- [ ] All conversations resolved
- [ ] No merge conflicts
- [ ] Branch up to date with main

**Merge Strategy:**
- Use "Squash and merge" for feature branches
- Use "Rebase and merge" for hotfixes
- Delete branch after merge

## Code Review Checklist

### Functionality

- [ ] Code does what the Issue/PR description says
- [ ] Edge cases handled appropriately
- [ ] Error handling is comprehensive
- [ ] No obvious bugs or logic errors
- [ ] Performance is acceptable

### Code Quality

- [ ] Code is readable and well-organized
- [ ] Functions/components are appropriately sized
- [ ] No code duplication (DRY principle)
- [ ] Naming is clear and consistent
- [ ] Comments explain "why" not "what"
- [ ] No commented-out code
- [ ] No debug console.logs

### TypeScript

- [ ] No `any` types (or justified with comments)
- [ ] Types are specific and accurate
- [ ] Interfaces/types are reusable
- [ ] No type assertions without justification
- [ ] Proper use of generics where appropriate

### React Router 7

- [ ] Uses `Response.json()` for JSON responses
- [ ] Proper use of `loader` and `action` functions
- [ ] Correct `LoaderFunctionArgs` / `ActionFunctionArgs` types
- [ ] No deprecated Remix imports
- [ ] Proper error boundaries
- [ ] Correct use of `useLoaderData` / `useActionData`

### Shopify Integration

- [ ] Uses Shopify MCP tools (not direct API calls)
- [ ] GraphQL queries validated with MCP
- [ ] Polaris components used correctly
- [ ] Session token enforced on embedded routes
- [ ] Proper error handling for API calls

### Database (Supabase)

- [ ] Uses Supabase RPC (not raw SQL)
- [ ] RLS policies reviewed/updated
- [ ] Migrations are reversible
- [ ] No N+1 query issues
- [ ] Proper indexing for queries
- [ ] Transactions used where appropriate

### Security

- [ ] No secrets in code
- [ ] Input validation on all user input
- [ ] XSS prevention (proper escaping)
- [ ] CSRF protection (if applicable)
- [ ] SQL injection prevention
- [ ] Proper authentication/authorization
- [ ] Security headers applied (if new routes)

### Testing

- [ ] Tests added for new functionality
- [ ] Tests updated for changed functionality
- [ ] Test coverage ≥ 80%
- [ ] Tests are meaningful (not just for coverage)
- [ ] Edge cases tested
- [ ] Error cases tested

### Documentation

- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Comments added for complex logic
- [ ] Migration notes added (if database changes)
- [ ] Environment variables documented (if new)

### Performance

- [ ] No unnecessary re-renders
- [ ] Proper use of React hooks
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Lazy loading where appropriate

### Accessibility

- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient
- [ ] Screen reader friendly

## Review Comments Best Practices

### For Reviewers

**✅ DO:**
- Be specific and constructive
- Explain the "why" behind suggestions
- Provide examples or links to documentation
- Acknowledge good code
- Ask questions to understand intent
- Suggest alternatives, not just problems

**❌ DON'T:**
- Be vague ("this is bad")
- Be condescending or rude
- Nitpick formatting (let Prettier handle it)
- Block on personal preferences
- Approve without actually reviewing

**Comment Prefixes:**
- `[BLOCKER]` - Must be fixed before merge
- `[SUGGESTION]` - Nice to have, not required
- `[QUESTION]` - Seeking clarification
- `[NITPICK]` - Minor style preference

### For Authors

**✅ DO:**
- Respond to all comments
- Ask for clarification if needed
- Explain your reasoning
- Be open to feedback
- Thank reviewers for their time

**❌ DON'T:**
- Take feedback personally
- Argue without understanding
- Ignore comments
- Make changes without discussion
- Rush to merge

## Common Review Issues

### Issue: Too Many Changes

**Problem:** PR is too large to review effectively

**Solution:**
- Break into smaller PRs
- Each PR should be < 500 lines
- Focus on one feature/fix per PR

### Issue: Missing Tests

**Problem:** No tests for new functionality

**Solution:**
- Add unit tests for new functions
- Add integration tests for new features
- Update existing tests if behavior changed

### Issue: Unclear Purpose

**Problem:** PR description doesn't explain changes

**Solution:**
- Update PR description
- Link to Issue for context
- Explain the "why" not just the "what"

### Issue: Security Concerns

**Problem:** Potential security vulnerability

**Solution:**
- Mark as `[BLOCKER]`
- Explain the risk
- Suggest secure alternative
- Do not merge until fixed

### Issue: Performance Concerns

**Problem:** Code may have performance issues

**Solution:**
- Profile the code
- Provide benchmarks
- Suggest optimizations
- Consider lazy loading

## Required Reviewers

### By File Path

Configured in `.github/CODEOWNERS`:

```
# Database migrations
/supabase/migrations/ @manager

# Security-related
/app/middleware/security-* @manager
/app/services/security/ @manager

# CI/CD workflows
/.github/workflows/ @manager

# Documentation
/docs/ @manager @engineer @qa
```

### By Change Type

- **Security changes:** Require manager approval
- **Database migrations:** Require manager approval
- **CI/CD changes:** Require manager approval
- **Breaking changes:** Require 2 approvals
- **Documentation:** Require 1 approval

## Automated Quality Checks

### Danger (PR Validation)

**Checks:**
- Issue linkage present
- Allowed paths declared
- Files within allowed paths
- No disallowed markdown files
- HITL config intact (for ai-customer)
- Tests updated (if app code changed)

### Gitleaks (Secret Scanning)

**Checks:**
- No API keys in code
- No passwords in code
- No tokens in code
- No credentials in code

### Docs Policy

**Checks:**
- Markdown files in allowed paths only
- No rogue documentation files

### MCP Evidence (if applicable)

**Checks:**
- MCP tools used for Shopify integration
- Evidence provided in PR body
- No dev MCP usage in production code

## Review Metrics

### Track These Metrics

- **Review Time:** Time from PR creation to first review
- **Merge Time:** Time from PR creation to merge
- **Iterations:** Number of review cycles
- **Defects:** Bugs found in review vs. production
- **Coverage:** Test coverage percentage

### Goals

- **Review Time:** < 24 hours for P1
- **Merge Time:** < 48 hours for P1
- **Iterations:** ≤ 2 review cycles
- **Defects:** > 80% found in review
- **Coverage:** ≥ 80% test coverage

## Escalation

### When to Escalate

- Security vulnerability found
- Breaking change not documented
- Disagreement on approach
- Review taking too long
- Blocker not being addressed

### How to Escalate

1. Comment on PR with `@manager`
2. Explain the issue clearly
3. Provide context and evidence
4. Suggest resolution if possible

## References

- [GitHub Code Review Best Practices](https://github.com/features/code-review)
- [Google Engineering Practices](https://google.github.io/eng-practices/review/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- Task: QUALITY-ASSURANCE-003 in TaskAssignment table

