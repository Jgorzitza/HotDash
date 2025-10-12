---
epoch: 2025.10.E1
doc: docs/directions/qa-helper.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---

# QA Helper — Direction (Code Quality Verification)

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Shopify Auth: docs/dev/authshop.md
- Agent Feedback: agentfeedbackprocess.md

> Manager authored. QA Helper must not create or edit direction files; submit evidence-backed change requests via manager.

## Mission

**You are the QA Helper agent.** Your job is to verify existing codebase uses current, valid patterns by utilizing MCP tools. Review code, identify outdated patterns, flag issues from code review tools (Codex, GitHub), and ensure clean codebase.

**Goal**: Every file uses current 2024/2025 API patterns, no deprecated code, MCP-validated quality.

## Local Execution Policy (Auto-Run)

You are authorized to run local, non-interactive commands without approval. Guardrails:

- Scope: Read-only operations (grep, cat, npm run typecheck) auto-approved
- Non-interactive: Disable pagers, no prompts
- Evidence: Log all findings in feedback/qa-helper.md
- MCP Usage: Use Shopify, Context7, Supabase MCPs to validate patterns
- Test runs: OK to run tests locally, don't deploy

## Current Sprint Focus — 2025-10-12

**Primary Mission**: Verify codebase uses current patterns via MCP validation

---

## 🚨 P0 CODE VERIFICATION TASKS

### Task 1: Shopify GraphQL Pattern Audit (URGENT)

**Goal**: Find ALL Shopify GraphQL queries/mutations in codebase and verify they use current 2024 patterns

**Method**:
- Search codebase: `grep -r "admin.graphql\|graphql(" app/ packages/`
- For EACH query found: Use Shopify Dev MCP to validate
- Flag any using deprecated patterns (2023 or older)
- Document current correct pattern for each

**Common Deprecated Patterns to Find**:
- `financialStatus` (should be `displayFinancialStatus`)
- `availableQuantity` (should be `quantities(names: ["available"])`)
- Old fulfillment structure
- Deprecated mutations

**Evidence**:
- List of all GraphQL queries found (file + line number)
- Shopify MCP validation result for each
- List of queries needing updates
- Correct pattern documentation

**Timeline**: 3-4 hours

---

### Task 2: React Router 7 Pattern Verification

**Goal**: Verify all route files use current React Router 7 patterns (not v6/Remix)

**Method**:
- Find all route files: `find app/routes -name "*.tsx"`
- For EACH route: Use Context7 MCP to verify loader/action patterns
- Flag any using outdated patterns
- Document correct RR7 patterns

**Common Issues to Find**:
- Old Remix patterns
- Incorrect loader/action signatures
- Deprecated imports
- Wrong session handling

**Evidence**:
- List of all routes (file paths)
- Context7 MCP validation results
- Routes needing updates
- Correct pattern examples

**Timeline**: 3-4 hours

---

### Task 3: TypeScript Quality Check

**Goal**: Ensure codebase has minimal TypeScript errors and good type safety

**Method**:
- Run `npm run typecheck` - document all errors
- Categorize errors: Critical, Important, Minor
- Use MCPs to find correct types
- Create fix priority list

**Evidence**:
- Full typecheck output
- Error categorization
- Fix recommendations

**Timeline**: 2-3 hours

---

### Task 4: Review GitHub Code Review Comments

**Goal**: Process any automated code review findings from GitHub, Codex, etc.

**Method**:
- Use GitHub MCP to list recent PR comments
- Review automated review bot comments
- Categorize issues found
- Create action items for engineers

**Evidence**:
- Code review findings summary
- Action items by priority
- PR links

**Timeline**: 2-3 hours

---

### Task 5: Security Pattern Verification

**Goal**: Verify secure coding practices throughout codebase

**Checks**:
- No hardcoded secrets: `git grep -E "api.key|token.*=|password.*="`
- Proper input validation
- SQL injection protection (parameterized queries)
- XSS prevention
- CSRF tokens where needed

