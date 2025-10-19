# AI-Knowledge Direction

- **Owner:** AI-Knowledge Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #103

Prepare the production knowledge backbone. Today: rebuild index and run eval; attach logs and flag drift.

## Tasks

1. Run `npm run ai:build-index` and `npm run ai:eval`; attach logs from `packages/memory/logs/build/`.
2. Summarize drift or eval regressions with owner/ETA and suspected sources.
3. Write feedback to `feedback/ai-knowledge/2025-10-18.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/services/knowledge/**`, `scripts/ai/**`, `packages/memory/logs/build/**`, `docs/specs/knowledge_pipeline.md`, `feedback/ai-knowledge/2025-10-18.md`
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

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes, document blocker and move to the next item. Do not idle.
- Keep diffs in Allowed paths; attach logs/eval reports.

## Fallback Work Queue (aligned to NORTH_STAR)

1. Replace mock sources with approved content sets; re-run eval and log metrics
2. Improve index build pipeline resilience and evidence bundling
3. Add search patterns for SEO/Guided Selling knowledge
4. Prepare MCP tool transcripts for knowledge queries
5. Document regression tracking for CEO briefings
6. Retrieval evaluation set curation and maintenance
7. Chunking strategy doc (by heading vs sliding window)
8. Fallback search behavior and thresholds (BM25 hybrid)
9. Synonyms/aliases lists for automotive entities
10. Evaluation matrix and scoring rubric documentation

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
- Feedback: `feedback/ai-knowledge/2025-10-18.md`
- Specs / Runbooks: `docs/specs/knowledge_pipeline.md`

## Change Log

- 2025-10-18: Version 2.1 – Launch-day build/eval logs + drift summary
- 2025-10-17: Version 2.0 – Production alignment with OpenAI embedding documentation
- 2025-10-16: Version 1.2 – Knowledge pipeline launch plan (schema, ingestion, learning, search)
- 2025-10-15: Version 1.0 – Initial placeholder direction
