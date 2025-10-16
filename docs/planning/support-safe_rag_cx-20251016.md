# Issue Seed — Support — Safe RAG + CX Integration (Start 2025-10-16)

Agent: support

Definition of Done:
- Enforce build-index guards (no delete without valid config; dry-run and no‑write modes)
- Provide test queries fixtures and CLI flags; docs with examples
- kb-ingest parser tests and sample outputs; audit logs added
- Wire CX metrics integration points; export support metrics for dashboard
- Chatwoot webhook setup documented; handler tests added
- Evidence bundle: logs, sample outputs, screenshots

Acceptance Checks:
- Running build-index without valid embeddings config performs no destructive ops
- CLI flags produce expected dry-run stats and no-write behavior
- Webhook handler tests pass; docs reflect accurate setup

Allowed paths: scripts/rag/**, app/services/support/**, tests/**, docs/specs/**

Evidence:
- Logs, example outputs, screenshots of approvals drawer consuming KB search (later)

Rollback Plan:
- Revert script changes; leave guard defaults to safe (no‑op) mode

