# Knowledge Service Setup Runbook

**File:** `docs/runbooks/knowledge_service_setup.md`  
**Owner:** AI-Knowledge Agent  
**Version:** 1.0  
**Created:** 2025-10-19  
**Status:** AIK-014 Deliverable

---

## Purpose

Setup guide for the knowledge ingestion and semantic search service using OpenAI embeddings and Supabase pgvector.

---

## Prerequisites

### Required Credentials

1. **OpenAI API Key**
   - Model: `text-embedding-3-small`
   - Cost: $0.02 per 1M tokens
   - Dimensions: 1536
   - Storage location: `vault/occ/openai/api_key_staging.env`
   - Environment variable: `OPENAI_API_KEY`

2. **Supabase Service Role Key**
   - Required for: Knowledge table access, vector search
   - Storage location: GitHub Secrets
   - Environment variable: `SUPABASE_SERVICE_ROLE_KEY`

3. **Supabase Project URL**
   - Environment variable: `SUPABASE_URL`

### Required Extensions

```sql
-- Enable pgvector extension (run as superuser)
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Installation Steps

### 1. Apply Database Migration

```bash
cd ~/HotDash/hot-dash
supabase migration apply supabase/migrations/20251019_knowledge_tables.sql
```

**Expected Result:**

- Table `knowledge_documents` created
- Indexes created (ivfflat on embedding, GIN on metadata)
- RLS policies enabled
- Helper function `search_knowledge()` created

### 2. Verify Extension

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Expected Output:**
| extname | extversion |
|---------|------------|
| vector | 0.5.0+ |

### 3. Verify Table Schema

```sql
\d knowledge_documents
```

**Expected Columns:**

- `id` (UUID, primary key)
- `content` (TEXT)
- `embedding` (VECTOR(1536))
- `metadata` (JSONB)
- `source` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 4. Test Vector Search Function

```sql
-- Create test embedding (normally from OpenAI)
INSERT INTO knowledge_documents (content, metadata, source)
VALUES (
  'Products ship in 2-3 business days via USPS',
  '{"category": "shipping", "tags": ["delivery", "timeline"]}'::jsonb,
  'manual_test'
);

-- Test search (requires actual embedding)
SELECT search_knowledge('[0.1, 0.2, ...]'::vector(1536), 0.7, 5);
```

---

## Row Level Security (RLS)

### Policies

1. **Service Role Policy** (`knowledge_documents_service_role`)
   - Role: `service_role`
   - Permissions: ALL (SELECT, INSERT, UPDATE, DELETE)
   - Purpose: Backend service access

2. **Authenticated Read Policy** (`knowledge_documents_authenticated_read`)
   - Role: `authenticated`
   - Permissions: SELECT only
   - Purpose: Read-only access for app users

### Testing RLS

```sql
-- Test as service_role (should succeed)
SET ROLE service_role;
INSERT INTO knowledge_documents (content, metadata, source)
VALUES ('Test', '{}'::jsonb, 'rls_test');

-- Test as authenticated (should only read)
SET ROLE authenticated;
SELECT * FROM knowledge_documents LIMIT 1; -- Should succeed
INSERT INTO knowledge_documents (content, metadata, source)
VALUES ('Test', '{}'::jsonb, 'fail_test'); -- Should fail
```

---

## Configuration

### Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBED_MODEL=text-embedding-3-small

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_ACCESS_TOKEN=sbp_...
```

### Rate Limiting

```typescript
// app/services/knowledge/embedding.ts
const RATE_LIMIT = {
  maxRequestsPerMinute: 3000, // OpenAI tier 1
  maxTokensPerMinute: 1000000,
};
```

---

## Usage Examples

### Ingest Document

```typescript
import { ingestDocument } from "~/services/knowledge";

const doc = await ingestDocument(
  "Returns accepted within 30 days of delivery",
  {
    category: "returns",
    tags: ["policy", "timeline"],
    confidence_score: 0.95,
  },
);
```

### Search Knowledge

```typescript
import { searchKnowledge } from "~/services/knowledge";

const results = await searchKnowledge("How long do I have to return an item?", {
  limit: 5,
  minSimilarity: 0.7,
  category: "returns",
});
```

### Build RAG Context

```typescript
import { buildRAGContext } from "~/services/knowledge/rag";

const context = await buildRAGContext(
  "What's your shipping policy?",
  3, // max documents
);
```

---

## Monitoring

### Query Performance

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename = 'knowledge_documents';

-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE query LIKE '%knowledge_documents%'
ORDER BY total_time DESC
LIMIT 10;
```

### Index Size

```sql
SELECT pg_size_pretty(pg_relation_size('idx_knowledge_documents_embedding'))
  AS embedding_index_size;
```

### Document Count

```sql
SELECT COUNT(*) AS total_documents,
       COUNT(DISTINCT metadata->>'category') AS categories
FROM knowledge_documents;
```

---

## Troubleshooting

### Issue: pgvector Extension Not Found

**Error:** `type "vector" does not exist`

**Solution:**

```sql
CREATE EXTENSION vector;
```

### Issue: Slow Vector Search

**Symptoms:** Queries taking >5 seconds

**Diagnostics:**

```sql
EXPLAIN ANALYZE
SELECT * FROM knowledge_documents
ORDER BY embedding <-> '[0.1,0.2,...]'::vector(1536)
LIMIT 5;
```

**Solutions:**

1. Verify index exists and is being used
2. Increase ivfflat probes: `SET ivfflat.probes = 10;`
3. Rebuild index: `REINDEX INDEX CONCURRENTLY idx_knowledge_documents_embedding;`

### Issue: RLS Blocking Service Access

**Error:** `new row violates row-level security policy`

**Solution:**

```sql
-- Verify service_role policy exists
SELECT * FROM pg_policies
WHERE tablename = 'knowledge_documents';

-- Grant service_role if missing
GRANT ALL ON knowledge_documents TO service_role;
```

---

## Maintenance

### Weekly

- Check index health: `REINDEX INDEX CONCURRENTLY idx_knowledge_documents_embedding;`
- Vacuum table: `VACUUM ANALYZE knowledge_documents;`
- Review slow queries

### Monthly

- Audit document quality (confidence scores)
- Remove stale documents (>90 days unused)
- Update index parameters if needed

---

## Security Considerations

1. **Never expose service role key** in client-side code
2. **Always use RLS policies** for user-facing queries
3. **Validate input** before ingestion (XSS, injection)
4. **Rate limit** embedding API calls
5. **Monitor costs** (OpenAI API usage)

---

## Rollback Plan

If knowledge service degrades:

1. Disable RAG context in AI-Customer: Set `ENABLE_RAG=false`
2. Revert to template-only drafting
3. Restore from backup: `supabase db dump > backup.sql`
4. Investigate issues in non-prod environment

---

## References

- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings
- pgvector Documentation: https://github.com/pgvector/pgvector
- Supabase Vector Guide: https://supabase.com/docs/guides/ai/vector-columns
- Knowledge Base Design: `docs/specs/knowledge_base_design.md`

---

**End of Runbook**
