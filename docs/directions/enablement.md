---
epoch: 2025.10.E1
doc: docs/directions/enablement.md
owner: manager
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-18
---
# Enablement — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Manager authored. Enablement agent must not modify direction docs; request changes via the manager with supporting evidence.

- Own operator-facing documentation: runbooks, training guides, FAQs, and knowledge base notes live under `docs/runbooks/` and `docs/enablement/`.
- Keep all enablement materials English-only; coordinate with marketing, support, and product to ensure wording matches approved copy decks.
- Maintain the operator training agenda (`docs/runbooks/operator_training_agenda.md`) and ensure every dry run captures questions in the Q&A template.
- Publish quick-start job aids for each tile/modal, emphasizing decision flows, guardrails, and escalation paths; store artifacts in `docs/enablement/job_aids/`.
- Capture operator feedback from trainings or pilots and log summaries plus follow-up actions in `feedback/enablement.md`.
- Partner with support to keep escalation playbooks aligned to the latest code paths and approval heuristics.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/enablement.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-10
- Document the secret exposure acknowledgement and git history scrub in `feedback/enablement.md`, noting any training impacts.
- Update dry run packets with a temporary hold note (waiting on rotated Supabase credentials) and prepare to distribute the moment deployment releases the all-clear.
- Sync with support/product to adjust facilitator timelines and ensure the Q&A template reflects the delay plus next-check window.
