# QA Handoff Plan - Production Validation

**Created**: 2025-10-19T15:20:00Z
**Owner**: QA Agent (lead), supported by Pilot + Engineer
**Timeline**: 6-8 hours after feature completion

---

## QA Suites (Priority Order)

### Suite 1: Smoke Tests (30 min) - GATE 1
**Owner**: QA Agent
**Runs**: After staging deploy
**Critical**: App loads, no crashes, basic navigation

**Tests**:
1. /health returns 200
2. Dashboard loads <5s
3. All 8 tiles visible (data can be mock)
4. One drawer opens and closes
5. No console errors

**Pass Criteria**: All 5 tests passing
**If FAIL**: NO-GO, escalate to Engineer
**Evidence**: Test output, screenshots

---

### Suite 2: Accessibility (WCAG 2.1 AA) (40 min) - GATE 2
**Owner**: QA + Pilot
**Tool**: Pa11y CI + Axe DevTools
**Runs**: After smoke tests pass

**Tests**:
1. Color contrast ≥4.5:1
2. Keyboard navigation complete
3. Screen reader compatible
4. ARIA labels correct
5. Focus indicators visible

**Pass Criteria**: 0 critical, <5 moderate violations
**If FAIL**: Engineer fixes criticals, retest
**Evidence**: Pa11y report, Axe scan results

---

### Suite 3: Integration Contracts (45 min) - GATE 3
**Owner**: Integrations Agent
**Runs**: Parallel with accessibility

**Tests**:
1. Shopify Orders API contract
2. Shopify Inventory API contract
3. GA4 Data API contract
4. Chatwoot API contract
5. Publer API contract
6. OpenAI API contract

**Pass Criteria**: All 6 contracts verified
**If FAIL**: Document schema drift, update mocks
**Evidence**: Contract test output (all passing)

---

### Suite 4: E2E User Flows (60 min) - GATE 4
**Owner**: Pilot Agent
**Runs**: After Gates 1-3 pass
**Tool**: Playwright

**Critical Flows**:
1. CEO logs into Shopify Admin
2. Opens Hot Rod AN app
3. Dashboard loads with all 8 tiles
4. Clicks idea → Idea pool drawer opens
5. Approves idea → Approval recorded
6. Checks approvals queue → Sees approved idea
7. Clicks approval → Approvals drawer opens
8. Grades approval (tone/accuracy/policy)
9. Approval applied successfully

**Pass Criteria**: All 9 steps complete without errors
**If FAIL**: Document exact failure step, assign to Engineer
**Evidence**: Playwright video recording

---

### Suite 5: Performance (30 min) - GATE 5
**Owner**: QA Agent
**Runs**: After E2E passes
**Tool**: Lighthouse CI

**Tests**:
1. Dashboard P95 load time <3s
2. Each tile P95 <3s
3. Drawer open <500ms
4. No layout shifts (CLS <0.1)
5. Bundle size <500kb gzipped

**Pass Criteria**: All metrics meeting SLA
**If FAIL**: Engineer optimizes, retest
**Evidence**: Lighthouse report

---

### Suite 6: Security & Permissions (40 min) - GATE 6
**Owner**: QA + DevOps
**Runs**: Parallel with performance

**Tests**:
1. Gitleaks scan: 0 secrets
2. RLS enabled on all tables (verify 4 critical from Data agent)
3. Feature flags all default false in production
4. No SERVICE_KEY in client bundle
5. CSP headers present

**Pass Criteria**: All security checks passing
**If FAIL**: CRITICAL - escalate to Manager
**Evidence**: Scan output, RLS verification, bundle analysis

---

### Suite 7: Data & Database (35 min) - GATE 7
**Owner**: Data Agent
**Runs**: After staging database migrated

**Tests**:
1. All migrations applied successfully
2. RLS tests passing (4 critical tables + all others)
3. Data integrity queries passing
4. Seed data loads without errors
5. Dashboard queries return valid data

**Pass Criteria**: All data checks passing
**If FAIL**: Rollback database, fix migrations
**Evidence**: Migration log, RLS test output, integrity report

---

## Defect Routing

### P0 Defects (Critical - Blocks Production)
**Examples**: App crash, security vulnerability, data loss risk
**Owner**: Engineer (immediate fix)
**ETA**: <2 hours
**Escalate to**: Manager if >2 hours

### P1 Defects (High - Significant Impact)
**Examples**: Tile not loading, drawer broken, slow performance
**Owner**: Engineer (same-day fix)
**ETA**: <4 hours
**Defer**: If >3 P1 defects, consider NO-GO

### P2 Defects (Medium - Minor Issues)
**Examples**: UI glitch, suboptimal UX, slow but functional
**Owner**: Engineer (next-day fix)
**Acceptable**: Ship with documented P2s

### P3 Defects (Low - Nice to Have)
**Examples**: Typos, minor visual issues
**Owner**: Backlog
**Acceptable**: Ship with any number of P3s

---

## Go/No-GO Decision Tree

**GO if**:
- ✅ All 7 suites passing
- ✅ 0 P0 defects
- ✅ <3 P1 defects
- ✅ RLS enabled on 4 critical tables
- ✅ Feature flags verified safe

**NO-GO if**:
- ❌ Any P0 defect
- ❌ ≥3 P1 defects
- ❌ Accessibility failures
- ❌ Security vulnerabilities
- ❌ RLS not enabled

**Defer if**:
- ⚠️ 1-2 P1 defects (fix first, then GO)
- ⚠️ Performance close to SLA (optimize, retest)

---

## QA Packet (Required Output)

**File**: reports/qa/go-no-go-2025-10-19.md

**Include**:
1. All 7 suite results (PASS/FAIL)
2. Defect list with routing (P0/P1/P2/P3, owner, ETA)
3. Risk assessment (technical, business)
4. Recommendation: GO / NO-GO / DEFER
5. Evidence manifest (all test outputs, screenshots, videos)

**Delivery**: To Product Agent for final Go/No-Go compilation

---

**Created**: 2025-10-19T15:20:00Z
**Owner**: QA Agent (orchestrates validation)
**Timeline**: Execute after staging deployed

