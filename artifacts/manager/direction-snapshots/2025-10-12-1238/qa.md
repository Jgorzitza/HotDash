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

---

## 🚀 DEEP PRODUCTION TASK LIST (Aligned to North Star - Oct 12 Update)

**North Star Goal**: Ensure the 5 actionable tiles deliver trustworthy, evidence-based insights that help Hot Rod AN CEO scale from $1MM to $10MM revenue.

**QA Mission**: Validate operator value, catch issues before operators see them, ensure evidence-based quality.

### 🎯 P0 - PRODUCTION LAUNCH VALIDATION (Oct 12-13)

**Task 1: Approval Queue Validation** (3 hours)
- Test approval UI loads correctly in Shopify Admin
- Verify approve/reject actions work
- Test decision logging to Supabase audit trail
- Validate approval queue shows correct operator info
- **Evidence**: Approval workflow tested end-to-end, screenshots
- **North Star**: Validates core agent-assisted approval mechanism
- **Deadline**: Oct 12 20:00 UTC

**Task 2: Agent SDK Integration Testing** (2 hours)
- Test Chatwoot webhook → Agent SDK flow
- Verify Agent SDK generates appropriate responses
- Test error handling (invalid webhooks, timeouts)
- **Evidence**: Integration test results, all scenarios passing
- **North Star**: Validates AI-assisted customer support workflow
- **Deadline**: Oct 12 20:00 UTC

**Task 3: Security Validation** (2 hours)
- Test CSRF protection on all approval actions
- Verify authentication/authorization
- Test input validation and sanitization
- Check for exposed secrets in logs/responses
- **Evidence**: Security test results, no vulnerabilities
- **North Star**: Builds operator trust through security
- **Deadline**: Oct 12 22:00 UTC

**Task 4: Performance Baseline** (2 hours)
- Run Lighthouse on dashboard (target: >90 score)
- Measure P95 latency for all routes (target: <300ms)
- Test approval queue under load (10 concurrent operators)
- **Evidence**: Performance baselines documented
- **North Star**: Fast dashboard = operator adoption
- **Deadline**: Oct 12 22:00 UTC

---

### 🧪 P1 - TILE VALIDATION (Week 1-2 Post-Launch)

**Validate each tile delivers operator value with evidence-based insights**

**Task 5: CX Pulse Tile Testing** (4 hours)
- Verify Chatwoot data loads correctly
- Test satisfaction score calculations
- Validate AI insights are accurate
- Test recommended actions work (prioritize, bulk respond)
- Test approval queue integration for customer responses
- **Evidence**: CX Pulse tile fully tested, operator value validated
- **North Star**: Helps operator manage customer support efficiently

**Task 6: Sales Pulse Tile Testing** (4 hours)
- Verify Shopify sales data accuracy
- Test Google Analytics conversion data
- Validate revenue trend calculations
- Test recommended actions (create discount, promote product)
- Test approval queue integration for pricing changes
- **Evidence**: Sales Pulse tile fully tested, data accuracy validated
- **North Star**: Helps operator make data-driven sales decisions

**Task 7: SEO Pulse Tile Testing** (4 hours)
- Verify Google Analytics SEO metrics
- Test Shopify product page performance data
- Validate content gap identification
- Test recommended actions (optimize meta, create content)
- Test approval queue integration for content publishing
- **Evidence**: SEO Pulse tile fully tested, SEO insights validated
- **North Star**: Helps operator improve organic visibility

**Task 8: Inventory Watch Tile Testing** (4 hours)
- Verify Shopify inventory levels accurate
- Test sales velocity calculations
- Validate reorder recommendations (quantity, timing)
- Test stock alert thresholds (<7 days, >90 days)
- Test recommended actions (create PO, clearance pricing)
- **Evidence**: Inventory Watch tile fully tested, alerts validated
- **North Star**: Helps operator prevent stockouts and optimize cash flow

**Task 9: Fulfillment Flow Tile Testing** (4 hours)
- Verify Shopify fulfillment data accuracy
- Test carrier performance calculations
- Validate delay identification logic
- Test recommended actions (expedite, notify customer)
- Test approval queue integration for fulfillment decisions
- **Evidence**: Fulfillment Flow tile fully tested, shipping insights validated
- **North Star**: Helps operator optimize delivery performance

---

### 🔬 P2 - COMPREHENSIVE QUALITY ASSURANCE (Week 2-3)

