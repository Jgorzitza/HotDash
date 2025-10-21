# Ai-knowledge Direction v5.1

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```


**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — LlamaIndex Knowledge Base for CEO Agent (PARALLEL DAY 1-2)

## ✅ WORK STATUS UPDATE (2025-10-21T00:00Z)

**Manager Consolidation Complete**: All feedback read, status verified

**Your Completed Work**: See feedback/${agent}/2025-10-20.md for full details

**Next Task**: See below for updated assignment

---


---

## Objective

**Build knowledge base for CEO agent** using LlamaIndex

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Timeline**: Day 1-2 — START NOW (Parallel with other agents)

**Purpose**: CEO agent queries knowledge base for product docs, policies, procedures

---

## Day 1 Tasks (START NOW - 4h)

### AI-KNOWLEDGE-001: LlamaIndex Setup & Document Ingestion

**Set up LlamaIndex**:

**Files to Create/Update**:
- `scripts/rag/build-index.ts` (may exist - enhance it)
- `app/services/rag/query-engine.ts` - Query interface
- `docs/integrations/llamaindex-setup.md` - Documentation

**Documents to Ingest**:
1. **Product Documentation**:
   - All product descriptions from Shopify
   - Product specifications
   - Usage instructions
   - Care/maintenance guides

2. **Company Policies**:
   - Return policy
   - Shipping policy
   - Privacy policy
   - Terms of service

3. **Operational Procedures**:
   - Refund process
   - Cancellation process
   - Escalation procedures
   - Quality standards

4. **FAQ Database**:
   - Common customer questions
   - Troubleshooting guides
   - Size charts, compatibility info

**Process**:
1. Collect documents (markdown, JSON, or scrape from Shopify)
2. Chunk documents (512 token chunks)
3. Generate embeddings (OpenAI or open source)
4. Store in vector database (Supabase pgvector OR Pinecone)
5. Build query engine

**CRITICAL - Pull Context7 FIRST**:
```bash
mcp_context7_get-library-docs("/llamaindex/llamaindex", "document-ingestion")
mcp_context7_get-library-docs("/llamaindex/llamaindex", "query-engine")
```

---

### AI-KNOWLEDGE-002: Query Engine for CEO Agent

**Build query interface**:

**Service**: `app/services/rag/ceo-knowledge-base.ts`

**Functions**:
```typescript
async function queryKnowledgeBase(query: string): Promise<{
  answer: string,
  sources: Array<{document: string, relevance: number}>,
  confidence: 'high' | 'medium' | 'low'
}> {
  // Use LlamaIndex query engine
  // Return answer + sources for citation
}
```

**Example Queries** (CEO agent will use):
- "What's our return policy for damaged items?"
- "How do I process a refund for order #12345?"
- "What are the specs for Powder Board XL?"
- "What's the escalation process for VIP customers?"

**Integration**: CEO agent calls this service, gets answers with citations

---

## Day 2 Tasks

### AI-KNOWLEDGE-003: Embedding Optimization & Testing

**Optimize retrieval**:
- Test different chunk sizes (256, 512, 1024 tokens)
- Test embedding models (OpenAI vs open source)
- Tune relevance threshold
- Test query rephrasing for better retrieval

**Benchmarks**:
- Query response time: <2s
- Relevance: Top 3 results should contain answer ≥80% of time
- Accuracy: Answer correct ≥90% of time

**Create Test Suite**:
- 20 test queries with expected answers
- Measure precision/recall
- Document in feedback

---

### AI-KNOWLEDGE-004: Knowledge Base Maintenance System

**Build update workflow**:
- Detect when Shopify products change
- Auto-update product docs in knowledge base
- Manual update workflow (upload new policy docs)
- Version tracking (know which policy version was active when)

**File**: `app/services/rag/knowledge-base-sync.ts`
- Webhook handler for Shopify product updates
- Manual upload endpoint (for policy docs)
- Incremental updates (don't rebuild entire index)

---

## Work Protocol

**1. MCP Tools (MANDATORY)**:
```bash
# LlamaIndex:
mcp_context7_get-library-docs("/llamaindex/llamaindex", "vector-store")
mcp_context7_get-library-docs("/llamaindex/llamaindex", "embeddings")

# OpenAI embeddings:
mcp_context7_get-library-docs("/openai/openai-node", "embeddings")

# Supabase pgvector (if using):
mcp_context7_get-library-docs("/supabase/supabase", "vector")

