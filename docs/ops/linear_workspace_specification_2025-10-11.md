---
epoch: 2025.10.E1
doc: docs/ops/linear_workspace_specification_2025-10-11.md
owner: product
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---
# Linear Workspace Specification — HotDash OCC Sprint 2025-10-11

## Sprint Configuration
- **Sprint Name:** HotDash OCC Sprint 2025-10-11 to 2025-10-18
- **Sprint Goal:** Resolve DEPLOY-147 blockers and establish production readiness framework
- **Sprint Duration:** 7 days (2025-10-11T00:00Z to 2025-10-18T23:59Z)
- **Team Capacity:** Cross-functional (Product, QA, Compliance, Data, DevOps, Marketing)

## Issue Labels System
```
Priority Labels:
- critical          # Blocks production deployment
- high             # Blocks sprint completion 
- medium           # Important but not blocking
- low              # Nice-to-have improvements

Category Labels:
- compliance       # Legal/regulatory requirements
- risk             # Risk management and mitigation
- qa               # Quality assurance and testing
- evidence         # Artifact collection and validation
- embed-token      # Shopify embed token dependencies
- audit            # Compliance and security audits
- docs             # Documentation and process updates
- release          # Release management and gates
- guardrail        # Stack compliance enforcement
- blocker          # Active blocking dependencies
- automation       # Process automation and tooling
```

## Workflow States
```
1. Triage          # New issues requiring assessment
2. In Progress     # Actively being worked
3. Waiting on External  # Blocked by vendor/external dependency
4. Review          # Completed, pending validation
5. Blocked         # Cannot proceed due to dependency
6. Done            # Completed and validated
```

## WIP Limits & Team Assignment
- **Product:** 3 active issues max (owns coordination and escalation)
- **QA:** 2 active issues max (evidence validation and testing)  
- **Compliance:** 2 active issues max (legal review and vendor management)
- **Data:** 2 active issues max (pipeline implementation and validation)
- **DevOps:** 2 active issues max (infrastructure and deployment)
- **Marketing:** 1 active issue max (communications and enablement)

## Core Sprint Issues

### DEPLOY-147 — QA Evidence Bundle (CRITICAL)
```
Title: DEPLOY-147 - Anchor on QA Evidence Bundle
Priority: Critical
Status: Blocked
Labels: critical, qa, evidence, embed-token, blocker
Assignee: QA Team
Watchers: Product, Deployment, Integrations

Description:
Primary sprint blocker requiring comprehensive evidence bundle for production readiness.

Acceptance Criteria:
- [ ] Sub-300ms ?mock=0 performance proof with timestamp
- [ ] Playwright test suite rerun with complete artifacts  
- [ ] Embed token validation and compliance clearance
- [ ] Nightly AI logging cadence alignment with QA/Data teams
- [ ] Reliability no-rotation stance documented and approved

Dependencies:
- RISK-EMBED (embed token clearance)
- COMP-SCC-DPA (compliance approvals) 
- OPS-NIGHTLY (logging pipeline readiness)

Evidence Links:
- Memory: packages/memory/logs/ops/decisions.ndjson#ops-deploy-147-evidence-anchor-20251011T010600
- Feedback: feedback/product.md#deploy-147-tracking
- Sanitized History: commit af1d9f1
```

### COMP-SCC-DPA — Compliance Escalations (HIGH)
```
Title: COMP-SCC-DPA - Track SCC and DPA Escalations
Priority: High  
Status: In Progress
Labels: high, compliance, risk, evidence, blocker
Assignee: Compliance Team
Watchers: Product, Legal, Manager

Description:
Drive daily escalation sessions for vendor DPA/SCC approvals blocking production deployment.

Acceptance Criteria:
- [ ] Supabase SCC countersignature received (ticket #SUP-49213)
- [ ] OpenAI Enterprise DPA finalized with retention opt-out
- [ ] GA MCP data residency confirmation obtained  
- [ ] Embed token usage patterns approved by legal/compliance
- [ ] Daily escalation sessions (16:00 UTC) until completion

Subtasks:
- Token scope & lifetime verification
- Storage & transmission analysis  
- Incident & revocation procedures
- Nightly AI logging audit compliance

Evidence Links:
- Plan: docs/compliance/comp_scc_dpa_escalation_plan_2025-10-11.md
- Status: docs/compliance/evidence/vendor_dpa_status.md
- Daily Updates: feedback/product.md#blocker-updates
```

### RISK-EMBED — Embed Token Dependency (HIGH)
```
Title: RISK-EMBED - Shopify Admin Embed Token Dependency
Priority: High
Status: Blocked  
Labels: high, embed-token, compliance, blocker, staging-access
Assignee: Product Team
Watchers: Deployment, Integrations, QA, Compliance, Legal

Description:
Track embed token validation and compliance clearance blocking staging access for all teams.

Acceptance Criteria:
- [ ] Legal/compliance written approval for token usage patterns
- [ ] QA testing pass with sub-300ms performance proof
- [ ] Reliability production risk signoff recorded  
- [ ] All teams staging access confirmation

Daily Updates:
- Morning (09:30 UTC): Token availability, compliance progress, evidence collection
- Afternoon (16:30 UTC): New evidence, team coordination, escalation decisions

Evidence Links:  
- Plan: docs/compliance/risk_embed_blocker_tracking_2025-10-11.md
- Updates: feedback/product.md#blocker-updates
- Risk Matrix: Embedded in tracking plan document
```

### OPS-NIGHTLY — AI Logging & Index Cadence (MEDIUM)
```
Title: OPS-NIGHTLY - Nightly AI Logging & Index Cadence 
Priority: Medium
Status: In Progress
Labels: medium, automation, evidence, qa
Assignee: Data Team
Watchers: Product, QA, Engineering

Description:
Implement automated nightly logging pipeline with QA/Data coordination for evidence bundle generation.

Acceptance Criteria:
- [ ] 02:00 UTC automated execution successful for 7 consecutive days
- [ ] QA daily evidence bundle consumption and DEPLOY-147 updates
- [ ] Data Agent compliance sign-off with no policy violations  
- [ ] Sub-300ms index query performance maintained in staging
- [ ] 14-day artifact retention automation verified

Implementation Phases:
1. Pipeline setup (2025-10-11 to 2025-10-12)
2. QA integration (2025-10-12 to 2025-10-13)  
3. Data compliance (2025-10-13 to 2025-10-14)
4. Production readiness (2025-10-14 to 2025-10-16)

Evidence Links:
- Plan: docs/data/nightly_ai_logging_implementation_plan_2025-10-11.md
- Bundle Path: artifacts/nightly/YYYY-MM-DD/ (to be created)
```

### DOCS-DRY-RUN — Operator Dry Run Publication (MEDIUM)
```
Title: DOCS-DRY-RUN - Polish Operator Dry Run Pre-Read
Priority: Medium  
Status: Review
Labels: medium, docs, compliance, release
Assignee: Product Team
Watchers: Support, Enablement, QA

Description:
Pre-read document ready for immediate publication once publication gates satisfied.

Publication Gates (DO NOT PUBLISH UNTIL ALL THREE SATISFIED):
- [ ] Staging access confirmed (DEPLOY-147 evidence bundle complete)
- [ ] Embed token cleared (RISK-EMBED compliance approval)
- [ ] Latency evidence meeting thresholds (sub-300ms performance proof)

Staged Actions (Ready for Immediate Execution):
- [ ] Memory entry publication (ops-dry-run-publication-20251016)
- [ ] Linear status change to "Review" with attendee confirmations
- [ ] Stakeholder notification (#occ-product, #occ-stakeholders)
- [ ] Manager sync inclusion with publication readiness status

Evidence Links:
- Document: docs/strategy/operator_dry_run_pre_read_draft.md
- Updates: Git commit history with stack guardrails integration
```

### AUDIT-STACK — Monday/Thursday Compliance Audits (MEDIUM)
```
Title: AUDIT-STACK - Monday/Thursday Stack Compliance Audits  
Priority: Medium
Status: Triage
Labels: medium, audit, guardrail, compliance
Assignee: Product Team
Watchers: Compliance, Security, Engineering

Description:
Bi-weekly stack compliance audits to ensure canonical toolkit adherence.

Schedule: Monday & Thursday 45 minutes each
Participants: Product, Compliance, Security, Engineering

Pre-Audit Checklist:
- [ ] Supabase-only backend confirmed, RLS policies validated
- [ ] Chatwoot deployed on Supabase, data residency verified
- [ ] Frontend React Router 7 only, no incompatible packages
- [ ] AI stack OpenAI + LlamaIndex only, config reviewed
- [ ] Data retention & encryption settings verified

Deliverables:
- Audit minutes in feedback/product.md  
- Action items tracked in Linear with owners/deadlines
- Guardrail violation blocking merges until resolved
```

### RELEASE-CADENCE — Mock to Staging to Production (LOW)
```
Title: RELEASE-CADENCE - Mock to Staging to Production Review Gates
Priority: Low
Status: Triage  
Labels: low, release, docs, qa
Assignee: Product Team
Watchers: QA, Reliability, Compliance

Description:
Coordinate release review gates from mock through production deployment.

Release Gates:
1. Mock Review: Dry run with synthetic data, latency/error recording
2. Staging Review: Full test plan, evidence bundle, performance validation  
3. Production Gate: Go/no-go meeting, rollback plan, stakeholder signoffs

Gate Dependencies:
- Mock: DEPLOY-147 evidence bundle completion
- Staging: RISK-EMBED clearance + OPS-NIGHTLY readiness
- Production: All compliance approvals + reliability signoff

Evidence Links:
- Each gate decision recorded in feedback/product.md
- Linear updates mirror gate status and artifact links
```

## Automation & Reminders

### Daily Automation Schedule
- **09:25 UTC:** Blocker update reminder (RISK-EMBED morning checklist)
- **09:30 UTC:** Morning update publication to feedback/product.md + Linear
- **16:25 UTC:** Afternoon blocker update reminder
- **16:30 UTC:** Afternoon update publication  
- **16:00 UTC:** Daily SCC/DPA escalation session (COMP-SCC-DPA)
- **17:00 UTC:** Linear status summaries and cross-issue updates

### Weekly Automation
- **Monday/Thursday:** AUDIT-STACK pre-audit reminders and calendar holds
- **Tuesday:** Customer call scheduling and preparation (future)
- **Friday:** Sprint retrospective and backlog grooming preparation

## Success Metrics & Reporting

### Sprint Burndown Tracking
- **DEPLOY-147 Evidence Completeness:** Daily % of required artifacts present
- **Compliance Milestone Progress:** SCC/DPA vendor response rates  
- **Team Coordination Efficiency:** Average response time to blocker updates
- **Evidence Quality Score:** Validation pass rate for submitted artifacts

### Real-time Dashboard Links
- Sprint Board: [Linear project view - to be created]
- Blocker Status: feedback/product.md#blocker-updates
- Evidence Archive: docs/compliance/evidence/ folder structure
- Memory Entries: packages/memory/logs/ops/decisions.ndjson

---
**Implementation:** Create Linear project with above configuration; import issues with templates and automation rules