**Task 10: Cross-Tile Integration Testing** (3 hours)
- Test data consistency across all 5 tiles
- Verify shared state management works
- Test cross-tile correlations (CX → Sales impacts)
- **Evidence**: Cross-tile integration validated
- **North Star**: Holistic business view for operator

**Task 11: Approval Queue Load Testing** (3 hours)
- Simulate 100 pending approvals
- Test concurrent operator approvals
- Verify no race conditions
- Test queue performance under load
- **Evidence**: Load test results, no degradation
- **North Star**: Scales as business grows to 10X

**Task 12: Error Recovery Testing** (3 hours)
- Test service failures (Shopify, Chatwoot, GA down)
- Verify graceful degradation
- Test cached data fallback
- Validate user-friendly error messages
- **Evidence**: Error scenarios tested, recovery working
- **North Star**: Reliable even when external services fail

**Task 13: Mobile Experience Testing** (3 hours)
- Test all 5 tiles on iOS Safari
- Test all 5 tiles on Android Chrome
- Verify touch-optimized approval actions
- Test responsive layouts
- **Evidence**: Mobile compatibility report
- **North Star**: Operators can work from phone/tablet

**Task 14: Accessibility Audit** (3 hours)
- WCAG 2.1 AA compliance testing
- Screen reader testing (all tiles + approval queue)
- Keyboard navigation testing
- Color contrast verification
- **Evidence**: Accessibility audit passing
- **North Star**: Inclusive for all operators

**Task 15: Browser Compatibility** (2 hours)
- Test Chrome, Firefox, Safari, Edge
- Verify consistent experience
- Document any browser-specific issues
- **Evidence**: Browser compatibility matrix
- **North Star**: Works for all operators regardless of browser

---

### 📊 P3 - CONTINUOUS QUALITY IMPROVEMENT (Week 3-6)

**Task 16: Automated Regression Suite** (4 hours)
- Create visual regression tests (Percy/Chromatic)
- Set up automated screenshot comparison
- Alert on UI regressions
- **Evidence**: Visual regression CI active
- **North Star**: Maintain quality as features added

**Task 17: Performance Regression Detection** (3 hours)
- Set up automated performance testing in CI
- Alert on performance degradation (>10% slower)
- Track performance trends over time
- **Evidence**: Performance CI active
- **North Star**: Dashboard stays fast as it grows

**Task 18: Security Scanning Automation** (3 hours)
- Integrate SAST tools in CI (Snyk, SonarQube)
- Automate dependency vulnerability scanning
- Alert on security issues
- **Evidence**: Security CI active
- **North Star**: Proactive security posture

**Task 19: Test Data Management** (2 hours)
- Create realistic test data generators
- Build test data cleanup automation
- Document test data patterns
- **Evidence**: Test data framework complete
- **North Star**: Faster test development

**Task 20: Quality Metrics Dashboard** (3 hours)
- Track test coverage trends
- Monitor defect rates
- Track performance trends
- Display quality gates status
- **Evidence**: Quality dashboard active
- **North Star**: Data-driven quality decisions

---

### 🎓 P4 - HOT ROD AN DOMAIN EXPERTISE (Week 4-6)

**Task 21: Automotive-Specific Test Scenarios** (3 hours)
- Test AN fitting product searches
- Test fuel system part compatibility lookups
- Test hot rod build kit recommendations
- Validate automotive terminology in UI
- **Evidence**: Domain-specific tests passing
- **North Star**: Vertical expertise differentiates from generic dashboards

**Task 22: Performance Parts Catalog Validation** (2 hours)
- Verify all Hot Rod AN product SKUs display correctly
- Test product categorization (AN fittings, brake lines, fuel systems)
- Validate technical specifications accuracy
- **Evidence**: Product catalog validated
- **North Star**: Accurate product data = operator trust

**Task 23: Customer Scenario Testing** (3 hours)
- Test common customer inquiries (part compatibility, tech support)
- Verify AI responses use correct automotive terminology
- Validate hot rod enthusiast tone in communications
- **Evidence**: Customer scenario tests passing
- **North Star**: Authentic communication with hot rod community

---

**Total QA Tasks**: 23 production-aligned tasks (8-10 weeks focused work)  
**Every task validates**: Operator value, evidence-based quality, Hot Rod AN domain fit  
**Prioritization**: P0 launch validation → Tile testing → Quality automation → Domain expertise  
**Evidence Required**: Every test logged in `feedback/qa.md` with results, traces, screenshots

**Quality Standards**: >80% test coverage, <5% defect rate, 100% P0 bug resolution before production

