# Dashboard Launch Checklist — Hot Rod AN Control Center

**File:** `docs/specs/dashboard_launch_checklist.md`  
**Owner:** Product Agent  
**Last Updated:** 2025-10-20T01:02:00Z  
**Status:** Pre-Launch (Blockers Active)

---

## Launch Status: 🚨 NOT READY (CRITICAL BLOCKER)

**Readiness**: 60% - Major progress but critical blocker preventing deployment

**Next Milestone**: Resolve PR #98 conflicts → Create 10 agent PRs → QA final approval

**Target Launch**: TBD (depends on blocker resolution + QA GO)

---

## Critical Path Blockers (STOP THE LINE)

### 🚨 BLOCKER #1: PR #98 Merge Conflicts (P0 - CRITICAL)

**Status**: BLOCKING ALL DOWNSTREAM WORK  
**Owner**: Manager Agent + CEO  
**Severity**: CRITICAL (40+ file conflicts)  
**Impact**: Blocks creation of 10 completed agent PRs

**Details**:

- PR #98 cannot merge due to extensive add/add conflicts (unrelated git histories)
- 40+ files affected: governance docs, all 16 direction files, workflows, app components
- 123 uncommitted files in working tree (agent work) MUST be preserved
- All agent work safely committed to `temp/agent-work-preservation-20251020` branch

**Resolution Options** (CEO Decision Required):

- **Option A (Recommended)**: Close PR #98, create fresh PR from main (60-90 min)
- **Option B**: Manual conflict resolution (2-4 hours)
- **Option C (Risky)**: Force merge PR #98 (may lose main changes)

**Timeline**: +2-4 hours to production deployment  
**Escalated**: 2025-10-20T01:05:00Z (Manager → CEO)

---

## Secondary Blockers (Required Before Launch)

### ⚠️ BLOCKER #2: QA Final Approval (P0 - REQUIRED)

**Status**: READY TO EXECUTE (Production app now accessible)  
**Owner**: QA Agent  
**Severity**: HIGH (Launch gate)  
**Impact**: Cannot deploy to production without QA GO

**Details**:

- QA delivered NO-GO with 4 P0 blockers on 2025-10-19
- Production app now accessible: https://hotdash-staging.fly.dev (HTTP 200 ✅)
- QA has 17 molecules to execute (production retest)
- Need final GO/NO-GO with 0 P0 blockers

**Dependencies**:

- PR #98 resolution
- 10 agent PRs merged
- Production app stable

**Timeline**: 2-4 hours after PR merges  
**SLA**: Final GO/NO-GO within 24 hours of PR #98 resolution

---

### ⚠️ BLOCKER #3: Designer Visual Review (P1 - REQUIRED)

**Status**: READY TO EXECUTE (Production app now accessible)  
**Owner**: Designer Agent  
**Severity**: MEDIUM (Quality gate)  
**Impact**: Visual defects may impact user experience

**Details**:

- Designer has 15 molecules to execute (visual review + fixes)
- Production app now accessible for Chrome DevTools MCP review
- 0% progress (direction read, awaiting execution)

**Timeline**: 3-4 hours execution  
**SLA**: Visual review within 48 hours of production access

---

### ⚠️ BLOCKER #4: Pilot Smoke Tests (P1 - REQUIRED)

**Status**: IN PROGRESS (27% complete, 4/15 molecules)  
**Owner**: Pilot Agent  
**Severity**: MEDIUM (Validation gate)  
**Impact**: May discover user workflow issues

**Details**:

- Pilot has 11 remaining molecules (production validation)
- Smoke tests created, UX docs complete, validation report done
- Production app now accessible for end-to-end testing

**Timeline**: 2-3 hours remaining  
**SLA**: Smoke tests within 48 hours of production access

---

## Completed Milestones ✅

### 🎯 Core Platform (10 Agents COMPLETE - 100%)

