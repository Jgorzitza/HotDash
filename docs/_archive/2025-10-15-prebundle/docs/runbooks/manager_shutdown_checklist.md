---
epoch: 2025.10.E1
doc: docs/runbooks/manager_shutdown_checklist.md
owner: manager
created: 2025-10-14
expires: 2025-10-21
---

# Manager Shutdown Checklist

Execute this checklist at the end of every manager session to ensure clean handoff and complete evidence.

## 1. Session Summary

- [ ] Log final status update to `feedback/manager.md` with timestamp
- [ ] Include session summary (start time, end time, duration, what accomplished)
- [ ] List all completed work with evidence (commits, files updated)
- [ ] Document any in-progress work and handoff notes

## 2. Agent Status Review

- [ ] Review all agent feedback files for current status
- [ ] Document which agents are active vs idle
- [ ] Identify any critical blockers needing immediate attention
- [ ] Note which agents need new direction vs can continue

## 3. Git & Code Status

- [ ] All valuable work committed (no uncommitted changes left)
- [ ] All commits pushed to GitHub (no unpushed commits)
- [ ] No secrets in commits (gitleaks scan passed)
- [ ] Document git status (branch, last commit)

## 4. System Health Check

- [ ] Production services status verified (Fly.io apps)
- [ ] Build status documented (TypeScript, tests)
- [ ] No critical errors left unresolved
- [ ] Document system health in feedback

## 5. Evidence Verification

- [ ] All work logged in feedback/manager.md
- [ ] Evidence includes: file paths, commit hashes, test results
- [ ] No verbose logs (summaries only, <10 lines per command)
- [ ] MCP tool usage documented (minimum 5 calls/day)

## 6. Handoff Documentation

- [ ] Next priorities clearly documented
- [ ] Critical blockers escalated
- [ ] Coordination points noted for next session
- [ ] Status: "ready for next session" or "blocked on X"

## 7. Compliance Check

- [ ] Feedback file size acceptable (<5000 lines, archive if needed)
- [ ] No ad-hoc documents created
- [ ] All agent directions current (last_reviewed date accurate)
- [ ] Workflow rules intact (.cursor/rules/04-agent-workflow.mdc)

## 8. Security Verification

- [ ] No secrets exposed in commits
- [ ] No sensitive data in feedback files
- [ ] .gitignore updated if needed
- [ ] Security incidents documented if any occurred

## 9. Session Metrics

- [ ] Document session duration
- [ ] Count commits made and pushed
- [ ] Count MCP tool calls made
- [ ] Count agents directed/activated

## 10. Final Sign-off

- [ ] Session timestamp logged
- [ ] Session status: "Session closed successfully" or "Blocked - awaiting X"
- [ ] Ready for next manager session
- [ ] All checklist items complete

Only after this checklist is complete should the manager session end.
