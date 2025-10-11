---
epoch: 2025.10.E1
doc: docs/enablement/rehearsal_coordination_2025-10-16.md
owner: enablement
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-17
---
# 2025-10-16 Rehearsal Coordination — Dependencies & Follow-Up Tracking

## Coordination Status
**Last Updated:** 2025-10-11T01:30:00Z  
**Overall Status:** ⚠️ **DEPENDENCIES PENDING** - QA evidence + Shopify embed token required  
**Contact:** customer.support@hotrodan.com for escalations and coordination

---

## Critical Dependencies & Ownership

### 1. Shopify Embed Token Delivery
**Owner:** Reliability  
**Status:** ⏳ **PENDING** - Token capture workflow ready, awaiting delivery  
**Dependency Details:**
- Session token required for modal authentication flow testing
- Embed token enables live Chatwoot-on-Supabase integration testing
- Without token: rehearsal limited to mock mode scenarios only

**Delivery Requirements:**
- [ ] Token captured per `docs/runbooks/shopify_embed_capture.md` workflow
- [ ] Token validated with staging environment access
- [ ] Evidence logged at `artifacts/enablement/distribution_2025-10-16/evidence/`

**Escalation:** If not delivered by 2025-10-15 12:00 ET, escalate to reliability on-call via `#occ-reliability`

### 2. Chatwoot Smoke Results & Evidence
**Owner:** QA + Reliability  
**Status:** ⏳ **PENDING** - Awaiting sustained `?mock=0` HTTP 200 evidence  
**Dependency Details:**
- QA evidence package must show sub-300ms response times
- Synthetic check JSON required for performance validation
- Chatwoot-on-Supabase integration must pass smoke tests

**Delivery Requirements:**
- [ ] `?mock=0` curl log showing sustained HTTP 200 at `artifacts/integrations/shopify/<date>/`
- [ ] Synthetic check JSON with <300ms latency at `artifacts/monitoring/`
- [ ] Chatwoot Fly host validation per `docs/deployment/chatwoot_fly_runbook.md`

**Escalation:** Monitor `DEPLOY-147` status; escalate to QA lead if evidence not available by 2025-10-14 18:00 ET

---

## Team Coordination Matrix

| Team | Contact | Primary Responsibility | Due Date | Status | Follow-Up Actions |
|------|---------|----------------------|----------|---------|------------------|
| **Support** | Morgan Patel | Session facilitation, operator guidance | 2025-10-15 | ⏳ Ready pending evidence | Confirm facilitator assignments |
| **Product** | Riley Chen | Training agenda approval, success metrics | 2025-10-14 | ⏳ Pending review | Attendee roster confirmation |
| **QA** | QA Lead | Evidence package delivery, staging validation | 2025-10-14 | ⏳ In progress | Monitor DEPLOY-147 completion |
| **Reliability** | TBD Liaison | Embed token, Chatwoot smoke, infrastructure | 2025-10-15 | ⏳ Pending owner | Assign liaison contact |
| **Design** | Design Partner | Visual overlays, screenshot annotation | 2025-10-14 | ⏳ Assets pending | Deliver annotated screenshots |
| **Marketing** | Marketing Team | Launch readiness, communication alignment | 2025-10-15 | ✅ Ready | Monitor launch coordination |

---

## Rehearsal Execution Dependencies

### Pre-Rehearsal Requirements (T-24h: 2025-10-15)
- [ ] **Staging Access Package:** All attendees can access `https://hotdash-staging.fly.dev/app`
- [ ] **Session Token Workflow:** Operators briefed on embed authentication flow
- [ ] **Evidence Bundle:** QA + reliability evidence package attached to invitations
- [ ] **Job Aids Distribution:** Updated CX Escalations + Sales Pulse materials shared
- [ ] **Facilitator Prep:** All trainers briefed on Chatwoot-on-Supabase architecture

### Day-Of Dependencies (2025-10-16 13:00 ET)
- [ ] **Live Data Access:** `?mock=0` mode functional with <300ms response times
- [ ] **Modal Authentication:** Session token enables CX Escalations + Sales Pulse modals
- [ ] **Decision Logging:** Supabase integration captures all rehearsal actions
- [ ] **Cross-Modal Data:** Sales performance data flows to CX escalation scenarios
- [ ] **Recording Setup:** Evidence capture ready for compliance audit trail

### Post-Rehearsal Follow-Up (T+24h: 2025-10-17)
- [ ] **Action Items Assigned:** All identified issues have owners and due dates
- [ ] **Evidence Archived:** Screenshots, recordings, decision logs stored
- [ ] **Feedback Synthesized:** Operator input consolidated for job aid updates
- [ ] **Launch Readiness:** Go/no-go decision documented with supporting evidence

---

## Shopify Embed Token Integration Plan

### Operator Training Focus Areas
1. **Authentication Flow Understanding**
   - Explain automatic token management (no manual operator intervention)
   - Cover troubleshooting steps for authentication failures
   - Practice escalation path for credential drift scenarios

