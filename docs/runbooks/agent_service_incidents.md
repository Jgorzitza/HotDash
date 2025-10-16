# Agent Service Incident Runbook

Purpose: Steps to triage and resolve incidents affecting agent-service, MCP tools, or approvals.

## Detection
- Alerts: CI failures, MCP health checks, /validate errors, elevated 5xx
- Signals: Approval latency spikes, tool timeout rates, webhook errors

## Immediate Actions (15 minutes)
1) Freeze risky actions
   - Disable Apply in Approvals Drawer
   - Announce in #ops: incident start, scope
2) Verify HITL safety
   - Confirm ai-customer and ai-ceo have human_review: true
   - Spot check approvals.state integrity
3) Gather receipts
   - Fetch last 100 logs from agent-service, MCP servers
   - Capture example payloads (redacted)

## Diagnosis
- Approvals flow
  - Can create approval? Can poll state? Reviewer updates reflected?
- MCP tools
  - LlamaIndex /query health; timeouts; error payloads
- External deps
  - Supabase availability; RLS changes; key rotation

## Remediation
- Quick fixes
  - Roll back last deployment
  - Restart agent-service / MCP containers
  - Rotate Supabase keys; update environment; redeploy
- Structural
  - Add timeouts/circuit breakers
  - Add retries with jitter; backoff caps

## Validation
- Run integration tests: Chatwoot webhook → approval → approved reply (staging)
- Confirm /validate passes and Approve enabled with evidence+rollback

## Communication
- Post incident summary in #ops with receipts and impact window
- Open GitHub Issue with:
  - Evidence (logs, queries, diffs)
  - Root cause hypothesis
  - Rollback performed
  - Follow-ups

## Follow-ups
- Add tests covering regression
- Update dashboards (latency, error rate)
- Document lessons learned

