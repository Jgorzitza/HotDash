# Incident Response Playbook - Security Incidents

**Owner:** Compliance / Manager  
**Last Updated:** 2025-10-12  
**Version:** 1.0  
**Status:** ACTIVE

---

## 1. Purpose & Scope

This playbook defines procedures for responding to security incidents affecting HotDash (Operator Control Center).

**Scope:** Security incidents including:
- Data breaches / unauthorized access
- Secret exposure (tokens, keys, credentials)
- API security incidents
- Authentication/authorization failures
- Denial of Service (DoS) attacks
- Malware / compromised systems

**Out of Scope:** Application bugs, performance issues, planned maintenance

---

## 2. Incident Classification

### 2.1 Severity Levels

#### P0 - CRITICAL (Response: Immediate)
**Impact:** Active data breach, widespread service disruption, regulatory breach

**Examples:**
- Customer data exposed publicly
- Production credentials compromised
- RLS bypass allowing unauthorized access
- Active DoS attack shutting down service
- Malware on production systems

**Response Time:** Immediate (24/7)  
**Escalation:** Manager + Engineer + Compliance  
**Notifications:** All stakeholders, customers (if data exposed)

#### P1 - HIGH (Response: 1 hour)
**Impact:** Potential data exposure, significant security control failure

**Examples:**
- Secret exposed in code/logs (not yet exploited)
- Authentication bypass discovered
- Suspicious access patterns detected
- Webhook signature verification failing
- Failed security scan with critical findings

**Response Time:** 1 hour  
**Escalation:** Manager + Compliance  
**Notifications:** Core team, compliance

#### P2 - MEDIUM (Response: 4 hours)
**Impact:** Security control degradation, limited exposure risk

**Examples:**
- Expired vendor DPA
- Failed compliance checks
- Rate limiting not working
- Security headers misconfigured
- Outdated dependencies with vulnerabilities

**Response Time:** 4 hours (business hours)  
**Escalation:** Compliance + Engineer  
**Notifications:** Relevant team members

#### P3 - LOW (Response: 24 hours)
**Impact:** Minor security gap, no immediate risk

**Examples:**
- Missing documentation
- Informational security scan findings
- Security enhancement recommendations
- Audit log gaps (non-critical)
- Training gaps identified

**Response Time:** 24 hours  
**Escalation:** Compliance  
**Notifications:** Owner only

### 2.2 Incident Types

| Type | Description | Initial Classification | Escalation Triggers |
|------|-------------|----------------------|---------------------|
| **Data Breach** | Unauthorized access to customer/business data | P0 | Always escalate |
| **Secret Exposure** | API keys, tokens, passwords exposed | P1 (P0 if exploited) | If exploited or public |
| **Auth Failure** | Authentication or authorization bypass | P1 | If actively exploited |
| **DoS/DDoS** | Service disruption via flooding | P0 (if successful) | Sustained attack |
| **Malware** | Malicious code on systems | P0 | Always escalate |
| **Insider Threat** | Unauthorized actions by team member | P0 | Always escalate |
| **Compliance** | Regulatory violation or audit failure | P2 (P1 if legal) | Legal involvement |
| **Vendor Incident** | Third-party security incident affecting us | P1 | Customer data involved |

---

## 3. Response Team & Roles

### 3.1 Core Response Team

**Incident Commander (Manager)**
- Overall incident coordination
- Decision authority
- Customer communication approval
- Post-incident review lead

**Security Lead (Compliance Agent)**
- Technical investigation
- Evidence collection
- Remediation execution
- Compliance reporting

**Engineering Lead (Engineer Agent)**
- System access and control
- Code fixes and deployments
- Database operations
- System recovery

**Communications Lead (Manager)**
- Internal stakeholder updates
- Customer notifications (if needed)
- Vendor coordination
- Status page updates

### 3.2 Extended Team (On-Call)

**Legal Counsel**
- Regulatory reporting requirements
- Customer notification review
- Vendor contract issues
- Litigation risk assessment

**QA Agent**
- Testing fixes
- Verifying remediation
- Security regression testing
- Post-incident validation

