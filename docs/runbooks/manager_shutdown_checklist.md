---
epoch: 2025.10.E1
doc: docs/runbooks/manager_shutdown_checklist.md
owner: manager
created: 2025-10-14T03:45:00Z
---

# Manager Shutdown Checklist

## Purpose
Ensure clean shutdown of manager coordination with proper logging, system verification, and handoff preparation.

## Pre-Shutdown Actions

### 1. Agent Status Review
- [ ] Read manager feedback: `feedback/manager.md` (last 500 lines)
- [ ] Review all agent feedback files for current status
- [ ] Check for P0/P1 issues flagged by any agent
- [ ] Verify agent direction files are current
- [ ] Identify any agents still working vs idle

### 2. System Health Verification
- [ ] Check deployed services health
  - [ ] Agent SDK: https://hotdash-agent-service.fly.dev/health
  - [ ] LlamaIndex MCP: https://hotdash-llamaindex-mcp.fly.dev/health
- [ ] Verify MCP services are running
  - [ ] Test LlamaIndex MCP query functionality
  - [ ] Confirm all tools available: query_support, refresh_index, insight_report
- [ ] Check Fly.io app status
  - [ ] `fly status --app hotdash-agent-service`
  - [ ] `fly status --app hotdash-llamaindex-mcp`

### 3. Git Repository Assessment
- [ ] Navigate to project: `cd ~/HotDash/hot-dash`
- [ ] Check git status: `git status`
- [ ] Review current branch: `git branch`
- [ ] Check remote status: `git remote -v`
- [ ] Review recent commits: `git log --oneline -10`
- [ ] Identify uncommitted changes
- [ ] Identify untracked files

### 4. Documentation Review
- [ ] Check North Star: `docs/NORTH_STAR.md`
- [ ] Review agent directions: `docs/directions/*.md`
- [ ] Check for updated runbooks: `docs/runbooks/`
- [ ] Review recent deployment notes

## Service Shutdown

### 5. Local Services Check (if running)
- [ ] Stop Context7 MCP: `docker stop context7-mcp` or `pkill -f context7`
- [ ] Stop Supabase local: `npx supabase stop`
- [ ] Stop other local services if running
- [ ] Verify processes stopped: `ps aux | grep -E "(context7|supabase)"`

### 6. Production Services Verification
- [ ] Verify production Agent SDK healthy: `curl https://hotdash-agent-service.fly.dev/health`
- [ ] Verify production LlamaIndex MCP healthy: `curl https://hotdash-llamaindex-mcp.fly.dev/health`
- [ ] Note: Production services auto-start/auto-stop, no manual intervention needed

## Repository Cleanup

### 7. Git Status Review
- [ ] Check git status: `git status`
- [ ] Review uncommitted changes
- [ ] Stage critical changes if needed
- [ ] Document repository state in feedback/manager.md
- [ ] Do NOT commit unless explicitly instructed

### 8. Temporary Files
- [ ] Remove any temp files created during session
- [ ] Clean up test outputs
- [ ] Remove debug logs (keep only permanent logs)

## Handoff Documentation

### 9. Session Summary
- [ ] Create session summary in feedback/manager.md
- [ ] List all deliverables created
- [ ] Document time spent per task
- [ ] Note completion percentage
- [ ] Identify next priorities

### 10. Blocker Documentation
- [ ] List all blockers encountered
- [ ] Document workarounds attempted
- [ ] Assign blocker ownership
- [ ] Estimate impact and urgency

### 11. Next Session Prep
- [ ] Identify tasks for next session
- [ ] Note dependencies and prerequisites
- [ ] Flag items needing CEO attention
- [ ] Document any follow-up items

## Final Verification

### 12. Evidence Check
- [ ] All work logged with timestamps
- [ ] All deliverables have file paths
- [ ] All code changes documented
- [ ] All blockers flagged
- [ ] Manager feedback updated

### 13. System State
- [ ] Production services: HEALTHY
- [ ] Local services: STOPPED (if applicable)
- [ ] Git repository: STATUS DOCUMENTED
- [ ] Feedback files: UPDATED
- [ ] Ready for next session: YES

---

## Shutdown Template

Copy this template to feedback/manager.md:

```markdown
## 2025-10-14T[TIME]Z — Manager Session Shutdown

**Manager**: {agent-name}
**Session Duration**: {duration}
**Tasks Completed**: {count}/{total}
**Deliverables**: {list}
**Blockers**: {list or "None"}

### Production Services Status
- Agent SDK: {status}
- LlamaIndex MCP: {status}

### Repository Status
- Branch: {branch}
- Modified: {count} files
- Untracked: {count} files
- Status: {clean/dirty}

### Local Services
- Context7 MCP: {stopped/not running}
- Supabase Local: {stopped/not running}

### Next Session
- Priority tasks: {list}
- Blockers to resolve: {list}
- Dependencies: {list}

**Status**: ✅ CLEAN SHUTDOWN COMPLETE
```

---

## Success Criteria

Shutdown is complete when:
- ✅ All work logged in feedback files
- ✅ Manager feedback updated
- ✅ Local services stopped (if running)
- ✅ Production services verified healthy
- ✅ Git status documented
- ✅ Blockers flagged
- ✅ Next session prep documented
- ✅ Session summary created

---

**Manager Ownership**: This checklist is executed by the Manager agent before shutdown.
**Review Frequency**: Update after each major system change or deployment.
**Last Validated**: 2025-10-14T03:45:00Z

