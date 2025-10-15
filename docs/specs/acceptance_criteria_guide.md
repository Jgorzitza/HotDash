# Acceptance Criteria Guide

**File:** `docs/specs/acceptance_criteria_guide.md`  
**Owner:** QA Agent  
**Purpose:** Guidelines for writing clear, testable acceptance criteria  
**Version:** 1.0  
**Last Updated:** 2025-10-15

---

## Purpose

This guide helps agents write **clear, testable acceptance criteria** for GitHub Issues. Good acceptance criteria ensure:
- Everyone understands what "done" means
- Tests can be written before implementation
- Evidence requirements are clear
- DoD compliance is achievable

---

## Acceptance Criteria Format

### Template

```markdown
## Acceptance Criteria

### Functional Requirements
- [ ] [Specific, measurable outcome 1]
- [ ] [Specific, measurable outcome 2]
- [ ] [Specific, measurable outcome 3]

### Non-Functional Requirements
- [ ] Performance: [Specific metric and target]
- [ ] Security: [Specific security requirement]
- [ ] Accessibility: [Specific accessibility requirement]

### Evidence Required
- [ ] [Type of evidence 1: e.g., unit tests passing]
- [ ] [Type of evidence 2: e.g., screenshot of working feature]
- [ ] [Type of evidence 3: e.g., performance metrics]

### Rollback Plan
- [ ] Rollback steps documented
- [ ] Rollback tested in staging
- [ ] Recovery time < [X minutes]
```

---

## INVEST Criteria

Good acceptance criteria follow the **INVEST** principle:

### Independent
- Can be implemented without depending on other incomplete work
- Can be tested in isolation
- **Example:** ✅ "User can log in with email and password"
- **Bad:** ❌ "User can log in (depends on auth system being built)"

### Negotiable
- Details can be discussed and refined
- Not overly prescriptive about implementation
- **Example:** ✅ "Dashboard loads in < 3 seconds"
- **Bad:** ❌ "Dashboard uses Redis cache with 5-minute TTL"

### Valuable
- Delivers clear value to the user or system
- Ties to NORTH_STAR objectives
- **Example:** ✅ "CEO can approve inventory reorder in < 15 minutes"
- **Bad:** ❌ "Database has an index on product_id"

### Estimable
- Can be sized (≤ 2 days for molecules)
- Complexity is understood
- **Example:** ✅ "Add 'Approve' button to drawer with validation"
- **Bad:** ❌ "Build complete approval system"

### Small
- Fits in a molecule (≤ 2 days)
- Can be completed in one PR
- **Example:** ✅ "Display approval queue with 5 most recent items"
- **Bad:** ❌ "Build entire dashboard with all tiles"

### Testable
- Can be verified with evidence
- Pass/fail is clear
- **Example:** ✅ "Unit tests achieve ≥ 80% coverage"
- **Bad:** ❌ "Code is well-tested"

---

## Writing Testable Criteria

### Use Specific Metrics

**Good:**
- ✅ "API response time P95 < 500ms"
- ✅ "Page load time < 3 seconds"
- ✅ "Unit test coverage ≥ 80%"

**Bad:**
- ❌ "API is fast"
- ❌ "Page loads quickly"
- ❌ "Code is well-tested"

### Use Measurable Outcomes

**Good:**
- ✅ "User can create a new product with name, SKU, and price"
- ✅ "System sends email confirmation within 5 seconds"
- ✅ "Error message displays when validation fails"

**Bad:**
- ❌ "Product creation works"
- ❌ "Email is sent"
- ❌ "Errors are handled"

### Use Observable Behavior

**Good:**
- ✅ "When user clicks 'Approve', button shows loading state"
- ✅ "After approval, drawer displays success message"
- ✅ "If validation fails, error appears below input field"

**Bad:**
- ❌ "Approval process works correctly"
- ❌ "UI updates appropriately"
- ❌ "Errors are shown"

---

## Examples by Feature Type

### Dashboard/UI Feature

