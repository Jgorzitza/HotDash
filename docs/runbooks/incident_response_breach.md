---
epoch: 2025.10.E1
doc: docs/runbooks/incident_response_breach.md
owner: compliance
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-14
---
# Incident Response Runbook — Data Breach & Privacy Events

## Purpose
Provide a step-by-step playbook for detecting, containing, and notifying stakeholders about security or privacy incidents impacting HotDash data (Shopify, Chatwoot, Supabase, Google Analytics MCP, OpenAI). This runbook aligns with GDPR/CCPA timelines and manager direction requiring evidence of drills in `docs/runbooks/`.

## Scope
- Unauthorized access, exfiltration, or modification of personal data (operator emails, Chatwoot transcripts, Shopify data, Supabase decision logs).
- Credential exposures (Shopify, Supabase, Chatwoot, GA MCP, OpenAI) with evidence of misuse or high risk.
- Third-party processor incidents reported via vendor status pages or contracts.

---

## Roles & Contacts
- **IR Lead (Compliance agent)** — Owns coordination, documentation, regulatory determinations, and customer/merchant notifications.
- **Reliability On-Call** — Executes containment steps (secret rotation, service isolation, backup validation). Refer to `docs/runbooks/secret_rotation.md` and `docs/runbooks/backup_restore.md` for procedures.
- **Engineering Lead** — Provides forensic support, log extraction, and patches.
- **Support Lead** — Handles operator/internal communications and customer inquiries.
- **Marketing/Comms** — Approves external messaging once compliance signs off.
- **Vendors** — Supabase support, Shopify Partner Support, Chatwoot success, OpenAI enterprise support, GA MCP contact (see vendor sheet in progress).

Document contact list in `docs/compliance/vendor_contacts.md` (placeholder) before production launch.

---

## Detection & Triage (T+0 - T+30 minutes)
1. **Trigger Sources**
   - Supabase sync logs (`supabase.decisionSync`, `supabase.analyticsSync`) emitting failures/anomalies.
   - Prisma access logs, Shopify webhook alerts, Chatwoot admin notifications, GA MCP status updates.
   - External vulnerability advisories (CVE, upstream notifications).
2. **Initial Assessment**
   - Open incident ticket in `feedback/compliance.md` (`## Incident YYYY-MM-DD`) with timestamp.
   - Capture current evidence: log excerpts, screenshots, vendor emails. Store under `docs/compliance/evidence/INCIDENT_ID/`.
   - Determine if personal data or confidential business data is involved.
3. **Classification**
   - Use severity matrix:
     - **P0**: Confirmed exfiltration of PD/SPD.
     - **P1**: Credential exposure with suspected misuse.
     - **P2**: Potential issue pending validation.
   - If Sev P0/P1, escalate to Manager immediately via designated channel.

---

## Containment (T+30 - T+90 minutes)
1. Assign Reliability On-Call to rotate affected secrets (`docs/runbooks/secret_rotation.md`).
2. Disable compromised integrations:
   - Revoke Shopify app credentials in Partner dashboard.
   - Regenerate Supabase service key; restrict RLS to read-only until validated.
   - Disable Chatwoot tokens via admin UI; revoke OpenAI key (via LlamaIndex service config) if prompts leaked.
3. Block access to affected tiles/features by toggling feature flags (`app/config/featureFlags.ts`) or environment variables.
4. Snapshot current databases (Prisma + Supabase) for forensics before modifications.

---

## Investigation & Impact Analysis (T+90 minutes - T+6 hours)
1. Pull relevant logs:
   - Prisma query logs, Supabase audit trails, Chatwoot conversation audit, Shopify Admin API logs, GA MCP request logs.
2. Identify data subjects affected (shop domains, operator emails, customer names).
3. Quantify scope (records, time window, systems).
4. Determine regulatory notification requirement (GDPR 72h, CCPA timely consumer notice).
5. Draft summary in `docs/compliance/evidence/INCIDENT_ID/impact.md` covering who/what/when/how.

---

## Notification & Communication (T+6 - T+24 hours)
1. **Internal**
   - Provide hourly updates in incident ticket and append to `feedback/compliance.md`.
   - Brief leadership with impact summary + containment status.
2. **External**
   - Draft customer/operator notice including incident nature, data affected, mitigation steps, contact info.
   - Obtain approvals: Compliance → Manager → Legal → Marketing.
   - Send via approved channels (email, in-app banner, Chatwoot broadcast).
3. **Regulators**
   - File report with relevant authority if required (GDPR DPA, CCPA AG if thresholds met).
   - Document submission timestamp/reference numbers in evidence folder.
4. **Vendors**
   - If vendor caused incident, request written post-mortem and remediation commitments.

---

## Eradication & Recovery (T+24 - T+48 hours)
1. Patch vulnerabilities/config gaps (upgrade dependencies, adjust IAM).
2. Restore clean data if tampering detected (`docs/runbooks/backup_restore.md`).
3. Validate systems:
   - Run regression tests (Vitest/Playwright) with sanitized data snapshots.
   - Confirm Supabase/Prisma row parity and audit logs show no residual anomalies.
4. Re-enable disabled tiles/integrations with manager approval.

---

## Post-Incident Review (Within 5 business days)
1. Schedule retrospective (Compliance, Reliability, Engineering, Support).
2. Produce post-incident report in `docs/compliance/evidence/INCIDENT_ID/postmortem.md` covering timeline, root cause, detection effectiveness, remediation tasks.
3. Update relevant runbooks, data inventory, and privacy notices.
4. Track action items in `feedback/compliance.md` until closure.

---

## Preparedness Checklist (Quarterly)
- [ ] Tabletop exercise covering Supabase breach scenario. Store findings in `docs/compliance/evidence/tabletop-YYYYMMDD.md`.
- [ ] Verify vendor contact sheet current.
- [ ] Confirm backups & restores tested (`docs/runbooks/backup_drill_plan.md`).
- [ ] Validate secret rotation cadence executed; archive evidence.
- [ ] Review Supabase/Prisma access logs for anomalies.

Failure to complete checklist must be escalated to Manager with remediation plan.
