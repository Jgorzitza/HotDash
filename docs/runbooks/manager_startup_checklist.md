---
epoch: 2025.10.E1
doc: docs/runbooks/manager_startup_checklist.md
owner: manager
created: 2025-10-13
last_updated: 2025-10-13T22:22:00Z
---

# Manager Startup Checklist

## Purpose
This checklist ensures the Manager agent can quickly recover from system reboots and coordinate all agents effectively.

## Pre-Flight Checks

### 1. System Health Verification
- [ ] Check deployed services health
  - [ ] Agent SDK: https://hotdash-agent-service.fly.dev/health
  - [ ] LlamaIndex MCP: https://hotdash-llamaindex-mcp.fly.dev/health
- [ ] Verify MCP services are running
  - [ ] Test LlamaIndex MCP query functionality
  - [ ] Confirm all tools available: query_support, refresh_index, insight_report
- [ ] Check Fly.io app status
  - [ ] `fly status --app hotdash-agent-service`
  - [ ] `fly status --app hotdash-llamaindex-mcp`

### 2. Repository Status Assessment
- [ ] Navigate to project: `cd ~/HotDash/hot-dash`
- [ ] Check git status: `git status`
- [ ] Review current branch: `git branch`
- [ ] Check remote status: `git remote -v`
- [ ] Review recent commits: `git log --oneline -10`
- [ ] Identify uncommitted changes
- [ ] Identify untracked files

### 3. Agent Feedback Review
- [ ] Read manager feedback: `feedback/manager.md` (last 500 lines)
- [ ] Review all agent feedback files for blockers
- [ ] Identify agents with recent activity
- [ ] Check for P0/P1 issues flagged by any agent
- [ ] Review agent coordination notes

### 4. Documentation Review
- [ ] Check North Star: `docs/NORTH_STAR.md`
- [ ] Review agent directions: `docs/directions/*.md`
- [ ] Check for updated runbooks: `docs/runbooks/`
- [ ] Review recent deployment notes

## Recovery Actions

### 5. MCP Service Recovery
If MCP services are stopped:
- [ ] Check Fly.io logs: `fly logs --app hotdash-llamaindex-mcp`
- [ ] Restart if needed: Services auto-start on request
- [ ] Verify health after restart
- [ ] Test query functionality

### 6. Git Repository Synchronization
- [ ] Review uncommitted changes
- [ ] Create feature branch if needed: `git checkout -b manager/recovery-$(date +%Y%m%d)`
- [ ] Stage important changes: `git add <files>`
- [ ] Commit with descriptive message
- [ ] Push to remote: `git push origin <branch>`
- [ ] Verify remote sync: `git fetch && git status`

### 7. Agent Direction Updates
- [ ] Review each agent's direction file for accuracy
- [ ] Update priorities based on current system state
- [ ] Flag outdated tasks or completed work
- [ ] Document any process changes
- [ ] Update agent coordination notes

### 8. Backlog Assignment
- [ ] Review pending tasks across all agents
- [ ] Identify idle agents or agents in wait state
- [ ] Assign backlog work based on:
  - [ ] Agent specialization
  - [ ] Current priorities (P0 > P1 > P2)
  - [ ] Dependencies and blockers
  - [ ] Available capacity
- [ ] Document assignments in agent feedback files

## Coordination Protocol

### 9. Agent Status Matrix
Create current status for each agent:

**P0 - Critical Path**:
- [ ] Engineer: Active work? Blockers?
- [ ] Deployment: Services healthy? Issues?
- [ ] QA: Critical bugs? Test failures?

**P1 - High Priority**:
- [ ] AI: Knowledge base status? MCP working?
- [ ] Chatwoot: Integration working? Webhook issues?
- [ ] Data: Database health? RLS policies?
- [ ] Integrations: API connections? Query validation?

**P2 - Supporting**:
- [ ] Designer: Specs complete? UI reviews needed?
- [ ] Support: Knowledge base content? Training materials?
- [ ] Product: Documentation? Launch materials?
- [ ] Marketing: Launch readiness? Content complete?
- [ ] Enablement: Training materials? Operator guides?
- [ ] Compliance: Security issues? Audit findings?
- [ ] Reliability: Monitoring? Incident response?
- [ ] Git Cleanup: Repository health? History issues?
- [ ] Localization: Content audit? Translation needs?
- [ ] Engineer Helper: Pairing needed? Code reviews?
- [ ] QA Helper: Lint issues? Test coverage?

### 10. Communication Updates
- [ ] Update manager feedback with current status
- [ ] Document recovery actions taken
- [ ] Flag any new blockers discovered
- [ ] Update agent coordination notes
- [ ] Log timestamp and evidence for all actions

## Post-Recovery Validation

### 11. System Validation
- [ ] All critical services responding
- [ ] Git repository synchronized
- [ ] Agent directions updated
- [ ] Backlog work assigned
- [ ] No P0 blockers remaining

### 12. Handoff Preparation
- [ ] Document current system state
- [ ] List active work in progress
- [ ] Identify next priorities
- [ ] Flag items needing CEO attention
- [ ] Update manager feedback log

## Emergency Escalation

If any of these conditions exist, escalate to CEO immediately:
- 🚨 Production services down (Agent SDK, LlamaIndex MCP)
- 🚨 Security vulnerabilities discovered
- 🚨 Data loss or corruption detected
- 🚨 Multiple P0 blockers with no clear resolution path
- 🚨 Git repository in inconsistent state (conflicts, lost commits)

## Evidence Logging

All actions must be logged in `feedback/manager.md` with:
- Timestamp (ISO 8601 format)
- Action taken
- Command executed (if applicable)
- Result/output
- Next steps

Example:
```
## 2025-10-13T22:22:00Z — Manager Startup Recovery

**Action**: Executed startup checklist after system reboot
**Commands**:
- `fly status --app hotdash-agent-service` → Healthy
- `fly status --app hotdash-llamaindex-mcp` → Healthy
- `git status` → 47 modified files, localization/work branch
**Result**: All services operational, git sync needed
**Next**: Sync git repository, update agent directions
```

## Success Criteria

Startup recovery is complete when:
- ✅ All deployed services are healthy
- ✅ MCP services are operational and tested
- ✅ Git repository status is documented
- ✅ All agent feedback reviewed
- ✅ Agent directions updated as needed
- ✅ Backlog work assigned to idle agents
- ✅ Manager feedback log updated with recovery actions
- ✅ No P0 blockers remaining
- ✅ System ready for coordinated agent work

---

**Manager Ownership**: This checklist is executed by the Manager agent on every startup/recovery.
**Review Frequency**: Update after each major system change or deployment.
**Last Validated**: 2025-10-13T22:22:00Z