```markdown
## Acceptance Criteria

### Functional Requirements
- [ ] Dashboard displays 6 tiles: Revenue, AOV, Returns, Stock Risk, SEO, CX Queue
- [ ] Each tile shows current value and 7-day trend (up/down/flat)
- [ ] Tiles refresh every 30 seconds via SSE
- [ ] Clicking a tile opens detail drawer
- [ ] Mobile: tiles stack vertically, maintain readability

### Non-Functional Requirements
- [ ] Performance: P95 tile load < 3 seconds
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] Responsive: Works on mobile (375px) to desktop (1920px)

### Evidence Required
- [ ] Unit tests for tile components (≥ 80% coverage)
- [ ] E2E test: Dashboard loads and displays all tiles
- [ ] Screenshot: Desktop and mobile layouts
- [ ] Lighthouse score: Performance ≥ 90

### Rollback Plan
- [ ] Revert to previous dashboard version
- [ ] No data migration needed
- [ ] Rollback time < 5 minutes
```

---

### API/Backend Feature

```markdown
## Acceptance Criteria

### Functional Requirements
- [ ] GET /api/approvals returns list of approvals
- [ ] Supports filtering by state (draft, pending_review, approved)
- [ ] Supports pagination (limit, cursor)
- [ ] Returns 401 if not authenticated
- [ ] Returns 403 if not authorized

### Non-Functional Requirements
- [ ] Performance: P95 response time < 500ms
- [ ] Security: RLS enforced, no data leakage
- [ ] Rate limiting: 100 requests/minute per user

### Evidence Required
- [ ] Unit tests for endpoint handler (≥ 80% coverage)
- [ ] Integration test: Full request/response cycle
- [ ] API response samples in PR
- [ ] Performance test results

### Rollback Plan
- [ ] Revert API changes
- [ ] Database schema unchanged (backward compatible)
- [ ] Rollback time < 2 minutes
```

---

### Integration Feature

```markdown
## Acceptance Criteria

### Functional Requirements
- [ ] Sync Shopify products to Supabase every 15 minutes
- [ ] Create new products if not exist
- [ ] Update existing products if changed
- [ ] Log sync results (success/failure counts)
- [ ] Retry failed syncs up to 3 times

### Non-Functional Requirements
- [ ] Performance: Sync 1000 products in < 2 minutes
- [ ] Reliability: Error rate < 0.5%
- [ ] Observability: Metrics and logs for monitoring

### Evidence Required
- [ ] Unit tests for sync logic (≥ 80% coverage)
- [ ] Integration test: Sync from staging Shopify
- [ ] Logs showing successful sync
- [ ] Metrics dashboard screenshot

### Rollback Plan
- [ ] Disable sync cron job
- [ ] Revert to previous sync version
- [ ] No data loss (sync is additive)
- [ ] Rollback time < 5 minutes
```

---

### HITL/Approval Feature

```markdown
## Acceptance Criteria

### Functional Requirements
- [ ] AI drafts customer reply as Private Note in Chatwoot
- [ ] Human reviews draft in Approvals Drawer
- [ ] Human can edit draft before approving
- [ ] On approval, system posts as public reply
- [ ] Human grades reply (tone, accuracy, policy: 1-5)

### Non-Functional Requirements
- [ ] Performance: Approval flow < 15 minutes (SLA)
- [ ] Security: Only authorized reviewers can approve
- [ ] Auditability: All approvals logged with timestamp

### Evidence Required
- [ ] Unit tests for approval workflow (≥ 80% coverage)
- [ ] E2E test: Full approval flow (draft → approve → send)
- [ ] Screenshot: Approvals Drawer with evidence
- [ ] Audit log showing approval record

### Rollback Plan
- [ ] Revert to manual Chatwoot replies
- [ ] Approved replies remain sent (no unsend)
- [ ] Disable AI drafting if needed
- [ ] Rollback time < 10 minutes
```

---

## Common Mistakes to Avoid

### ❌ Too Vague
**Bad:** "System works correctly"  
**Good:** "API returns 200 status and valid JSON for successful requests"

### ❌ Implementation Details
**Bad:** "Use Redis cache with 5-minute TTL"  
**Good:** "Dashboard data refreshes within 5 minutes of source update"

### ❌ Not Testable
**Bad:** "Code is clean and maintainable"  
**Good:** "Unit tests achieve ≥ 80% coverage and all pass"

