## Summary
<!-- What changed and why? Link to related Issue -->
Fixes #

**What changed:**
-

**Why now:**
-

**Allowed paths:**
<!-- fnmatch patterns, e.g., app/routes/*, app/services/auth.*, tests/** -->

## Type of Change
<!-- Check all that apply -->
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Security fix

## Testing
<!-- All items must be checked before requesting review -->
- [ ] `npm run fmt` - Code formatted with Prettier
- [ ] `npm run lint` - No ESLint errors
- [ ] `npm run test:ci` - All tests passing
- [ ] `npm run scan` - No secrets detected
- [ ] Manual testing completed
- [ ] Tests added/updated for changes

**Evidence:**
<!-- Paste screenshots, logs, test results, or links -->
```
# Test output or evidence here
```

## Code Quality
<!-- Verify code quality standards -->
- [ ] No TypeScript `any` types added (or justified in comments)
- [ ] Error handling added for async operations
- [ ] No hardcoded values (use environment variables)
- [ ] Code follows React Router 7 patterns
- [ ] Shopify API calls use MCP tools (if applicable)
- [ ] Database queries use Supabase RPC (if applicable)

## Risk & Mitigations
**Risk level:** <!-- Low/Medium/High -->

**Potential risks:**
-

**Mitigation steps:**
-

**Rollback plan:**
<!-- Commands or playbook link -->
```bash
# Rollback commands
```

## Security & Compliance
<!-- All security items must be checked -->
- [ ] No secrets committed (checked with `npm run scan`)
- [ ] Shopify session token enforced on embedded routes (if applicable)
- [ ] Supabase RLS reviewed/updated (if database changes)
- [ ] Security headers applied (if new routes)
- [ ] HTTPS enforced (if production changes)
- [ ] Input validation added (if user input)
- [ ] XSS prevention considered (if rendering user content)

## Deployment Notes
**Affected infrastructure:**
<!-- Check all that apply -->
- [ ] Fly.io (app deployment)
- [ ] Supabase (database/auth)
- [ ] Shopify (app/theme)
- [ ] Chatwoot (customer support)
- [ ] Publer/Social (social media)
- [ ] GitHub Actions (CI/CD)

**Environment variables:**
<!-- List any new or changed environment variables -->
-

**Database migrations:**
<!-- List any migrations that need to run -->
-

**Post-deploy verification:**
<!-- Steps to verify deployment succeeded -->
1.
2.

## Reviewer Checklist
<!-- For reviewers - do not modify -->
- [ ] Code follows project standards and conventions
- [ ] Changes match the description and Issue requirements
- [ ] Tests are adequate and passing
- [ ] Security considerations addressed
- [ ] Documentation updated (if needed)
- [ ] No obvious performance issues
- [ ] Rollback plan is clear and tested
- [ ] Approved for merge
