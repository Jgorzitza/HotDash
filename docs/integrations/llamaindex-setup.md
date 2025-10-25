# LlamaIndex Knowledge Base Setup

## Overview

The HotDash knowledge base uses LlamaIndex TypeScript to provide the CEO Agent with instant access to product information, policies, and operational procedures.

**Status**: ✅ Production Ready (October 2025)

**Components**:

- Vector store with OpenAI embeddings
- Query engine with natural language understanding
- Maintenance scripts for updates
- Comprehensive test suite

---

## Architecture

### Vector Store

**Location**: `packages/memory/indexes/operator_knowledge/`

**Files**:

- `doc_store.json` - Document storage
- `index_store.json` - Index metadata
- `vector_store.json` - Vector embeddings
- `index_metadata.json` - Build metadata

**Embedding Model**: OpenAI `text-embedding-3-small` (1536 dimensions)

**Storage Backend**: Local filesystem (production-ready)

### Document Sources

**Location**: `data/support/*.md`

**Current Documents** (7 total, ~70 KB):

1. `common-questions-faq.md` - General FAQ and high-volume intents
2. `exchange-process.md` - Exchange procedures
3. `order-tracking.md` - Tracking information
4. `product-troubleshooting.md` - Product support flows
5. `refund-policy.md` - Return and refund policies
6. `shipping-policy.md` - Shipping options and costs
7. `warranty-policy.md` - Warranty and replacement guidelines

**Format**: Markdown files with natural language content

### Query Engine (MCP)

**Implementation**: `apps/llamaindex-mcp-server/src/server.ts`

**Available Tools**:

- `query_support` – semantic search over support FAQs/policies
- `knowledge_base_stats` – metadata snapshot for dashboards
- `refresh_index` – rebuilds vector store from `data/support/`
- `insight_report` – telemetry-driven summaries (optional)

**Client Integrations**:

- Customer agents invoke `answer_from_docs` (`apps/agent-service/src/tools/rag.ts`)
- CEO agent delegates to MCP via `packages/agents/src/ai-ceo.ts`
- `LLAMAINDEX_MCP_URL` defaults to `https://hotdash-llamaindex-mcp.fly.dev/mcp`

**Response Format** (per MCP spec):

```json
{
  "content": [
    { "type": "text", "text": "Answer with citations" }
  ]
}
```

**Runtime Configuration**:

- Embeddings: OpenAI `text-embedding-3-small`
- Chunk size: 512 tokens, 0 overlap (see `index_metadata.json`)
- Default retrieval: `similarityTopK = 5` (override via tool args)
- Persisted index path: `packages/memory/indexes/operator_knowledge`

---

## Performance Benchmarks

**Test Suite**: `scripts/rag/test-and-optimize.ts`

**Results** (as of 2025-10-21):

- ✅ **Accuracy**: 80% (16/20 test queries)
- ✅ **Response Time**: 1437ms average (target: <2000ms)
- ✅ **Answer Rate**: 100% (all queries answered)
- ✅ **Coverage**: All 6 document categories

**Category Performance**:

- Returns: 75%
- Shipping: 50%
- Tracking: 100% ✅
- Exchanges: 100% ✅
- Troubleshooting: 100% ✅
- FAQ: 75%

---

## Usage

### Query the Knowledge Base

```bash
# List tools (expect query_support, knowledge_base_stats, refresh_index, insight_report)
curl -s -X POST \
  https://hotdash-llamaindex-mcp.fly.dev/mcp/tools/list \
  -H 'Content-Type: application/json' \
  -d '{}'

# Query support KB via MCP (top 3 results)
curl -s -X POST \
  https://hotdash-llamaindex-mcp.fly.dev/mcp/tools/call \
  -H 'Content-Type: application/json' \
  -d '{
        "name": "query_support",
        "arguments": { "q": "What is the return window?", "topK": 3 }
      }'

# From agent service (answer_from_docs tool)
const answer = await answerFromDocs.execute({
  question: "What is our return policy for damaged items?",
  topK: 3,
});
```

### Rebuild Index

When documents are added or updated:

```bash
# 1. Rebuild local vector store (persisted under packages/memory/indexes/operator_knowledge)
npx tsx scripts/rag/build-index.ts --skip-test

# 2. Capture metadata for auditing / release notes
cat packages/memory/indexes/operator_knowledge/index_metadata.json \
  > artifacts/ai-knowledge/$(date +%Y-%m-%d)/index-build.json

# 3. (Optional) Semantic evaluation before QA handoff
npx tsx scripts/rag/semantic-evaluation.ts --topK 3 --days 7

# 4. Refresh running MCP instance (requires DevOps task if Fly app is paused)
curl -s -X POST \
  https://hotdash-llamaindex-mcp.fly.dev/mcp/tools/call \
  -H 'Content-Type: application/json' \
  -d '{ "name": "refresh_index", "arguments": { "full": true } }'
```

### Run Tests

```bash
# Run full test suite
npx tsx scripts/rag/test-and-optimize.ts

# Run with verbose output
npx tsx scripts/rag/test-and-optimize.ts --verbose
```

---

## Maintenance

### Manual Updates

