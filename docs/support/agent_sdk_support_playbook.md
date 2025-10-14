---
epoch: 2025.10.E1
doc: docs/support/agent_sdk_support_playbook.md
owner: support
status: draft
last_updated: 2025-10-14T00:00:00Z
---

# Agent SDK — Support Playbook (Draft)

## Purpose
Provide step-by-step guidance for diagnosing and escalating Agent SDK issues observed by operators.

## Quick Triage
1. Check health: `curl -sS https://hotdash-agent-service.fly.dev/health`
2. Confirm MCP dependency: `curl -sS https://hotdash-llamaindex-mcp.fly.dev/health`
3. Review operator report: Which tile/action failed? Include timestamps.

## Common Symptoms → Actions
- Approval action hangs
  - Capture request ID from UI (if shown)
  - Reproduce once; collect timestamp and operator email
  - Check service health and Fly status (attach outputs)
- Data mismatch in tile context
  - Cross-check against source system (Shopify/Chatwoot)
  - Note record IDs and expected vs actual values
  - File ticket with evidence bundle

## Escalation Matrix
- Severity P0 (widespread outage): Notify Reliability + Engineer immediately; attach health checks and timestamps
- Severity P1 (major feature impaired): Create high-priority ticket; loop in Engineer; attach reproduction steps
- Severity P2 (intermittent/minor): Queue for next triage cycle; include logs and screenshots

## Known Limitations (Keep Updated)
- Some demo paths return mock data pending integration
- Long-running operations may defer until next refresh cycle

## Ticket Template
- Title: [Agent SDK] <symptom> — <tile/feature>
- Body:
  - When: <UTC timestamp>
  - Where: <tile/route>
  - Who: <operator email>
  - What happened: <symptom>
  - Expected: <expected behavior>
  - Evidence: <screenshots, request IDs, health outputs>

---
Status: Draft content. Ready for triage workflows.


