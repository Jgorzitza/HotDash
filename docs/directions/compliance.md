---
epoch: 2025.10.E1
doc: docs/directions/compliance.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Compliance — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Compliance agent must request updates through the manager with supporting evidence; do not create or edit direction docs directly.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands (audits, evidence packaging) without approval. Guardrails:

- Scope: local repo and local Supabase reads; no remote infra changes under auto-run.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/compliance.md; store under artifacts/compliance/.
- Secrets: load from vault/env; never print values.
- Retry: 2 attempts then escalate with logs.

- Maintain the end-to-end data inventory, including sources, storage locations, retention policies, and access controls; publish updates under `docs/compliance/`.
- Own privacy impact assessments for major features (decision logging, AI suggestions, Supabase replication) and ensure incident response steps are documented.
- Review third-party agreements (Supabase, OpenAI, GA MCP, Hootsuite) for data processing and breach obligations; flag gaps before credentials go live.
- Coordinate with reliability and deployment on secret handling, documenting the no-rotation decision and ensuring audit evidence stays current.
- Ensure operator-facing copy and training materials include accurate privacy disclosures; partner with marketing/enablement when updates are required.
- Stack guardrails: reference `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex tooling) when auditing; flag any drift immediately.
- Log daily status, risks, and evidence references in `feedback/compliance.md`.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/compliance.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12
You own each deliverable below from start to finish. Capture every command, outreach, and artifact path in `feedback/compliance.md`; retry twice before escalating, and attach the failed evidence when you do.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/compliance.md and continue):

1. ✅ **Security Audit** - COMPLETE (2025-10-11, 1-2h)
   - 8 critical findings identified (3 P0, 3 P1, 2 P2)
   - 50-page compliance report delivered
   - Evidence: Complete audit in feedback/compliance.md

2. **P0 Secret Exposure Remediation** - Execute urgent security fixes
   - Scan ALL feedback files for exposed credentials/tokens/API keys
   - Add [REDACTED] markers to sensitive values
   - Verify vault/ file permissions are 600 (owner read/write only)
   - Document exposed items and remediation actions
   - Evidence: Remediation log with before/after, documented in feedback/compliance.md

3. **P0 Credential Rotation Check** - Verify rotation schedule compliance
   - Check last rotation dates for all secrets in vault/occ/
   - Identify overdue rotations (>90 days)
   - Create rotation schedule with dates
   - Coordinate: Tag @deployment for rotation execution
   - Evidence: Rotation schedule, overdue list

4. **P0 Supabase DPA Follow-up** - Close vendor agreement gap
   - Follow up on ticket #SUP-49213
   - Document response status and timeline
   - Escalate if no response within 48h
   - Update docs/compliance/evidence/vendor_dpa_status.md
   - Evidence: Vendor correspondence logged

5. **P1 Secret Scanning Automation** - Implement automated security checks
   - Add gitleaks pre-commit hook
   - Test on sample commits with secrets
   - Document in runbook
   - Verify CI secret scanning active
   - Evidence: Hook configuration, test results

6. **Agent SDK Security Review** - Validate new service security
   - Review Agent SDK approval endpoints for CSRF protection
   - Verify authentication/authorization on all routes
   - Check for input validation and sanitization
   - Ensure no secrets logged by Agent SDK
   - Coordinate: Tag @engineer for any security fixes needed
   - Evidence: Security review checklist, findings

7. **Production Security Checklist** - Final sign-off for pilot launch
   - Verify all P0 remediations complete
   - Check all secrets rotated and secured
   - Verify monitoring and alerting active
   - Sign-off on pilot launch security posture
   - Evidence: Security approval document

**Ongoing Requirements**:
- Monitor secret scanning alerts
- Update compliance posture in feedback/compliance.md
- Coordinate with @deployment on credential rotation

---

### 🎉 EXCELLENT WORK - ALL P0/P1 TASKS COMPLETE

**Manager Review**: Outstanding security work. All remediations executed perfectly.

### 🚀 ONGOING MONITORING TASKS

**Task A: Daily Secret Scan** - Automated security monitoring
- Run gitleaks scan daily
- Check feedback files for new exposures
- Monitor vault/ permissions
- Report findings immediately
- Evidence: Daily scan logs

**Task B: Agent SDK Security Monitoring** - Monitor new services
- Review Agent SDK code as @engineer builds
- Check for security issues (auth, validation, secrets)
- Test approval endpoint security
- Document findings
- Coordinate: Tag @engineer for fixes
- Evidence: Security review notes

**Task C: Compliance Dashboard** - Create compliance tracking
- Create dashboard for compliance posture
- Track P0/P1/P2 findings status
- Monitor DPA vendor responses
- Document compliance metrics
- Evidence: Dashboard design, tracking sheet

Execute A daily, B as Engineer progresses, C for ongoing visibility.

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Task D: Data Privacy Impact Assessment**
- Conduct DPIA for Agent SDK (customer data processing)
- Document data flows and retention
- Assess GDPR/CCPA compliance requirements
- Create privacy documentation for customers
- Evidence: Privacy impact assessment report

**Task E: Security Incident Response Testing**
- Test incident response procedures
- Conduct tabletop exercise for data breach
- Document lessons learned
- Update incident response runbooks
- Evidence: Incident response test results

**Task F: Compliance Automation**
- Design automated compliance checking
- Create compliance reporting dashboards
- Implement policy violation detection
- Document compliance workflow automation
- Evidence: Compliance automation framework

**Task G: Third-Party Risk Assessment**
- Assess risks from all third-party services
- Document vendor security posture
- Create vendor risk matrix
- Plan for ongoing vendor assessments
- Evidence: Third-party risk assessment

**Task H: Access Control Audit**
- Audit all system access controls
- Review role-based permissions
- Document principle of least privilege compliance
- Create access review procedures
- Evidence: Access control audit report

**Task I: Compliance Documentation**
- Create comprehensive compliance documentation
- Document all policies and procedures
- Design compliance evidence repository
- Plan for compliance audits
- Evidence: Compliance documentation suite

**Task J: Regulatory Change Monitoring**
- Set up monitoring for regulatory changes (GDPR, CCPA, etc.)
- Create change impact assessment process
- Document compliance update workflow
- Plan for proactive compliance management
- Evidence: Regulatory monitoring framework

Execute D-J in any order - all strengthen compliance posture.

---

### 🚀 MASSIVE EXPANSION (5x Capacity) - 20 Additional Tasks

**Task K-O: Advanced Compliance Programs** (5 tasks)
- K: Design comprehensive information security management system (ISMS)
- L: Create SOC 2 Type II readiness program and gap analysis
- M: Implement ISO 27001 compliance framework
- N: Design PCI DSS compliance program (if payment data handled)
- O: Create HIPAA compliance framework (if health data processed)

**Task P-T: Security Operations** (5 tasks)
- P: Design security operations center (SOC) procedures
- Q: Create threat intelligence monitoring and response
- R: Implement vulnerability management program
- S: Design penetration testing program (schedule, scope, remediation)
- T: Create security awareness training program for all team members

**Task U-Y: Audit & Certification** (5 tasks)
- U: Prepare for external security audit (readiness checklist)
- V: Create internal audit program (quarterly reviews)
- W: Design compliance certification tracking system
- X: Implement continuous compliance monitoring
- Y: Create compliance dashboard for executive reporting

**Task Z-AD: Risk Management** (5 tasks)
- Z: Design comprehensive risk assessment framework
- AA: Create business continuity and disaster recovery plans
- AB: Implement cyber insurance requirements assessment
- AC: Design supply chain security assessment
- AD: Create insider threat detection and prevention program

Execute K-AD in any order. Total: 27 tasks, ~18-20 hours of compliance work.

---

### 🚀 FOURTH MASSIVE EXPANSION (Another 25 Tasks)

**Task AE-AJ: Security Architecture** (6 tasks)
- AE: Design zero-trust security architecture
- AF: Create security reference architecture documentation
- AG: Implement defense-in-depth strategy
- AH: Design secure software development lifecycle (SSDLC)
- AI: Create security champions program for development team
- AJ: Implement security design review process

**Task AK-AP: Threat Management** (6 tasks)
- AK: Create threat modeling for all services
- AL: Design attack surface analysis and reduction
- AM: Implement security incident simulation program
- AN: Create red team/blue team exercise program
- AO: Design bug bounty program
- AP: Implement security metrics dashboard

**Task AQ-AV: Governance & Policy** (6 tasks)
- AQ: Create information classification policy
- AR: Design acceptable use policy
- AS: Implement data retention and destruction policy
- AT: Create third-party security requirements
- AU: Design security exception and waiver process
- AV: Implement security policy review and update cycle

**Task AW-BA: Compliance Operations** (7 tasks)
- AW: Design compliance testing and validation program
- AX: Create compliance reporting automation
- AY: Implement compliance KPI tracking
- AZ: Design compliance training program for all staff
- BA: Create compliance knowledge base

Execute AE-BA in any order. Total: 52 tasks, ~30-35 hours work.

---

### 🚀 SIXTH MASSIVE EXPANSION (Another 25 Tasks)

**Task BB-BF: Privacy Engineering** (5 tasks)
- BB: Design privacy-by-design framework
- BC: Create data minimization strategies
- BD: Implement consent management system
- BE: Design privacy impact assessments
- BF: Create privacy engineering training

**Task BG-BK: Security Operations Center** (5 tasks)
- BG: Design 24/7 SOC operations model
- BH: Create security playbooks library
- BI: Implement security orchestration automation
- BJ: Design security metrics dashboard
- BK: Create security team training program

**Task BL-BP: Compliance Automation** (5 tasks)
- BL: Design automated compliance testing
- BM: Create continuous compliance monitoring
- BN: Implement compliance evidence automation
- BO: Design compliance reporting automation
- BP: Create compliance dashboard

**Task BQ-BU: Third-Party Risk** (5 tasks)
- BQ: Design vendor security assessment
- BR: Create third-party monitoring program
- BS: Implement vendor risk scoring
- BT: Design supply chain security framework
- BU: Create vendor incident response

**Task BV-BZ: Advanced Security** (5 tasks)
- BV: Design quantum-resistant cryptography roadmap
- BW: Create AI/ML security framework
- BX: Implement blockchain for audit trails
- BY: Design decentralized identity management
- BZ: Create zero-knowledge proof implementations

Execute BB-BZ in any order. Total: 77 tasks, ~45-50 hours work.

---

## 🚨 LAUNCH CRITICAL REFOCUS (2025-10-11T22:50Z)

**CEO Decision**: Emergency refocus on launch gates

**Your Status**: PAUSED - Stand by until launch gates complete

**Why PAUSED**: Launch gates require Engineer, QA, Designer, Deployment work. Your tasks are valuable but not launch-blocking.

**When to Resume**: After all 7 launch gates complete (~48-72 hours)

**What to Do Now**: Stand by, review your completed work quality, ensure evidence is documented

**Your tasks remain in direction file - will resume after launch.**
