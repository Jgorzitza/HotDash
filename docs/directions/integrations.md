---
epoch: 2025.10.E1
doc: docs/directions/integrations.md
owner: manager
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-18
---
# Integrations — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Manager authored. Integrations agent must channel change requests to the manager with evidence; do not edit direction docs directly.

- Own external vendor onboarding (GA MCP, Chatwoot sandbox, Supabase, social sentiment providers) and track status in `docs/integrations/`.
- Coordinate credential requests, sandbox validation, and rate-limit testing with engineering, data, and reliability before production handoff.
- Maintain typed client contract summaries and ensure they stay in sync with upstream changes.
- Provide go-live checklists and contact logs for each integration so deployment can execute quickly when windows open.
- Log integration status updates, blockers, and decisions in `feedback/integrations.md`.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/integrations.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-08
- Secure GA MCP production credentials (or written ETA) and update `docs/integrations/ga_mcp_onboarding.md` with required verification steps, contacts, and evidence for compliance.
- Partner with marketing and product to finalize the social sentiment vendor recommendation (Hootsuite vs native APIs) and document the decision, contract considerations, and next steps.
- Publish the integration readiness dashboard summarizing each vendor's status (sandbox/live, credentials, testing, blockers) and share it with manager/product before the 2025-10-08 check-in.
