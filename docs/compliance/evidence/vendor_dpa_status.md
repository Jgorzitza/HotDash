---
epoch: 2025.10.E1
doc: docs/compliance/evidence/vendor_dpa_status.md
owner: compliance
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-21
---
# Vendor DPA & Data Residency Evidence Tracker

## Google Analytics MCP
- **Required docs**: Google Cloud Data Processing Addendum (GA4/MCP), property region confirmation, subprocessors list.
- **Status**: Request emailed 2025-10-07; awaiting Google ticket confirmation.
- **Evidence placeholder**: Store signed DPA PDF under `docs/compliance/evidence/ga_mcp/` once obtained.
- **Open questions**:
  1. Confirm MCP endpoint region for production (EU vs US).
  2. Verify data retention defaults (≤26 months) or configure shorter.

## Supabase
- **Required docs**: Supabase DPA + SCC, project region confirmation, RLS/backup encryption statement.
- **Status**: Support ticket submitted 2025-10-07; waiting on reference number.
- **Evidence placeholder**: Upload PDF/confirmation email to `docs/compliance/evidence/supabase/`.
- **Open questions**:
  1. Validate service key limited to `decision_log`/`facts` tables.
  2. Obtain rotation evidence for Q1 2025 cadence.

## Anthropic
- **Required docs**: Anthropic Enterprise Terms, privacy/data handling FAQ (prompt retention), regional endpoint confirmation.
- **Status**: Outreach sent 2025-10-07; pending account rep acknowledgement.
- **Evidence placeholder**: Store agreements at `docs/compliance/evidence/anthropic/`.
- **Open questions**:
  1. Confirm prompt retention opt-out and default behavior.
  2. Request SOC 2 Type II coverage + regional data residency assurances.

## Next Actions
1. Manager to provide signed agreements or download links.
2. Archive documents in respective folders and update status with receipt date.
3. Log summary in `feedback/compliance.md` when evidence arrives.
