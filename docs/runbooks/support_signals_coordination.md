# Support Signals Coordination (AI-Customer / Knowledge)

Effective: 2025-10-17
Owner: Support Agent

## Objective
Ensure grading + learning signals from AI-Customer replies flow into Supabase for analytics and weekly reporting.

## Required Signals (per HITL policy)
- Grades (1-5): tone, accuracy, policy
- Human edits: diff distance between draft and approved
- Approval latency: created_at → approved_at
- Outcome: public reply sent, escalation, follow-up

## Sources
- Chatwoot: approved Private Note → public reply event
- AI-Customer agent: draft content, evidence, rollback, validation result
- Approvals drawer: human grades + edits

## Storage (Supabase)
- Tables (proposed):
  - approvals (id, agent_id, evidence_ref, created_at)
  - grades (approval_id, tone, accuracy, policy, graded_by, graded_at)
  - edits (approval_id, draft_text, final_text, edit_distance, captured_at)
- RLS: service-only write, user read for analytics roles

## Integration Points
- Server tool for Chatwoot public reply must write audit row on send
- Approvals drawer must POST grades + final text to Supabase
- AI-Customer must attach evidence refs for traceability

## Verification Plan
- Unit: mock approvals POST → rows created (grades, edits)
- Integration: simulate draft → grade → send → rows linked by approval_id
- Contract: daily rollup includes SLA (latency), quality (avg grades), learning (edit distance)

## Next Steps
- Align schemas with Data team
- Add tests in agents/ and app/services/ (separate tasks)
- Start with read-only dashboards before automation

