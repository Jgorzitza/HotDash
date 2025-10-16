# Issue Seed — AI-Customer — SDK + HITL Validation (Start 2025-10-16)

Agent: ai-customer

Definition of Done:
- agents.json has human_review: true + reviewers; AI config check passes
- Implement sdk/index.ts + customer agent scaffold; outputs are draft-only
- Config validation script + unit tests for required fields
- Integration tests: HITL block on send; draft output schema; grading capture
- PII scrubbing utilities and error taxonomy added
- Evidence bundle: test logs, Approvals Drawer screenshots consuming drafts

Acceptance Checks:
- Any “send public” attempt is blocked without approval (tests verify)
- agents.json validation errors clearly reported; CI signal is green
- Draft schema matches /validate expectations; metadata carries grading fields

Allowed paths: app/agents/**, app/components/grading/**, tests/agents/**, docs/specs/**

Evidence:
- Test logs, screenshots of drafts and Approvals drawer preview

Rollback Plan:
- Revert agent scaffolds; keep feature flags disabling any public send

