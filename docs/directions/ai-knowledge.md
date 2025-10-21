# AI-Knowledge Direction v6.0

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T22:00Z  
**Version**: 6.0  
**Status**: ACTIVE — KB Optimization + CEO Integration

---

## ✅ DAY 1 COMPLETE + DAY 2 IN PROGRESS
- ✅ LlamaIndex setup, query engine functional, 6 docs indexed
- ⏸️ Day 2 optimization ongoing

---

## ACTIVE TASKS (10h total)

### AI-KNOWLEDGE-010: Complete Query Engine Optimization (2h) - START NOW
Finish Day 2 optimization
- Chunk size testing (256, 512, 1024 tokens)
- Similarity threshold tuning (0.5-0.8)
- Implement reranking
- Apply optimal configuration
**MCP**: LlamaIndex reranking, similarity tuning

### AI-KNOWLEDGE-011: Expand Knowledge Base (3h)
Add 50+ documents
- Product docs, policies, procedures, FAQs
- Process and chunk (512 tokens, 10% overlap)
- Generate embeddings, store in Supabase
**MCP**: LlamaIndex document ingestion, Supabase pgvector

### AI-KNOWLEDGE-012: CEO Agent Query Function (1h)
Export query function for CEO Agent
- Support doc_type filters
- Return answer + sources + confidence
- Track query performance

### AI-KNOWLEDGE-013: KB Management API (2h)
API to manage knowledge base
- Add, update, delete documents
- Automatic processing and indexing
- Admin-only access
**MCP**: LlamaIndex ingestion, React Router 7 file uploads

### AI-KNOWLEDGE-014: KB Quality Metrics (1h)
Measure KB quality
- Coverage, accuracy, retrieval speed
- KB health score (0-100)

### AI-KNOWLEDGE-015: KB Maintenance (2h)
Maintenance procedures
- Document versioning, deduplication
- Refresh embeddings

### AI-KNOWLEDGE-016: Documentation (included)

**START NOW**: Pull LlamaIndex + Supabase docs, complete query optimization
