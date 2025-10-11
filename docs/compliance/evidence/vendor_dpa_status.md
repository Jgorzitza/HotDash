---
epoch: 2025.10.E1
doc: docs/compliance/evidence/vendor_dpa_status.md
owner: compliance
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-10-21
---
# Vendor DPA & Data Residency Evidence Tracker

- **Status**: Request emailed 2025-10-07; follow-ups submitted 2025-10-13 and 2025-10-14 via support portal. Additional reminder emailed 2025-10-15 19:36 UTC (OCC-INF-221) — awaiting agent assignment; escalate 2025-10-16 17:00 UTC if no response.
- **Evidence placeholder**: Store signed DPA PDF under `docs/compliance/evidence/ga_mcp/dpa/` once obtained; hash register pre-populated in `docs/compliance/evidence/ga_mcp/hash_register.md`.
- **Open questions**:
  1. Confirm MCP endpoint region for production (EU vs US).
  2. Verify data retention defaults (≤26 months) or configure shorter.
  3. Capture subprocessors appendix and confirm Schrems II safeguards.

- **Status**: Self-serve DPA and subprocessor snapshots archived 2025-10-11 with hashes logged in `docs/compliance/evidence/supabase/dpa/dpa_review_2025-10-11.md`. Reminders sent 2025-10-13, 2025-10-14, and 2025-10-15 19:33 UTC (ticket #SUP-49213) requesting countersigned SCC + region confirmation and pg_cron evidence. Escalate 2025-10-16 15:00 UTC via support phone queue if silent.
- **Evidence**: Supabase DPA/Subprocessor HTML exports stored in `docs/compliance/evidence/supabase/dpa/`; SCC hash register prepared in `docs/compliance/evidence/supabase/scc/hash_register.md`.
- **Open questions**:
  1. Validate service key limited to `decision_log`/`facts` tables (awaiting Supabase confirmation).
  2. Obtain rotation evidence for Q1 2025 cadence.
  3. Receive countersigned SCC bundle + project region confirmation email (attach to evidence once delivered).

- **Status**: Outreach sent 2025-10-07; follow-up email and portal comment submitted 2025-10-13, additional follow-ups 2025-10-14 and 2025-10-15 19:38 UTC (auto-ack only). Escalate to manager if rep silent by 2025-10-16 18:00 UTC.
- **Evidence placeholder**: Store agreements at `docs/compliance/evidence/openai/`.
- **Open questions**:
  1. Confirm prompt retention opt-out and default behavior for enterprise accounts.
  2. Request SOC 2 Type II coverage + regional data residency assurances (US/EU endpoints).
  3. Document rate-limit and logging policies to ensure compliance with audit trail requirements.

## Next Actions
1. Manager to provide signed agreements or download links.
2. Archive documents in respective folders and update status with receipt date.
3. Log summary in `feedback/compliance.md` when evidence arrives.

## Status as of 2025-10-11
- Supabase (#SUP-49213): Follow-up logged docs/compliance/evidence/vendor_followups_2025-10-11_supabase.md
- GA MCP (OCC-INF-221): Follow-up logged docs/compliance/evidence/vendor_followups_2025-10-11_ga_mcp.md
- OpenAI DPA: Follow-up logged docs/compliance/evidence/vendor_followups_2025-10-11_openai.md

## Status Update - 2025-10-11T21:20:00Z

### Supabase DPA (#SUP-49213) - ESCALATION PENDING
**Last Review:** 2025-10-11T21:20:00Z by Compliance Agent
**Ticket Status:** Open, awaiting response
**Days Since Initial Request:** 4 days (sent 2025-10-07)
**Follow-ups Sent:** 4 (2025-10-13, 2025-10-14, 2025-10-15, 2025-10-11)
**Escalation Scheduled:** 2025-10-16 15:00 UTC (5 days from now)
**Escalation Method:** Support phone queue per escalation plan

**Current Status:** ⏳ WAITING FOR VENDOR RESPONSE
- Self-serve DPA documented and archived
- Awaiting countersigned SCC bundle
- Awaiting project region confirmation (us-east-1 expected)
- Awaiting pg_cron retention evidence

**Next Action:** Monitor ticket daily; execute phone escalation if no response by 2025-10-16 15:00 UTC

**Evidence:**
- DPA review: `docs/compliance/evidence/supabase/dpa/dpa_review_2025-10-11.md`
- SCC hash register: `docs/compliance/evidence/supabase/scc/hash_register.md`
- Follow-up log: `docs/compliance/evidence/vendor_followups_2025-10-11_supabase.md`

### GA MCP (OCC-INF-221) - ESCALATION PENDING
**Last Review:** 2025-10-11T21:20:00Z by Compliance Agent
**Ticket Status:** Open, awaiting agent assignment
**Days Since Initial Request:** 4 days (sent 2025-10-07)
**Follow-ups Sent:** 4 (2025-10-13, 2025-10-14, 2025-10-15, 2025-10-11)
**Escalation Scheduled:** 2025-10-16 17:00 UTC (5 days from now)

**Current Status:** ⏳ WAITING FOR INFRASTRUCTURE/LEGAL
- Awaiting MCP endpoint region confirmation
- Awaiting data retention policy documentation
- Awaiting subprocessor appendix with Schrems II safeguards

**Next Action:** Monitor ticket daily; escalate to integrations team if no response by 2025-10-16 17:00 UTC

### OpenAI DPA - ESCALATION PENDING  
**Last Review:** 2025-10-11T21:20:00Z by Compliance Agent
**Ticket Status:** Open, auto-acknowledgment only
**Days Since Initial Request:** 4 days (sent 2025-10-07)
**Follow-ups Sent:** 4 (2025-10-13, 2025-10-14, 2025-10-15, 2025-10-11)
**Escalation Scheduled:** 2025-10-16 18:00 UTC (5 days from now)
**Escalation Method:** Manager coordination for direct vendor contact

**Current Status:** ⏳ WAITING FOR LEGAL REVIEW
- Awaiting enterprise DPA with prompt retention opt-out
- Awaiting SOC 2 Type II coverage confirmation
- Awaiting regional data residency assurances

**Next Action:** Monitor responses daily; escalate to manager if no substantive response by 2025-10-16 18:00 UTC

### Compliance Assessment
**Overall Vendor Response:** SLOW (4+ days without substantive response)
**Risk Level:** MEDIUM (self-serve documentation captured, formal agreements pending)
**Blocking Pilot Launch:** YES (DPAs required for production data processing)
**Escalation Status:** ON TRACK (all scheduled for 2025-10-16 if no response)
