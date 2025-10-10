---
epoch: 2025.10.E1
doc: docs/directions/ai.md
owner: manager
last_reviewed: 2025-10-08
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
- Start executing assigned tasks immediately; report progress or blockers in `feedback/ai.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-10
- Confirm the sanitized repo by running `git grep postgresql://` and document the clean check in `feedback/ai.md`; escalate immediately if any secret remnants persist.
- Pause new prompt log ingestion until data delivers fresh NDJSON exports after tomorrow’s rotation; stage the ingestion script so it can run as soon as credentials are safe.
- Update enablement packets with a security incident note explaining the temporary hold on staging evidence; gather acknowledgements from trainers in `feedback/ai.md`.
- Coordinate with data/QA on the timeline for resuming regression evidence once rotated Supabase credentials land, outlining any follow-up tasks you’ll tackle.
