# AI-Knowledge Direction v5.2

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T04:10Z  
**Version**: 5.2  
**Status**: ACTIVE — Knowledge Base + CEO Agent Backend

---

## Objective

**Build knowledge base with vector search + CEO agent backend with OpenAI SDK**

---

## MANDATORY MCP USAGE

```bash
# LlamaIndex for knowledge base
mcp_context7_get-library-docs("/run-llama/LlamaIndexTS", "vector embeddings search indexing")

# OpenAI Agents SDK
mcp_context7_get-library-docs("/openai/openai-node", "agents SDK assistants")

# Supabase vector storage
mcp_context7_get-library-docs("/supabase/supabase", "vector embeddings pgvector")
```

---

## ACTIVE TASKS (10h total)

### AI-KNOWLEDGE-001: Knowledge Base Schema (3h) - START NOW

**Requirements**:
- Vector embeddings table in Supabase
- Document storage with metadata
- Search index configuration
- Similarity search setup

**MCP Required**: LlamaIndex + Supabase vector docs

**Implementation**:
**File**: `supabase/migrations/20251021000002_knowledge_base.sql` (new)
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base table
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector index for similarity search
CREATE INDEX idx_knowledge_embedding ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops);
```

**File**: `prisma/schema.prisma` (update)
- Add KnowledgeBase model with @@schema("public")

**Time**: 3 hours

---

### AI-KNOWLEDGE-002: CEO Agent Backend (3h)

**Requirements**:
- OpenAI Agents SDK integration
- Thread management
- Tool definitions (business.summary, knowledge.search)
- HITL approval workflow

**MCP Required**: OpenAI SDK agents documentation

**Implementation**:
**File**: `app/agents/ceo-agent.ts` (new)
```typescript
// OpenAI SDK agent setup
// Thread management
// Tool definitions
// HITL integration
```

**Time**: 3 hours

---

### AI-KNOWLEDGE-003: Business Summary Service (2h)

**Requirements**:
- Daily business summary generation
- Revenue, orders, CX, inventory highlights
- CEO-focused insights

**File**: `app/services/knowledge/business-summary.ts` (new)

**Time**: 2 hours

---

### AI-KNOWLEDGE-004: Insight Generation (2h)

**Requirements**:
- Pattern detection across metrics
- Anomaly identification
- Trend analysis

**File**: `app/services/knowledge/insights.ts` (new)

**Time**: 2 hours

---

## Work Protocol

**MCP Tools**: LlamaIndex, OpenAI SDK, Supabase vector docs

**Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — AI-Knowledge: Knowledge Base

**Working On**: AI-KNOWLEDGE-001 (Vector DB schema)
**Progress**: 70% - Migration created, testing embeddings

**Evidence**:
- Migration: supabase/migrations/20251021000002_knowledge_base.sql (67 lines)
- MCP: LlamaIndex vector embeddings docs + Supabase pgvector
- Test: Created 5 test documents, embeddings stored
- Search: Similarity search working (0.92 similarity for related docs)

**Blockers**: None
**Next**: Complete index optimization, update Prisma schema
```

---

**START WITH**: AI-KNOWLEDGE-001 (Knowledge base) - Pull LlamaIndex + Supabase docs NOW

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
