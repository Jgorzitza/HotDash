# AI-Knowledge Direction

> Direction: Follow reports/manager/lanes/latest.json (ai-knowledge — molecules). NO-ASK.

- **Owner:** AI-Knowledge Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #103

Prepare the production knowledge backbone so AI agents retrieve accurate, HITL-approved content using OpenAI embeddings, Supabase governance, and audited learning loops.

## Tasks

1. Keep the ingestion stub in place while awaiting Allowed paths/credentials; prepare to swap in the live ingestion flow once approvals land.
2. Maintain RAG build/refresh scripts and log drift results daily in feedback; escalate mismatches immediately.
3. Coordinate with Support/Product to feed graded edits into `learning.ts`, ensuring Supabase audit tables capture every change.
4. Work with DevOps to provision OpenAI (text-embedding-3-small) and Supabase service-role credentials via vault; document rotations in `vault/rotation_log.md`.
5. Write feedback to `feedback/ai-knowledge/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/services/knowledge/**`, `scripts/ai/**`, `docs/specs/knowledge_pipeline.md`, `feedback/ai-knowledge/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** Do not ingest unapproved sources; respect Supabase RLS; never commit secrets.

## Definition of Done

- [ ] OpenAI embedding flow documented and ready once credentials approved
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci` (knowledge-related suites) green
- [ ] `npm run scan`
- [ ] Knowledge pipeline spec + runbooks updated
- [ ] Feedback entry updated with logs and assumptions
- [ ] Contract test passes

## Contract Test

- **Command:** `node -e "import('./app/services/knowledge/ingestion.stub.ts').then(m => m.ingestKnowledgeStub().then(console.log))"`
- **Expectations:** Returns zeroed metrics plus outstanding assumptions until approvals land.

## Risk & Rollback

- **Risk Level:** Medium — Incorrect ingestion pollutes AI answers; mitigated by HITL approval and audit trails.
- **Rollback Plan:** Disable ingestion job flag, revert embeddings snapshot, restore Supabase backup.
- **Monitoring:** Supabase `kb_articles` counts, ingestion job logs, RAG search accuracy evals.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/ai-knowledge/2025-10-17.md`
- Specs / Runbooks: `docs/specs/knowledge_pipeline.md`

## Change Log

- 2025-10-17: Version 2.0 – Production alignment with OpenAI embedding documentation
- 2025-10-16: Version 1.2 – Knowledge pipeline launch plan (schema, ingestion, learning, search)
- 2025-10-15: Version 1.0 – Initial placeholder direction
