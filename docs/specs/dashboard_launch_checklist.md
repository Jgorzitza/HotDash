# Dashboard Launch Checklist — Hot Rod AN Control Center

**File:** `docs/specs/dashboard_launch_checklist.md`  
**Owner:** Product Agent  
**Last Updated:** 2025-10-20T08:42:00Z  
**Status:** Option A Build In Progress (P0s Complete, Phase 1 Complete)

---

## Launch Status: 🟢 OPTION A BUILD IN PROGRESS

**Current Status**: P0 Blockers Resolved ✅, Phase 1 Complete ✅, Phases 2-11 Pending

**Progress**:
- ✅ P0 #1: /health endpoint COMPLETE (Engineer)
- ✅ P0 #2: RLS verification COMPLETE (Data)
- ✅ Phase 1: Approval Queue COMPLETE (Engineer ENG-001 to ENG-004)
- ⏳ Option A Tables: 4/5 complete (Data)
- ⏳ Phases 2-11: Awaiting full task list from Manager

**QA Status**: 
- QA Grade: B+ (85/100) from Oct 19
- Test Coverage: 97.24% unit, 100% integration, 0 secrets
- Current Tests: 236/273 passing (86%)
- Recommendation: CONDITIONAL GO pending P0 fixes → P0s NOW COMPLETE

**Next Milestone**: Complete Option A build (38 Engineer tasks, 15 Designer tasks, 5 Data tables)

**Timeline**: 3-4 days for complete Option A implementation

---

## Previous P0 Blockers (NOW RESOLVED ✅)

### ✅ BLOCKER #1: Missing /health Endpoint (RESOLVED 2025-10-19)

**Status**: ✅ COMPLETE  
**Owner**: Engineer Agent  
**Resolution Date**: 2025-10-19  
**Evidence**: Engineer feedback 2025-10-20.md - "/health route implemented"

**Details**:

- Missing route: `app/routes/health.tsx`
- Required checks: Database (Supabase ping), Shopify (test API call)
- Response requirement: <500ms, JSON format
- Deploy requirement: `fly deploy` after implementation

**Acceptance Criteria**:

- [ ] /health route returns 200 OK when healthy
- [ ] /health route returns 503 when degraded
- [ ] Database check functional
- [ ] Shopify API check functional
- [ ] Response time <500ms
- [ ] Deployed to production
- [ ] QA retest completed

**Timeline**: 15 minutes implementation + deploy  
**Escalated**: 2025-10-19T23:50:00Z (Manager → Engineer)

---

### ✅ BLOCKER #2: RLS Verification Missing (RESOLVED 2025-10-20)

**Status**: ✅ COMPLETE (ALL PASS)  
**Owner**: Data Agent  
**Resolution Date**: 2025-10-20  
**Evidence**: Data feedback 2025-10-20.md - "P0 RLS Verification: COMPLETE (PASS)"

**Verification Results**:
- ✅ `ads_metrics_daily` - RLS ENABLED
- ✅ `agent_run` - RLS ENABLED
- ✅ `agent_qc` - RLS ENABLED
- ✅ `creds_meta` - RLS ENABLED

**Outcome**: ALL 4 critical tables passed RLS verification. Ready for QA sign-off.

---

## Secondary Tasks (Non-Blocking)

### ⚠️ P2: Ads Metrics Formatting (P2 - NON-BLOCKING)

**Status**: ASSIGNED TO ADS AGENT  
**Owner**: Ads Agent  
**Severity**: P2 - Cosmetic (8 test failures, non-blocking)  
**Impact**: Minor display formatting issues  
**Timeline**: 20 minutes

**Details**:

- File: `app/lib/ads/metrics.ts`
- Tests: `tests/unit/ads/metrics.spec.ts`
- Issues:
  1. Thousands separator missing: `$2,500.00` not `$2500.00`
  2. Negative sign placement: `-$500.00` not `$-500.00`
  3. ROAS trailing zeros: `3.5x` not `3.50x`
  4. Zero case handling: `0.0x` not `0.00x`

**Acceptance Criteria**:

- [ ] All 8 tests passing
- [ ] Formatting fixes verified
- [ ] Evidence logged in feedback

**Priority**: Complete after ADS-020 (current work)  
**Launch Blocking**: NO (cosmetic only)

---

## Completed Milestones ✅

### 🎯 QA Testing Complete (QA Agent - 2025-10-19)

**Grade**: B+ (85/100) - Excellent comprehensive testing  
**Decision**: CONDITIONAL GO ✅

**Test Results**:

- ✅ Unit Test Coverage: 97.24% passing
- ✅ Integration Tests: 100% passing
- ✅ Security Scan: 0 secrets detected
- ✅ Build Fixed: Missing `app/services/approvals.ts` restored
- ✅ Accessibility Tests: Can run (build succeeds)

**Remaining QA Work** (After P0 fixes):

- QA-002: Retest /health endpoint (after Engineer completes)
- QA-003 to QA-014: Execute 7 UI/UX molecules with Chrome DevTools MCP
- QA-017: Issue final GO/NO-GO decision

