---
epoch: 2025.10.E1
doc: docs/integrations/hootsuite_contract_checklist.md
owner: integrations
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-18
---

# Hootsuite Contract Checklist — POC Readiness

## Objective

Document the contract, compliance, and operational requirements needed before enabling the Hootsuite-powered social sentiment POC. Completed checklist will be routed to Compliance (Casey Lin) by 2025-10-09.

## Contract Requirements

| #   | Task                                                                        | Owner         | Due        | Status     | Evidence                                                                                                                        |
| --- | --------------------------------------------------------------------------- | ------------- | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Obtain Hootsuite order form with Professional tier pricing + discount terms | Integrations  | 2025-10-08 | ⏳ Pending | Request sent via vendor portal (ticket HS-44721); placeholder stored at `artifacts/vendors/hootsuite/2025-10-09/order-form.pdf` |
| 2   | Secure SLA addendum covering ≥99.5% uptime & 4h critical response           | Integrations  | 2025-10-08 | ⏳ Pending | Draft language prepared; awaiting vendor review; placeholder at `artifacts/vendors/hootsuite/2025-10-09/sla-addendum.pdf`       |
| 3   | Confirm data residency + retention (≤90 days) and purge workflow            | Compliance    | 2025-10-09 | ⏳ Pending | To be logged in DPIA once vendor responds; notes in `artifacts/vendors/hootsuite/2025-10-09/data-handling-summary.md`           |
| 4   | Capture list of subprocessors + security certifications (SOC2/GDPR)         | Compliance    | 2025-10-09 | ⏳ Pending | Vendor questionnaire requested; awaiting responses in `artifacts/vendors/hootsuite/2025-10-09/security-questionnaire.md`        |
| 5   | Define billing contact + cost center for subscription                       | Marketing Ops | 2025-10-09 | ⏳ Pending | Madison Lee to confirm budget code; summary to append in `artifacts/vendors/hootsuite/2025-10-09/order-form.pdf`                |

## Access & Security Controls

- Limit OAuth scopes to read-only sentiment/reporting endpoints; document scope list before app install.
- Require quarterly access review for Hootsuite admin users; track in `docs/compliance/access_reviews.md` (to be updated post-integration).
- Align token rotation with `docs/runbooks/secret_rotation.md` (90-day cadence); Reliability to own automation once tokens issued.

## Evidence Package (to deliver with Compliance packet)

- Signed order form + SLA addendum (PDF)
- Vendor security questionnaire responses
- Summary of data categories exchanged & retention policy alignment
- Screenshot of Shopify app install permissions
- Draft rollback plan in case vendor access is revoked (link to `docs/integrations/social_sentiment_vendor_recommendation.md` contingency section)

## Next Steps

1. Await vendor response to HS-44721 for rate-limit + contractual details.
2. Populate evidence placeholders in `artifacts/vendors/hootsuite/2025-10-09/` as documents arrive and share with Compliance.
3. Book review session with Casey Lin on 2025-10-09 to finalize DPIA updates.