### 3.3 Contact Information

**Core Team:**
- Manager: [See RESTART_CHECKLIST.md for contact]
- Compliance: This agent (always available)
- Engineer: Agent (always available)

**Escalation Paths:**
1. Level 1: Core Response Team
2. Level 2: + QA, Legal (if needed)
3. Level 3: + External security consultant
4. Level 4: + Law enforcement (extreme cases)

---

## 4. Incident Response Phases

### Phase 1: Detection & Triage (0-15 minutes)

**Objective:** Identify and classify the incident

**Actions:**
1. **Detect Incident**
   - Monitoring alerts
   - User reports
   - Security scans
   - Vendor notifications

2. **Initial Assessment**
   - What happened?
   - What systems affected?
   - Is it ongoing?
   - Severity classification

3. **Declare Incident**
   - Create incident ticket
   - Assign Incident Commander
   - Notify core response team
   - Start incident log

**Checklist:**
- [ ] Incident detected and logged
- [ ] Severity classified (P0/P1/P2/P3)
- [ ] Incident Commander assigned
- [ ] Core team notified
- [ ] Incident timeline started

**Evidence Collection:**
- Logs from affected systems
- Screenshots of alerts
- User reports
- Monitoring data

### Phase 2: Containment (15-60 minutes)

**Objective:** Stop the incident from spreading

**Actions:**
1. **Isolate Affected Systems**
   - Revoke compromised credentials
   - Block malicious IPs
   - Disable affected endpoints
   - Isolate compromised machines

2. **Preserve Evidence**
   - Copy logs before rotation
   - Screenshot system state
   - Database snapshots
   - Network traffic captures

3. **Initial Remediation**
   - Stop active attacks
   - Close unauthorized access
   - Implement temporary fixes
   - Monitor for recurrence

**Containment Procedures by Type:**

**Data Breach:**
1. Identify scope (which data, how much, when)
2. Revoke access (disable accounts, rotate keys)
3. Block access vectors (close endpoints, update RLS)
4. Preserve evidence (logs, database snapshots)

**Secret Exposure:**
1. Identify exposed secret (type, location, age)
2. Rotate secret immediately
3. Check for exploitation (logs, metrics)
4. Revoke old secret
5. Update all references

**Auth Failure:**
1. Identify bypass mechanism
2. Disable affected endpoint if possible
3. Add temporary extra validation
4. Monitor auth logs for exploitation

**DoS Attack:**
1. Identify attack source (IPs, patterns)
2. Implement rate limiting
3. Block attacker IPs (Fly.io, Cloudflare)
4. Scale up resources if needed

**Checklist:**
- [ ] Incident contained (not spreading)
- [ ] Evidence preserved
- [ ] Temporary fixes applied
- [ ] Monitoring active for recurrence
- [ ] Status update sent to stakeholders

### Phase 3: Eradication (1-4 hours)

**Objective:** Remove the root cause

**Actions:**
1. **Root Cause Analysis**
   - How did it happen?
   - What vulnerability was exploited?
   - Why didn't controls prevent it?
   - What other systems are vulnerable?

2. **Permanent Fix**
   - Code fixes
   - Configuration changes
   - Security control enhancements
   - Process improvements

3. **Validation**
   - Test fixes
   - Verify vulnerability closed
   - Check for similar issues
   - Security scan verification

**Eradication Procedures by Type:**

**Data Breach:**
1. Close access vector (RLS fix, endpoint disable)
2. Verify no backdoors remain
3. Change all affected credentials
4. Review audit logs for other breaches

**Secret Exposure:**
1. Remove secret from all locations (code, logs, docs)
2. Verify secret rotation complete
3. Check all systems using secret
4. Update secret management process

**Auth Failure:**
1. Fix authentication logic
2. Add/fix authorization checks
3. Review similar endpoints
4. Add security tests

**DoS Attack:**
1. Implement permanent rate limiting
2. Add monitoring for similar attacks
3. Review capacity planning
4. Consider DDoS protection service

