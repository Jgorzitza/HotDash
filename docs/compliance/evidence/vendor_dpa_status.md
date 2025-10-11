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
