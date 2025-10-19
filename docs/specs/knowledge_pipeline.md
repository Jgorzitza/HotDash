# Knowledge Pipeline Specification

**File:** `docs/specs/knowledge_pipeline.md`  
**Owner:** AI-Knowledge Agent  
**Version:** 1.0  
**Created:** 2025-10-19  
**Status:** AIK-017 Deliverable

---

## 1) Purpose

Production-ready knowledge pipeline for AI-Customer agent RAG (Retrieval-Augmented Generation), enabling:

- Semantic search using OpenAI embeddings
- Document ingestion from multiple sources
- Quality scoring and confidence tracking
- Learning from human-approved customer interactions

---

## 2) Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE PIPELINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐      ┌──────────────┐      ┌────────────┐ │
│  │   Sources   │ ───► │  Ingestion   │ ───► │  Storage   │ │
│  └─────────────┘      └──────────────┘      └────────────┘ │
│       │                      │                      │        │
│       │                      ▼                      │        │
│  ┌────────────────────────────────┐                │        │
│  │  - Support Articles            │                │        │
│  │  - Product Catalog (Shopify)   │                │        │
│  │  - Customer Interactions       │      ┌─────────▼─────┐  │
│  │  - Graded Edits (HITL)         │      │   Supabase    │  │
│  └────────────────────────────────┘      │ pgvector(1536)│  │
│                                           └───────────────┘  │
│                                                    │          │
│                      ┌────────────────────────────┘          │
│                      ▼                                        │
│           ┌──────────────────┐                               │
│           │  Search & RAG    │                               │
│           │  Context Builder │                               │
│           └──────────────────┘                               │
│                      │                                        │
│                      ▼                                        │
│           ┌──────────────────┐                               │
│           │  AI-Customer     │                               │
│           │  Agent (HITL)    │                               │
│           └──────────────────┘                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3) Ingestion Process

### 3.1 Document Flow

1. **Source Extraction**
   - Support articles: Markdown files from `docs/support/**`
   - Products: Shopify Admin GraphQL API
   - Interactions: `kb_learning_edits` table (graded ≥4)

2. **Content Chunking**
   - Max chunk size: 512 tokens (~2048 characters)
   - Overlap: 50 tokens for context preservation
   - Metadata preserved per chunk

3. **Embedding Generation**
   - Model: OpenAI `text-embedding-3-small`
   - Dimensions: 1536
   - Cost: $0.02 per 1M tokens
   - Rate limit: 3000 requests/minute

4. **Storage**
   - Table: `knowledge_documents`
   - Embedding: `VECTOR(1536)`
   - Index: ivfflat with vector_cosine_ops
   - RLS: Service role full access, authenticated read-only

### 3.2 Quality Scoring

Each document receives:

- **Confidence Score** (0-1): Based on source authority
- **Usage Count**: Times retrieved for drafts
- **Success Count**: Times used in approved replies
- **Average Grades**: Tone, accuracy, policy (1-5)

Formula:

```
confidence = (success_count / usage_count) * 0.4 +
             (avg_tone_grade / 5) * 0.2 +
             (avg_accuracy_grade / 5) * 0.3 +
             (avg_policy_grade / 5) * 0.1
```

---

## 4) Search Process

### 4.1 Semantic Search

```sql
SELECT id, content, metadata, source,
       1 - (embedding <=> $query_embedding) AS similarity
FROM knowledge_documents
WHERE 1 - (embedding <=> $query_embedding) >= 0.7
ORDER BY embedding <=> $query_embedding
LIMIT 5;
```

### 4.2 Filtering

- **By Category**: `metadata->>'category' = 'shipping'`
- **By Tags**: `metadata->'tags' ?| array['refund', 'return']`
- **By Confidence**: `metadata->>'confidence_score'::float >= 0.8`
- **By Recency**: `created_at > NOW() - INTERVAL '30 days'`

### 4.3 Performance

- **Target**: <500ms per search query
- **Index**: ivfflat with `lists = 100`
- **Probes**: `SET ivfflat.probes = 10` for better recall
- **Monitoring**: `pg_stat_statements` for slow queries

---

## 5) RAG Integration

### 5.1 Context Building

```typescript
// Build context for AI-Customer agent
const context = await buildRAGContext(customerQuestion, 3);

// AI prompt structure
const prompt = `
KNOWLEDGE BASE CONTEXT:

${context}

CUSTOMER QUESTION:
${customerQuestion}

Draft a helpful, accurate, policy-compliant reply.
`;
```

### 5.2 Context Relevance

- Minimum similarity: 0.7 (70%)
- Maximum documents: 3-5
- Total context: <2000 tokens
- Sorted by: `similarity * confidence_score DESC`

---

## 6) Maintenance Procedures

### 6.1 Daily

- **Stale Document Detection**

  ```sql
  SELECT id, content, last_used_at
  FROM knowledge_documents
  WHERE last_used_at < NOW() - INTERVAL '90 days'
    AND (metadata->>'confidence_score')::float < 0.5;
  ```

- **Quality Monitoring**
  ```sql
  SELECT COUNT(*) FILTER (WHERE confidence_score >= 0.8) AS high_quality,
         COUNT(*) FILTER (WHERE confidence_score < 0.4) AS low_quality
  FROM knowledge_documents;
  ```

### 6.2 Weekly

- **Index Maintenance**

  ```sql
  REINDEX INDEX CONCURRENTLY idx_knowledge_documents_embedding;
  VACUUM ANALYZE knowledge_documents;
  ```