| Agent            | Status      | Molecules | Evidence                               | PR Ready            |
| ---------------- | ----------- | --------- | -------------------------------------- | ------------------- |
| **ai-knowledge** | ✅ COMPLETE | 15/15     | 11 files, 8/8 tests passing            | ✅ YES (Issue #103) |
| **integrations** | ✅ COMPLETE | 15/15     | 17 files, 44/44 tests passing          | ✅ YES (Issue #113) |
| **ai-customer**  | ✅ COMPLETE | 15/15     | 51 files, 23/23 tests passing, HITL    | ✅ YES (Issue #114) |
| **analytics**    | ✅ COMPLETE | 5/5       | 4 files, contract test passing         | ✅ YES (Issue #104) |
| **content**      | ✅ COMPLETE | 15/15     | 15 molecules, 98% test pass rate       | ✅ YES (Issue #116) |
| **data**         | ✅ COMPLETE | 16/16     | P0 RLS fix, contract tests passing     | ✅ YES (Issue #106) |
| **inventory**    | ✅ COMPLETE | 16/16     | 139/139 tests passing                  | ✅ YES (Issue #112) |
| **product**      | ✅ COMPLETE | 15/15     | 6 reports, GO/NO-GO analysis           | ✅ YES (Issue #117) |
| **seo**          | ✅ COMPLETE | 15/15     | 56/56 tests passing                    | ✅ YES (Issue #107) |
| **support**      | ✅ COMPLETE | 15/15     | 12/12 tests passing, 99.9% reliability | ✅ YES (Issue #111) |

**Total**: 153 molecules completed, 400+ tests passing

---

### 🎯 Infrastructure & Platform

| Component          | Status        | Owner      | Evidence                                   |
| ------------------ | ------------- | ---------- | ------------------------------------------ |
| **Production App** | ✅ LIVE       | DevOps     | https://hotdash-staging.fly.dev (HTTP 200) |
| **Shopify App**    | ✅ CONFIGURED | Manager    | Client ID: 4f72...24d, 8 scopes active     |
| **Security**       | ✅ CLEAN      | Manager    | 0 secrets (581 commits scanned, Gitleaks)  |
| **CI Guardrails**  | ✅ ACTIVE     | DevOps     | Docs policy, AI config, Gitleaks passing   |
| **MCP Tools**      | ✅ VERIFIED   | All Agents | Shopify CLI 3.85.4, Supabase CLI 2.48.3    |

---

## In Progress (3 Agents - 29-60% Complete)

| Agent        | Progress | Molecules | Evidence                                   | ETA       |
| ------------ | -------- | --------- | ------------------------------------------ | --------- |
| **engineer** | 29%      | 5/17      | Health route, test utilities, schema files | 2-3 days  |
| **pilot**    | 27%      | 4/15      | Smoke tests, UX docs, validation           | 2-3 hours |
| **devops**   | 60%      | 3/5       | CI lockfile fix, Gitleaks automation       | 1-2 hours |

---

## Ready to Execute (3 Agents - 0% Complete)

| Agent        | Molecules | Dependencies                          | ETA                                 |
| ------------ | --------- | ------------------------------------- | ----------------------------------- |
| **designer** | 0/15      | Production app accessible ✅          | 3-4 hours                           |
| **qa**       | 0/17      | Production app accessible ✅          | 4-6 hours (includes final GO/NO-GO) |
| **ads**      | 0/20      | Needs rebuild (previous work deleted) | 4-6 hours                           |

---

## Launch Criteria (DoD)

### Must Have (Launch Blockers) 🚨

- [ ] **PR #98 resolved and merged** (BLOCKER #1)
- [ ] **10 agent PRs created and merged** (Dependent on #1)
- [ ] **QA final GO with 0 P0 blockers** (BLOCKER #2)
- [ ] **Designer visual review complete** (BLOCKER #3)
- [ ] **Pilot smoke tests passed** (BLOCKER #4)
- [ ] **All CI checks green** (docs policy, Gitleaks, AI config)
- [ ] **Production app health verified** (HTTP 200, no errors)
- [ ] **Approvals drawer functional** (HITL workflow operational)

### Should Have (Quality Gates) ⚠️

- [ ] **Engineer core molecules complete** (12/17 remaining)
- [ ] **Ads system rebuilt** (20 molecules)
- [ ] **DevOps final tasks** (2/5 remaining)
- [ ] **All test suites passing** (unit + integration + E2E)
- [ ] **Security scan clean** (Gitleaks, secret scanning)
- [ ] **Analytics metrics flowing** (GA4 integration verified)

### Nice to Have (Post-Launch) 📋

- [ ] Social posting automation (Publer HITL)
- [ ] Inventory ROP automation (high confidence scenarios)
- [ ] SEO anomaly auto-triage
- [ ] Customer reply auto-drafts (high confidence)
- [ ] Knowledge base coverage >85%

---

## Release Sequencing (After Blocker Resolution)

### Phase 1: PR Resolution & Merge (2-4 hours)

1. CEO decision on PR #98 resolution strategy
2. Execute chosen strategy (recommended: Option A)
3. Merge governance/direction updates to main
4. Verify main branch clean (CI green)

### Phase 2: Agent PR Creation (2-3 hours)

1. Create 10 sequential PRs from `temp/agent-work-preservation-20251020`
2. Link each PR to respective Issue
3. Verify Allowed paths compliance (Danger)
4. Review and merge PRs sequentially
5. Monitor CI after each merge

### Phase 3: Final Validation (4-6 hours)

1. Designer executes 15 molecules (visual review)
2. QA executes 17 molecules (production retest)
3. Pilot completes remaining 11 molecules
4. All agents report final status

### Phase 4: Launch Decision (24-48 hours after Phase 3)

1. QA delivers final GO/NO-GO
2. Product reviews all metrics
3. Manager confirms all launch criteria met
4. CEO approves production launch
5. DevOps executes deployment

---

## Rollback Plan

### If Launch Fails

1. **Immediate**: Revert to previous Fly.io deployment (hot-dash-21)
2. **Communication**: Post incident report in feedback/manager/
3. **Investigation**: QA identifies root cause (24-hour SLA)
4. **Fix Forward**: Create hotfix Issue with P0 priority
5. **Relaunch**: After fix verified by QA

### Rollback Commands (DevOps)

```bash
# Revert to previous deployment
fly deploy --image registry.fly.io/hot-dash:hot-dash-21

# Verify rollback
curl -I https://hotdash-staging.fly.dev

# Monitor logs
fly logs -a hot-dash
```

---

## Monitoring & Success Metrics

### Launch Week Metrics (Day 0-7)

**Performance & Reliability**:

- [ ] P95 tile load < 3s
- [ ] Approvals drawer load < 500ms
- [ ] 0 production errors (error rate < 0.1%)
- [ ] Uptime ≥ 99.9%

**HITL Quality**:

- [ ] ≥ 90% customer replies drafted by ai-customer
- [ ] Median approval time ≤ 15 min (business hours)
- [ ] Average review grades: tone ≥ 4.5, accuracy ≥ 4.7, policy ≥ 4.8

**Governance**:

- [ ] 0 secret incidents
- [ ] 0 rogue markdown merges
- [ ] Daily drift sweeps completed
- [ ] All PRs have Issue linkage + Allowed paths

**CEO Experience**:

- [ ] CEO ad-hoc tool time -50% vs baseline
- [ ] All dashboard tiles loading with real data
- [ ] Approvals queue functional
- [ ] No context switching required

---

## Risk & Mitigation

| Risk                          | Likelihood | Impact   | Mitigation                             | Owner            |
| ----------------------------- | ---------- | -------- | -------------------------------------- | ---------------- |
| PR #98 resolution breaks code | Medium     | High     | Test all CI checks after merge         | Manager          |
| QA finds new P0 blockers      | Medium     | Critical | Delay launch, create hotfix Issues     | QA               |
| Production app crashes        | Low        | Critical | Rollback plan ready, monitoring active | DevOps           |
| Designer finds visual defects | High       | Medium   | Fix in Phase 3, delay if P0            | Designer         |
| Pilot smoke tests fail        | Medium     | High     | Fix workflows, update docs             | Pilot + Engineer |
| Merge conflicts in agent PRs  | Low        | Medium   | Sequential PR creation, careful review | Manager          |

---

## Stakeholder Communication

**Daily Brief** (See: `docs/specs/stakeholder_comms.md`):

- Morning: Status summary + blocker updates
- Evening: Progress metrics + next-day plan
- Blockers escalated within 15 minutes

**Weekly Summary**:

- Sunday: Week ahead preview
- Friday: Week in review + launch readiness %

**Launch Notification**:

- T-24h: Pre-launch checklist review
- T-1h: Final go/no-go decision
- T+0: Launch announcement
- T+24h: Launch retrospective

---

## Owner Assignments

| Area                      | Primary Owner  | Backup    |
| ------------------------- | -------------- | --------- |
| **PR #98 Resolution**     | Manager        | CEO       |
| **Agent PR Creation**     | Manager        | N/A       |
| **QA Final Approval**     | QA Agent       | Manager   |
| **Visual Review**         | Designer Agent | Pilot     |
| **Smoke Tests**           | Pilot Agent    | Engineer  |
| **Production Deployment** | DevOps Agent   | Manager   |
| **Metrics Tracking**      | Product Agent  | Analytics |
| **Stakeholder Comms**     | Product Agent  | Manager   |

---

## Version History

- **v1.0** (2025-10-20T01:02:00Z): Initial launch checklist created
  - 1 critical blocker (PR #98 conflicts)
  - 3 secondary blockers (QA, Designer, Pilot)
  - 10 agents complete (153 molecules)
  - Production app accessible

---

**Next Review**: After PR #98 resolution (ETA TBD based on CEO decision)  
**Status**: ACTIVE - Daily updates required until launch
