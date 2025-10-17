---
epoch: 2025.10.E1
doc: docs/runbooks/llamaindex_workflow.md
owner: ai
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# LlamaIndex Workflow — Pipeline & Operations

## Overview and Goals

This runbook documents the LlamaIndex-based AI workflow for HotDash, implementing automated knowledge ingestion, indexing, and query capabilities. The system ingests content from approved sources, builds searchable vector indexes, and provides MCP tools for other agents to query support knowledge.

**Primary Goals:**

- Automated nightly ingestion of web content, decision logs, and curated support replies
- Vector search capabilities over all knowledge sources
- MCP-compliant tools for agent integration
- Evaluation and quality monitoring with BLEU/ROUGE metrics
- Rollback and recovery procedures for operational stability

## Approved Ingestion Sources

The workflow ingests from three approved sources:

1. **Web Content (hotrodan.com)**
   - Primary: Sitemap-based crawling of https://hotrodan.com/sitemap.xml
   - Fallback: Manual seed page crawling (home, blog, pricing, docs)
   - Output: `packages/memory/logs/build/ingestion/web/YYYYMMDD-HHMM/`

2. **Supabase Decision Log & Telemetry**
   - Tables: `decision_log`, `telemetry_events`
   - Read-only access with RLS protection
   - Output: `packages/memory/logs/build/ingestion/supabase/YYYYMMDD-HHMM/`

3. **Chatwoot Curated Replies**
   - Table: `support_curated_replies` (maintained by Support team)
   - Fields: id, question, answer, tags, updated_at
   - Output: `packages/memory/logs/build/ingestion/curated/YYYYMMDD-HHMM/`

## Secrets and Configuration

**Environment File:** `.env.local` (repo root, not committed)

Required environment variables:

```bash
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJ...
# OR for enhanced security:
SUPABASE_READONLY_KEY=eyJ...
CHATWOOT_SPACE=hotrodan
LOG_DIR=packages/memory/logs/build
```

**Configuration Management:**

- Config loader: `scripts/ai/llama-workflow/src/config.ts`
- Zod validation for all environment variables
- Defaults: LOG_DIR → `packages/memory/logs/build`

## Nightly Cadence and Scheduling

**Preferred: GitHub Actions**

- Workflow: `.github/workflows/ai_nightly.yml`
- Schedule: 02:30 UTC daily (`cron: "30 2 * * *"`)
- Manual trigger: `workflow_dispatch`

**Fallback: Local Cron**

```bash
# crontab entry
45 2 * * * cd /home/justin/HotDash/hot-dash && /usr/bin/env -S bash -lc 'source ~/.profile; corepack enable; npm run ai:refresh && npm run ai:eval' >> packages/memory/logs/build/cron.log 2>&1
```

**Execution Flow:**

1. `npm run ai:refresh` - Build index from all sources
2. `npm run ai:eval` - Run evaluation against golden dataset
3. Upload logs as build artifacts

## Build and Storage Locations

**Directory Structure:**

```
packages/memory/logs/build/
├── ingestion/
│   ├── web/YYYYMMDD-HHMM/
│   ├── supabase/YYYYMMDD-HHMM/
│   └── curated/YYYYMMDD-HHMM/
├── indexes/
│   ├── YYYYMMDD-HHMM/          # Timestamped builds
│   ├── latest -> YYYYMMDD-HHMM/ # Symlink to current
│   └── prev -> YYYYMMDD-HHMM/   # Symlink to previous (rollback)
├── eval/
│   └── YYYYMMDD-HHMM/
└── logs/
    ├── last_refresh.log
    └── last_eval.log
```

**Storage Details:**

- Vector store: Local persistent JSON-based SimpleVectorStore
- Chunking: 1024 tokens with 128 overlap
- Metadata: Source attribution, timestamps, table origins
- Manifest: `manifest.json` with counts, timing, source tallies per run

## Logging and Observability

**Log Outputs:**

- All stdout captured via `tee` to `last_refresh.log` and `last_eval.log`
- Per-run directories contain `errors.log` for failures
- Manifest files track ingestion counts and processing times
- Sample outputs written for validation

**Monitoring Points:**

- Document counts by source type
- Index build duration
- Evaluation metrics (BLEU, ROUGE-L, citation accuracy)
- Error rates and failure modes

## Rollback and Recovery

**Rollback Procedure:**

