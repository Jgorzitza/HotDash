---
epoch: 2025.10.E1
doc: docs/directions/qa.md
owner: manager
last_reviewed: 2025-10-12
---

# QA — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

**⚠️ STOP - Read these 6 iron rules. Lock them into memory.**

### 1️⃣ North Star Obsession
Every task must help operators see actionable tiles TODAY for Hot Rod AN.

**Memory Lock**: "North Star = Operator value TODAY"

### 2️⃣ MCP Tools Mandatory
Use MCPs for ALL validation. NEVER rely on memory.

**Memory Lock**: "MCPs always, memory never"

### 3️⃣ Feedback Process Sacred
ALL work logged in `feedback/qa.md` ONLY. No exceptions.
- Log timestamps, evidence, file paths
- No separate files
- **NEVER write to feedback/manager.md** (that is Manager's file)
- Manager reads YOUR feedback file to coordinate

**Memory Lock**: "One agent = one feedback file (MY OWN ONLY)"
**Memory Lock**: "One agent = one feedback file"

### 4️⃣ No New Files Ever
Never create new .md files without Manager approval.

**Memory Lock**: "Update existing, never create new"

### 5️⃣ Immediate Blocker Escalation
Blockers escalated IMMEDIATELY when identified.
**Process**: (1) Log blocker in feedback/qa.md, (2) Continue to next task
Don't wait - Manager removes blockers while you work.


**Memory Lock**: "Blocker found = immediate flag"

### 6️⃣ Manager-Only Direction
Only Manager assigns tasks.

**Memory Lock**: "Manager directs, I execute"

---

## Canon

- North Star: docs/NORTH_STAR.md
- Git Protocol: docs/git_protocol.md
- MCP Tools: docs/directions/mcp-tools-reference.md

## Mission

You ensure quality and catch bugs before they reach Hot Rod AN CEO. Test everything, trust nothing.

## Current Sprint Focus — Launch QA (Oct 13-15, 2025)

**Primary Goal**: Verify launch readiness, fix P0 blockers, validate all features work

## 🎯 ACTIVE TASKS

### Task 1 - Fix Date Test (P0 - Quick Win)

**What**: Fix timezone issue in `tests/unit/utils.date.spec.ts`
**Why**: Blocking CI (must be green before launch)
**Evidence**: Test passing, CI green
**Timeline**: 15-30 minutes

---

### Task 2 - Verify Engineer's RLS Fix

**What**: After Engineer enables RLS, verify with Supabase MCP
**Test**: Check DecisionLog, DashboardFact, Session, facts tables have rls_enabled=true
**Evidence**: Supabase MCP query results
**Timeline**: 15 minutes

---

### Task 3 - Verify Engineer's CI Fix

**What**: Confirm all 4 GitHub Actions workflows pass
**Evidence**: GitHub MCP shows all workflows green
**Timeline**: 15 minutes

---

### Task 4 - Test Approval Queue UI

**What**: Full manual testing of approval queue when Engineer completes
**Test Scenarios**:
- View pending approvals
- Approve an agent suggestion
- Reject an agent suggestion
- Real-time updates work

**Evidence**: Test results, screenshots
**Timeline**: 1-2 hours

---

### Task 5 - E2E Launch Testing

**What**: Complete end-to-end workflow test
**Flow**: Chatwoot webhook → Agent SDK → Approval → Operator action → Response sent
**Evidence**: Full workflow documented with screenshots
**Timeline**: 2-3 hours

---

### Task 6 - Performance Validation

**What**: Verify all 5 tiles load fast (<500ms)
**Test**: Dashboard tile load times under target
**Evidence**: Performance metrics
**Timeline**: 1 hour

---

### Task 7 - Security Final Check

**What**: Final security scan before launch
**Check**: No secrets, no vulnerabilities, RLS enabled
**Evidence**: Clean scan results
**Timeline**: 1 hour

---

### Task 8 - Launch Day Testing

**What**: Monitor and test during Hot Rod AN CEO usage
**When**: Oct 13-15
**Evidence**: Fast bug identification and escalation

---

### Task 9 - Shopify GraphQL Query Testing

**What**: Validate all Shopify queries with Shopify Dev MCP
**Evidence**: All queries using 2024+ API patterns
**Timeline**: 1-2 hours

---

### Task 10 - React Router 7 Pattern Validation

**What**: Validate all routes with Context7 MCP
**Evidence**: All routes using current RR7 patterns
**Timeline**: 1-2 hours

---

### Task 11 - Agent SDK Integration Testing

**What**: Test complete agent workflow end-to-end
**Evidence**: Full approval flow works
**Timeline**: 2-3 hours

---

### Task 12 - Data Integrity Testing

**What**: Test RLS, multi-tenant isolation, data security
**Evidence**: No data leakage between tenants
**Timeline**: 2-3 hours

---

### Task 13 - API Error Scenario Testing

**What**: Test API failures (Shopify down, Chatwoot timeout, GA error)
**Evidence**: Graceful error handling documented
**Timeline**: 2-3 hours

---

### Task 14 - Browser Compatibility Testing

**What**: Test on Chrome, Firefox, Safari, Edge
**Evidence**: Dashboard works on all browsers
**Timeline**: 1-2 hours

---

### Task 15 - Accessibility Compliance Testing

**What**: Test keyboard nav, screen readers, WCAG 2.1 AA
**Evidence**: Accessibility audit passes
**Timeline**: 2-3 hours

---

### Task 16 - Load Testing

**What**: Test with 10 concurrent operators using dashboard
**Evidence**: No performance degradation
**Timeline**: 2-3 hours

---

### Task 17 - Data Accuracy Validation

**What**: Verify all 5 tiles show accurate Hot Rod AN data
**Evidence**: Data matches Shopify/Chatwoot/GA sources
**Timeline**: 2-3 hours

---

### Task 18 - Security Vulnerability Testing

**What**: Test for XSS, CSRF, SQL injection, auth bypasses
**Evidence**: Security test results, no vulnerabilities
**Timeline**: 2-3 hours

---

### Task 19 - Regression Testing

**What**: Test that existing features still work after new changes
**Evidence**: No regressions introduced
**Timeline**: 2-3 hours

---

### Task 20 - Final Launch Approval

**What**: Complete final QA review and provide launch approval
**Evidence**: ✅ APPROVED FOR LAUNCH or list of blockers
**Timeline**: 1-2 hours

---

## Git Workflow

**Branch**: `qa/work`
- Commit: `git commit -m "test: description"`
- Push: `git push origin qa/work`
- Manager merges

---

## Shutdown Checklist

[Standard 7-section + 1A, 3A checklist]

---

**Previous Work**: Archived in `archive/2025-10-12-pre-restart/`

**Status**: 🔴 ACTIVE - Task 1 (Fix date test)

## 🚀 10X TASK EXPANSION — Comprehensive Testing Roadmap (200+ Tasks)

**Goal**: Ensure QA NEVER runs idle with months of quality assurance work

### 🧪 COMPREHENSIVE TILE TESTING (Tasks 24-100) — 77 Tasks, 15-20 Weeks

#### CX Pulse Testing (Tasks 24-33) — 10 Tasks
**Task 24**: Test all Chatwoot data scenarios (3h)
**Task 25**: Test satisfaction calculation accuracy (2h)
**Task 26**: Test response time metrics (2h)
**Task 27**: Test ticket prioritization logic (3h)
**Task 28**: Test bulk response generation (3h)
**Task 29**: Load test with 1000 open tickets (3h)
**Task 30**: Test error handling (Chatwoot down) (2h)
**Task 31**: Test real-time updates (2h)
**Task 32**: Security test CX actions (2h)
**Task 33**: Performance test CX tile (<300ms) (2h)

#### Sales Pulse Testing (Tasks 34-43) — 10 Tasks
**Task 34-43**: Comprehensive sales tile testing (3h each = 30h)
- Revenue calculations, product rankings, conversion tracking
- Discount creation, promotion actions, approval workflows
- Load testing, error handling, security validation

#### SEO Pulse Testing (Tasks 44-53) — 10 Tasks
**Task 44-53**: Comprehensive SEO tile testing (3h each = 30h)
- GA organic traffic, landing page performance, content gaps
- Meta optimization, content creation, approval workflows
- Search ranking validation, keyword opportunities

#### Inventory Watch Testing (Tasks 54-63) — 10 Tasks
**Task 54-63**: Comprehensive inventory tile testing (3h each = 30h)
- Stock level accuracy, velocity calculations, reorder logic
- Purchase order creation, pricing actions, bundling
- Alert thresholds, overstock detection, multi-warehouse

#### Fulfillment Flow Testing (Tasks 64-73) — 10 Tasks
**Task 64-73**: Comprehensive fulfillment tile testing (3h each = 30h)
- Order status tracking, carrier performance, delay detection
- Expedite actions, customer notifications, carrier switching
- International shipping, returns processing

#### Cross-Tile Integration (Tasks 74-83) — 10 Tasks
**Task 74-83**: Cross-tile integration testing (3h each = 30h)
- Data consistency, shared state, correlations
- Cross-functional workflows, business health scoring

#### Performance Testing (Tasks 84-93) — 10 Tasks
**Task 84**: Dashboard load time under 2s (3h)
**Task 85**: Tile render time <300ms each (3h)
**Task 86**: API response time <100ms (3h)
**Task 87**: Database query optimization testing (3h)
**Task 88**: Concurrent user testing (100 operators) (4h)
**Task 89**: Memory leak testing (4h)
**Task 90**: CPU usage optimization testing (3h)
**Task 91**: Network bandwidth optimization (3h)
**Task 92**: Mobile performance testing (3h)
**Task 93**: Performance regression detection (3h)

#### Security Testing (Tasks 94-100) — 7 Tasks
**Task 94-100**: Comprehensive security testing (4h each = 28h)
- OWASP Top 10 validation, penetration testing
- Authentication/authorization, data encryption
- API security, dependency vulnerabilities

---

### 🤖 AUTOMATION & CI/CD (Tasks 101-150) — 50 Tasks, 10-12 Weeks

#### Test Automation (Tasks 101-120) — 20 Tasks
**Task 101-120**: Build comprehensive test automation (3h each = 60h)
- Visual regression, API contract testing, mutation testing
- Property-based testing, chaos engineering
- Test data management, flaky test detection

#### Quality Metrics (Tasks 121-140) — 20 Tasks
**Task 121-140**: Quality metrics and dashboards (3h each = 60h)
- Coverage tracking, defect analysis, test performance
- Quality trends, predictive quality models

#### CI/CD Testing (Tasks 141-150) — 10 Tasks
**Task 141-150**: CI/CD quality gates (3h each = 30h)
- Automated test execution, parallel testing
- Test result analytics, quality gates enforcement

---

### 🎯 SPECIALIZED TESTING (Tasks 151-200) — 50 Tasks, 10-12 Weeks

#### Domain Testing (Tasks 151-170) — 20 Tasks
**Task 151-170**: Hot Rod AN domain expertise testing (3h each = 60h)
- Automotive terminology, part compatibility
- Technical accuracy, brand voice consistency

#### Operator Experience (Tasks 171-190) — 20 Tasks
**Task 171-190**: Operator UX testing (3h each = 60h)
- Usability testing, accessibility, mobile experience
- User journey validation, satisfaction measurement

#### Edge Cases (Tasks 191-200) — 10 Tasks
**Task 191-200**: Edge case and boundary testing (3h each = 30h)
- Error scenarios, data edge cases, extreme loads

---

**TOTAL QA TASKS**: 200 comprehensive testing tasks  
**Timeline**: 40-50 weeks (nearly 1 year) of quality assurance work  
**Every task**: Logged in feedback/qa.md with test results, evidence


---

## 🚨 AUDIT-BASED CURRENT WORK (Oct 12 11:00 UTC Update)

**Manager's Audit Found**: Only 54 lines in feedback/qa.md - you're not logging current activity

**Your Grade**: C+ (70%) - Tests passing (98% - excellent!) BUT poor feedback logging

**CRITICAL**: Tests are PASSING (100/102) but you're not documenting your current work. Fix this immediately.

### IMMEDIATE REQUIREMENT: Log All Test Activity

**What**: Document ALL test preparation and execution in feedback/qa.md

**Log Format**:
```
## 2025-10-12T11:30:00Z — Test Preparation for Launch

**Activity**: Preparing E2E test scenarios
**Tests Created**: test-approval-workflow.md, test-agent-sdk-integration.md
**Status**: Ready to execute when Engineer fixes bugs
**Next**: Execute tests at 13:00 UTC when bugs fixed
```

**Update EVERY HOUR** with test progress

---

### Current Active Work (Log This NOW):

**Task 1**: Prepare GDPR test plan (when applicable - deprioritized per CEO)
**Task 2**: Prepare Approval UI test scenarios (for 18:00 UTC)
**Task 3**: Prepare E2E integration tests (for 20:00 UTC)
**Task 4**: Stand by for bug fix testing (13:00 UTC)

**LOG ALL OF THIS** in feedback/qa.md - even preparation work counts

**Deadline**: Start logging NOW
**Priority**: P0 (Feedback compliance)

