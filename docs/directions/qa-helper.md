---
epoch: 2025.10.E1
doc: docs/directions/qa-helper.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---

# QA Helper — Direction (Code Quality Verification)

## 🚨 CRITICAL: CONTINUE TEST COVERAGE EXPANSION (P1)

**Your immediate priority**: Continue building Shopify integration test suite

**Current status**:
- ✅ 7/12 tests complete
- 🔄 Engineer deploying to Fly.io NOW
- 🎯 Continue test coverage expansion

**START HERE NOW** (Continue test coverage):
```bash
cd ~/HotDash/hot-dash

# 1. Continue with Task 7B: Test service error handling
# Create tests for Shopify service error handling
# Use Shopify MCP to verify error patterns
# mcp_shopify_introspect_graphql_schema for error types

# 2. Continue with Task 7C: Test utility edge cases
# Add tests for date utilities, string formatters
# Test edge cases and error conditions

# 3. Continue with Task 7D: Test E2E scenarios
# Add integration test helpers
# Create test data generation utilities

# 4. Continue with Task 7E: Test performance
# Add performance tests for tile loading
# Test with various data sizes

# 5. Continue with Task 7F: Test security
# Add security tests for API endpoints
# Test authentication and authorization

# Evidence: Additional test files created, coverage increased
# Log to: feedback/qa-helper.md
```

**MCP TOOLS REQUIRED**:
- ✅ Context7 MCP: mcp_context7_get-library-docs (React Router 7 patterns)
- ✅ Shopify MCP: mcp_shopify_introspect_graphql_schema (error types)
- ❌ DO NOT guess React Router 7 patterns

**Timeline**: 60-90 minutes (continue 5 remaining tests)

**Success Metric**: 12/12 tests complete, coverage increased by 5-10%

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


---

## 🎯 MANAGER UPDATE - EXCELLENT WORK, NEW DIRECTION

**Your Report**: All 7 tasks complete, ✅ **LAUNCH APPROVED**

**Manager Response**: **Outstanding work!** Your comprehensive MCP-driven audit validated production readiness.

**New Direction**: Continue with expanded QA tasks below (Tasks 8-18)

---

## 📋 NEXT WAVE - DEEP QA & TESTING (Tasks 8-18)

**Task 8**: P1 React Router Deprecation Updates
- Update React Router patterns identified as P1
- Use Context7 MCP to verify updates are correct
- Test all updated routes
- Evidence: Updated files, Context7 validation, test results
- Timeline: 2-3 hours

**Task 9**: P1 Prisma Schema Optimization
- Update Prisma patterns identified as P1
- Optimize queries for performance
- Update indexes if needed
- Evidence: Updated schema, query performance tests
- Timeline: 2-3 hours

**Task 10**: Test Coverage Expansion
- Expand test coverage for critical paths (approval flow, tiles)
- Add missing test cases
- Target: 80% coverage for launch-critical code
- Evidence: Coverage report before/after
- Timeline: 3-4 hours

**Task 11**: Performance Testing Suite
- Create performance tests for dashboard tiles
- Load testing for concurrent operators
- API response time benchmarks
- Evidence: Performance test suite, baseline metrics
- Timeline: 3-4 hours

**Task 12**: E2E Test Scenarios for Hot Rodan
- Create end-to-end test scenarios specific to Hot Rodan workflows
- Operator reviews approval, checks CX tile, etc.
- Playwright tests for critical user journeys
- Evidence: E2E test suite, test results
- Timeline: 3-4 hours

**Task 13**: Security Testing Automation
- Automate security scans (secrets, vulnerabilities)
- Create pre-commit hooks for security checks
- Set up continuous security monitoring
- Evidence: Security automation scripts, scan results
- Timeline: 2-3 hours

**Task 14**: Code Quality Monitoring Dashboard
- Set up automated code quality metrics tracking
- TypeScript error trends, test coverage trends
- Complexity metrics, code duplication detection
- Evidence: Quality dashboard spec or implementation
- Timeline: 2-3 hours

**Task 15**: Test Data Management
- Create comprehensive test fixtures for Hot Rodan scenarios
- Mock data for automotive parts, orders, customers
- Realistic test data for all tiles
- Evidence: Test data fixtures, documentation
- Timeline: 2-3 hours

**Task 16**: API Contract Testing
- Verify Shopify/Chatwoot/GA API contracts
- Create contract tests to catch breaking changes
- Alert on API deprecations
- Evidence: Contract test suite
- Timeline: 2-3 hours

**Task 17**: Accessibility Testing
- Audit dashboard for WCAG 2.1 AA compliance
- Test with screen readers
- Keyboard navigation testing
- Evidence: Accessibility audit report, fixes needed
- Timeline: 2-3 hours

**Task 18**: Launch Monitoring Prep
- Define metrics to monitor post-launch
- Create error tracking and alerting
- Set up production monitoring dashboards
- Evidence: Monitoring plan, dashboard specs
- Timeline: 2-3 hours

Execute Tasks 8-18. Total: ~45-55 hours of deep QA work.

**Recommended Order**:
1. P1 fixes first (8-9) - addresses issues you identified
2. Performance & E2E tests (11-12) - launch-critical
3. Launch monitoring (18) - needed before launch
4. Remaining quality tasks (10, 13-17)

**Status**: 🟢 ACTIVE - Proceed with Tasks 8-18 (your choice of order)

---

## 🚨 UPDATED PRIORITY (2025-10-13T22:51:00Z) — Manager Assignment

**Status**: All direction file tasks complete ✅ (11/11)  
**New Assignment**: Test Coverage & Quality Improvements

### P0: Integration Test Suite Expansion (3-4 hours)

**Goal**: Comprehensive integration test coverage

**Tasks**:
1. **API Integration Tests**
   - Test all Shopify API endpoints
   - Test Agent SDK endpoints
   - Test LlamaIndex MCP endpoints
   - Test database operations

2. **Service Integration Tests**
   - Test Chatwoot webhook handling
   - Test Google Analytics integration
   - Test approval queue workflow
   - Test notification system

3. **Data Flow Tests**
   - Test end-to-end data flows
   - Test error handling
   - Test retry logic
   - Test timeout handling

4. **Test Coverage Analysis**
   - Measure current coverage
   - Identify gaps
   - Add missing tests
   - Target >80% coverage

**Evidence**: Test suite, coverage report, test results

### P1: Performance Testing (2-3 hours)

**Goal**: Establish performance baselines

**Tasks**:
1. **Load Testing**
   - Test dashboard under load
   - Test API endpoints under load
   - Test database queries under load
   - Document performance limits

2. **Stress Testing**
   - Test system breaking points
   - Test recovery procedures
   - Document failure modes

3. **Performance Benchmarks**
   - Establish baseline metrics
   - Create performance dashboard
   - Set up performance alerts

**Evidence**: Performance test results, benchmarks, alerts

### P2: Security Testing (2 hours)

**Goal**: Automated security testing

**Tasks**:
1. Set up OWASP ZAP scanning
2. Test for common vulnerabilities
3. Document findings
4. Coordinate fixes with Engineer

**Evidence**: Security test results, vulnerability report

**Timeline**: Start with P0, report progress every 2 hours to feedback/qa-helper.md

**Coordination**:
- QA: Coordinate on test strategy
- Engineer: Fix any issues found
- Reliability: Performance monitoring
- Manager: Report completion for next assignment

---