```bash
# 1. Switch to previous index
cd packages/memory/logs/build
ln -sfn indexes/prev indexes/latest

# 2. Verify rollback
npm run ai:eval

# 3. Check evaluation results
cat eval/latest/summary.md
```

**Recovery Checklist:**

- [ ] Previous index symlink exists and is valid
- [ ] Evaluation passes with acceptable metrics
- [ ] MCP tools respond correctly to test queries
- [ ] No critical errors in logs

**Prevention:**

- Always keep `prev` symlink before updating `latest`
- Automated evaluation must pass before deployment
- Manual verification for production-critical changes

## Validation and Evaluations

**Golden Dataset:** `scripts/ai/llama-workflow/eval/data.jsonl`

- Format: `{"q": "question", "ref": "reference_answer", "must_cite": ["source-id"]}`
- Test cases cover key integration points and support scenarios

**Metrics Computed:**

- BLEU score (n-gram overlap with reference answers)
- ROUGE-L (longest common subsequence)
- Citation sanity (required sources properly attributed)

**Quality Gates:**

- BLEU > 0.3 (acceptable overlap)
- ROUGE-L > 0.4 (structural similarity)
- Citation accuracy > 80% (source attribution)

**Evaluation Process:**

1. Load latest index
2. Execute test queries
3. Compute metrics against references
4. Generate report: `LOG_DIR/eval/YYYYMMDD-HHMM/report.json`
5. Create summary: `LOG_DIR/eval/YYYYMMDD-HHMM/summary.md`

## MCP Tools and Usage

**Available Tools:** `docs/mcp/tools/llamaindex.json`

1. **refresh_index**
   - **Purpose:** Rebuild knowledge index from approved sources
   - **Input:** `{"sources": "all|web|supabase|curated", "full": true}`
   - **CLI Mapping:** `scripts/ai/llama-workflow/dist/cli.js refresh --sources=all --full`

2. **query_support**
   - **Purpose:** Query knowledge base with citations
   - **Input:** `{"q": "How do I integrate HotDash?", "topK": 5}`
   - **CLI Mapping:** `scripts/ai/llama-workflow/dist/cli.js query -q "..." --topK 5`
   - **Constraints:** topK ≤ 20

3. **insight_report**
   - **Purpose:** Generate insights from telemetry and curated data
   - **Input:** `{"window": "7d", "format": "md"}`
   - **CLI Mapping:** `scripts/ai/llama-workflow/dist/cli.js insight --window 7d --format md`
   - **Constraints:** window ≤ 30d, format in [md, txt, json]

**Integration Notes:**

- All tools return JSON responses with structured data
- Citations include source metadata for verification
- Error handling includes retry logic and fallback responses
- Rate limiting respects OpenAI API constraints

## Safety and Compliance

**Security Measures:**

- Read-only Supabase keys with RLS protection
- PII sanitization for emails, phone numbers, tokens
- No direct production writes (read-only operations)
- Robots.txt compliance for web crawling

**Data Protection:**

- Telemetry data sanitized before indexing
- Support replies reviewed by curation process
- No sensitive credentials in logs or outputs
- GDPR compliance through data minimization

**Rate Limiting:**

- Web requests throttled to respect site policies
- OpenAI API calls managed within usage tiers
- Supabase queries use connection pooling
- Graceful degradation on API failures

---

## Command Reference

```bash
# Build and test workflow
cd scripts/ai/llama-workflow
npm run build
npm run ingest:test

# Manual operations
npm run ai:refresh    # Full index rebuild
npm run ai:eval       # Run evaluation suite
npm run dev           # Development mode

# Individual CLI commands
node dist/cli.js refresh --sources=all --full
node dist/cli.js query -q "integration help" --topK 10
node dist/cli.js insight --window 1d --format json
```

## Troubleshooting

**Common Issues:**

- **Index build failures:** Check `.env.local` credentials and network access
- **Low evaluation scores:** Review golden dataset and update test cases
- **MCP tool errors:** Verify CLI paths and argument formats
- **Storage issues:** Check disk space and directory permissions

**Debug Commands:**

```bash
# Check latest logs
tail -f packages/memory/logs/build/last_refresh.log

# Validate configuration
node -e "require('./scripts/ai/llama-workflow/dist/config.js').validateConfig()"

# Test individual loaders
npm --prefix scripts/ai/llama-workflow run ingest:test
```
