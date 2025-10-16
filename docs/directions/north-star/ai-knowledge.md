# North Star Task Plan — AI-Knowledge Agent

## A. Schema & Data Foundations
- [ ] Apply `kb_` Supabase migrations to staging, verify tables, indexes, RLS, and rollback scripts.
- [ ] Seed knowledge base articles, topics, links, and usage logs with fixture data.
- [ ] Write documentation for schema (ERD, column definitions, access patterns).
- [ ] Implement archival policy for stale content and housekeeping jobs.

## B. Search & Retrieval Services
- [ ] Stabilize semantic/hybrid/contextual search modules with Supabase query chains.
- [ ] Provide configurable thresholds (confidence, relevance) and expose via config.
- [ ] Implement keyword fallback and combined ranking strategy with tests.
- [ ] Support pagination, category filters, and conversation history context.
- [ ] Add Prometheus metrics for search latency, hit rate, confidence distribution.

## C. Learning & Automation
- [ ] Finalize learning extraction pipeline: ingest edits, classify learning type, update usage stats.
- [ ] Build automation for KB updates (auto-create article drafts, flag low-performing content).
- [ ] Generate insight reports (top issues, emerging topics) feeding Product roadmap.
- [ ] Track article confidence adjustments and produce quality dashboards.

## D. Index Management & RAG Integration
- [ ] Rehydrate vector index from trusted artifacts and store under `packages/memory/indexes`.
- [ ] Update `scripts/rag/build-index.ts` workflow (OpenAI vs MCP fallback) and documentation.
- [ ] Schedule regular rebuilds with logging, CI dry runs, and fallback instructions.
- [ ] Coordinate with llamaindex MCP server to ensure query/refresh tools succeed.

## E. API & Tool Consumers
- [ ] Publish KB API contracts for AI-Customer (search, usage tracking, related articles).
- [ ] Offer endpoints for Support dashboard (recent KB hits, quality metrics).
- [ ] Surface KB quality tile data for dashboard (article counts, confidence trends).
- [ ] Provide CLI utilities for admins (reindex, export, quality reports).

## F. Testing & Ops
- [ ] Fix unit tests (`knowledge/search.spec.ts`) with proper Supabase mocks.
- [ ] Add integration tests covering Supabase interactions and index rebuild.
- [ ] Create evaluation datasets (relevancy JSONL) and tooling to score search quality.
- [ ] Produce runbooks for outage handling, KB data recovery, and privacy review.
