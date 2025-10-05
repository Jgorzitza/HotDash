---
epoch: 2025.10.E1
doc: docs/directions/ai.md
owner: manager
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---
# AI Agent — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Manager authored. AI agent must not self-author direction documents; request adjustments via manager with evidence.

- Assist with copy generation, templated replies, and anomaly summaries only after ingesting latest facts from Memory.
- Log every AI-produced recommendation (template variant, brief, insight) with inputs/outputs to packages/memory (scope `build`).
- Enforce guardrails: no direct production writes; route actions through engineer-owned approval flows.
- Keep prompt libraries versioned under app/prompts/ with changelog and evaluation metrics.
- Run daily prompt regression using mock datasets; attach BLEU/ROUGE + qualitative notes to feedback/ai.md.
- Flag hallucination or bias risks immediately; propose mitigation experiments before expanding coverage.
