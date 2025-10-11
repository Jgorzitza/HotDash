---
epoch: 2025.10.E1
doc: feedback/$(basename "$file")
owner: $(basename "$file" .md)
last_reviewed: 2025-10-14
doc_hash: TBD
expires: 2025-10-21
---

<!-- Log new updates below. Include timestamp, command/output, and evidence path. -->

[2025-10-11T01:15:37Z] ACTION: Updated comms to include support inbox and Chatwoot Fly note.
PATHS: docs/marketing/launch_comms_packet.md; docs/marketing/product_approval_packet_2025-10-07.md; docs/marketing/launch_faq.md
EVIDENCE: pending stakeholder acknowledgements (to be captured under artifacts/marketing/assets/approvals/); diffs in PR once opened.
NOTES: Ensured alignment with canonical toolkit and English-only scope per docs/directions/README.md.

[2025-10-11T01:37:29Z] MANAGER FEEDBACK: Alignment request + readiness for updated direction
ACTION: Provide manager-facing summary and explicit asks per governance. Awaiting updated direction; will not edit docs/directions/**.
COMMAND/Script: repo doc edits (see git diff in upcoming PR); no scripts executed.
PATHS (changed earlier for context): docs/marketing/launch_comms_packet.md; docs/marketing/product_approval_packet_2025-10-07.md; docs/marketing/launch_faq.md
GATING/DEPENDENCIES:
- QA: Sustained HTTP 200 for https://hotdash-staging.fly.dev/app?mock=0 with archived evidence (DEPLOY-147). Ref: docs/marketing/launch_comms_packet.md # Go-live trigger checklist.
- Reliability: Shopify Admin embed token delivered and escrowed (vault/occ/shopify/embed_token_staging.env) + GH env mirror; confirm evidence in feedback/reliability.md. Ref: docs/runbooks/shopify_embed_capture.md, docs/ops/credential_index.md.
- Design: Tooltip placement overlays/screenshots for Admin; placeholders remain until delivered. Ref: docs/design/tooltip_modal_annotations_2025-10-09.md.
REQUESTS FOR MANAGER:
1) Stakeholders for approvals — confirm names/handles for Support lead, Product lead, Designer to route comms approvals; I will circulate and capture evidence in artifacts/marketing/assets/approvals/.
2) Scheduling tooling — approve Hootsuite (vault/occ/hootsuite/api_key.env listed in credential map) or confirm manual-send playbook preference; I’ll document the day-of sequence accordingly.
3) Shopify Admin host param — confirm the canonical host value in docs/runbooks/shopify_embed_capture.md is current for staging; greenlight its use in enablement screenshots and Playwright.
4) Timeline — confirm staging go/no-go window and target production launch window so we can lock the comms calendar.
5) Scope confirmation — maintain English-only launch; confirm if any localization scope has reopened before I proceed with translations.
6) Admin overlays — confirm when to capture annotated screenshots post-embed token; I’ll link assets from the comms packet when delivered.
NEXT READY STEPS (post-manager review):
- Route updated copy for approvals and archive acknowledgements (PDF/image) under artifacts/marketing/assets/approvals/.
- Pre-stage email/blog/social/press assets with explicit send triggers (QA 200s + embed token delivered); link from docs/marketing/launch_comms_packet.md.
- Rehearse Admin tour using /app/tools/session-token, capture sanitized evidence in artifacts/marketing/dry_runs/.
EVIDENCE LINKS: diffs pending PR; approvals to be archived under artifacts/marketing/assets/approvals/.
NOTES: Compliant with direction governance (manager-only authorship for docs/directions/**). This entry is status-only per WARP rules.

## 2025-10-11T01:15:00Z - Support Team Coordination: Updated Contact Information
**Contact:** Support agent coordinating on customer.support@hotrodan.com integration
**Update Request:** Ensure all marketing materials reference correct support inbox for operator communications
**Verification:** customer.support@hotrodan.com already configured in Chatwoot deployment and referenced in training materials
**Coordination Status:** Support inbox operational, ready for operator communications and training coordination
**Reference:** All runbooks now reference customer.support@hotrodan.com as primary support contact
**Next Steps:** Marketing team to verify support contact alignment in any external communications or training announcements

