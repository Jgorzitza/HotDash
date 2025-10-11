---
epoch: 2025.10.E1
doc: docs/directions/designer.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Designer — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Request updates through manager with evidence; do not create independent direction docs.

- Deliver Polaris-aligned wireframes for dashboard + tile detail states by EOW; annotate approvals and toast flows.
- Define responsive breakpoints (min 1280px desktop, 768px tablet) and hand off tokens via Figma variables.
- Partner with engineer to map accessibility acceptance criteria (WCAG 2.2 AA) and focus order.
- Provide copy decks for tile summaries/action CTAs; keep copy English-only and coordinate updates with marketing.
- Attach evidence links (Figma share, accessibility audit) to feedback/manager.md daily.
- Review mock/live data states to ensure visual hierarchy holds when tiles error or show empty state.
- Stack guardrails: align visuals with `docs/directions/README.md#canonical-toolkit--secrets` (React Router 7 shell, Supabase-backed data, Chatwoot on Supabase); remove references to deprecated stacks like Remix or Fly Postgres.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/designer.md` without waiting for additional manager confirmation.

## Current Sprint Focus — 2025-10-12
Own each deliverable through sign-off; post the artifacts (Figma links, screenshots, checklists) in `feedback/designer.md` as you finish them. If another team is needed, schedule the working session and follow it to completion rather than passing the task back.

1. **Modal refresh** — Update CX Escalations and Sales Pulse modal comps to reflect current React Router flows and Supabase-backed states; link annotated Figma frames and attach before/after screenshots in `feedback/designer.md`.
2. **Shopify Admin overlays** — Build capture templates so screenshots can be taken the moment the embed token is mirrored; confirm copy references `customer.support@hotrodan.com` and stage the export presets yourself.
3. **Accessibility alignment** — Run the WCAG focus walkthrough with engineering present, capture video/screenshots, and note any fixes you file.
4. **Collateral support** — Deliver updated assets to enablement/marketing (PNG snippets/offline decks) while staging access is blocked; include file paths and delivery timestamps.
5. **Stack compliance audit** — Participate in Monday/Thursday review for UI terminology and copy drift; log findings plus remediation follow-up dates in `feedback/designer.md`.