**Checklist:**
- [ ] Root cause identified
- [ ] Permanent fix developed
- [ ] Fix tested in staging
- [ ] Fix deployed to production
- [ ] Vulnerability closed (verified)
- [ ] Similar systems checked

### Phase 4: Recovery (4-24 hours)

**Objective:** Return to normal operations

**Actions:**
1. **System Restoration**
   - Re-enable disabled services
   - Restore from backups if needed
   - Verify all systems operational
   - Performance testing

2. **Monitoring**
   - Enhanced monitoring for 72 hours
   - Watch for recurrence
   - Track related metrics
   - Alerting verification

3. **Customer Communication**
   - If customer data affected
   - Transparency about incident
   - Steps taken to prevent recurrence
   - Resources for affected customers

4. **Internal Debrief**
   - Timeline review
   - Response effectiveness
   - Lessons learned
   - Action items

**Recovery Procedures by Type:**

**Data Breach:**
1. Verify no unauthorized access remains
2. Enhanced monitoring (7 days)
3. Customer notification (if required by GDPR/CCPA)
4. Regulatory reporting (if required)
5. Update DPIA with incident details

**Secret Exposure:**
1. Verify all services using new secret
2. Monitor for use of old secret (should be none)
3. Update credential index
4. Post-mortem on how it was exposed

**Auth Failure:**
1. Monitor auth success/failure rates
2. Check for bypasses of new controls
3. Review similar endpoints again
4. Update security test suite

**DoS Attack:**
1. Monitor request rates
2. Verify rate limiting effective
3. Review capacity and scaling
4. Consider DDoS protection if recurring

**Checklist:**
- [ ] All systems operational
- [ ] Enhanced monitoring active
- [ ] Customer notifications sent (if needed)
- [ ] Regulatory reports filed (if required)
- [ ] Internal debrief scheduled

### Phase 5: Post-Incident (24-72 hours)

**Objective:** Learn and improve

**Actions:**
1. **Post-Incident Review Meeting**
   - Timeline review
   - What went well?
   - What went poorly?
   - Action items for improvement

2. **Documentation Updates**
   - Update runbooks
   - Improve monitoring
   - Enhance detection
   - Training gaps identified

3. **Process Improvements**
   - Control enhancements
   - Policy updates
   - Procedure refinements
   - Technology changes

4. **Final Report**
   - Executive summary
   - Detailed timeline
   - Root cause
   - Remediation steps
   - Preventative measures
   - Action items with owners

**Post-Incident Checklist:**
- [ ] Post-incident review held
- [ ] Action items assigned
- [ ] Documentation updated
- [ ] Final report completed
- [ ] Regulatory reports filed (if required)
- [ ] Incident closed in tracking system

---

## 5. Communication Templates

### 5.1 Internal Notification (P0/P1)

**Subject:** [P0/P1] Security Incident - [Brief Description]

**To:** Core response team + stakeholders

**Body:**
```
Security Incident Notification

Severity: [P0/P1]
Type: [Data Breach / Secret Exposure / etc.]
Time Detected: [YYYY-MM-DDTHH:MM:SSZ]
Status: [Detected / Contained / Remediated]

Summary:
[Brief description of what happened]

Impact:
[Systems affected, data exposed, service disruption]

Actions Taken:
[Containment and remediation steps]

Next Steps:
[Investigation, fixes, monitoring]

Incident Commander: [Name]
Incident Log: [Link to tracking doc/ticket]

Updates will be provided every [30 minutes for P0, 2 hours for P1].
```

### 5.2 Customer Notification (Data Breach)

**Subject:** Important Security Notice - HotDash

**To:** Affected customers

**Body:**
```
Dear [Customer Name],

We are writing to inform you of a security incident that may have affected your data.

What Happened:
On [date], we discovered [brief description of incident]. We immediately took action to contain the issue and have since implemented additional security measures.

What Information Was Involved:
[Specific data elements: names, emails, etc.]

What We're Doing:
- Contained the incident immediately
- Conducted thorough investigation
- Implemented additional security controls
- Enhanced monitoring
- [Other specific actions]

What You Can Do:
- [Specific recommendations for customers]
- Monitor your accounts for suspicious activity
- Contact us if you have concerns

We take the security of your data very seriously. We apologize for this incident and any inconvenience it may cause.

For questions or concerns, please contact:
Email: support@hotrodan.com
Subject line: Security Incident [Case ID]

Sincerely,
[Manager Name]
HotDash Team

Additional Resources:
[Link to FAQ, support page, etc.]
```

