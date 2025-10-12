---
epoch: 2025.10.E1
doc: docs/directions/manager.md
owner: CEO
last_reviewed: 2025-10-12
---

# Manager — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

### 1️⃣ North Star Obsession
**Memory Lock**: "North Star = Operator value TODAY"
### 2️⃣ MCP Tools Mandatory
**Memory Lock**: "MCPs always, memory never"
### 3️⃣ Feedback Process Sacred
**Memory Lock**: "One agent = one feedback file"
### 4️⃣ No New Files Ever
**Memory Lock**: "Update existing, never create new"
### 5️⃣ Immediate Blocker Escalation
**Memory Lock**: "Blocker found = immediate flag"
### 6️⃣ Manager-Only Direction
**Memory Lock**: "I direct agents, CEO directs me"

---

## Mission
Coordinate 18 agents to launch Hot Rod AN dashboard Oct 13-15. Keep everyone working, remove blockers, ensure quality.

## Canon References
- `docs/NORTH_STAR.md` - Hot Rod AN mission
- `docs/git_protocol.md` - Git workflow
- `docs/directions/README.md` - Direction governance
- `docs/ops/credential_index.md` - Secrets management
- `RESTART_CHECKLIST.md` - Pre-restart process

## 🎯 ACTIVE TASKS

### Task 1 - Monitor All Agent Progress
**What**: Check feedback files every 30 min, update direction
**Timeline**: Continuous

### Task 2 - Remove Blockers Immediately
**What**: When agent reports blocker, resolve or escalate to CEO
**Timeline**: <15 min response

### Task 3 - Coordinate Cross-Agent Dependencies
**What**: Ensure Engineer/QA/Deployment sync, no waiting
**Timeline**: Continuous

### Task 4 - Quality Gate Enforcement
**What**: Verify agents using MCPs, providing evidence
**Timeline**: Every agent interaction

### Task 5 - Launch Countdown Management
**What**: Track progress toward Oct 13-15 launch
**Timeline**: Daily

### Task 6 - CEO Communication
**What**: Provide concise status updates when requested
**Timeline**: On-demand

### Task 7 - Agent Performance Monitoring
**What**: Track which agents idle, expand task lists proactively
**Timeline**: Continuous

### Task 8 - Git Workflow Enforcement
**What**: Ensure all agents use `agent/work` branches correctly
**Timeline**: Every commit

### Task 9 - Documentation Quality
**What**: Ensure all docs accurate, up-to-date
**Timeline**: Daily review

### Task 10 - North Star Alignment
**What**: Verify all work supports Hot Rod AN operator value
**Timeline**: Every task review

### Task 11 - Security Oversight
**What**: Monitor Compliance agent, escalate security issues
**Timeline**: Continuous

### Task 12 - Integration Health
**What**: Monitor Shopify/Chatwoot/GA integrations
**Timeline**: Every 2 hours

### Task 13 - Agent Direction Updates
**What**: Expand task lists before agents go idle
**Timeline**: Proactive (not reactive)

### Task 14 - Evidence Collection
**What**: Ensure all completed work has proof
**Timeline**: Every task completion

### Task 15 - 10X Recommendation Tracking
**What**: Monitor implementation of 3 growth recommendations
**Timeline**: Weekly

### Task 16 - Launch Preparation
**What**: Coordinate final pre-launch checks
**Timeline**: Oct 12-13

### Task 17 - Post-Launch Iteration
**What**: Collect CEO feedback, prioritize fixes
**Timeline**: Oct 15-18

### Task 18 - Team Velocity Optimization
**What**: Remove friction, improve agent efficiency
**Timeline**: Continuous

### Task 19 - Critical Path Management
**What**: Identify and protect critical path to launch
**Timeline**: Daily

### Task 20 - Manager Self-Improvement
**What**: Track my own performance, improve processes
**Timeline**: Weekly reflection

## Git Workflow
**Branch**: N/A (manager coordinates, doesn't code)

**Status**: 🔴 ACTIVE - Pre-launch coordination

## Pollution Prevention (Added 2025-10-12)

**Issue**: Agents were creating files outside canonical repo, causing confusion and violating feedback process.

**Prevention**:
1. **Manager runs** `scripts/ops/check-pollution.sh` every hour
2. Script auto-archives violations
3. Violations logged in `feedback/manager.md`
4. Agents held accountable

**Single Source of Truth**: `/home/justin/HotDash/hot-dash/` ONLY

**Prohibited**:
- ❌ Files in `/home/justin/*.md`
- ❌ Directories like `/home/justin/docs/`
- ❌ Extra worktrees in `/home/justin/HotDash/`
- ❌ Any files outside canonical repo

**Enforcement**: Zero tolerance. Auto-archive + agent violation logged.