2. **Modal Access Patterns**
   - Demonstrate proper modal launch from Shopify Admin embed context
   - Show error states and recovery procedures
   - Validate cross-modal data consistency

3. **Support Escalation Procedures**
   - Train operators on `customer.support@hotrodan.com` routing
   - Practice evidence capture for authentication issues
   - Cover fallback procedures during token refresh cycles

### Technical Integration Testing
- [ ] **End-to-End Flow:** Shopify Admin → OCC → Modal → Decision Log → Supabase
- [ ] **Error Handling:** Authentication failures, token expiry, credential drift
- [ ] **Cross-Service Sync:** Chatwoot conversation data ↔ Supabase persistence
- [ ] **Performance Validation:** Modal load times <200ms, API response <300ms

---

## Chatwoot-on-Supabase Smoke Validation

### Critical Integration Points
1. **Data Persistence Flow**
   - Operator decision → Supabase `decision_log` → Chatwoot API sync
   - Conversation history storage in Supabase with 90-day retention
   - Cross-reference capability between OCC decisions and Chatwoot threads

2. **Performance Benchmarks**
   - Modal load time: <200ms (Supabase edge caching + Fly.io deployment)
   - API response time: <300ms (sustained under load testing)
   - Sync latency: <5 seconds (decision log → Chatwoot status update)

3. **Compliance & Audit Trail**
   - All operator actions logged with timestamp, email, payload
   - NDJSON export capability for compliance reporting
   - Retention policy enforcement per Supabase configuration

### Smoke Test Validation Checklist
- [ ] **CX Escalations:** Full reply approval flow with Supabase logging
- [ ] **Sales Pulse:** Cross-modal data triggers CX escalation creation
- [ ] **Decision Audit:** Export functionality produces complete audit trail
- [ ] **Error Recovery:** Graceful fallback during temporary service outages

---

## Risk Mitigation & Contingency Planning

### High-Risk Scenarios
1. **QA Evidence Delay (>24h)**
   - **Mitigation:** Run rehearsal in mock mode only
   - **Impact:** Limited validation of live data flows
   - **Owner:** QA Lead + Product approval required

2. **Embed Token Unavailable**
   - **Mitigation:** Focus on architecture training, defer modal testing
   - **Impact:** Operators cannot practice live authentication flow
   - **Owner:** Reliability liaison coordination required

3. **Chatwoot Integration Failure**
   - **Mitigation:** Use recorded scenarios for CX Escalations training
   - **Impact:** No live conversation management practice
   - **Owner:** Support lead must adjust agenda and scenarios

### Escalation Triggers
- **T-48h:** Any critical dependency shows red status → Manager escalation
- **T-24h:** Evidence package incomplete → Rehearsal scope reduction
- **Day-of:** >2 critical systems unavailable → Session postponement consideration

---

## Communication & Follow-Up Protocol

### Stakeholder Updates
**Daily Status (until rehearsal):** Email updates to all team leads by 09:00 ET
- Dependency status changes
- Risk escalations requiring attention
- Action item completions and blockers

**Immediate Escalations:** Via `customer.support@hotrodan.com` and relevant team channels
- Critical dependency failures
- Evidence delivery delays
- Resource availability changes

### Post-Rehearsal Actions
1. **Evidence Package Compilation** (T+4h)
   - Recordings, screenshots, chat logs, decision export
   - Archive to `artifacts/ops/dry_run_2025-10-16/` with metadata
   
2. **Stakeholder Summary** (T+24h)
   - Success metrics, action items, launch readiness assessment
   - Distribution to all team leads and manager
   
3. **Job Aid Updates** (T+48h)
   - Incorporate feedback into CX Escalations + Sales Pulse materials
   - Update training agenda based on rehearsal outcomes

---

## Success Metrics & Completion Criteria

### Rehearsal Success Indicators
- [ ] **Attendance:** ≥80% of invited operators participate
- [ ] **Technical Execution:** All planned scenarios complete without critical failures  
- [ ] **Feedback Quality:** ≥5 actionable improvement items captured
- [ ] **Evidence Complete:** Full audit trail of rehearsal activities archived

### Launch Readiness Gates
- [ ] **Dependencies Resolved:** All critical items show green status
- [ ] **Operator Confidence:** Training feedback indicates readiness for production
- [ ] **Technical Validation:** End-to-end workflows proven under realistic load
- [ ] **Compliance Evidence:** Audit trail demonstrates full regulatory compliance

### Follow-Up Commitment
**Next Review:** 2025-10-17 09:00 ET - Go/no-go decision with supporting evidence  
**Owner:** Enablement lead coordination with all team representatives  
**Deliverable:** Launch readiness recommendation with risk assessment

---

## Change Log
- **2025-10-11T01:30Z:** Initial coordination document created with dependency tracking
- **Pending:** Daily updates as evidence gates progress and team assignments finalize