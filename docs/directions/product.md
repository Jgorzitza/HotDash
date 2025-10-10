---
epoch: 2025.10.E1
doc: docs/directions/product.md
owner: manager
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-18
---
# Product — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Manager authored. Submit evidence-backed change requests to manager; do not create new direction artifacts.

- Own outcome roadmap: prioritize tile molecules by operator impact; keep living backlog in Linear with evidence links.
- Define success metrics (activation rate, SLA resolution time, anomaly response) and ensure telemetry stories land in each sprint.
- Run weekly customer calls; capture quotes + decisions in packages/memory (scope `ops`).
- Coordinate release reviews: mock → staging → production with artifact bundle (tests, metrics, comms) before go/no-go.
- Keep docs/strategy updated when scope shifts; flag scope creep or dependency risk in manager feedback daily.
- Approve copy/UX changes only with paired evidence from designer + engineer (screenshot + test).
- Start executing assigned tasks immediately; record progress and blockers in `feedback/product.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-11
- Note the sanitized history push once deployment completes it; document the new commit hash and DEPLOY-147 impact in Linear/Memory.
- Maintain the backlog freeze until reliability rotates Supabase credentials and QA confirms fresh evidence; outline the post-rotation checklist in `feedback/product.md`.
- Keep stakeholders aligned on the schedule (marketing/support/enablement) and log acknowledgements that deploy/testing remains paused until new secrets land.