### 5.3 Regulatory Notification (GDPR Data Breach)

**To:** Supervisory Authority (within 72 hours of discovery)

**Subject:** Data Breach Notification - [Organization Name]

**Body:**
```
Data Breach Notification

Organization: HotDash
Contact: [Name, Email, Phone]
Data Controller: [Legal entity name]

Breach Discovery Date: [YYYY-MM-DD]
Notification Date: [YYYY-MM-DD]

Nature of Breach:
[Detailed description of what happened]

Categories of Data Affected:
- [e.g., Names, emails, order history]
- Approximate number of individuals: [X]

Likely Consequences:
[Impact assessment for data subjects]

Measures Taken:
[Containment, eradication, recovery actions]

Measures to Mitigate Consequences:
[Steps to protect affected individuals]

Communication to Data Subjects:
[Have they been notified? When? How?]

Contact for Further Information:
[Name, email, phone of privacy officer/manager]

Attachments:
- Detailed incident timeline
- List of affected individuals (if required)
- Technical root cause analysis
```

### 5.4 Status Update (Ongoing Incident)

**Subject:** [P0/P1] Incident Update - [HH:MM] [Date]

**Body:**
```
Incident Update - [Time]

Status: [In Progress / Contained / Remediated]

Progress Since Last Update:
[What has been done]

Current Status:
[What is happening now]

Next Steps:
[What will be done next]

Estimated Time to Resolution: [Best estimate]

Impact:
[Current impact on services/data]

Next Update: [Time of next update]

Incident Commander: [Name]
```

### 5.5 Incident Closure Notice

**Subject:** [P0/P1] Incident Resolved - [Brief Description]

**Body:**
```
Incident Resolution

Severity: [P0/P1]
Incident Start: [Date/Time]
Incident End: [Date/Time]
Total Duration: [X hours]

Summary:
[What happened and how it was resolved]

Impact:
[Systems affected, data exposed, duration]

Root Cause:
[Why it happened]

Remediation:
[What was done to fix it]

Preventative Measures:
[What was done to prevent recurrence]

Follow-up Actions:
[Action items with owners and due dates]

Post-Incident Review:
Scheduled for [Date/Time]
Report available: [Link when ready]

Questions: Contact [Incident Commander]
```

---

## 6. Escalation Matrix

### 6.1 Escalation Triggers

**Automatic Escalation (P0 → All hands):**
- Active data breach with customer data exposed
- Production systems compromised
- Ransomware or malware detected
- Regulatory deadline approaching (72h for GDPR)
- Incident duration > 4 hours unresolved

**Manager Escalation (P1 → P0):**
- Secret exploitation detected
- Authentication bypass actively used
- DoS attack sustained > 1 hour
- Multiple failed containment attempts
- Customer complaints increasing

**Legal Escalation:**
- Customer PII exposed (>10 customers)
- Regulatory reporting required
- Potential lawsuit or liability
- Law enforcement involvement needed

### 6.2 Escalation Paths

**Level 1: Core Response Team**
- Manager (Incident Commander)
- Compliance (Security Lead)
- Engineer (Technical Lead)

**Level 2: Extended Team**
- QA (Testing/Validation)
- Legal (Regulatory)
- Product (Customer Impact)

**Level 3: External Support**
- Security consultant
- Forensics expert
- Legal counsel (external)
- PR/Communications firm

**Level 4: Authorities**
- Law enforcement
- Regulatory bodies
- Industry partners (if coordinated attack)

### 6.3 Decision Authority

**Incident Commander (Manager):**
- Classification changes
- Communication approval
- Customer notifications
- Incident closure
- Post-incident review authority

