---
epoch: 2025.10.E1
doc: docs/compliance/dpia_shopify_admin_testing_addendum.md
owner: compliance
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2026-01-12
---

# DPIA Addendum — Shopify Admin Testing (Outline)

## 1. Context & Scope

- Pilot covers Shopify Admin beta testers with OCC access enabled.
- Data flows: Shopify admin events → HotDash OCC → Supabase telemetry (180-day retention).
- Dependencies: Supabase SCC countersignature, GA MCP DPA, marketing/support privacy comms sign-off.

## 2. Changes Since Baseline DPIA

- New data subjects: Internal Shopify operators with expanded telemetry capture.
- Additional processing: Admin activity logs linked to decision trail for audit readiness.
- Updated retention safeguards: pg_cron automation (pending evidence) + manual purge fallback.

## 3. Risk Assessment Checklist

- ✅ Vendor contractual coverage (Shopify DPA hash, Supabase SCC pending, GA MCP DPA pending).
- ✅ Privacy disclosures delivered (marketing/support confirmations pending).
- ☑ Technical controls: access scoped to Shopify Admin users; confirm feature flag default state (document once verified).
- ☑ Data minimization: document telemetry fields captured during testing; ensure no PII beyond operator email.

## 4. Mitigations & Monitoring

- Credential rotation playbook executed post-testing if secrets shared with beta staff.
- Daily audit log review for anomalous admin activity; attach log summary to evidence folder.
- Escalation path: compliance → manager → Shopify partner contact if data subject complaints arise.

## 5. Evidence to Attach

- Signed SCC + DPA artifacts (hashes recorded in respective registers).
- Marketing/support confirmation screenshots.
- Reliability pg_cron first-run log + purge verification.
- QA sign-off on telemetry scope tests.

### Current Evidence Status — 2025-10-12

- Shopify DPA hashed and archived (`docs/compliance/evidence/vendor_dpa_status.md`).
- Supabase SCC awaiting countersignature; escalation draft prepped (`docs/compliance/evidence/supabase/scc/escalation_draft_2025-10-14.md`).
- Marketing/support confirmations requested; responses pending (`docs/compliance/evidence/operator_privacy_comms/sent_2025-10-12.md`).
- pg_cron evidence follow-up sent; awaiting reliability package (`docs/compliance/evidence/retention_runs/pg_cron_followup_2025-10-12.md`).
- GA MCP follow-up submitted; documents pending (`docs/compliance/evidence/vendor_followups_2025-10-12.md`).

## 6. Outstanding Actions Before Approval

- [ ] Receive Supabase SCC countersigned bundle and note region.
- [ ] Capture GA MCP DPA and residency letter.
- [ ] Log marketing/support confirmations in evidence folder.
- [ ] Verify pg_cron run evidence and hash records.
- [ ] Finalize risk scoring and approval sign-off block with manager/legal signatures.
- [ ] QA validate telemetry scope in staging with Shopify Admin test accounts.

## 7. Approval Block (To Complete)

- Compliance reviewer:
- Manager approval:
- Legal (if required):
- Date of sign-off:
