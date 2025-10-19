# AI-Knowledge - RAG Pipeline + Embeddings

> Knowledge ingestion. Embeddings. Vector search. Context retrieval. Ship RAG.

**Issue**: #115 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: app/services/knowledge/**, scripts/rag/**, tests/unit/knowledge/\*\*

## Constraints

- MCP Tools: MANDATORY for framework patterns
  - `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
  - Direct OpenAI Embeddings API (no MCP for AI)
- Framework: React Router 7 (NOT Remix) - use loaders for server-side data
- Model: text-embedding-3-small
- Vector store: Supabase pgvector extension
- Knowledge sources: Shopify orders, product docs, policies
- Feature flag: AI_KNOWLEDGE_RAG_ENABLED

## Definition of Done

- [ ] Knowledge ingestion pipeline operational
- [ ] Embeddings generated and stored
- [ ] Vector search working
- [ ] RAG context retrieval in AI-Customer
- [ ] All tests passing
- [ ] Evidence: RAG improving draft quality

## Production Molecules

### AIK-001: Knowledge Ingestion Pipeline (40 min)

**File**: app/services/knowledge/ingestion.ts
**Sources**: FAQs, product descriptions, return policies, past tickets
**Chunking**: Split into 500-token chunks
**Evidence**: Content ingested

### AIK-002: OpenAI Embeddings Integration (35 min)

**File**: app/services/knowledge/embedding.ts
**Model**: text-embedding-3-small
**Batch**: 100 texts at a time (API limit)
**Evidence**: Embeddings generated

### AIK-003: Supabase Vector Store Setup (35 min)

**Coordinate with Data agent**: knowledge_embeddings table
**Schema**: id, content, embedding (vector), metadata
**Index**: ivfflat for fast similarity search
**Evidence**: Table created, indexed

### AIK-004: Vector Search Implementation (40 min)

**File**: app/services/knowledge/search.ts
**Query**: Embed query, find top K similar vectors
**K**: 5 most relevant chunks
**Evidence**: Search returning relevant results

### AIK-005: RAG Context Builder (35 min)

**File**: app/services/knowledge/rag.ts
**Build**: Combine query + top K chunks into context
**Format**: For OpenAI chat completion
**Evidence**: Context properly formatted

### AIK-006: Integration with AI-Customer (30 min)

**Coordinate**: AI-Customer agent uses RAG context
**Update**: Draft generator to include RAG results
**Feature flag**: AI_KNOWLEDGE_RAG_ENABLED
**Evidence**: Drafts using RAG context

### AIK-007: Knowledge Sync Script (40 min)

**File**: scripts/rag/sync-knowledge-base.ts
**Sync**: Pull new Shopify products, policies, FAQs
**Schedule**: Daily via cron
**Evidence**: Sync working

### AIK-008: Embedding Cache Strategy (25 min)

**File**: app/services/knowledge/embedding-cache.ts
**Cache**: Recently embedded texts (avoid re-embedding)
**TTL**: 24 hours
**Evidence**: Cache reducing API calls

### AIK-009: Search Relevance Scoring (30 min)

**File**: app/services/knowledge/relevance-scorer.ts
**Score**: Cosine similarity threshold (>0.7 = relevant)
**Filter**: Only include high-relevance chunks
**Evidence**: Only relevant results returned

### AIK-010: Knowledge Base Explorer UI (Optional) (30 min)

**File**: app/routes/admin.knowledge.tsx
**Display**: All knowledge chunks, search interface
**For**: Debugging and manual review
**Evidence**: UI functional

### AIK-011: RAG Quality Metrics (25 min)

**File**: app/lib/metrics/rag-quality.ts
**Track**: Context relevance, draft quality with/without RAG
**Compare**: Edit distance with vs without RAG
**Evidence**: Metrics tracked

### AIK-012: Batch Embedding Job (30 min)

**File**: scripts/rag/build-index.ts
**Action**: Embed all existing knowledge
**Progress**: Log progress, handle failures
**Evidence**: Index built

### AIK-013: Contract Tests - OpenAI Embeddings (20 min)

**File**: tests/unit/knowledge/embeddings.contract.test.ts
**Verify**: Embedding response shapes
**Evidence**: Contracts passing

### AIK-014: Documentation (20 min)

**File**: docs/specs/knowledge_pipeline.md (verify completeness)
**Update**: RAG flow, embedding strategy, sync schedule
**Evidence**: Docs complete

### AIK-015: WORK COMPLETE Block (10 min)

**Update**: feedback/ai-knowledge/2025-10-19.md
**Include**: RAG operational, embeddings working, AI-Customer integrated
**Evidence**: Feedback entry

## Foreground Proof

1. ingestion.ts pipeline
2. embedding.ts integration
3. Vector store table created
4. search.ts implementation
5. rag.ts context builder
6. AI-Customer integration
7. sync-knowledge-base.ts script
8. embedding-cache.ts strategy
9. relevance-scorer.ts logic
10. Knowledge explorer UI (optional)
11. rag-quality.ts metrics
12. build-index.ts job
13. Embeddings contract tests
14. knowledge_pipeline.md docs
15. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~6 hours
**SUCCESS**: RAG improving draft quality, knowledge synced daily, context retrieval working