**Security Lead (Compliance):**
- Technical containment decisions
- Evidence collection
- Remediation plans
- Compliance reporting

**Engineering Lead:**
- System changes
- Deployments during incident
- Database operations
- Access revocations

**Legal Counsel:**
- Regulatory notifications
- Customer notification wording
- Law enforcement engagement
- Liability management

---

## 7. Incident Log Template

### 7.1 Incident Tracking

**Create in:** `artifacts/compliance/incidents/incident_[YYYY-MM-DD]_[ID].md`

**Template:**
```markdown
# Security Incident Log

**Incident ID:** INC-[YYYY-MM-DD]-[XXX]  
**Severity:** [P0/P1/P2/P3]  
**Type:** [Data Breach / Secret Exposure / etc.]  
**Status:** [Detected / Contained / Eradicated / Recovered / Closed]

**Incident Commander:** [Name]  
**Security Lead:** [Name]  
**Created:** [YYYY-MM-DDTHH:MM:SSZ]  
**Last Updated:** [YYYY-MM-DDTHH:MM:SSZ]

---

## Timeline

| Time (UTC) | Event | Actor | Actions Taken |
|------------|-------|-------|---------------|
| [HH:MM] | Incident detected | [Who] | [What they did] |
| [HH:MM] | Containment started | [Who] | [Actions] |
| [HH:MM] | Evidence preserved | [Who] | [What was saved] |
| [HH:MM] | Root cause identified | [Who] | [Finding] |
| [HH:MM] | Fix deployed | [Who] | [What was fixed] |
| [HH:MM] | Incident resolved | [Who] | [Verification] |

---

## Incident Details

### Detection
**How Detected:** [Alert / User report / Security scan / etc.]  
**Detection Time:** [YYYY-MM-DDTHH:MM:SSZ]  
**Detection Source:** [System / Tool / Person]

### Impact
**Systems Affected:** [List]  
**Data Exposed:** [Type and volume]  
**Users Affected:** [Count and details]  
**Service Disruption:** [Duration and extent]

### Root Cause
**Vulnerability:** [What was exploited]  
**Attack Vector:** [How they got in]  
**Why Controls Failed:** [Gap analysis]

### Response Actions

**Containment:**
- [Action 1]
- [Action 2]

**Eradication:**
- [Permanent fix 1]
- [Permanent fix 2]

**Recovery:**
- [Recovery step 1]
- [Recovery step 2]

---

## Evidence

**Logs:** [Locations and timestamps]  
**Screenshots:** [File paths]  
**Database Snapshots:** [Locations]  
**Network Captures:** [If any]

**Preserved in:** `artifacts/compliance/evidence/[incident-id]/`

---

## Communications

**Internal Notifications:** [Times sent, recipients]  
**Customer Notifications:** [Required? Sent? When?]  
**Regulatory Reports:** [Required? Filed? When?]

---

## Post-Incident

**Review Date:** [YYYY-MM-DD]  
**Attendees:** [List]  
**Report:** [Link to final report]

**Action Items:**
- [ ] [Action 1] - Owner: [Name], Due: [Date]
- [ ] [Action 2] - Owner: [Name], Due: [Date]

**Lessons Learned:**
1. [Lesson 1]
2. [Lesson 2]

**Improvements Implemented:**
1. [Improvement 1] - Status: [Done/In Progress]
2. [Improvement 2] - Status: [Done/In Progress]

---

**Incident Closed:** [YYYY-MM-DDTHH:MM:SSZ]  
**Closed By:** [Name]
```

---

## 8. Common Incident Scenarios

### Scenario 1: Secret Exposed in Git History

**Detection:** Code review or automated scan

**Response:**
1. **Immediate (P1 - 15 min):**
   - Rotate exposed secret
   - Check logs for usage of old secret
   - Revoke old secret

2. **Containment (30 min):**
   - Remove secret from git history (`git filter-branch` or BFG)
   - Force push (if safe) or create new repo
   - Verify all clones updated

3. **Eradication (2 hours):**
   - Update all systems to use new secret
   - Add pre-commit hook to prevent future exposures
   - Document in credential index

