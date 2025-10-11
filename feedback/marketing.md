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
- Reliability: Admin tour validated via Shopify CLI 3 dev flow (no embed/session token) and logged in feedback/reliability.md.
- Design: Tooltip placement overlays/screenshots for Admin; placeholders remain until delivered. Ref: docs/design/tooltip_modal_annotations_2025-10-09.md.
REQUESTS FOR MANAGER:
1) Stakeholders for approvals — confirm names/handles for Support lead, Product lead, Designer to route comms approvals; I will circulate and capture evidence in artifacts/marketing/assets/approvals/.
2) Scheduling tooling — approve Hootsuite (vault/occ/hootsuite/api_key.env listed in credential map) or confirm manual-send playbook preference; I’ll document the day-of sequence accordingly.
3) Shopify Admin host param — confirm the canonical host value is current for staging (we will rely on CLI dev validation; no token capture in comms) for enablement screenshots and Playwright.
4) Timeline — confirm staging go/no-go window and target production launch window so we can lock the comms calendar.
5) Scope confirmation — maintain English-only launch; confirm if any localization scope has reopened before I proceed with translations.
6) Admin overlays — confirm when to capture annotated screenshots post-CLI validation; I’ll link assets from the comms packet when delivered.
NEXT READY STEPS (post-manager review):
- Route updated copy for approvals and archive acknowledgements (PDF/image) under artifacts/marketing/assets/approvals/.
- Pre-stage email/blog/social/press assets with explicit send triggers (QA 200s + CLI dev validation confirmed); link from docs/marketing/launch_comms_packet.md.
- Rehearse Admin tour via CLI dev flow; capture sanitized evidence in artifacts/marketing/dry_runs/.
EVIDENCE LINKS: diffs pending PR; approvals to be archived under artifacts/marketing/assets/approvals/.
NOTES: Compliant with direction governance (manager-only authorship for docs/directions/**). This entry is status-only per WARP rules.

[2025-10-11T03:22:18Z] EXECUTION: Pre-staged external messaging assets and aligned comms per updated direction
ACTION: Created initial GA draft assets (email/blog/social/press) with send triggers; added enablement readiness note; updated comms to remove embed/session token references in favor of Shopify CLI 3 dev validation.
PATHS: artifacts/marketing/assets/email/launch_email_v1.md; artifacts/marketing/assets/blog/ga_launch_post_v1.md; artifacts/marketing/assets/social/x_thread_v1.md; artifacts/marketing/assets/social/linkedin_post_v1.md; artifacts/marketing/assets/press/press_note_v1.md; docs/marketing/enablement_readiness_2025-10-16.md; docs/marketing/launch_comms_packet.md; docs/marketing/support_training_script_2025-10-16.md
EVIDENCE: directory tree created under artifacts/marketing/; diffs in docs reflecting CLI v3 validation language.
NOTES: EN-only scope; canonical toolkit references maintained (Supabase, Chatwoot on Fly, React Router 7, OpenAI + LlamaIndex).

[2025-10-11T03:30:47Z] CANON DIGEST: docs/directions/marketing.md
SUMMARY:
- Canon-first; manager-only authorship for docs/directions/**; self-testing mandate; secrets via credential index only.
- Local Execution Policy (Auto-Run): local, non-interactive ops only; disable pagers; log evidence in feedback/marketing.md; never print secrets.
- Aligned Task List — 2025-10-11: remove embed/session token mentions; reflect RR7 + Shopify CLI v3 validation; update comms; pre-stage external messaging; coordinate enablement; draft variants/testimonials; assemble release-day assets; participate in compliance audit.
EVIDENCE: docs/directions/marketing.md; docs/directions/README.md

[2025-10-11T03:30:47Z] GATING AND DEPENDENCIES
- [ ] QA: Sustained HTTP 200 at https://hotdash-staging.fly.dev/app?mock=0 with archived evidence (DEPLOY-147)
- [ ] Reliability: Admin tour validated via Shopify CLI 3 dev flow (no tokens) and logged in feedback/reliability.md
- [ ] Design: Tooltip placement overlays/screenshots delivered; placeholders until then
- [ ] Stakeholders: Approvals captured (Support lead, Product lead, Designer) and archived under artifacts/marketing/assets/approvals/

[2025-10-11T03:30:47Z] OPEN QUESTIONS
1) Stakeholders for approvals — confirm names/handles (Support lead, Product lead, Designer)
2) Scheduling tooling — approve Hootsuite or confirm manual-send plan
3) Shopify Admin host/navigation specifics — confirm canonical details for staging screenshots (using CLI dev validation; no tokens mentioned in comms)
4) Launch windows — staging go/no-go and production target to lock comms calendar

[2025-10-11T03:35:34Z] EXECUTION: Approval request draft + CLI dev rehearsal prep
ACTION: Created approval request template and linked assets in launch comms packet; prepared CLI dev rehearsal plan and placeholder session notes (no tokens, EN-only).
PATHS: artifacts/marketing/assets/approvals/approval_request_2025-10-11.md; docs/marketing/launch_comms_packet.md (Assets section); artifacts/marketing/dry_runs/cli_dev_rehearsal_plan_2025-10-11.md; artifacts/marketing/dry_runs/session_cli_dev_notes_2025-10-11T0335Z.md
EVIDENCE: file paths above; screenshots to be added under artifacts/marketing/dry_runs/screenshots/ during live rehearsal.
NOTES: Ready to route approvals to stakeholders once names/handles confirmed by Manager; will capture acknowledgements under artifacts/marketing/assets/approvals/.

[2025-10-11T03:40:30Z] EXECUTION: Staging endpoint probe (non-interactive)
ACTION: Ran curl against https://hotdash-staging.fly.dev/app?mock=0 to capture current status without tokens.
OUTPUT (summary): HTTP 410, time_total 0.553528
PATHS: artifacts/marketing/dry_runs/mock0_probe_2025-10-11T0340Z.log
NOTES: Continue to hold external sends until sustained 200s per gate; proceed with CLI dev tour rehearsal for screenshots.

[2025-10-11T04:51:30Z] EXECUTION: Drafted variants, curated testimonials, and assembled release-day asset scaffolding
ACTION: Added email/social variants, testimonials doc, and graphics/snippets scaffolding; linked assets and testimonials in the comms packet.
PATHS: artifacts/marketing/assets/email/launch_email_variants.md; artifacts/marketing/assets/social/alt_variants_v1.md; docs/marketing/testimonials_curated.md; artifacts/marketing/assets/graphics/README.md; artifacts/marketing/assets/snippets/README.md; docs/marketing/launch_comms_packet.md
EVIDENCE: files above; updates visible via git diff.
NOTES: EN-only scope; ready to route approvals once stakeholders are confirmed.

[2025-10-11T07:12:31Z] EXECUTION: Overnight plan — marketing tasks
ACTION: Created admin tour rehearsal sequence (RR7 + CLI dev), day-of manual send playbook, placeholder graphics/snippets; ran short live probe loop for evidence.
PATHS: artifacts/marketing/20251011T071231Z/admin_tour_rehearsal_sequence.md; artifacts/marketing/assets/social/send_playbook.md; artifacts/marketing/assets/graphics/banner_en_v1_TEMP.md; artifacts/marketing/assets/snippets/faq_anchor_links.md; artifacts/marketing/logs/staging_200s_check_20251011.log
OUTPUT (probe summary): 5/5 responses HTTP 410 (0.52s–0.69s)
NOTES: Holding external sends until sustained 200s. Will proceed with CLI dev tour screenshots next.

[2025-10-11T07:20:05Z] EXECUTION: Complete overnight auto-run — all marketing tasks
ACTION: Performed compliance alignment, quality checks, enablement coordination, acceptance criteria mapping, and release day playbook creation. Cleaned up token references and verified canonical toolkit messaging.
PATHS: 
- Compliance: artifacts/marketing/logs/md_checks_20251011.log (36 docs validated)
- Enablement: artifacts/marketing/logs/enablement_coordination_20251011.log
- Quality: Fixed 1 embed/token reference in distribution_kit.md
- Acceptance: artifacts/marketing/logs/acceptance_criteria_crosswalk_20251011.md
- Release ops: artifacts/marketing/assets/release_day_playbook.md
- Comms packet: Updated with Release Day Operations section
OUTPUT:
- Canonical toolkit: 100+ references verified across marketing docs
- Support contact: 17 files using customer.support@hotrodan.com
- EN-only scope: Maintained across all materials
- Token cleanup: CLI dev validation language consistent
NOTES: All major marketing deliverables ready. Pending: stakeholder approvals routing, CLI dev screenshots (interactive), sustained 200s evidence.

[2025-10-11T07:20:05Z] COMPLIANCE CHECK
STATUS: ✅ COMPLETE
- Supabase backend references: ✅ Maintained
- Chatwoot on Fly: ✅ Corrected (not "on Supabase")
- React Router 7 UI: ✅ Consistent (not Remix)
- OpenAI + LlamaIndex posture: ✅ Properly attributed
- English-only content: ✅ No locale promises
- No secrets/tokens: ✅ All artifacts clean
- Support inbox alignment: ✅ customer.support@hotrodan.com throughout

## 2025-10-11T01:15:00Z - Support Team Coordination: Updated Contact Information
**Contact:** Support agent coordinating on customer.support@hotrodan.com integration
**Update Request:** Ensure all marketing materials reference correct support inbox for operator communications
**Verification:** customer.support@hotrodan.com already configured in Chatwoot deployment and referenced in training materials
**Coordination Status:** Support inbox operational, ready for operator communications and training coordination
**Reference:** All runbooks now reference customer.support@hotrodan.com as primary support contact
**Next Steps:** Marketing team to verify support contact alignment in any external communications or training announcements

[2025-10-11T07:35:15Z] EXECUTION: CLI dev rehearsal documented with screenshot specifications
ACTION: Completed Shopify CLI v3 dev flow rehearsal planning and created placeholder screenshot specifications for Admin tour. Validated CLI configuration, dependencies, and local infrastructure readiness.
PATHS:
- Session notes: artifacts/marketing/dry_runs/session_cli_dev_notes_20251011T073115Z.md
- Screenshot specs: artifacts/marketing/dry_runs/screenshots/01_dashboard_PLACEHOLDER.md through 06_settings_privacy_PLACEHOLDER.md (6 files)
- Rehearsal plan: artifacts/marketing/dry_runs/cli_dev_rehearsal_plan_2025-10-11.md
EVIDENCE: CLI v3.85.4 authenticated to hotroddash.myshopify.com; React Router 7 + Prisma dependencies confirmed; Supabase local running on 127.0.0.1:54322; detailed specifications for 6 tour screenshots created
NOTES: Per WARP governance (non-interactive ops), documented expected dev flow and created placeholder specifications. Ready for interactive session to capture actual screenshots. All specifications include marketing notes and expected content for each tour step.

