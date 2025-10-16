# Issue Seed — Content — Approvals Integration (Start 2025-10-16)

Agent: content

Definition of Done:
- Expose drafter API to approvals queue with evidence fields
- Provide recommendations feed endpoint and sample payloads
- Wire hashtag analyzer outputs to dashboard tile contract
- Feature flag guard for OpenAI integrations; fixtures in dev
- Store drafts in Supabase with audit fields; add unit tests
- Evidence bundle: sample drafts, approvals screenshots, telemetry

Acceptance Checks:
- Approvals queue receives drafts with evidence fields; UI renders samples
- Feature flag prevents external calls in dev; fixtures thoroughly cover flows
- Supabase storage schema matches docs; unit tests pass

Allowed paths: app/services/content/**, app/routes/api/content/**, tests/**, docs/specs/**

Evidence:
- API examples, screenshots, telemetry logs

Rollback Plan:
- Revert new endpoints; keep feature flags off; remove staged draft data