4. **Recovery (24 hours):**
   - Monitor for attempted use of old secret
   - Review access logs
   - Update secret management process

**Prevention:**
- Gitleaks pre-commit hook (already implemented)
- Secret scanning in CI/CD
- Credential management training

### Scenario 2: RLS Bypass Discovered

**Detection:** Security audit or bug report

**Response:**
1. **Immediate (P0/P1 - 10 min):**
   - Assess if actively exploited (check logs)
   - If exploited: Disable affected endpoint
   - If not exploited: Monitor closely

2. **Containment (30 min):**
   - Identify scope (which tables, which policies)
   - Check audit logs for unauthorized access
   - Preserve evidence

3. **Eradication (4 hours):**
   - Fix RLS policies
   - Test fix thoroughly
   - Review all similar policies
   - Deploy fix

4. **Recovery (24 hours):**
   - Re-enable endpoint if disabled
   - Enhanced monitoring for 72 hours
   - Security scan to verify fix

**Prevention:**
- RLS policy testing in CI/CD
- Regular security audits
- Peer review of all RLS changes

### Scenario 3: DoS Attack on Webhook Endpoint

**Detection:** Monitoring alerts, service degradation

**Response:**
1. **Immediate (P0 - 5 min):**
   - Identify attack source (IPs, patterns)
   - Check service health
   - Alert team

2. **Containment (15 min):**
   - Block attacking IPs (Fly.io, Cloudflare)
   - Implement emergency rate limiting
   - Scale up resources if needed

3. **Eradication (2 hours):**
   - Implement permanent rate limiting
   - Review capacity planning
   - Add monitoring for similar attacks

4. **Recovery (24 hours):**
   - Remove temporary blocks (if attack stopped)
   - Monitor request rates
   - Review and adjust rate limits

**Prevention:**
- Implement rate limiting (Task BZ-C recommendation)
- Add request monitoring and alerting
- Consider DDoS protection service

### Scenario 4: Vendor Data Breach (e.g., Supabase)

**Detection:** Vendor notification

**Response:**
1. **Immediate (P1 - 1 hour):**
   - Read vendor notification carefully
   - Assess our exposure (what data, which systems)
   - Alert core team

2. **Containment (4 hours):**
   - Rotate any potentially exposed credentials
   - Review our data in affected systems
   - Enhanced monitoring of our systems

3. **Eradication (vendor-dependent):**
   - Wait for vendor remediation
   - Verify vendor fix
   - Test our systems

4. **Recovery (vendor-dependent + 24 hours):**
   - Return to normal operations
   - Review vendor relationship
   - Update vendor security requirements

**Prevention:**
- Vendor security assessments
- Incident notification clauses in contracts
- Data minimization with vendors

---

## 9. Tools & Resources

### 9.1 Incident Response Tools

**Logging & Monitoring:**
- Supabase logs: `supabase logs --project-ref <ref>`
- Fly.io logs: `fly logs --app hot-dash`
- Decision logs: Query `decision_sync_event_logs` table

**Secret Management:**
- Vault: `vault/occ/` directory
- Credential index: `docs/ops/credential_index.md`
- Rotation scripts: `scripts/ops/`

**Evidence Collection:**
- Screenshot tool: Built-in OS tools
- Log export: Supabase dashboard or CLI
- Database snapshots: `pg_dump` via Supabase

**Communication:**
- Email templates: This document (Section 5)
- Status page: (If implemented)
- Internal chat: Use standard channels

### 9.2 External Resources

**Regulatory Guidance:**
- GDPR Breach Notification: https://gdpr.eu/data-breach-notification/
- CCPA Requirements: https://oag.ca.gov/privacy/ccpa
- ICO Guidance: https://ico.org.uk/for-organisations/

**Security Resources:**
- NIST Incident Response: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf
- SANS Incident Handler: https://www.sans.org/tools/
- OWASP Incident Response: https://cheatsheetseries.owasp.org/cheatsheets/Incident_Response_Cheat_Sheet.html

**Tools:**
- gitleaks: https://github.com/gitleaks/gitleaks
- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
- Have I Been Pwned: https://haveibeenpwned.com/

