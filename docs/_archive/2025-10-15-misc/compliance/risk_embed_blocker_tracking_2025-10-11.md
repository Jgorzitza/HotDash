---
epoch: 2025.10.E1
doc: docs/compliance/risk_embed_blocker_tracking_2025-10-11.md
owner: product
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# RISK-EMBED Blocker Tracking Plan — 2025-10-11T01:35Z

## Embed Token Dependency Overview

- **Primary Blocker:** Shopify Admin embed token validation and compliance clearance
- **Impact:** Blocks staging access for all teams, prevents dry run execution
- **Current Status:** BLOCKED pending legal/compliance approval for token usage patterns
- **Watchers Required:** Product, Deployment, Integrations, QA, Compliance, Legal

## Twice-Daily Update Schedule

### Morning Update (09:30 UTC)

**Checklist items to assess and log:**

1. **Token Availability Status**
   - Current embed token value in staging environment
   - Any rotation events or token refreshes since previous update
   - Staging environment accessibility tests by team

2. **Compliance Progress**
   - New vendor communications (Shopify DPA addendum)
   - Legal review status updates
   - Any compliance blockers or new requirements identified

3. **Evidence Collection**
   - New artifacts from reliability/deployment teams
   - QA test results if token access enabled
   - Documentation updates or approval emails received

4. **Required Team Actions**
   - Deployment: Environment setup or credential rotation needed
   - Integrations: API validation or Shopify app configuration
   - QA: Test suite execution or artifact collection
   - Compliance: Legal review progress or vendor escalations

### Afternoon Update (16:30 UTC)

**Checklist items to assess and log:**

1. **New Evidence or Incidents**
   - Any token-related failures or access issues during business hours
   - New documentation or approval communications received
   - Progress on outstanding action items from morning update

2. **Team Coordination Updates**
   - Deployment team progress on environment configuration
   - Integrations team vendor communication status
   - QA team readiness for testing once token cleared
   - Compliance team legal review timeline updates

3. **Escalation Decisions**
   - Whether to escalate specific blockers to manager level
   - Vendor communication timing and approach decisions
   - Resource allocation adjustments based on new information

4. **Next 24-Hour Action Plan**
   - Specific deliverables due from each team before next morning update
   - Vendor touchpoints scheduled with expected response timing
   - Decision points or go/no-go evaluations coming up

## Unblocking Criteria (Clear Exit Conditions)

### 1. Legal/Compliance Written Approval

- **Required:** Documented approval for Shopify Admin embed token usage patterns
- **Format:** Email or formal approval memo from legal/compliance teams
- **Content:** Explicit authorization for token storage, transmission, and lifecycle management
- **Evidence Path:** `docs/compliance/evidence/shopify/embed_token_approval_YYYY-MM-DD.pdf`

### 2. QA Testing Pass with Current Tokens

- **Required:** Full QA test suite execution with staging embed token
- **Performance:** Sub-300ms latency proof and Playwright test completion
- **Artifacts:** Test results, screenshots, and latency measurements documented
- **Evidence Path:** Link to DEPLOY-147 QA evidence bundle with token validation

### 3. Reliability Production Risk Signoff

- **Required:** Reliability team written signoff for production risk assessment
- **Scope:** Token rotation procedures, incident response, and monitoring coverage
- **Documentation:** Runbook references for token revocation and re-issuance
- **Evidence Path:** `feedback/reliability.md` entry with signoff timestamp and criteria

## Risk Assessment Matrix

| Risk Category          | Likelihood | Impact | Current Mitigation                      | Owner       |
| ---------------------- | ---------- | ------ | --------------------------------------- | ----------- |
| Token exposure in logs | Medium     | High   | TLS enforcement, log sanitization       | Engineering |
| Unauthorized access    | Low        | High   | Service key scoping, access controls    | Reliability |
| Compliance violation   | High       | Medium | Legal review in progress, DPA pending   | Compliance  |
| Production incident    | Medium     | High   | Incident response runbook, monitoring   | Reliability |
| QA test failures       | Medium     | Medium | Staging environment isolation, rollback | QA          |

## Linear Issue Structure

### RISK-EMBED Issue Template

```
Title: RISK-EMBED - Shopify Admin Embed Token Dependency Tracking
Status: Blocked
Priority: High
Labels: embed-token, compliance, blocker, staging-access

Description:
Tracks Shopify Admin embed token validation and compliance clearance blocking staging access for all teams.

Acceptance Criteria:
- [ ] Legal/compliance written approval obtained and documented
- [ ] QA testing pass with sub-300ms performance proof
- [ ] Reliability production risk signoff recorded
- [ ] All teams have staging access confirmation

Watchers:
- Product (owner)
- Deployment
- Integrations
- QA
- Compliance
- Legal

Daily Update Links:
- Morning (09:30 UTC): Link to feedback/product.md#blocker-updates section
- Afternoon (16:30 UTC): Link to feedback/product.md#blocker-updates section
```

### Daily Comment Template

```
## RISK-EMBED Daily Update - YYYY-MM-DD [Morning|Afternoon]

### Status Summary
- Token availability: [Available|Blocked|Unknown]
- Compliance progress: [In Review|Pending|Approved|Blocked]
- Team readiness: [Ready|Waiting|Blocked]

### New Evidence
- [List any new artifacts, approvals, or communications]

### Required Actions
- [Team]: [Specific action] by [deadline]

### Next Update
- Scheduled: [Next update time]
- Expected items: [What should be resolved by next update]

### Escalation Status
- [None|Manager review requested|Vendor escalation initiated]
```

## Automation and Reminders

### Daily Reminder Schedule

- **09:25 UTC:** Automated reminder to collect morning update data
- **09:30 UTC:** Morning update published to feedback/product.md and Linear
- **16:25 UTC:** Automated reminder to collect afternoon update data
- **16:30 UTC:** Afternoon update published to feedback/product.md and Linear
- **17:00 UTC:** Daily summary comment added to Linear RISK-EMBED issue

### Evidence Collection Automation

- **Staging Check:** Automated test of token accessibility every 2 hours during business hours
- **Documentation Scan:** Daily scan of evidence folders for new compliance documents
- **Vendor Communication:** Tracking of email threads with timestamps for response SLA
- **Team Status:** Integration with feedback files to pull latest status from each team

## Success Metrics & SLA Targets

### Response Time Targets

- **Compliance Review:** 48 hours from legal submission to written approval
- **QA Testing:** 24 hours from token access to evidence bundle completion
- **Reliability Signoff:** 12 hours from QA approval to production risk assessment
- **Vendor Response:** 72 hours from escalation to vendor acknowledgement

### Evidence Completeness Tracking

- **Daily:** Percentage of required evidence items collected and documented
- **Weekly:** Compliance milestone completion rate vs. target schedule
- **Sprint:** Overall DEPLOY-147 dependency resolution progress percentage

---

**Implementation:** Add RISK-EMBED Linear issue with this tracking plan; establish 09:30/16:30 UTC update routine in feedback/product.md