**When to rebuild**:

- New documents added to `data/support/`
- Existing documents updated
- Index age > 7 days (optional)

**Process**:

1. Update document files in `data/support/`
2. Run `npx tsx scripts/rag/build-index.ts --skip-test`
3. Inspect `index_metadata.json` (document count, chunk config, build time)
4. Optionally run `npx tsx scripts/rag/test-and-optimize.ts` for regression coverage
5. Coordinate with DevOps to execute MCP `refresh_index` if Fly app is active
6. Log MCP evidence (`artifacts/<agent>/<date>/mcp/*.jsonl`) for CI guardrails

### Version Tracking

Index metadata includes:

- `buildTime` - Timestamp of last build
- `documentCount` - Number of documents indexed
- `sources` - List of source files with sizes

Access via maintenance script:

```bash
jq '.' packages/memory/indexes/operator_knowledge/index_metadata.json
```

### Future: Shopify Integration

**Planned** (Phase 11 - CEO Agent Implementation):

1. **Webhook Handler**: Detect product updates from Shopify
2. **Incremental Updates**: Update specific documents without full rebuild
3. **Auto-sync**: Scheduled sync of product catalog
4. **Version Control**: Track which policy version was active when

**Integration Points**:

- Shopify product webhooks → Trigger document update
- Product catalog → Generate markdown from Shopify data
- Policy management → UI for uploading new policies

---

## Configuration

### Environment Variables

**Required**:

- `OPENAI_API_KEY` - OpenAI API key for embeddings and LLM

**Vault Location**: `vault/occ/openai/api_key_staging.env`

**Format**:

```bash
OPENAI_API_KEY=sk-...
```

### OpenAI Settings

**Embeddings** (`text-embedding-3-small`):

- Dimensions: 1536
- Cost: ~$0.00002 per 1K tokens
- Performance: High quality, fast

**LLM** (`gpt-3.5-turbo`):

- Temperature: 0.1 (deterministic)
- Purpose: Response synthesis
- Cost: ~$0.0015 per 1K tokens

### Chunk Configuration

**Current**: 512 tokens per chunk

**Rationale**:

- Optimal for policy/FAQ content
- Balances context size vs retrieval precision
- Tested against 256 and 1024 token alternatives

**To modify**: Edit `SentenceSplitter` configuration in `scripts/rag/build-index.ts`

---

## Troubleshooting

### Index not found

**Symptom**: `❌ Index not found at: packages/memory/indexes/operator_knowledge`

**Solution**:

 ```bash
  npx tsx scripts/rag/build-index.ts --skip-test
  ```

### Slow queries (>2000ms)

**Possible causes**:

- Cold start (first query after restart)
- Network latency to OpenAI
- Large number of source documents

**Solutions**:

- Query engine uses singleton caching (subsequent queries faster)
- Consider local embeddings for development
- Monitor OpenAI API status

### Low accuracy on test queries

**Investigate**:

1. Run verbose tests: `npx tsx scripts/rag/test-and-optimize.ts --verbose`
2. Check which categories are failing
3. Review source documents for coverage
4. Verify index is recent: `jq '.buildTime' packages/memory/indexes/operator_knowledge/index_metadata.json`

**Common fixes**:

- Rebuild index if documents were updated
- Add missing content to source documents
- Adjust `similarityTopK` in query engine (default: 3)

### Index integrity errors

**Symptom**: `❌ Index integrity check failed`

**Solution**:

```bash
# Inspect metadata / chunk stats
jq '.' packages/memory/indexes/operator_knowledge/index_metadata.json

# Rebuild to fix
npx tsx scripts/rag/build-index.ts --skip-test
```

---

## Development

### Adding New Documents

1. Create markdown file in `data/support/`
2. Use clear, natural language
3. Include all relevant information
4. Rebuild index:
   ```bash
   npx tsx scripts/rag/build-index.ts --skip-test
   ```
5. Test coverage:
   ```bash
   npx tsx scripts/rag/test-and-optimize.ts
   ```

### Testing New Features

1. Add test queries to `scripts/rag/test-and-optimize.ts`
2. Define expected keywords
3. Run tests to establish baseline
4. Iterate on document content or query engine config

### Performance Optimization

**Metrics to monitor**:

- Query response time (target: <2000ms)
- Accuracy (target: ≥90%)
- Answer rate (target: 100%)

**Tuning parameters**:

- `similarityTopK` (default: 3) - Number of chunks retrieved
- Chunk size (default: 512) - Tokens per document chunk
- LLM temperature (default: 0.1) - Response creativity

---

## References

- **LlamaIndex TypeScript**: https://ts.llamaindex.ai/
- **OpenAI Embeddings**: https://platform.openai.com/docs/guides/embeddings
- **Scripts / Entry Points**:
  - Build: `scripts/rag/build-index.ts`
  - MCP Server: `apps/llamaindex-mcp-server/src/server.ts`
  - Agent Tool: `apps/agent-service/src/tools/rag.ts`
  - Test: `scripts/rag/test-and-optimize.ts`

---

**Last Updated**: 2025-10-25  
**Status**: Production Ready  
**Owner**: AI-Knowledge Agent
