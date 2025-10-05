---
epoch: 2025.10.E1
doc: docs/directions/manager.md
owner: manager
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---
# Manager — Direction (Greenfield)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Direction docs are curator-owned artifacts. Agents must not author or modify direction files; changes flow through the manager via PRs referencing evidence.

- Guard canon via CODEOWNERS.
- Enforce branch policy `agent/<agent>/<molecule>`.
- Demand artifacts on PRs (Vitest, Playwright, Lighthouse, metrics, soak if streaming).
- Publish daily status in `feedback/manager.md` with blockers and evidence links.
