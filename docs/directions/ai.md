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

## Current Sprint Focus — 2025-10-08
- Build the operator dry-run AI kit: generate annotated CX Escalations and Sales Pulse suggestions for the top training scenarios, store outputs under `docs/enablement/job_aids/ai_samples/`, and review with enablement/support before the 2025-10-16 session.
- Keep `npm run ai:regression` green daily, writing BLEU/ROUGE deltas and qualitative notes to Memory (scope `build`) and `feedback/ai.md`; share regression artifacts with QA so they bundle alongside Playwright evidence.
- Finalize the pilot readiness brief covering guardrails, kill-switch behavior (`FEATURE_AI_ESCALATIONS`), Supabase logging dependencies, and go/no-go criteria; review with product, compliance, and reliability ahead of the M1/M2 checkpoint.
