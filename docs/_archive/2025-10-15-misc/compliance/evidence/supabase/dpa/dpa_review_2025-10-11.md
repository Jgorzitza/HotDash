---
epoch: 2025.10.E1
doc: docs/compliance/evidence/supabase/dpa/dpa_review_2025-10-11.md
owner: compliance
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2026-01-11
---
# Supabase DPA Evidence — 2025-10-11

## Document Receipt
- Retrieved Supabase Data Processing Addendum from `https://supabase.com/legal/dpa` on 2025-10-11.
- Archived HTML copy at `docs/compliance/evidence/supabase/dpa/Supabase_Data_Processing_Addendum_2025-10-11.html`.
- SHA256: `8da6a7addf74e02755a403d1b40df502ecafd40ba63f57d6d656fe01c321c1c1` (verified 2025-10-11).
- Captured complementary subprocessor list snapshot at `docs/compliance/evidence/supabase/dpa/Supabase_Subprocessors_2025-10-11.html` (SHA256 `1c260e76212b35e7ac6096052631b66bdc394e0a492c8f58fc2d59656f8c4060`).

## Key Provisions Reviewed
- **Controller/Processor Roles** — Confirms HotDash (customer) is controller and Supabase is processor/sub-processor; clarifies Supabase affiliates and infrastructure vendors.
- **Data Location & Transfers** — Appendix states data hosted in selected Supabase project region with support for EU and US deployments; EU Standard Contractual Clauses (Module 2) provided for international transfers.
- **Security & Compliance** — Annex outlines security measures (encryption at rest/in transit, access governance, logging, vulnerability management) and ISO 27001/SOC 2 coverage commitments.
- **Subprocessor Management** — References live list at `https://supabase.com/legal/subprocessors`; requires advance notice for changes and provides audit/objection mechanism.
- **Incident & DSR Support** — Commits to prompt breach notification, assists with data subject requests, and allows deletion/export upon termination.

## Supplemental Evidence
- `docs/compliance/evidence/supabase/retention/cron_setup.sql` captures planned retention automation for `decision_log` and `facts` tables to satisfy DPA deletion requirements.
- Supabase decision log samples and sync summaries available under `artifacts/logs/` for audit traceability.

## Follow-up Items
- Awaiting Supabase support confirmation of project region (`us-east-1`) and countersigned SCC bundle; attach correspondence when received.
- Schedule annual DPA review + subprocessor snapshot per vendor tracker.
