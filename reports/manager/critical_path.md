# Critical Path to Production

**Version**: 1.0
**Created**: 2025-10-19
**Target**: Production by 08:00 UTC 2025-10-20

## THE CRITICAL PATH (Must Complete)

### Milestone 1: Tests 100% Green (2 hours)
**Blocking Everything**

**Tasks**:
1. Engineer: Fix 4 integration test mocks (20 min)
2. Pilot: Fix Playwright test discovery (40 min)
3. QA: Run full test suite, verify 100% (60 min)

**Success Criteria**:
- Unit tests: 230/230 ✅ (DONE)
- Integration tests: 100% (currently 98.3%)
- E2E tests: All passing
- Accessibility: <5 serious violations

**Blocks**: All production deployment

---

### Milestone 2: Staging Database Ready (2 hours)
**Blocks All Data-Dependent Features**

**Tasks**:
1. DevOps: Verify CI green, scripts ready (30 min)
2. Data: Apply staging migrations (60 min)
3. Data: Run RLS tests, verify integrity (30 min)

**Success Criteria**:
- All migrations applied
- All RLS tests passing
- Data integrity verified
- Performance acceptable

**Blocks**: Analytics real data, Inventory, Approvals data

---

### Milestone 3: Core Features Working (4 hours)
**Blocks User Acceptance**

**Tasks**:
1. Engineer: Complete dashboard tiles (2 hours)
2. Engineer: Complete approvals drawer (1 hour)
3. Analytics: Wire real GA4/Shopify data (2 hours)
4. Inventory: ROP calculations working (2 hours)
5. Integrations: All API contracts passing (2 hours)

**Success Criteria**:
- All 8 tiles loading <3s
- Approvals HITL flow complete
- Real data flowing
- All features functional

**Blocks**: Staging validation

---

### Milestone 4: Staging Validated (2 hours)
**Blocks Production Deploy**

**Tasks**:
1. DevOps: Deploy to staging (30 min)
2. QA: Run E2E suite on staging (60 min)
3. Pilot: UX validation on staging (45 min)
4. Product: Compile Go/No-Go report (45 min)

**Success Criteria**:
- Staging deployed successfully
- All E2E tests passing
- UX validation complete
- Go/No-Go: GO recommendation

**Blocks**: Production deployment

---

### Milestone 5: Production Live (2 hours)
**Final Milestone**

**Tasks**:
1. CEO: Approve Go recommendation (5 min)
2. DevOps: Production database migration (60 min)
3. DevOps: Deploy application (30 min)
4. DevOps + QA: Production smoke tests (30 min)

**Success Criteria**:
- Production database migrated
- Application deployed
- Health checks passing
- Smoke tests passing
- Monitoring active

**Blocks**: Nothing (mission complete)

---

## Timeline

**Total Critical Path**: ~12 hours
- Milestone 1: 2 hours
- Milestone 2: 2 hours (parallel with M1)
- Milestone 3: 4 hours (after M1+M2)
- Milestone 4: 2 hours (after M3)
- Milestone 5: 2 hours (after M4 + CEO approval)

**With Parallelization**: ~8-10 hours

**Current Time**: 12:45 UTC
**Target**: 08:00 UTC next day (19.25 hours available)
**Buffer**: 9-11 hours (comfortable)

---

## What If Critical Path Blocked?

**If M1 blocked** (tests not 100%):
- Impact: Cannot validate any features
- Mitigation: Engineer + Pilot focus entirely on test fixes
- Escalation: After 3 hours if still blocked

**If M2 blocked** (database issues):
- Impact: Cannot use real data
- Mitigation: Proceed with mocks, deploy database separately
- Escalation: After 4 hours if still blocked

**If M3 blocked** (features not working):
- Impact: Cannot deploy incomplete product
- Mitigation: Deploy core features only, phase remaining
- Escalation: Product + Manager reassess scope

**If M4 blocked** (staging validation fails):
- Impact: Cannot safely deploy to production
- Mitigation: Fix issues, re-validate
- Escalation: If >5 P0 issues, defer production

---

**Status**: Critical path identified and achievable
**Risk**: Low (plenty of buffer time)
**Owner**: Manager tracks, escalates blockers

