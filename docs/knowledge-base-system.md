# Knowledge Base System Documentation

**Owner:** ai-knowledge agent  
**Version:** 1.0  
**Status:** Implemented  
**Last Updated:** 2025-10-23

---

## Overview

The Knowledge Base System is an AI-powered knowledge management system that:

- **Indexes content** using vector embeddings for semantic search
- **Provides search functionality** using pgvector for similarity matching
- **Builds RAG context** for AI agents to improve response quality
- **Learns from HITL approvals** to continuously improve
- **Tracks quality metrics** including confidence scores and usage statistics

---

## Architecture

### Service Modules

Located in `app/services/knowledge/`:

| Module | Purpose | Status |
|--------|---------|--------|
| `types.ts` | Type definitions for KB system | ✅ Complete |
| `embedding.ts` | OpenAI text-embedding-3-small integration | ✅ Complete |
| `ingestion.ts` | Document ingestion + embedding generation | ✅ Complete |
| `search.ts` | Semantic search using pgvector | ✅ Complete |
| `rag.ts` | Context builder for AI agents | ✅ Complete |
| `index.ts` | Main export and health checks | ✅ Complete |

### Database Schema

Uses existing `knowledge_base` table in Prisma schema:

```typescript
model knowledge_base {
  id                   String   @id @default(dbgenerated("gen_random_uuid()"))
  shop_domain          String
  document_key         String
  document_type        String
  title                String
  content              String
  embedding            vector(1536)  // pgvector for semantic search
  source_url           String?
  tags                 String[]
  category             String?
  version              Int      @default(1)
  is_current           Boolean  @default(true)
  created_by           String
  created_at           DateTime @default(now())
  updated_at           DateTime @default(now())
  metadata             Json     @default("{}")
  project              String   @default("occ")
}
```

---

## Usage

### 1. Ingest Documents

```typescript
import { ingestDocument } from "~/services/knowledge";

const result = await ingestDocument({
  title: "How to track orders",
  content: "You can track your order by visiting...",
  category: "orders",
  tags: ["tracking", "shipping", "order-status"],
  source: "support-docs",
  createdBy: "ai-knowledge",
  metadata: {
    author: "support-team",
    version: "1.0",
  },
});

console.log(`Article created: ${result.articleId}`);
```

### 2. Semantic Search

```typescript
import { semanticSearch } from "~/services/knowledge";

const results = await semanticSearch({
  query: "How do I return an item?",
  limit: 5,
  minSimilarity: 0.7,
  categories: ["returns"],
});

results.forEach((result) => {
  console.log(`${result.article.question} (${result.similarity.toFixed(2)})`);
});
```

### 3. Build RAG Context for AI Agents

```typescript
import { buildRAGContext, formatRAGContextForPrompt } from "~/services/knowledge";

// Build context
const context = await buildRAGContext(customerMessage, {
  maxContext: 3,
  minConfidence: 0.5,
  categories: ["orders", "shipping"],
});

// Format for AI prompt
const promptContext = formatRAGContextForPrompt(context);

// Use in AI agent prompt
const aiPrompt = `
You are a customer support agent. Use the following knowledge base context to help answer the customer's question.

${promptContext}

Customer Question: ${customerMessage}

Your Response:
`;
```

### 4. Update Articles

```typescript
import { updateArticle } from "~/services/knowledge";

await updateArticle(articleId, {
  content: "Updated answer with more details...",
  tags: ["tracking", "shipping", "order-status", "international"],
});
```

### 5. List Articles

```typescript
import { listArticles } from "~/services/knowledge";

const articles = await listArticles({
  category: "orders",
  tags: ["tracking"],
  limit: 10,
});
```

---

## Categories

The system supports the following categories:

- **orders** — Order status, tracking, modifications, cancellations
- **shipping** — Shipping methods, ETAs, delays, international
- **returns** — Return policy, RMA process, refunds, exchanges
- **products** — Product details, specifications, compatibility
- **technical** — Website issues, account problems, checkout errors
- **policies** — Privacy, terms, warranties, guarantees

---

## Quality Metrics

Each KB article tracks quality metrics:

