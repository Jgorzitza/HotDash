# Rehearsal Schedule - 2025-10-16 OCC Training

## Session Details
**Date:** Thursday, 2025-10-16  
**Time:** 13:00 ET (90 minutes)  
**Format:** Live walkthrough + hands-on practice with staging data  
**Audience:** Operator core team (Ops, CX, Data, Enablement)

## Pre-Rehearsal Timeline

### T-72h (2025-10-13)
- [ ] Sprint focus deliverables confirmed complete
- [ ] Attendee roster finalized and invitations sent  
- [ ] Facilitator assignments confirmed
- [ ] Materials distribution initiated (pending evidence gates)

### T-48h (2025-10-14)  
- [ ] **CRITICAL: QA evidence delivered** - `?mock=0` sustained HTTP 200
- [ ] Synthetic check results available (<300ms latency requirement)
- [ ] Staging access package validated for all attendees
- [ ] Job aids final review completed

### T-24h (2025-10-15)
- [ ] **CRITICAL: Shopify embed token delivered** by 12:00 ET
- [ ] Distribution packet released to all stakeholders  
- [ ] Recording and evidence capture setup confirmed
- [ ] Facilitator huddle completed

### T-12h (2025-10-16 01:00 ET)
- [ ] Final smoke tests completed on staging environment
- [ ] Go/no-go decision finalized based on criteria below
- [ ] Backup scenarios prepared if needed

## Go/No-Go Criteria

### ✅ GO Criteria (All Must Be Met)
1. **Technical Infrastructure**
   - Staging environment returns HTTP 200 for `?mock=0` 
   - Response times <300ms sustained over 15-minute test window
   - Shopify embed token acquired and validated
   - Chatwoot-on-Supabase integration passing smoke tests

2. **Training Materials**  
   - Updated job aids distributed with architecture details
   - Session token workflow documented and tested
   - Async training modules ready for self-paced prep
   - Evidence capture tools functional

3. **Team Readiness**
   - All facilitators confirmed and prepared
   - ≥80% of invited operators confirmed attendance
   - Recording and backup systems operational
   - Cross-team dependencies resolved or mitigated

### 🛑 NO-GO Criteria (Any Triggers Postponement)
1. **Critical System Failures**
   - Staging environment unreachable or returning errors
   - Chatwoot-on-Supabase integration broken
   - Supabase decision logging non-functional
   - Modal authentication completely broken

2. **Evidence Gate Failures**  
   - QA evidence package not delivered by T-48h
   - Shopify embed token unavailable by T-24h
   - Synthetic performance tests failing consistently

3. **Resource Constraints**
   - <50% facilitator availability 
   - <60% operator attendance confirmed
   - Major infrastructure maintenance scheduled

## Facilitator Assignments

### Primary Facilitators
- **Support Lead (Morgan Patel):** CX Escalations walkthrough, operator guidance
- **Product (Riley Chen):** Training agenda oversight, success metrics tracking  
- **Enablement Lead:** Session pacing, Q&A capture, evidence collection

### Subject Matter Experts (On-Call)
- **Reliability Liaison:** Infrastructure troubleshooting, token validation
- **QA Observer:** Issue capture, bug vs enhancement classification  
- **Design Partner:** Visual overlay coordination (if assets ready)

## Rehearsal Agenda Summary

### 0:00-0:15 - Architecture Overview
- Chatwoot-on-Supabase architecture walkthrough
- Session token authentication flow
- Decision logging and audit trail explanation

### 0:15-0:45 - CX Escalations Deep Dive  
- Modal interface walkthrough
- AI-suggested reply review and approval
- Escalation scenarios and decision frameworks
- Error handling and support paths

### 0:45-1:15 - Sales Pulse & Cross-Modal Integration
- Sales health monitoring workflows
- Cross-modal data triggers and CX escalations
- Decision logging across multiple modals  
- Performance threshold and alerting

### 1:15-1:30 - Q&A & Feedback Collection
- Operator questions and clarifications
- Feedback capture for job aid improvements
- Action item assignment and follow-up planning

## Success Metrics

### Participation Metrics
- **Target:** ≥80% operator attendance
- **Target:** All planned scenarios completed without critical failures
- **Target:** ≥5 actionable feedback items captured for improvement

### Technical Validation
- **Target:** All modal workflows demonstrated successfully  
- **Target:** Session token authentication validated end-to-end
- **Target:** Decision logging confirmed functional in Supabase

### Readiness Assessment  
- **Target:** Operators demonstrate understanding of workflows
- **Target:** Training feedback indicates confidence for production
- **Target:** Action items have clear owners and due dates

## Contingency Plans

### Scenario: QA Evidence Delayed
- **Action:** Run rehearsal in mock mode only with recorded scenarios
- **Impact:** Limited validation of live data flows
- **Decision Authority:** QA Lead + Product approval required

### Scenario: Embed Token Unavailable
- **Action:** Focus on architecture training, defer hands-on modal testing  
- **Impact:** Operators cannot practice live authentication flow
- **Decision Authority:** Reliability liaison coordination required

### Scenario: Major Infrastructure Failure
- **Action:** Postpone to backup date (TBD) with 48h notice to all attendees
- **Impact:** Launch timeline may be affected
- **Decision Authority:** Manager escalation required

## Post-Rehearsal Actions (T+4h)

### Evidence Package Compilation
- [ ] Recordings archived to `artifacts/ops/dry_run_2025-10-16/`
- [ ] Screenshots and chat logs organized by scenario
- [ ] Decision log export with rehearsal data captured
- [ ] Feedback summary compiled with action items

### Stakeholder Summary (T+24h) 
- [ ] Success metrics and completion status
- [ ] Action items with owners and due dates  
- [ ] Launch readiness assessment with risk evaluation
- [ ] Updated job aids based on feedback

### Launch Readiness Decision (T+48h)
**Decision Point:** Go/no-go for production launch  
**Required Evidence:** Technical validation + operator confidence + compliance audit  
**Decision Authority:** Manager with team input

## Contact Information

**Primary Escalation:** customer.support@hotrodan.com  
**Emergency Channel:** #occ-reliability  
**Coordination Lead:** Enablement agent  
**Backup Facilitator:** TBD (assigned T-48h)

---

*Last Updated: 2025-10-11T01:55:00Z*  
*Next Review: Daily until rehearsal completion*