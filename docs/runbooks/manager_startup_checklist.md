---
epoch: 2025.10.E1
doc: docs/runbooks/manager_startup_checklist.md
owner: manager
created: 2025-10-14
expires: 2025-10-21
---
# Manager Startup Checklist

Run this checklist at the start of every manager session, especially after crashes or interruptions.

## 1. Canon & Rules Review
- [ ] Confirm understanding of manager responsibilities from `docs/directions/manager.md`
- [ ] Review agent workflow rules in `.cursor/rules/04-agent-workflow.mdc`
- [ ] Reference quick guide: `docs/AGENT_RULES_REFERENCE.md`
- [ ] Review MCP usage requirements (5+ tool calls/day minimum)

## 2. Post-Crash State Assessment
- [ ] Check all agent feedback files for last update timestamps
- [ ] Identify agents that completed shutdown vs crashed
- [ ] Review last direction updates for each agent
- [ ] Identify incomplete work and blockers
- [ ] Check for uncommitted changes or in-progress work

## 3. System Health Verification
- [ ] Verify production services status (Agent SDK, LlamaIndex MCP on Fly.io)
- [ ] Check build status (TypeScript, tests)
- [ ] Review git status and branch state
- [ ] Verify credential availability per `docs/ops/credential_index.md`

## 4. Agent Status Summary
- [ ] Create comprehensive agent status report in `feedback/manager.md`
- [ ] Document last known state for each agent
- [ ] Identify agents ready for new work
- [ ] Identify agents with incomplete tasks
- [ ] Flag any blockers requiring immediate attention

## 5. Direction File Review
- [ ] Review all direction files for currency
- [ ] Identify outdated assignments
- [ ] Check for conflicts between agent tasks
- [ ] Verify priority alignment across agents

## 6. MCP Tools Verification (MANDATORY)
- [ ] Execute at least 5 MCP tool calls during startup
- [ ] Verify GitHub MCP connectivity
- [ ] Verify Shopify MCP availability
- [ ] Verify Context7 MCP availability
- [ ] Test Supabase MCP if needed
- [ ] Test Fly MCP if needed

## 7. Evidence & Compliance Check
- [ ] Verify feedback files are under 5000 lines (archive if needed)
- [ ] Check for ad-hoc documents in feedback/ (archive to feedback/archive/)
- [ ] Verify agents logged evidence properly
- [ ] Check for self-assigned tasks in feedback (violation)

## 8. Manager Startup Log
- [ ] Log startup timestamp in `feedback/manager.md`
- [ ] Document crash assessment findings
- [ ] Create session startup report with:
  - Session start time
  - Last session end time (if known)
  - Agents operational
  - Agents blocked
  - Immediate priorities
  - Evidence of startup checks completed

## 9. Next Steps Planning
- [ ] Determine immediate priorities based on state
- [ ] Identify which agents need new direction
- [ ] Identify which agents can resume work
- [ ] Plan direction updates needed
- [ ] Set session goals

## 10. Launch Approval
- [ ] Confirm all checks complete
- [ ] Log session start approval in `feedback/manager.md`
- [ ] Begin coordination work

Only after this checklist is complete should manager begin active coordination work.

