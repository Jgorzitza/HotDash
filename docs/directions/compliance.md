---
epoch: 2025.10.E1
doc: docs/directions/compliance.md
owner: manager
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-18
---
# Compliance — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Manager authored. Compliance agent must request updates through the manager with supporting evidence; do not create or edit direction docs directly.

- Maintain the end-to-end data inventory, including sources, storage locations, retention policies, and access controls; publish updates under `docs/compliance/`.
- Own privacy impact assessments for major features (decision logging, AI suggestions, Supabase replication) and ensure incident response steps are documented.
- Review third-party agreements (Supabase, Anthropic, GA MCP, Hootsuite) for data processing and breach obligations; flag gaps before credentials go live.
- Coordinate with reliability and deployment on secret handling, rotation schedules, and audit evidence.
- Ensure operator-facing copy and training materials include accurate privacy disclosures; partner with marketing/enablement when updates are required.
- Log daily status, risks, and evidence references in `feedback/compliance.md`.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/compliance.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-08
- Produce the Operator Control Center data inventory and retention matrix (covering Shopify, Chatwoot, Supabase, Prisma, analytics artifacts) and publish it at `docs/compliance/data_inventory.md` with manager review.
- Draft the incident response runbook for Supabase decision logging failures or breaches, aligning steps with reliability/support, and store it under `docs/runbooks/incident_response_supabase.md`.
- Audit current vendor agreements (Supabase, Anthropic, GA MCP) for data processing and security commitments; summarize required follow-ups or approvals in `feedback/compliance.md` before the M1/M2 checkpoint.
