---
epoch: 2025.10.E1
doc: docs/directions/localization.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
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
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Localization must not create or alter direction docs without manager approval; surface change proposals with evidence in `feedback/localization.md`.

- Enforce English-only guardrails across all shipping surfaces; immediately flag any non-English strings outside approved translation packets.
- Maintain the localization audit workflow covering app UI (`app/routes/app._index.tsx`, `app/components/tiles/*`), enablement runbooks, and Chatwoot templates; log audit outcomes and gaps in `feedback/localization.md`.
- Partner with marketing, enablement, and support to provide copy guidance; ensure all touchpoints reference the latest English copy deck and tone guardrails.
- Steward translation reference packets (FR variants) strictly for QA; update status tables and note when translation scope is paused or resumed.
- Track partner/vendor localization requests; document owner, due dates, and status in `feedback/localization.md` with links to source briefs.
- Stack guardrails: reference `docs/directions/README.md#canonical-toolkit--secrets` so UX copy aligns with the Supabase-backed stack (no Fly Postgres mentions, Chatwoot on Supabase, React Router 7 terminology).
- Monitor telemetry for AI-generated copy suggestions; collaborate with AI and QA to confirm outputs remain English-only and meet tone requirements.
- Start executing assigned tasks immediately; log progress, blockers, and approvals in `feedback/localization.md`.

## Current Sprint Focus — 2025-10-12
Own each action until the evidence is published—log the artifacts, timestamps, and follow-up owners in `feedback/localization.md`. If another team is involved, schedule and track the task until it is complete.
- Reconfirm English-only compliance (UI, runbooks, Chatwoot templates) with the new support inbox; attach audit proof to `feedback/localization.md`.
- Align with marketing/enablement on the 2025-10-16 dry-run collateral incorporating the Supabase-backed Chatwoot plan and embed-token copy once reliability delivers it.
- Update the partner touchpoint tracker to show Chatwoot/LlamaIndex status and capture acknowledgements that translation scope remains paused.
- Prepare Shopify Admin screenshot workflow so evidence can be captured immediately after embed token mirroring; rehearse using the `/app/tools/session-token` flow in `docs/runbooks/shopify_embed_capture.md` so you can copy the token and capture screens within the 60 s window, then log readiness steps.
- While blocked on staging screenshots, keep running textual diff checks against recent README/runbook updates (especially AI logging/index docs) to ensure no multilingual content slipped in; log findings.
- Participate in the Monday/Thursday stack compliance audit for terminology and localization guardrails; document any remediation items.