# Log:
## HH:MM - Context7: LlamaIndex
- Topic: document ingestion, query engine
- Key Learning: Chunk size affects retrieval quality
- Applied to: scripts/rag/build-index.ts (chunk size 512)
```

**2. Coordinate**:
- **AI-Customer**: CEO agent will use your knowledge base
- **Manager**: Provide policy documents to ingest
- **DevOps**: May need to deploy LlamaIndex MCP server (if using)

**3. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — AI-Knowledge: LlamaIndex Setup

**Working On**: AI-KNOWLEDGE-001 (document ingestion)
**Progress**: 150 documents ingested, embeddings generated

**Evidence**:
- Documents ingested: 150 (products: 80, policies: 15, FAQ: 55)
- Embeddings: 1,245 chunks (512 tokens each)
- Vector store: Supabase pgvector
- Context7: Pulled LlamaIndex docs (ingestion patterns)
- Test query: "return policy damaged items" → ✅ Correct answer retrieved

**Blockers**: None
**Next**: Build query engine interface for CEO agent
```

---

## Definition of Done

**LlamaIndex Setup**:
- [ ] Documents ingested (100+ documents minimum)
- [ ] Embeddings generated
- [ ] Vector store operational
- [ ] Context7 docs pulled

**Query Engine**:
- [ ] Query interface functional
- [ ] Returns answers + sources
- [ ] Response time <2s
- [ ] Accuracy ≥90% on test queries

**Optimization**:
- [ ] Chunk size tuned
- [ ] Relevance threshold set
- [ ] Test suite passing (≥16/20 correct)

**Maintenance System**:
- [ ] Auto-sync with Shopify
- [ ] Manual upload workflow
- [ ] Version tracking

---

## Critical Reminders

**DO**:
- ✅ Pull Context7 docs for LlamaIndex before coding
- ✅ Test query quality (accuracy matters for CEO agent)
- ✅ Provide citations (CEO needs to verify sources)
- ✅ Optimize for response time (<2s)

**DO NOT**:
- ❌ Skip Context7 tool pulls
- ❌ Deploy without testing query accuracy
- ❌ Ingest documents without chunking (too large)
- ❌ Store embeddings without vector store (use pgvector or Pinecone)

---

## Phase Schedule

**Day 1**: AI-KNOWLEDGE-001, 002 (Setup + query engine - 4h) — START NOW
**Day 2**: AI-KNOWLEDGE-003, 004 (Optimization + maintenance - 4h)

**Total**: 8 hours across Days 1-2 (parallel with other agents)

**UNBLOCKS**: CEO agent (Phase 11) has knowledge base ready

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md`
**Existing**: scripts/rag/ directory (may have starter code)
**LlamaIndex MCP**: May be deployed (hotdash-llamaindex-mcp.fly.dev)
**Feedback**: `feedback/ai-knowledge/2025-10-20.md`

---

**START WITH**: AI-KNOWLEDGE-001 (LlamaIndex setup NOW - 2h) — PARALLEL DAY 1

---

## Credential & Blocker Protocol

### If You Need Credentials:

**Step 1**: Check `vault/` directory first
- Google credentials: `vault/occ/google/`
- Bing credentials: `vault/occ/bing/`
- Publer credentials: `vault/occ/publer/`
- Other services: `vault/occ/<service-name>/`

**Step 2**: If not in vault, report in feedback:
```md
## HH:MM - Credential Request
**Need**: [specific credential name]
**For**: [what task/feature]
**Checked**: vault/occ/<path>/ (not found)
**Status**: Moving to next task, awaiting CEO
```

**Step 3**: Move to next task immediately (don't wait idle)

### If You Hit a True Blocker:

**Before reporting blocker, verify you**:
1. ✅ Checked vault for credentials
2. ✅ Inspected codebase for existing patterns
3. ✅ Pulled Context7 docs for the library
4. ✅ Reviewed RULES.md and relevant direction sections

**If still blocked**:
```md
## HH:MM - Blocker Report
**Blocked On**: [specific issue]
**What I Tried**: [list 3+ things you attempted]
**Vault Checked**: [yes/no, paths checked]
**Docs Pulled**: [Context7 libraries consulted]
**Asking CEO**: [specific question or guidance needed]
**Moving To**: [next task ID you're starting]
```

**Then immediately move to next task** - CEO will respond when available

**Key Principle**: NEVER sit idle. If one task blocked → start next task right away.