### ❌ Too Large
**Bad:** "Build complete inventory management system"  
**Good:** "Display inventory list with status buckets (in_stock, low_stock, out_of_stock)"

### ❌ Missing Evidence
**Bad:** "Feature works"  
**Good:** "Feature works (evidence: E2E test passing, screenshot of working UI)"

### ❌ No Rollback
**Bad:** "Deploy to production"  
**Good:** "Deploy to production (rollback: revert commit, restore DB snapshot, < 10 min)"

---

## Checklist for Reviewing Acceptance Criteria

Before approving an Issue, verify:

### Clarity
- [ ] Criteria are specific and unambiguous
- [ ] No jargon or undefined terms
- [ ] Anyone can understand what "done" means

### Testability
- [ ] Each criterion has clear pass/fail condition
- [ ] Evidence type is specified
- [ ] Tests can be written before implementation

### Completeness
- [ ] Functional requirements covered
- [ ] Non-functional requirements covered (performance, security, etc.)
- [ ] Evidence requirements specified
- [ ] Rollback plan included

### Alignment
- [ ] Criteria align with NORTH_STAR objectives
- [ ] Criteria align with global DoD
- [ ] Criteria fit within allowed paths

### Feasibility
- [ ] Can be completed in ≤ 2 days (molecule size)
- [ ] Dependencies are clear
- [ ] Blockers are identified

---

## Integration with DoD

Acceptance criteria must support the **global Definition of Done**:

### From NORTH_STAR
1. ✅ Acceptance criteria satisfied with tests/evidence
2. ✅ Rollback documented
3. ✅ Calls are MCP/SDK-backed (no speculative endpoints)
4. ✅ HITL reviews/grades captured (if customer-facing)
5. ✅ Governance: Issue linkage, Allowed paths, CI checks green
6. ✅ Metrics updated if behavior changed
7. ✅ Audit entry present (if runtime change)

### Criteria Must Include
- [ ] **Tests/Evidence:** Specify what tests and evidence are required
- [ ] **Rollback:** Document rollback steps and test them
- [ ] **Tools:** Specify which MCP/SDK tools will be used
- [ ] **HITL:** If customer-facing, specify grading requirements
- [ ] **Governance:** Confirm allowed paths and CI requirements
- [ ] **Metrics:** Specify which metrics will be affected
- [ ] **Audit:** Specify what audit logs are needed

---

## Template for Common Scenarios

### New Feature
```markdown
- [ ] Feature implemented per spec
- [ ] Unit tests ≥ 80% coverage
- [ ] Integration tests passing
- [ ] E2E test for critical path
- [ ] Screenshot/video of working feature
- [ ] Performance within budget
- [ ] Rollback tested
```

### Bug Fix
```markdown
- [ ] Bug no longer reproduces
- [ ] Test added to prevent regression
- [ ] Root cause documented
- [ ] Related bugs checked
- [ ] Rollback plan (revert commit)
```

### Refactoring
```markdown
- [ ] Behavior unchanged (tests prove it)
- [ ] Code complexity reduced (measurable)
- [ ] Performance same or better
- [ ] All existing tests passing
- [ ] Rollback plan (revert commit)
```

### Integration
```markdown
- [ ] Integration working end-to-end
- [ ] Error handling tested
- [ ] Retry logic tested
- [ ] Logs and metrics in place
- [ ] Rollback plan (disable integration)
```

---

## Questions to Ask

When writing acceptance criteria, ask:

1. **What does success look like?** (Observable outcome)
2. **How will we know it works?** (Evidence type)
3. **What could go wrong?** (Error cases)
4. **How do we undo it?** (Rollback plan)
5. **What are the edge cases?** (Boundary conditions)
6. **What are the performance requirements?** (Metrics)
7. **Who can use this?** (Authorization)
8. **What data is involved?** (Privacy, security)

---

## Resources

- **NORTH_STAR:** `docs/NORTH_STAR.md` (global DoD)
- **Test Plan Template:** `docs/specs/test_plan_template.md`
- **Approvals Spec:** `docs/specs/approvals_drawer_spec.md`
- **Issue Template:** `.github/ISSUE_TEMPLATE/task.yml`

---

## Changelog

- **1.0 (2025-10-15):** Initial guide with INVEST criteria, examples, and checklist

