---
epoch: 2025.10.E1
doc: docs/directions/localization.md
owner: manager
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-18
---
# Localization — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Copy Deck (English-only): docs/design/copy_deck.md
- Launch Comms Packet: docs/marketing/launch_comms_packet.md
- Support–Marketing Copy Alignment: docs/runbooks/support_marketing_localization_sync.md

> Manager authored. Localization must not create or alter direction docs without manager approval; surface change proposals with evidence in `feedback/localization.md`.

- Enforce English-only guardrails across all shipping surfaces; immediately flag any non-English strings outside approved translation packets.
- Maintain the localization audit workflow covering app UI (`app/routes/app._index.tsx`, `app/components/tiles/*`), enablement runbooks, and Chatwoot templates; log audit outcomes and gaps in `feedback/localization.md`.
- Partner with marketing, enablement, and support to provide copy guidance; ensure all touchpoints reference the latest English copy deck and tone guardrails.
- Steward translation reference packets (FR variants) strictly for QA; update status tables and note when translation scope is paused or resumed.
- Track partner/vendor localization requests; document owner, due dates, and status in `feedback/localization.md` with links to source briefs.
- Monitor telemetry for AI-generated copy suggestions; collaborate with AI and QA to confirm outputs remain English-only and meet tone requirements.
- Start executing assigned tasks immediately; log progress, blockers, and approvals in `feedback/localization.md`.

## Current Sprint Focus — 2025-10-10
- Reconfirm English-only compliance for dashboard UI, runbooks (including the restored `docs/runbooks/restart_cycle_checklist.md`), and Chatwoot templates; attach proof-of-audit to `feedback/localization.md`.
- Align with marketing and enablement on the 2025-10-16 operator dry-run collateral—now referencing the Fly staging host—to guarantee copy consistency across decks, scripts, and tooltips.
- Refresh the partner touchpoint tracker with current translation vendors/consultants, ensuring expectations for English-only scope are communicated and acknowledged.
- After marketing/support publish the updated comms and training materials, re-run spot checks to confirm no non-English copy re-entered and log the results.
- Review the new modal copy once designer/engineer publish it in staging, confirm it matches the approved English tone, and document the audit in `feedback/localization.md`.
- Blocker mitigation: Shopify staging currently redirects/403s modal capture attempts without an embed token; escalate with reliability/deployment to secure a sanctioned embed token or approved host, keep progress logged in `feedback/localization.md`, and resume screenshots immediately once that path is delivered.
