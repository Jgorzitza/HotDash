---
epoch: 2025.10.E1
doc: docs/runbooks/vendor_silence_escalation_template.md
owner: compliance
created: 2025-10-13
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2026-01-13
action_item: AI-004
---
# Vendor Silence Escalation Template

## Purpose
Provide standardized escalation procedures when critical third-party vendors (Supabase, Google Analytics MCP, OpenAI) become unresponsive during active incidents or critical support cases.

## Scope
This template applies to:
- **Supabase**: Database infrastructure and decision logging
- **Google Analytics (GA)**: Analytics MCP and data pipeline services
- **OpenAI**: AI/ML services powering Agent SDK
- Other critical vendors as designated by Manager

## When to Use This Template

Escalate when ANY of the following conditions are met:
1. **P0 Incident Active**: Vendor silence during active P0 incident (>30 minutes without acknowledgment)
2. **Critical Service Down**: Production service unavailable and vendor status page shows no incident (>1 hour)
3. **Data Integrity Issue**: Suspected data loss/corruption with no vendor response (>2 hours)
4. **Security Vulnerability**: Reported security issue without acknowledgment (>4 hours)
5. **SLA Breach**: Vendor missing committed response times per contract

## Escalation Levels

### Level 1: Standard Support Channels (T+0 to T+30 minutes)
**Actions:**
- [ ] Open ticket via vendor's primary support channel (email, portal, chat)
- [ ] Include: Account ID, service affected, impact description, severity level
- [ ] Copy: compliance@hotdash.internal, reliability@hotdash.internal
- [ ] Document: Log ticket number in `feedback/compliance.md` with timestamp

**Supabase Specific:**
- Support Portal: https://supabase.com/dashboard/support
- Status Page: https://status.supabase.com
- Account: [Project ID from credential_index.md]

**Google Analytics Specific:**
- Support: Google Cloud Console → Support Cases
- Status Page: https://status.cloud.google.com
- Account: [GA Property ID from credential_index.md]

**OpenAI Specific:**
- Support Portal: https://platform.openai.com/support
- Status Page: https://status.openai.com
- Account: [Organization ID from credential_index.md]

### Level 2: Premium/Enterprise Escalation (T+30 to T+90 minutes)
**Trigger Conditions:**
- No acknowledgment within 30 minutes on P0 incident
- Standard support unresponsive
- Issue escalating in severity

**Actions:**
- [ ] Escalate to premium support tier (if available)
- [ ] Contact vendor's enterprise account manager
- [ ] Reference SLA commitments and contract terms
- [ ] Update incident folder: `docs/compliance/evidence/[vendor]/incidents/[YYYYMMDD]/escalation_log.md`

**Supabase Escalation:**
- Enterprise Support: support@supabase.com (mark URGENT in subject)
- Account Manager: [Name from vendor contact sheet]
- Slack Channel: [Enterprise Slack Connect channel if available]

**Google Analytics Escalation:**
- Premium Support: 1-855-726-4249 (Google Cloud Support)
- Account Manager: [Name from vendor contact sheet]
- Priority: P1 or higher

**OpenAI Escalation:**
- Enterprise Support: enterprise-support@openai.com
- Account Manager: [Name from vendor contact sheet]
- API Status: Check platform.openai.com for known issues

### Level 3: Executive/Legal Escalation (T+90 minutes to T+4 hours)
**Trigger Conditions:**
- No substantive response after Level 2 escalation
- Data loss or security breach suspected
- Regulatory notification timelines at risk
- SLA breach documented and ongoing

**Actions:**
- [ ] Manager notifies CEO with incident summary
- [ ] Compliance prepares vendor breach documentation
- [ ] Legal reviews contract remedies and notification obligations
- [ ] Consider activating backup/failover procedures
- [ ] Document all attempts in incident folder with timestamps

**Supabase Executive Escalation:**
- Co-Founder/CEO: paul@supabase.com
- CTO: copple@supabase.com
- Legal: legal@supabase.com
- DPA Contact: [From vendor_dpa_status.md]