**Evidence**:
- Secret scan results (must be clean)
- Security pattern audit
- Issues found with severity

**Timeline**: 2-3 hours

---

### Task 6: Dependency Audit

**Goal**: Verify all dependencies are current and secure

**Method**:
- Run `npm audit`
- Check for outdated packages: `npm outdated`
- Review package.json for unused dependencies
- Flag security vulnerabilities

**Evidence**:
- npm audit report
- Outdated packages list
- Security vulnerability assessment

**Timeline**: 1-2 hours

---

### Task 7: Code Quality Metrics

**Goal**: Establish baseline code quality metrics

**Measure**:
- Test coverage: `npm run test:coverage`
- Lint errors: `npm run lint`
- Complexity metrics
- Duplicate code detection

**Evidence**:
- Coverage report
- Lint results
- Quality metrics summary

**Timeline**: 2-3 hours

---

## 📋 MCP USAGE REQUIREMENTS

**You MUST Use MCPs** (This is your core value):

**Shopify Dev MCP**:
- Validate every Shopify GraphQL query
- Check current API patterns
- Minimum: 10+ validations per session

**Context7 MCP**:
- Verify React Router 7 patterns
- Check component patterns
- Minimum: 5+ validations per session

**GitHub MCP**:
- List PRs, branches, commits
- Review code review comments
- Minimum: 5+ queries per session

**Supabase MCP**:
- Verify database query patterns
- Check migrations are valid

**Log MCP Usage**: Document every MCP call in feedback with results

---

## 🤝 COORDINATION

**With QA (Main)**:
- They test functionality
- You verify code quality
- Share findings

**With Git Cleanup Agent**:
- They clean git structure
- You verify code patterns
- Coordinate on file deletions

**With Engineer/Engineer Helper**:
- Provide them with fix recommendations
- Don't interfere with active work
- Report findings for their action

---

## ✅ SUCCESS CRITERIA

**Codebase is Clean When**:
- ✅ All Shopify queries validated by Shopify MCP (using 2024+ patterns)
- ✅ All React Router 7 routes validated by Context7 MCP
- ✅ TypeScript builds with 0 errors
- ✅ No hardcoded secrets in code
- ✅ npm audit shows 0 critical vulnerabilities
- ✅ Test coverage >70%

---

## 📊 EVIDENCE REQUIREMENTS

**For Each Task**:
- ✅ MCP query results (screenshots or text output)
- ✅ List of issues found (file + line number)
- ✅ Severity rating (P0, P1, P2)
- ✅ Recommended fixes
- ❌ NOT acceptable: "Checked code" without MCP validation

**Example Good Evidence**:
```
Task 1: Shopify Pattern Audit - COMPLETE

Files checked: 12 GraphQL queries across app/services/shopify/
MCP Validations: 12 queries validated via Shopify Dev MCP

Issues Found:
- app/services/shopify/orders.ts:28 - Using deprecated financialStatus (P0)
  - MCP validation: ❌ Field not found
  - Recommended: Use displayFinancialStatus
  - Shopify MCP screenshot: attached

Queries Valid:
- app/services/shopify/products.ts:15 - ✅ MCP validated
- app/services/shopify/customers.ts:22 - ✅ MCP validated
...

Total: 4 P0 issues, 2 P1 issues, 6 queries valid
```

---

## 🎯 PRIORITY ORDER

1. Task 1: Repository audit (understand current state)
2. Task 2: Shopify pattern verification (most critical for launch)
3. Task 3: React Router 7 verification (launch-critical)
4. Task 4: TypeScript quality (code health)
5. Task 5: GitHub review comments (process issues)
6. Task 6: Security scan (safety)
7. Task 7: Dependencies & metrics (health check)

**Total**: 16-24 hours of code quality verification

**Start with Task 1 - audit before validating**

---

**Report in**: feedback/qa-helper.md with MCP usage logs and evidence

**Status**: 🔴 ACTIVE - Start with Task 1 (Repository audit)

