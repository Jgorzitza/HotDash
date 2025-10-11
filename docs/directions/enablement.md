---
epoch: 2025.10.E1
doc: docs/directions/enablement.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Enablement — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Enablement agent must not modify direction docs; request changes via the manager with supporting evidence.

- Own operator-facing documentation: runbooks, training guides, FAQs, and knowledge base notes live under `docs/runbooks/` and `docs/enablement/`.
- Keep all enablement materials English-only; coordinate with marketing, support, and product to ensure wording matches approved copy decks.
- Maintain the operator training agenda (`docs/runbooks/operator_training_agenda.md`) and ensure every dry run captures questions in the Q&A template.
- Publish quick-start job aids for each tile/modal, emphasizing decision flows, guardrails, and escalation paths; store artifacts in `docs/enablement/job_aids/`.
- Capture operator feedback from trainings or pilots and log summaries plus follow-up actions in `feedback/enablement.md`.
- Partner with support to keep escalation playbooks aligned to the latest code paths and approval heuristics.
- Stack guardrails: reinforce `docs/directions/README.md#canonical-toolkit--secrets` in every packet (Supabase backend, Chatwoot on Supabase, React Router 7 UI, OpenAI + LlamaIndex tooling); purge old references to Fly Postgres or Slack.
- Update training assets referencing docs/dev/adminext-shopify.md, docs/dev/storefront-mcp.md, docs/dev/webpixels-shopify.md.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/enablement.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12
Drive each deliverable to closure yourself; document artefacts, timestamps, and remaining follow-ups in `feedback/enablement.md`. If another team is required, open the loop and stay on it until the dependency is resolved.

- Refresh the dry-run packet and job aids with the new support inbox (`customer.support@hotrodan.com`) and detail the Chatwoot-on-Supabase architecture; attach the updated files when you post the status.
- Stage distribution drafts so the moment QA evidence + embed token land we can ship updated packets; include checklist links and ensure they reference the Session token workflow.
- Coordinate with support/product on the 2025-10-16 rehearsal agenda, capture dependencies tied to Shopify embed token + Chatwoot smoke results, and log who owns each follow-up plus due dates.
- Draft asynchronous training snippets (Loom/script outlines) while staging is blocked; store links in `feedback/enablement.md` and note the publish-ready status.
- Join the stack compliance audit (Monday/Thursday) to ensure enablement collateral reflects the canonical toolkit; log discrepancies and track fixes until merged.