**Google Analytics Executive Escalation:**
- Google Cloud Account Team Leader: [From vendor contact sheet]
- Legal/Compliance: [From Google Cloud contract]
- Alternative: File formal complaint via Cloud Console

**OpenAI Executive Escalation:**
- Enterprise Escalation: enterprise-escalation@openai.com
- Security Issues: security@openai.com
- Legal: legal@openai.com

### Level 4: Business Continuity Activation (T+4 hours+)
**Trigger Conditions:**
- Vendor completely unresponsive for >4 hours on P0
- Service outage exceeding RTO (Recovery Time Objective)
- Data integrity compromised with no vendor support
- Regulatory deadlines approaching

**Actions:**
- [ ] CEO activates business continuity plan
- [ ] Manager coordinates failover to backup systems
- [ ] Compliance begins regulatory notification process
- [ ] Legal pursues contractual remedies
- [ ] Engineering implements emergency workarounds
- [ ] Marketing/Support prepare customer communications

**Business Continuity Options:**

**Supabase Failover:**
- Activate Prisma-only mode (disable Supabase replication)
- Enable read-only mode for decision logging
- Use local backups for data restoration
- Document: `docs/runbooks/supabase_failover_procedure.md`

**Google Analytics Failover:**
- Switch to direct REST API (bypass MCP if needed)
- Use cached/historical data for dashboard tiles
- Defer non-critical analytics queries
- Document: `docs/runbooks/ga_direct_api_failover.md`

**OpenAI Failover:**
- Rate limit AI agent requests
- Use cached/template responses where possible
- Activate manual approval fallback for critical decisions
- Document: `docs/runbooks/agent_sdk_degraded_mode.md`

## Communication Templates

### Internal Status Update (Every 2 Hours)
```
TO: manager@hotdash.internal, team@hotdash.internal
SUBJECT: [VENDOR] Escalation Status Update - [YYYYMMDD HH:MM]

**Vendor**: [Supabase/Google Analytics/OpenAI]
**Incident**: [Brief description]
**Severity**: [P0/P1/P2]
**Elapsed Time**: [X hours Y minutes]
**Current Escalation Level**: [1/2/3/4]

**Actions Taken**:
- [Timestamp] Opened ticket #[NUMBER]
- [Timestamp] Escalated to [LEVEL]
- [Timestamp] Contacted [PERSON/TEAM]

**Vendor Response**: [None/Acknowledged/Working/Resolved]

**Business Impact**: [Description of operational impact]

**Next Actions**: [What we're doing next]

**Evidence Location**: docs/compliance/evidence/[vendor]/incidents/[YYYYMMDD]/

Compliance Lead
```

### External Vendor Escalation Email Template
```
SUBJECT: [URGENT - P0] HotDash Production Issue - Immediate Escalation Required

TO: [Vendor Support/Account Manager]
CC: compliance@hotdash.internal, manager@hotdash.internal

Dear [Vendor Support Team],

We are experiencing a critical production issue affecting our HotDash Operator Control Center and require immediate escalation of this matter.

**Account Details**:
- Customer: HotDash (Shopify Embedded App)
- Account ID: [From credential_index.md]
- Contract: [Enterprise/Premium/Standard]
- Support Tier: [Level]

**Incident Details**:
- Incident ID: [Our internal ID]
- Severity: P0 - Production Outage
- Service Affected: [Specific service/API]
- Impact: [Description of business impact]
- Operators Affected: [Number or "All"]
- Started: [ISO 8601 timestamp]
- Duration: [X hours Y minutes]

**Previous Escalation Attempts**:
- [Timestamp] Opened ticket #[NUMBER] - No response
- [Timestamp] Contacted [Channel] - No acknowledgment
- [Timestamp] Checked status page - No reported incidents

**Regulatory Considerations**:
We have data retention and audit obligations under GDPR/CCPA. If this outage exceeds [X hours], we may be required to file regulatory notifications. We need immediate assistance to:
1. Restore service functionality
2. Verify data integrity
3. Obtain incident root cause documentation

**Requested Actions**:
1. Immediate acknowledgment of this escalation (within 15 minutes)
2. Assign senior engineer to investigate (within 30 minutes)
3. Provide status updates every 30 minutes until resolution
4. Post-incident report within 48 hours of resolution

**Contact Information**:
- Primary: compliance@hotdash.internal
- Phone: [On-call number]
- Incident Channel: [Slack/Discord if available]

We value our partnership and hope for swift resolution. Please treat this as your highest priority.

Regards,
[Name]
Compliance Lead, HotDash
compliance@hotdash.internal
```

