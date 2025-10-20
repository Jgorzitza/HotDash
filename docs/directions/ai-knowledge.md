# AI-Knowledge Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 4.0

## Objective

**Issue**: #71 ✅ COMPLETE  
RAG system operational - ready for KB expansion

## Current Status

All v3.0 tasks ✅, RAG tested ✅ (6 docs, 17.7s), credentials ✅

## Tasks

### SUPPORTIVE WORK (1h) - KB Documentation & Expansion

**AI-KB-001**: Document RAG Build Process (30 min)
1. Create `docs/runbooks/knowledge_base_rag_build.md`
2. Document:
   - How to run: `npx tsx scripts/rag/build-index.ts`
   - Input: data/support/*.md files
   - Embedding: OpenAI text-embedding-3-small
   - Output: packages/memory/indexes/operator_knowledge/
   - Credentials: vault/occ/openai/api_key_staging.env
3. Include troubleshooting steps
4. Save to docs/runbooks/

**AI-KB-002**: Expand Support KB Content (30 min)
1. Review existing: data/support/*.md (currently 6 docs)
2. Add 2-3 new support docs:
   - Chatwoot troubleshooting (based on Support's Oct 20 fix)
   - Approval queue FAQ
   - Common dashboard issues
3. Run RAG build to index new docs
4. Verify: Document count increases

### STANDBY - Ready for KB Requests

- Support Engineer with knowledge integration
- Answer questions about RAG system
- Provide embeddings help
- Expand KB as needed

## Work Complete

✅ RAG system tested (6 docs indexed)  
✅ OpenAI embeddings working (text-embedding-3-small)  
✅ Supabase credentials verified  
✅ KB harness spec created (350+ lines)

## Constraints

**Tools**: npx, tsx  
**Budget**: ≤ 1.5 hours  
**Paths**: data/support/**, scripts/rag/**, docs/runbooks/**, feedback/ai-knowledge/**

## Links

- Previous work: feedback/ai-knowledge/2025-10-20.md (all complete)
- RAG script: scripts/rag/build-index.ts
- KB spec: docs/specs/hitl/ai-knowledge-base.md

## Definition of Done

- [ ] RAG build process documented
- [ ] KB content expanded (8-10 docs minimum)
- [ ] New docs indexed successfully
