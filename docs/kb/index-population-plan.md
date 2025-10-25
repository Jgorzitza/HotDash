# Knowledge Base Production Index Plan — 2025-10-25

## Objectives

- Guarantee the LlamaIndex-backed knowledge base stays fresh, accurate, and queryable for all MCP clients (customer agents, CEO agent, QA).
- Define authoritative content sources, ingestion cadence, and operational ownership so production and staging indices remain aligned.
- Establish validation gates that catch regressions before QA or customer agents consume bad data.

## Current State (as of 2025-10-25)

- **Vector store**: `packages/memory/indexes/operator_knowledge/` (OpenAI `text-embedding-3-small`, 512 token chunks, 0 overlap).
- **Source corpus**: `data/support/*.md` (7 markdown files — FAQ, exchanges, tracking, troubleshooting, refund, shipping, warranty).
- **Automation**:
  - `scripts/rag/build-index.ts` performs a full rebuild with persistence.
  - File watcher + cron refresh (daily 02:00 UTC) already shipped (`knowledge-base-auto-refresh` service + GitHub Action).
  - MCP server `hotdash-llamaindex-mcp.fly.dev` exposes `query_support`, `knowledge_base_stats`, `refresh_index`, `insight_report`.
- **Quality tooling**: `scripts/dev-kb/quality-dashboard.ts`, `scripts/rag/test-and-optimize.ts`, `scripts/rag/semantic-evaluation.ts`.

## Source Inventory & Expansion Roadmap

| Tier | Source | Format | Owner | Notes |
| --- | --- | --- | --- | --- |
| P0 | `data/support/*.md` (policies, FAQ) | Markdown | AI-Knowledge | Already in index. Maintain via PR review + watcher.
| P0 | `docs/integrations/llamaindex-setup.md`, launch readiness docs | Markdown | AI-Knowledge | Provide operator SOP context; ingest after curation pass.
| P1 | Shopify product content (metafields, bundles) | API + generated MD | Product / Engineer | Requires Shopify Admin pulls + content approval. Stage via `docs/kb/product/` before ingest.
| P1 | Chatwoot runbooks / macros | Markdown / export | Support | Copy sanitized runbooks to `docs/support/` derivatives; ensure PII scrubbed.
| P2 | Growth Engine specs & telemetry insights | Markdown + JSON | Growth / Analytics | Input once telemetry dashboards stabilize; guard with approval metadata.

All new content must pass the **HITL approval loop** (manager or designated reviewer) before hitting `data/support/` or equivalent ingestion directories.

## Ingestion & Automation Flow

1. **Authoring**
   - Draft in `docs/kb/drafts/` (temporary) → review → promote to `data/support/` (production corpus) or new ingestion namespace.
   - Enforce linting (Markdown spellcheck) before merge.
2. **Persistence**
   - Primary command: `npx tsx scripts/rag/build-index.ts --skip-test` (runs in CI/CD and manual refreshes).
   - Store resulting metadata snapshot at `artifacts/ai-knowledge/<date>/index-build.json` for audit.
3. **Deployment**
   - DevOps runs MCP `refresh_index` via HTTPS post-deploy (or rely on watcher when server is online).
   - Ensure Fly app `hotdash-llamaindex-mcp` remains warm (`min_machines_running = 1` for production cutover).
4. **Backfill / Catch-up**
   - For large imports (e.g., Shopify product catalog), batch documents (≤100 per run) and monitor OpenAI costs (target <$5 per full rebuild).

## Cadence & Ownership

| Trigger | Action | SLA | Owner |
| --- | --- | --- | --- |
| Policy/support doc change merged | Auto rebuild via watcher; verify health | Same business day | AI-Knowledge |
| Daily scheduled (02:00 UTC) | GitHub Action fires rebuild + MCP refresh | Daily | DevOps (monitor) |
| Major launch (new product line) | Manual rebuild + expanded tests | Prior to launch freeze | AI-Knowledge + Product |
| Post-incident remediation | Rebuild + targeted regression tests | Within 2 hours of fix | AI-Knowledge |

Ownership matrix:
- **AI-Knowledge**: corpus curation, rebuild commands, artifacts, MCP evidence, regression scripts.
- **DevOps**: MCP server uptime, Fly scaling, setting `LLAMAINDEX_MCP_URL` secrets, responding to 5xx alerts.
- **QA**: query regression sign-off, MCP tool smoke tests post-rebuild.

## Validation & Monitoring

1. **Pre-publish checklist**
   - Run `npx tsx scripts/dev-kb/quality-dashboard.ts` → ensure health ≥ 95.
   - Execute `npx tsx scripts/rag/test-and-optimize.ts --verbose` for regression coverage (minimum accuracy 80 %).
   - Trigger `npx tsx scripts/rag/semantic-evaluation.ts --topK 3` for faithfulness checks; log findings in artifacts.
2. **Runtime monitoring**
   - Endpoint `https://hotdash-llamaindex-mcp.fly.dev/health` polled every 5 minutes (include pager if 5xx > 3 consecutive).
   - Export MCP metrics (`/metrics`) into Grafana (calls, latency, error rate).
   - Capture MCP evidence in `artifacts/<agent>/<date>/mcp/*.jsonl` for each rebuild + validation.
3. **QA sign-off**
   - QA agent runs scripted handoff tests (Triage → Order Support, etc.) verifying `query_support` citations.
   - If MCP offline, AI-Knowledge logs blocker referencing DevOps task (e.g., `DEVOPS-LLAMAINDEX-001`).

## Risk Mitigation & Dependencies

- **MCP downtime**: keep at least one Fly machine hot; add warm-up request in scheduler job to avoid cold-start timeouts.
- **PII leakage**: sanitize new docs via regex + reviewer checklist before ingest; integrate `pii_sanitization` unit tests.
- **Cost overruns**: track OpenAI spend per rebuild (target <$1 for baseline corpus); fallback to mock embeddings in emergency with disclaimer.
- **Schema drift**: maintain `docs/integrations/llamaindex-setup.md` as the canonical SOP; update this plan when chunking/embedding configs change.

## Immediate Next Steps

1. Formalize GitHub Action runbook (inputs, secrets) → document in `docs/kb/runbooks/ci-refresh.md` (future task).
2. Partner with Support to migrate approved macros into markdown corpus (requires PII scrub flow).
3. Define KPI dashboard (quality score over time, query latency) using existing `quality-dashboard` outputs.
4. Coordinate with DevOps to raise `min_machines_running` for MCP in production before public launch.

## References

- `scripts/rag/build-index.ts`, `scripts/rag/test-and-optimize.ts`, `scripts/dev-kb/quality-dashboard.ts`
- `docs/integrations/llamaindex-setup.md`, `docs/launch/knowledge-base-launch-readiness.md`
- MCP server source: `apps/llamaindex-mcp-server/src/server.ts`