## Evidence Requirements

All escalations must be documented in:
`docs/compliance/evidence/[vendor]/incidents/[YYYYMMDD]/`

**Required Files**:
- `escalation_log.md` - Timestamped log of all actions taken
- `vendor_communications.md` - Copy of all emails, tickets, chat logs
- `impact_assessment.md` - Business impact, affected merchants, data scope
- `resolution_summary.md` - Final outcome and lessons learned (post-incident)

**Escalation Log Format**:
```markdown
# Vendor Escalation Log - [VENDOR] - [YYYYMMDD]

## Incident Summary
- **Vendor**: [Name]
- **Issue**: [Description]
- **Severity**: [P0/P1/P2]
- **Start Time**: [ISO 8601]
- **Resolution Time**: [ISO 8601 or "Ongoing"]

## Escalation Timeline

### [YYYY-MM-DD HH:MM:SSZ] - Level 1: Standard Support
- **Action**: Opened support ticket
- **Channel**: [Email/Portal/Phone]
- **Ticket Number**: [NUMBER]
- **Response**: [None/Acknowledged/Working]

### [YYYY-MM-DD HH:MM:SSZ] - Level 2: Premium Escalation
- **Action**: Contacted account manager
- **Contact**: [Name, email]
- **Response**: [Details]

### [YYYY-MM-DD HH:MM:SSZ] - Level 3: Executive Escalation
- **Action**: Escalated to vendor executive team
- **Contact**: [Names, titles]
- **Response**: [Details]

### [YYYY-MM-DD HH:MM:SSZ] - Level 4: Business Continuity
- **Action**: Activated failover procedures
- **Procedure**: [Reference to runbook]
- **Outcome**: [Results]

## Lessons Learned
[Post-incident analysis]
```

## Post-Escalation Actions

After incident resolution:
1. [ ] Document complete escalation timeline with all timestamps
2. [ ] Request vendor post-mortem/root cause analysis
3. [ ] Update vendor contact information if new contacts discovered
4. [ ] Review and update SLA/contract if vendor response inadequate
5. [ ] Share lessons learned with team in `feedback/manager.md`
6. [ ] Update this template if new escalation paths identified
7. [ ] Archive all evidence in compliance folder

## Manager Approval Required

The following actions require Manager approval before execution:
- Level 3 Executive Escalation (involving vendor executives)
- Level 4 Business Continuity Activation (failover procedures)
- Public communication about vendor issues
- Contract/legal remedies
- Switching to alternative vendors

## Vendor Contact Registry

**Current as of**: 2025-10-13

| Vendor | Support Channel | Enterprise Contact | Escalation Path | SLA Response Time |
|--------|----------------|-------------------|-----------------|-------------------|
| Supabase | support@supabase.com | [TBD] | Standard→Premium→Executive | 30m / 1h / 4h |
| Google Analytics | Cloud Console | [TBD] | Standard→Premium→Executive | 1h / 2h / 4h |
| OpenAI | platform.openai.com/support | [TBD] | Standard→Enterprise→Executive | 1h / 4h / 8h |

**Note**: Maintain current contact details in `docs/ops/credential_index.md` and update this template annually.

## Related Runbooks
- `docs/runbooks/incident_response_supabase.md` - Supabase-specific incident response
- `docs/runbooks/incident_response_security.md` - Security incident procedures
- `docs/runbooks/supabase_failover_procedure.md` - Supabase business continuity
- `docs/ops/credential_index.md` - Vendor account details and credentials

---

**Revision History**:
- 2025-10-13: Initial template created (AI-004 action item from tabletop exercise)
- Template owner: Compliance Lead
- Review frequency: Annually or after major vendor escalation
- Next review: 2026-01-13