- **confidenceScore** (0-1) — Overall confidence in the article
- **usageCount** — Number of times the article has been used
- **successCount** — Number of successful uses (high grades)
- **avgToneGrade** (1-5) — Average tone quality from HITL feedback
- **avgAccuracyGrade** (1-5) — Average accuracy from HITL feedback
- **avgPolicyGrade** (1-5) — Average policy compliance from HITL feedback

---

## Health Checks

### System Health

```typescript
import { checkKnowledgeBaseHealth } from "~/services/knowledge";

const health = await checkKnowledgeBaseHealth();

console.log(`Healthy: ${health.healthy}`);
console.log(`Embedding: ${health.components.embedding}`);
console.log(`Database: ${health.components.database}`);
console.log(`Search: ${health.components.search}`);
```

### Statistics

```typescript
import { getKnowledgeBaseStats } from "~/services/knowledge";

const stats = await getKnowledgeBaseStats();

console.log(`Total Articles: ${stats.totalArticles}`);
console.log(`Recent Articles: ${stats.recentArticles}`);
console.log(`By Category:`, stats.articlesByCategory);
```

---

## Admin Interface

Access the knowledge base admin interface at:

**Route:** `/knowledge-base`

Features:
- View system health status
- Browse all KB articles
- Search and filter articles
- View statistics and metrics
- Add new articles (coming soon)

---

## Integration with AI Agents

### AI-Customer Agent

The AI-Customer agent uses the knowledge base to improve response quality:

```typescript
import { buildRAGContext } from "~/services/knowledge";

// In AI-Customer agent
const context = await buildRAGContext(customerMessage, {
  maxContext: 3,
  categories: detectCategory(customerMessage),
});

// Include context in prompt
const prompt = buildPromptWithContext(customerMessage, context);
```

### Learning from HITL Approvals

When a human approves/edits an AI draft, the system learns:

1. Captures the edit (ai_draft vs human_final)
2. Records grades (tone/accuracy/policy)
3. Updates KB article confidence scores
4. Creates new articles for new patterns

---

## Best Practices

### 1. Document Ingestion

- Use clear, concise questions as titles
- Provide comprehensive answers
- Tag articles with relevant keywords
- Categorize accurately
- Include source attribution

### 2. Search Optimization

- Use semantic search for natural language queries
- Set appropriate similarity thresholds (0.7 is a good default)
- Filter by category when known
- Combine multiple search strategies if needed

### 3. RAG Context

- Limit context to 3-5 articles to avoid overwhelming the AI
- Use higher confidence thresholds for critical responses
- Validate context quality before using
- Format context clearly for AI consumption

### 4. Quality Management

- Monitor confidence scores regularly
- Review low-confidence articles
- Update articles based on HITL feedback
- Archive outdated articles

---

## Troubleshooting

### Embedding Service Errors

**Issue:** `Failed to generate embedding`

**Solutions:**
- Check `OPENAI_API_KEY` environment variable
- Verify OpenAI API quota
- Check network connectivity
- Review text length (max 8191 tokens)

### Search Returns No Results

**Issue:** Semantic search returns empty results

**Solutions:**
- Lower `minSimilarity` threshold
- Check if articles have embeddings
- Verify pgvector extension is installed
- Try full-text search as fallback

### Database Connection Errors

**Issue:** `Database connection failed`

**Solutions:**
- Check Prisma connection string
- Verify database is running
- Check network/firewall settings
- Review database logs

---

## Future Enhancements

### Phase 2: Learning Pipeline

- Implement learning from HITL approvals
- Auto-update confidence scores
- Create new articles from patterns
- Track recurring issues

### Phase 3: Advanced Features

- Multi-language support
- Article versioning and history
- Automated quality scoring
- Recommendation engine
- Analytics dashboard

---

## API Reference

See inline documentation in service modules:

- `app/services/knowledge/types.ts` — Type definitions
- `app/services/knowledge/embedding.ts` — Embedding functions
- `app/services/knowledge/ingestion.ts` — Ingestion functions
- `app/services/knowledge/search.ts` — Search functions
- `app/services/knowledge/rag.ts` — RAG functions
- `app/services/knowledge/index.ts` — Main exports

---

## Support

For issues or questions:

1. Check this documentation
2. Review service module inline docs
3. Check system health status
4. Review logs for error details
5. Contact ai-knowledge agent

---

**Last Updated:** 2025-10-23  
**Version:** 1.0  
**Status:** Production Ready