---

## 10. Training & Drills

### 10.1 Incident Response Training

**All Team Members (Annually):**
- Incident classification
- Escalation paths
- Communication protocols
- Reporting procedures

**Response Team (Quarterly):**
- Playbook review
- Tool usage
- Evidence collection
- Communication templates

**Technical Team (Monthly):**
- Containment procedures
- System access during incidents
- Log analysis
- Fix deployment under pressure

### 10.2 Tabletop Exercises

**Schedule:** Quarterly

**Scenarios to Practice:**
1. Data breach (customer data exposed)
2. Secret exposure (API key in public repo)
3. DoS attack (sustained traffic)
4. Vendor breach (third-party incident)

**Exercise Format:**
- 90-minute session
- Scenario presented by facilitator
- Team works through response
- Debrief and lessons learned
- Action items assigned

**Next Exercise:** Schedule after pilot launch

### 10.3 Red Team / Blue Team

**Schedule:** Annually (after production launch)

**Scope:**
- Penetration testing
- Social engineering attempts
- Physical security (if applicable)
- Response team effectiveness

**Provider:** External security firm (recommended)

---

## 11. Metrics & KPIs

### 11.1 Incident Response Metrics

**Response Time:**
- P0: Target < 15 min detection to response
- P1: Target < 1 hour
- P2: Target < 4 hours
- P3: Target < 24 hours

**Containment Time:**
- P0: Target < 1 hour
- P1: Target < 4 hours

**Resolution Time:**
- P0: Target < 24 hours
- P1: Target < 72 hours

**Detection Effectiveness:**
- % of incidents detected by monitoring vs. reported
- Time to detection
- False positive rate

### 11.2 Tracking

**Monthly Report:**
- Incident count by severity
- Average response/resolution time
- Recurring incident types
- Action items completed vs. pending

**Quarterly Review:**
- Incident trends
- Response effectiveness
- Process improvements
- Training gaps

---

## 12. Appendices

### Appendix A: Quick Reference Card

**Incident? Follow these steps:**

1. **Classify** (P0/P1/P2/P3)
2. **Alert** Manager + Compliance
3. **Contain** Stop the spread
4. **Preserve** Evidence
5. **Eradicate** Fix the root cause
6. **Recover** Return to normal
7. **Review** Learn and improve

**Emergency Contacts:**
- Manager: [See RESTART_CHECKLIST.md]
- Compliance: This agent
- Engineer: Agent

**Key Resources:**
- This playbook: `docs/runbooks/incident_response_security.md`
- Communication templates: Section 5
- Incident log template: Section 7

### Appendix B: Regulatory Reporting Timelines

**GDPR (EU):**
- Report to supervisory authority: 72 hours
- Notify affected individuals: "without undue delay"
- High risk: Immediate notification

**CCPA (California):**
- No specific breach notification law in CCPA
- California Civil Code §1798.82 applies
- Notify affected residents: "without unreasonable delay"

**Other Jurisdictions:**
- Check local data breach notification laws
- Consult legal counsel for compliance

### Appendix C: Incident Severity Decision Tree

```
Is customer data exposed or likely to be exposed?
├─ YES, and actively exploited → P0
├─ YES, but not yet exploited → P1
└─ NO
   └─ Is service significantly disrupted?
      ├─ YES, and widespread → P0
      ├─ YES, but limited → P1
      └─ NO
         └─ Is a security control compromised?
            ├─ YES, authentication/authorization → P1
            ├─ YES, other controls → P2
            └─ NO → P3
```

---

**Playbook Version:** 1.0  
**Last Updated:** 2025-10-12  
**Next Review:** 2026-01-12 (Quarterly)  
**Owner:** Compliance Agent

**Approval:**
- [ ] Manager
- [ ] Compliance
- [ ] Engineer
- [ ] Legal (if required)

**Change Log:**
- 2025-10-12: Initial version created (Task BZ-D)

---

**Task BZ-D: ✅ COMPLETE**  
**Incident Response:** 📋 PLAYBOOK READY

