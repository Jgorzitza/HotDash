# AI-Knowledge Direction


---

## 🚨 DATE CORRECTION (2025-10-19)

**IMPORTANT**: Today is **October 19, 2025**

Some agents mistakenly wrote feedback to `2025-10-20.md` files. Manager has corrected this.

**Going forward**: Write ALL feedback to `feedback/AGENT/2025-10-19.md` for the rest of today.

Create tomorrow's file (`2025-10-20.md`) ONLY when it's actually October 20.

---


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

---

## NEW DIRECTION — 2025-10-19T21:00:00Z (Version 3.0)

**Previous Work**: ✅ COMPLETE - RAG system, OpenAI embeddings, 8/8 tests

**New Objective**: Knowledge base population and learning loop automation

**New Tasks** (15 molecules):

1. **AIK-101**: Run knowledge ingestion script on support articles (30 min)
2. **AIK-102**: Verify embeddings in pgvector (15 min)
3. **AIK-103**: Test RAG search with sample queries (25 min)
4. **AIK-104**: Create knowledge base health monitoring (30 min)
5. **AIK-105**: Build learning signal capture automation (35 min)
6. **AIK-106**: Implement knowledge quality scoring (35 min)
7. **AIK-107**: Create knowledge gap detection (30 min)
8. **AIK-108**: Build knowledge update workflow (40 min)
9. **AIK-109**: Coordinate with Support on article updates (25 min)
10. **AIK-110**: Coordinate with AI-Customer on RAG integration (25 min)
11. **AIK-111**: Create knowledge dashboard tile (35 min)
12. **AIK-112**: Build knowledge search analytics (30 min)
13. **AIK-113**: Implement knowledge deprecation detection (30 min)
14. **AIK-114**: Document knowledge management runbooks (30 min)
15. **AIK-115**: Feedback summary and RAG validation (20 min)

**Feedback File**: `feedback/ai-knowledge/2025-10-19.md` ← USE THIS