- **Coverage Analysis**
  ```sql
  SELECT metadata->>'category' AS category,
         COUNT(*) AS doc_count,
         AVG((metadata->>'confidence_score')::float) AS avg_confidence
  FROM knowledge_documents
  GROUP BY category
  ORDER BY doc_count DESC;
  ```

### 6.3 Monthly

- Archive documents not used in 90 days
- Re-embed updated content
- Audit confidence scores
- Review API costs

---

## 7) Data Sources

### 7.1 Support Articles

**Location**: `docs/support/**/*.md`

**Metadata**:

```json
{
  "category": "shipping|returns|products|technical|policies",
  "tags": ["delivery", "timeline", "international"],
  "confidence_score": 0.9,
  "source": "support_docs"
}
```

**Ingestion**: `scripts/knowledge/ingest-articles.mjs`

### 7.2 Product Catalog

**Source**: Shopify Admin GraphQL

**Query**:

```graphql
query ProductKnowledge {
  products(first: 250) {
    edges {
      node {
        id
        title
        description
        descriptionHtml
        productType
        vendor
        tags
        variants(first: 10) {
          edges {
            node {
              title
              price
              sku
            }
          }
        }
      }
    }
  }
}
```

**Metadata**:

```json
{
  "category": "products",
  "tags": ["product_type", "vendor"],
  "product_id": "gid://shopify/Product/...",
  "confidence_score": 0.85
}
```

### 7.3 Customer Interactions

**Source**: `kb_learning_edits` table

**Filter**: Grades ≥4 (high quality)

**Content**: Human-approved final replies

**Metadata**:

```json
{
  "category": "cx_interaction",
  "tags": ["tone_improvement", "factual_correction"],
  "tone_grade": 5,
  "accuracy_grade": 5,
  "policy_grade": 5,
  "confidence_score": 0.95
}
```

---

## 8) Security & Compliance

### 8.1 Row Level Security

**Service Role**:

- Full access (SELECT, INSERT, UPDATE, DELETE)
- Used by backend services only
- Never exposed to client

**Authenticated Users**:

- Read-only access (SELECT)
- For search/retrieval only

### 8.2 Data Privacy

- **No PII**: Customer names, emails, addresses excluded
- **Anonymization**: Interaction data de-identified
- **GDPR**: Right to be forgotten implemented
- **Audit Trail**: All ingestion logged

### 8.3 API Security

- **Rate Limiting**: 100 requests/minute per user
- **Authentication**: Supabase JWT required
- **Validation**: Input sanitization for XSS/injection
- **Monitoring**: Track unusual patterns

---

## 9) Quality Metrics

### 9.1 Coverage

- Target: ≥70% of customer questions have relevant knowledge
- Metric: `(questions_with_results / total_questions) * 100`

### 9.2 Accuracy

- Target: ≥90% of RAG-drafted replies approved without edits
- Metric: `(approved_without_edits / total_drafts) * 100`

### 9.3 Confidence Distribution

- High (≥0.8): Target ≥40%
- Medium (0.6-0.79): Target ≤40%
- Low (<0.6): Target ≤20%

### 9.4 Performance

- Search latency: P95 <500ms
- Ingestion throughput: ≥100 docs/minute
- Embedding API: 99.9% uptime

---

## 10) Troubleshooting

### Slow Searches

**Symptoms**: Queries >2 seconds

**Diagnostics**:

```sql
EXPLAIN ANALYZE
SELECT * FROM knowledge_documents
ORDER BY embedding <-> $query
LIMIT 5;
```

**Solutions**:

1. Increase ivfflat probes
2. Rebuild index concurrently
3. Optimize index parameters (lists)

### Low Recall

**Symptoms**: Relevant docs not returned

**Diagnostics**:

```sql
-- Compare exact vs approximate
BEGIN;
SET LOCAL enable_indexscan = off;
SELECT * FROM knowledge_documents
ORDER BY embedding <-> $query
LIMIT 10;
COMMIT;
```

**Solutions**:

1. Lower similarity threshold (0.7 → 0.6)
2. Increase result limit
3. Re-embed with better chunking

### Stale Content

**Symptoms**: Outdated info in drafts

**Diagnostics**:

```sql
SELECT id, content, created_at, last_used_at
FROM knowledge_documents
WHERE last_used_at IS NULL
   OR last_used_at < NOW() - INTERVAL '60 days';
```

**Solutions**:

1. Archive old documents
2. Re-ingest updated content
3. Implement TTL policy

---

## 11) Rollback Plan

If knowledge service degrades:

1. **Disable RAG**:

   ```typescript
   // app/services/ai-customer/config.ts
   export const ENABLE_RAG = false;
   ```

2. **Revert to Templates**:
   - Use pre-defined reply templates
   - No semantic search
   - Human review all drafts

3. **Restore Backup**:

   ```bash
   supabase db dump > backup.sql
   psql $DATABASE_URL < backup.sql
   ```

4. **Investigate**:
   - Check index health
   - Review slow query log
   - Analyze confidence scores

---

## 12) Future Enhancements

- **Multi-modal embeddings**: Images, videos
- **Hybrid search**: Combine full-text + vector
- **Fine-tuning**: Custom embedding model
- **Auto-categorization**: ML-based category assignment
- **Real-time updates**: Webhook-triggered re-ingestion

---

## 13) References

- Knowledge Base Design: `docs/specs/knowledge_base_design.md`
- Runbook: `docs/runbooks/knowledge_service_setup.md`
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings
- pgvector: https://github.com/pgvector/pgvector
- Supabase Vectors: https://supabase.com/docs/guides/ai/vector-columns

---

**End of Knowledge Pipeline Specification**
