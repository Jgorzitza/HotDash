# Direction Archive — ai-customer — 2025-10-16

Source: docs/directions/ai-customer.md (archived daily objective)

## 4) Today's Objective (2025-10-16) — BLOCKER‑FIRST RESET

Status: ACTIVE
Priority: P0 — Restore SDK scaffolding and enforce HITL

Work rule: Execute strictly in order. If blocked >10 minutes, log blocker in feedback/ai‑customer/<today>.md and move on.

Git Process (Manager‑Controlled)

- No git operations; Manager will create Issues/PRs with Allowed paths/DoD.

Ordered Task List (30)

1. Recreate app/agents/sdk/index.ts (HITL enforced)
2. Recreate app/agents/customer/index.ts (Chatwoot draft tool wiring)
3. Recreate app/agents/ceo/index.ts (scaffold)
4. Example: app/agents/examples/customer-support-example.ts
5. agents.json with human_review: true + reviewers
6. Config validation script for agents config
7. Wire grading interface outputs (app/components/grading/\*) to agent replies metadata
8. Integration test: agent creation + HITL block
9. Integration test: draft note output schema
10. Integration test: grading capture flow
11. RAG tool usage via AI‑Knowledge search/contextualSearch
12. PII scrubbing on logs/outputs
13. Policy filters (refund caps, no‑offer rules)
14. Error taxonomy for SDK actions
15. Telemetry on cost/latency and token usage
16. Feature flag toggles for risky tools
17. Red‑team tests alignment with tests/security
18. Fallback mocks when external APIs absent
19. Output schemas aligned with /validate expectations
20. Admin toggles to disable features
21. Language detection integration
22. Sentiment detection integration
23. Escalation to human on triggers
24. PII‑safe logs with trace IDs
25. Docs: README for usage + constraints
26. Coordinate with Engineer to surface drafts in ApprovalsDrawer
27. Coordinate with Data for approvals storage tables
28. Coordinate with Support for triage/SLA hooks
29. Update feedback with evidence + test logs
30. Verify integration E2E with QA dashboard flow

Current Focus: Tasks 1–6, then 7–10
Blockers: Missing integrations clients? Use mocks and proceed.
Critical: HITL enforced at all times; no public messages without approval.

### Artifact Source and Phase 2 — NORTH_STAR Delivery (22 tasks)

Note: Manager will restore agent scaffolds from docs/\_archive/2025-10-15-prebundle/app/agents. Agents must not use git. Validate locally and proceed.

Phase 2 Tasks:

1. Add policy gating library and playbooks
2. Add per-intent tool selection with safe defaults
3. Add memory slim context windows
4. Add structured output validation
5. Add reply style presets (tone dial)
6. Add message routing rules per channel
7. Add escalation templates and thresholds
8. Add cost/latency telemetry dashboards
9. Add prompt versioning system
10. Add safety filters for PII and risky actions
11. Add review rubric hints in UI metadata
12. Add continuous eval hooks with Supabase
13. Add red-team prompt library
14. Add multi-language response detection
15. Add timeouts and retries logic
16. Add sandbox tool adapters (no-op)
17. Add post-approval audit payload formatting
18. Add agent health endpoint for Integrations
19. Add deterministic test fixtures
20. Add PR checklist (HITL enforced + evidence)
21. Add E2E tests with dashboard approvals
22. Handoff and demo script for CX
