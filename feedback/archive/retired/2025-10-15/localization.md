---
epoch: 2025.10.E1
doc: feedback/$(basename "$file")
owner: $(basename "$file" .md)
last_reviewed: 2025-10-14
doc_hash: TBD
expires: 2025-10-21
---

<!-- Log new updates below. Include timestamp, command/output, and evidence path. -->

## 2025-10-11T07:13:42Z — Overnight English-only audit (RR7 + CLI v3)

### 1. Scan Results

- Command: `grep -RInE "\b(fr|fr-FR|fr_CA)\b|Résumé|Bonjour" app/ docs/`
- Scan evidence:
  - Results: artifacts/localization/20251011T071342Z/scan.txt
  - Analysis: artifacts/localization/20251011T071342Z/ui_copy_audit.md
- Findings: ✅ ENGLISH-ONLY MAINTAINED
  - No violations in app/ UI code
  - No violations in user-facing docs outside sanctioned references
  - All FR strings are in sanctioned QA files or technical metadata

### 2. Shopify Admin Screenshot Workflow (RR7 + CLI v3)

- Command: `shopify app dev` will open embedded app in Admin automatically
- Evidence: artifacts/localization/shopify/screenshots/20251011T071342Z/README.txt
- ✅ Workflow uses only Shopify CLI v3; no token injection required

### 3. Partner/Vendor Touchpoint Tracker

| Owner        | Partner            | Ask                                                         | Due        | Status     | Links                                          |
| ------------ | ------------------ | ----------------------------------------------------------- | ---------- | ---------- | ---------------------------------------------- |
| Localization | Chatwoot           | Confirm macros remain English-only; align tone to copy deck | 2025-10-12 | 🟡 Pending | app/services/chatwoot/templates.ts             |
| Localization | LlamaIndex         | Confirm terminology guardrails in any prompt templates      | 2025-10-13 | 🟡 Pending | scripts/ai/\*                                  |
| Marketing    | Support Enablement | Acknowledge FR scope paused (RR7 + CLI v3 flow; no tokens)  | 2025-10-16 | 🟡 Pending | docs/marketing/english_only_audit_checklist.md |

### 4. Monday/Thursday Stack Compliance Audit

- Next audit dates: 2025-10-14 (Mon), 2025-10-17 (Thu)
- Focus areas:
  1. Supabase terminology across stack docs
  2. Chatwoot on Supabase references and macros alignment
  3. React Router 7 nomenclature and consistency
- Any remediation items will be logged here after each audit.

## 2025-10-11T04:47:30Z — Manager-updated tasks executed (RR7 + Shopify CLI v3; English-only audit)

- Actions:
  - Ran a repo-wide non-ASCII proxy check to reconfirm English-only compliance, focusing on shipping UI and Chatwoot templates.
  - Prepared Shopify Admin screenshot workflow per updated direction using `shopify app dev` (no token flows) and staged README for capture.
  - Will align collateral and partner tracker after manager review of findings.
- Artifacts:
  - UI scan summary: artifacts/localization/audits/20251011T044730Z/scan_ui.txt
  - Chatwoot scan summary: artifacts/localization/audits/20251011T044730Z/scan_chatwoot.txt
  - Screenshot prep: artifacts/localization/shopify/screenshots/20251011T044730Z/README.txt
- Notes:
  - The non-ASCII proxy flags typographic punctuation (e.g., en dash, curly quotes). No French strings identified in the UI or Chatwoot template paths; human review recommended at the listed line numbers to confirm.
  - Per updated direction, removed token-based screenshot workflow from the plan; using RR7 + Shopify CLI v3 instead.

### Partner/vendor touchpoint tracker (pending updates)

- Owner | Partner | Ask | Due | Status | Links
- [owner-fill] | Chatwoot | Confirm macros remain English-only; align tone to copy deck | [date] | [status] | app/services/chatwoot/templates.ts
- [owner-fill] | LlamaIndex | Confirm terminology guardrails in any prompt templates | [date] | [status] | scripts/ai/\*
- [owner-fill] | Marketing | Acknowledge FR scope paused; use RR7 + CLI v3 flow (no tokens) | [date] | [status] | docs/marketing/english_only_audit_checklist.md

## 2025-10-11T02:00:13Z — Localization audit kickoff (status: blocked, awaiting direction)

- Commands executed:
  - Attempt 1 (rg-based): bash -lc '<rg audit script creating artifacts dirs, sanctioned FR excludes, scans and drift checks>'
  - Attempt 2 (grep -P fallback): bash -lc '<grep-based audit script using scan_list helper and per-surface scans>'
- Output/evidence:
  - Artifacts summary: artifacts/localization/audits/2025-10-11T020013Z/status.md
  - Notes: ripgrep is not installed; both attempts encountered path expansion issues that caused writes to root (e.g., /scan\_\*.txt), leading to permission errors. No source files were modified; no secrets touched.
- Proposed next steps (awaiting manager approval):
  1. Install ripgrep and re-run a simplified, step-by-step scan (no eval, no functions) targeting UI/Chatwoot/Runbooks/Marketing, or
  2. Proceed with grep -P only in smaller, per-surface chunks, or
  3. Narrow initial scope to UI + Chatwoot scans, then expand.
- Blockers:
  - Shopify Admin screenshot workflow pending embed token delivery; prep folders will be created after scans succeed.
- Request:
  - Please advise which option to proceed with, and whether to install ripgrep on this workstation.
