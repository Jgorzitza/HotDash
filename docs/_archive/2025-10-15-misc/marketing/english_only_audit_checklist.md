---
epoch: 2025.10.E1
doc: docs/marketing/english_only_audit_checklist.md
owner: localization-agent
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---

# English-Only Audit Checklist (Marketing & Support)

## When to Run

- Before publishing or re-sharing any marketing collateral, enablement deck, FAQ, or Chatwoot template edits.
- Immediately after a partner or vendor hands back suggested copy changes.
- Before submitting collateral for manager sign-off when English-only guardrails are active.

## Required Inputs

- Latest approved copy deck: `docs/design/copy_deck.md`
- Localization direction: `docs/directions/localization.md`
- Collateral under review (Markdown, Slides export, Chatwoot JSON/TS templates).

## Step-by-Step Audit

1. **Scan for non-English characters**
   - Run `rg --stats "[À-ÿ]" <paths>` on the updated files (example: `rg --stats "[À-ÿ]" docs/marketing/support_training_script_2025-10-16.md`).
   - Confirm zero matches outside sanctioned QA reference packets (`docs/marketing/launch_comms_packet.md` FR appendix, tooltip copy handoff).
2. **Confirm tone + terminology**
   - Cross-check action labels against the copy deck; verify use of en dash (–) where specified.
   - Ensure CTAs use plain imperative English (`Approve & send`, `Log follow-up`) without abbreviations.
3. **Validate staging references**
   - Ensure URLs point to `https://hotdash-staging.fly.dev/app?mock=1` for rehearsals until deployment flips to live data.
   - Note any alternate endpoints and escalate to reliability if staging health has changed.
4. **Log evidence**
   - Record the audit run in `feedback/localization.md` with command output summary, file list, and any follow-ups.
   - Update the partner touchpoint tracker if stakeholders acknowledged the English-only scope or requested exceptions.

## Escalation Triggers

- Any detected non-English strings outside the FR QA appendix.
- Requests to reinstate FR copy before manager approval.
- Divergence between collateral tone and copy deck guardrails (e.g., slang, abbreviations, missing context).
- Inconsistent staging URL or environment instructions.

## Contacts

- Localization agent (primary): log updates in `feedback/localization.md`.
- Marketing lead: tagged in `feedback/marketing.md` for copy approvals.
- Support enablement: reference `docs/marketing/support_training_script_2025-10-16.md` owners for final sign-off.
