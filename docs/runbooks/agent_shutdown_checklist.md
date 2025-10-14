# Agent Shutdown Checklist

**Purpose**: Ensure clean shutdown of agent work sessions with proper logging and handoff preparation

**Owner**: All agents  
**Created**: 2025-10-14T03:42:00Z

---

## Pre-Shutdown Actions

### 1. Complete In-Progress Work
- [ ] Finish current task or reach logical stopping point
- [ ] Save all work in progress
- [ ] Commit any code changes (if applicable)
- [ ] Update task status to reflect current state

### 2. Document Session Work
- [ ] Log all completed tasks in feedback/{agent}.md
- [ ] Document blockers encountered
- [ ] Note any issues for next session
- [ ] Timestamp all entries (ISO 8601 format)

### 3. Update Manager
- [ ] Summarize session accomplishments in feedback/manager.md
- [ ] Flag any P0/P1 blockers
- [ ] Provide handoff notes for other agents
- [ ] Log evidence of work completed

---

## Service Shutdown

### 4. Stop Local Services (if running)
- [ ] Stop Agent SDK service: `pkill -f "agent-service"`
- [ ] Stop LlamaIndex MCP service: `pkill -f "llamaindex-mcp-server"`
- [ ] Verify processes stopped: `ps aux | grep -E "(agent-service|llamaindex)"`
- [ ] Check ports released: `lsof -i :8787` and `lsof -i :8081`

### 5. Production Services Check
- [ ] Verify production Agent SDK healthy: `curl https://hotdash-agent-service.fly.dev/health`
- [ ] Verify production LlamaIndex MCP healthy: `curl https://hotdash-llamaindex-mcp.fly.dev/health`
- [ ] Note: Production services auto-start/auto-stop, no manual intervention needed

---

## Repository Cleanup

### 6. Git Status Review
- [ ] Check git status: `git status`
- [ ] Review uncommitted changes
- [ ] Stage important changes if needed
- [ ] Do NOT commit unless explicitly instructed
- [ ] Document repository state in feedback file

### 7. Temporary Files
- [ ] Remove any temp files created during session
- [ ] Clean up test outputs
- [ ] Remove debug logs (keep only permanent logs)

---

## Handoff Documentation

### 8. Session Summary
- [ ] Create session summary in feedback/{agent}.md
- [ ] List all deliverables created
- [ ] Document time spent per task
- [ ] Note completion percentage
- [ ] Identify next priorities

### 9. Blocker Documentation
- [ ] List all blockers encountered
- [ ] Document workarounds attempted
- [ ] Assign blocker ownership
- [ ] Estimate impact and urgency

### 10. Next Session Prep
- [ ] Identify tasks for next session
- [ ] Note dependencies and prerequisites
- [ ] Flag items needing manager attention
- [ ] Document any follow-up items

---

## Final Verification

### 11. Evidence Check
- [ ] All work logged with timestamps
- [ ] All deliverables have file paths
- [ ] All code changes documented
- [ ] All blockers flagged
- [ ] Manager feedback updated

### 12. System State
- [ ] Production services: HEALTHY
- [ ] Local services: STOPPED (if applicable)
- [ ] Git repository: STATUS DOCUMENTED
- [ ] Feedback files: UPDATED
- [ ] Ready for next session: YES

---

## Shutdown Template

Copy this template to your feedback file:

```markdown
## {TIMESTAMP} — Session Shutdown

**Agent**: {agent-name}
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
- Agent SDK: {stopped/not running}
- LlamaIndex MCP: {stopped/not running}

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

**Last Updated**: 2025-10-14T03:42:00Z  
**Maintained by**: All agents


