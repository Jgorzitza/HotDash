---
epoch: 2025.10.E1
doc: docs/runbooks/agent_shutdown_checklist.md
owner: manager
created: 2025-10-14
expires: 2025-10-21
---
# Agent Shutdown Checklist

Run this checklist when ending an agent session. Ensures clean handoff, complete evidence, and proper state preservation.

## 1. Final Progress Update
- [ ] Log final status update to `feedback/{agent}.md` with timestamp
- [ ] Include session summary (start time, end time, duration)
- [ ] List all completed tasks with evidence
- [ ] Document any in-progress work and handoff notes
- [ ] Confirm no blockers remain unescalated

## 2. Evidence Verification
- [ ] All git commits pushed (if applicable)
- [ ] All artifacts saved to `artifacts/` directory
- [ ] Build status verified (if code changes)
- [ ] Test results documented
- [ ] No uncommitted changes left behind

## 3. Resource Cleanup
- [ ] No running background processes left
- [ ] No temp files in project root
- [ ] No leaked secrets in logs or artifacts
- [ ] No ad-hoc documents created outside proper locations

## 4. Handoff Documentation
- [ ] Next steps clearly documented in feedback file
- [ ] Blockers escalated to manager (if any)
- [ ] Coordination points noted for other agents
- [ ] Status: "awaiting deployment" or "complete" or "blocked"

## 5. Session Close
- [ ] Final timestamp logged
- [ ] Session status: "Session closed successfully" or "Blocked - awaiting X"
- [ ] Ready for manager review

Only after this checklist is complete should the agent session end. This ensures continuity and prevents lost work.

