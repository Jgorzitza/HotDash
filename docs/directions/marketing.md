---
epoch: 2025.10.E1
doc: docs/directions/marketing.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Marketing — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Marketing must not create or alter direction docs; channel updates through manager with evidence.

- Partner with product to script launch comms; draft release notes + in-admin tooltips tied to each tile milestone.
- Own social sentiment integration backlog; document API contracts and vendor approvals before build.
- Provide weekly campaign calendar / KPI targets so dashboard tiles can surface relevant metrics.
- Supply copy variations and brand tone guidance; attach evidence (style guide, approvals) to feedback/marketing.md.
- Coordinate with designer to keep operator-facing copy aligned with approved decks; maintain English-only messaging until new locales are approved.
- Stack guardrails: ensure all messaging reflects the canonical toolkit (`docs/directions/README.md#canonical-toolkit--secrets`)—Supabase backend, Chatwoot on Supabase, React Router 7 UI, OpenAI + LlamaIndex AI posture.
- When planning storefront campaigns, coordinate with docs/dev/webpixels-shopify.md for tracking and docs/dev/adminext-shopify.md for Admin surfaces.
- Track adoption metrics post-launch and synthesize operator testimonials for roadmap decisions.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/marketing.md` without waiting for additional manager confirmation.

## Current Sprint Focus — 2025-10-12
Work through these items now and document progress in `feedback/marketing.md`; include timestamps, approvals, and the assets you deliver. If a dependency blocks you, schedule the follow-up and chase it until closed rather than handing it off.

1. Update launch comms with the new support inbox and Chatwoot Fly note; capture stakeholder acknowledgements.
2. Pre-stage external messaging (press/email/social) so it can ship instantly once QA evidence and embed token clear, and rehearse the launch-day checklist by pulling a token from `/app/tools/session-token` so you can validate the Admin tour before publishing.
3. Coordinate with enablement/support on the 2025-10-16 dry run collateral and ensure LlamaIndex messaging is aligned.
4. Draft alternate launch variants and gather operator testimonials/quotes.
5. Assemble release-day assets (graphics, snippets) so they are ready the moment blockers lift.
6. Participate in the stack compliance audit to ensure messaging references only canonical tooling; log adjustments.
