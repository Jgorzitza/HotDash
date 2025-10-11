---
epoch: 2025.10.E1
doc: docs/directions/ai.md
owner: manager
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# AI Agent — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. AI agent must not self-author direction documents; request adjustments via manager with evidence.

- Assist with copy generation, templated replies, and anomaly summaries only after ingesting latest facts from Memory.
- Log every AI-produced recommendation (template variant, brief, insight) with inputs/outputs to packages/memory (scope `build`).
- Enforce guardrails: no direct production writes; route actions through engineer-owned approval flows.
- Keep prompt libraries versioned under app/prompts/ with changelog and evaluation metrics.
- Run daily prompt regression using mock datasets; attach BLEU/ROUGE + qualitative notes to feedback/ai.md.
- Flag hallucination or bias risks immediately; propose mitigation experiments before expanding coverage.
- Stack guardrails: adhere to `docs/directions/README.md#canonical-toolkit--secrets` (Supabase as the only Postgres target, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex tooling); do not introduce alternate providers or alternate LlamaHub connectors without approval.
- Build prompts/tools against the documented APIs: docs/dev/admin-graphql.md (admin data) and docs/dev/storefront-mcp.md (storefront MCP).
- Start executing assigned tasks immediately; report progress or blockers in `feedback/ai.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-10
Work every task to completion—do not hand off after identifying a gap. Capture the command you ran, the output, and the timestamp in `feedback/ai.md`. Retry each failed command twice before escalating with logs attached.

1. **Pipeline blueprint** — Draft `docs/runbooks/llamaindex_workflow.md` capturing the approved ingestion sources (Sitemap/WebPage for hotrodan.com, Supabase decision/telemetry tables, Chatwoot curated replies), nightly cadence, logging outputs, and rollback steps. Attach changelog evidence in `feedback/ai.md`.
2. **CLI scaffolding** — Run `npx create-llama` to scaffold a TypeScript workflow project under `scripts/ai/llama-workflow/`. Wire it to read secrets from `.env.local` (OpenAI, Supabase) and document setup in the runbook.
3. **Loader implementation** — Build ingestion modules inside the new workflow for:
   - `SitemapLoader` with `WebPageReader` fallback targeting hotrodan.com.
   - `SupabaseReader` hitting the decision log + telemetry tables (read-only role).
   - Chatwoot curated replies (consume the Supabase table Support will maintain).
   Validate each module locally and log evidence paths.
4. **MCP toolbox integration** — Define MCP tools (`refresh_index`, `query_support`, `insight_report`) in `docs/mcp/tools/llamaindex.json` (or update existing file) and surface matching handlers in the workflow project. Provide schema + usage notes for other agents in `feedback/ai.md`.
5. **Nightly job + evaluations** — Add npm scripts (`ai:refresh`, `ai:eval`) and ensure nightly scheduling hooks the workflow, logs outputs to `packages/memory/logs/build/`, and runs regression checks (BLEU/ROUGE + citation sanity). Deliver evidence and unblock Data/QA before switching tasks.