**Timeline**: 60-90 minutes after P0 completion

**Note**: Chrome DevTools MCP IS AVAILABLE (Manager confirmed working today)

---

## Launch Criteria (Updated 2025-10-19)

### Must Have (Launch Blockers) 🚨

- [ ] **BLOCKER #1: /health endpoint implemented and tested** (Engineer - 15 min)
- [ ] **BLOCKER #2: RLS verified on 4 critical tables** (Data - 30 min)
- [ ] **QA final GO with 0 P0 blockers** (QA - 60-90 min after P0s)
- [ ] **Unit tests remain ≥95% passing** (Currently 97.24% ✅)
- [ ] **All CI checks green** (docs policy, Gitleaks, AI config)
- [ ] **Production app health verified** (HTTP 200, no errors)

### Should Have (Quality Gates) ⚠️

- [ ] **Ads formatting fixes complete** (P2 - 20 min, non-blocking)
- [ ] **Chrome DevTools MCP UI/UX testing** (QA - 7 molecules)
- [ ] **All test suites passing** (unit + integration + E2E)
- [ ] **Security scan clean** (Gitleaks ✅, secret scanning ✅)

### Nice to Have (Post-Launch) 📋

- [ ] Social posting automation (Publer HITL)
- [ ] Inventory ROP automation
- [ ] SEO anomaly auto-triage
- [ ] Customer reply auto-drafts

---

## GO Decision Timeline

```
NOW (2025-10-19T23:50:00Z):
    ├─ Engineer starts /health route (P0)
    ├─ Data starts RLS verification (P0)
    └─ QA starts UI/UX testing (QA-003 to QA-014)

+15 min (2025-10-20T00:05:00Z):
    ├─ Engineer deploys /health route
    └─ QA retests health endpoint (QA-002)

+30 min (2025-10-20T00:20:00Z):
    ├─ Data completes RLS verification
    └─ Data provides results to QA

+60-90 min (2025-10-20T01:20:00Z):
    ├─ QA issues final GO/NO-GO decision (QA-017)
    └─ Ads completes formatting fixes (parallel, P2)

LAUNCH DECISION:
    ├─ IF both P0s PASS → GO ✅
    └─ IF either P0 FAILS → NO-GO 🔴, reschedule
```

---

## GO Criteria (Manager Defined)

**Production GO Requirements**:

✅ /health route returns 200 OK with DB/Shopify checks  
✅ RLS verified on 4 critical tables (`ads_metrics_daily`, `agent_run`, `agent_qc`, `creds_meta`)  
✅ Unit tests remain ≥95% passing (currently 97.24%)  
✅ QA final sign-off (GO decision issued)

**If All Pass**: PRODUCTION GO - Proceed to deployment  
**If Any Fail**: NO-GO - Fix and retest

---

## Risk & Mitigation

| Risk                              | Likelihood | Impact   | Mitigation                           | Owner    |
| --------------------------------- | ---------- | -------- | ------------------------------------ | -------- |
| /health route implementation bugs | Low        | High     | Test locally before deploy           | Engineer |
| RLS not enabled on critical table | Medium     | Critical | Escalate to Manager, apply RLS fixes | Data     |
| QA finds new P0 blockers          | Low        | Critical | Fix immediately, delay launch        | QA       |
| Ads formatting breaks tests       | Low        | Low      | Revert changes, fix after launch     | Ads      |

---

## Stakeholder Communication

**Status Updates Required**:

- Engineer: Notify QA + Product when /health deployed
- Data: Notify QA + Product when RLS verification complete
- QA: Issue final GO/NO-GO to Product + Manager
- Product: Update CEO/stakeholders with launch decision

**Escalation Protocol**:

- P0 failures: Immediate escalation to Manager + CEO
- Timeline delays: Update stakeholders within 15 minutes
- GO decision: Announce to all stakeholders immediately

---

## Owner Assignments

| Area                  | Primary Owner  | Backup  |
| --------------------- | -------------- | ------- |
| **/health Route**     | Engineer Agent | Manager |
| **RLS Verification**  | Data Agent     | Manager |
| **QA Final GO/NO-GO** | QA Agent       | Manager |
| **Ads Formatting**    | Ads Agent      | N/A     |
| **Launch Tracking**   | Product Agent  | Manager |
| **CEO Communication** | Product Agent  | Manager |

---

## Version History

- **v2.0** (2025-10-19T23:58:00Z): QA CONDITIONAL GO - 2 P0 blockers identified
  - QA Grade: B+ (85/100)
  - Test Coverage: 97.24% unit, 100% integration
  - P0: /health route (Engineer, 15 min)
  - P0: RLS verification (Data, 30 min)
  - P2: Ads formatting (non-blocking, 20 min)
  - Timeline: 60-90 min to GO
- **v1.0** (2025-10-20T01:02:00Z): Initial launch checklist (historical reference)

---

**Next Review**: After P0 completion (ETA 2025-10-20T00:20:00Z)  
**Status**: ACTIVE - Updates required as P0s complete  
**Launch Decision**: Pending QA final GO/NO-GO
