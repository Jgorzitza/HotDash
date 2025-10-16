# Issue Seed — AI-Knowledge — Integration & Testing (Start 2025-10-16)

Agent: ai-knowledge

Definition of Done:
- Address manager review comments on KB APIs/scripts
- Test APIs: POST /api/kb/search, GET/PATCH /api/kb/articles/:id, GET /api/kb/graph/:id, GET /api/kb/metrics (attach curl)
- Expose tools to ai-customer: search/context/related/track-usage adapters
- Propose support ingestion UI contract and doc workflow
- Monitoring dashboards for latency, error rate, quality distribution; thresholds documented
- Evidence bundle: latency targets, error taxonomy, sample outputs

Acceptance Checks:
- API endpoints respond with documented schemas; curl samples included
- ai-customer tool adapters export correct types and metadata
- Monitoring shows basic charts with thresholds

Allowed paths: app/routes/api/kb/**, app/agents/tools/**, scripts/kb/**, docs/specs/**, tests/**

Evidence:
- Curl samples, test logs, screenshots of monitoring

Rollback Plan:
- Revert tool exposure; keep endpoints behind feature flags

