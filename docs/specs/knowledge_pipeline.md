# Knowledge Pipeline — 2025-10-18

## Current State

- `npm run ai:build-index` rebuilds the operator knowledge index to `packages/memory/indexes/operator_knowledge/`, emitting metadata that captures generator/embedding models, document count (currently 10), and the last build timestamp (`2025-10-19T00:12:39.797Z`).
- `npm run ai:eval` executes the lightweight eval harness (`scripts/ai/llama-workflow`), producing metrics stored under `packages/memory/logs/build/eval/`. Results remain placeholder-level (BLEU 0.072 / ROUGE-L 0.107 / citation score 0) because the dataset still uses mock answers.
- Contract ingestion path is served by `app/services/knowledge/ingestion.stub.ts`, which reports zeroed metrics plus the outstanding assumptions until credential approvals land.
- Secret scan (`npm run scan`) passes; fmt completes cleanly; repo-wide lint/test debt remains outside the knowledge slice (see blockers).
- `scripts/ai/validate-knowledge-sources.ts` checks the configured source paths (`DEFAULT_SOURCES` from `build-llama-index.ts`) and exits non-zero if any are missing, providing a JSON report for approvals.

## Gaps & Blockers

- Missing content sources: `docs/enablement/job_aids`, `docs/marketing/launch_faq.md`, `docs/marketing/launch_comms_packet.md`. Index build skips these files, reducing coverage.
- Embedding provider credentials still pending; ingestion must stay in stub mode until approvals conclude.
- Repository lint/test failures unrelated to the knowledge path (ads, analytics, social APIs) prevent a clean CI run—tracked for follow-up by owning teams.

## Next Actions

1. Coordinate with Content Ops to supply/retarget the missing source documents before the next index build.
2. Replace placeholder eval cases with approved Q/A pairs so BLEU/ROUGE/citation metrics reflect real coverage.
3. Swap the stub ingestion path for production ingestion once embeddings credentials and data-privacy checks are approved.

## Evidence & Logs

- Index metadata: `packages/memory/indexes/operator_knowledge/index_metadata.json`
- Eval report: `packages/memory/logs/build/eval/2025-10-19T0013/report.json`
- Feedback log: `feedback/ai-knowledge/2025-10-18.md`
